import { CourseSchedule } from "../types/api";
import { DutyLeave } from "../types/dutyLeave";
import { GradeCardResponse, Semester } from "../types/gradeCard";
import { storage } from "./storage";

// Manual Attendance Database for Web
export class AttendanceDatabase {
  private static getKey(subjectId: string, year: number, month: number, day: number, hour: number): string {
    return `attendance_${subjectId}_${year}_${month}_${day}_${hour}`;
  }

  static async getAllManualAttendanceRecords(): Promise<Map<string, CourseSchedule[]>> {
    const result = new Map<string, CourseSchedule[]>();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("attendance_")) {
          const item = localStorage.getItem(key);
          if (item) {
            const record = JSON.parse(item) as CourseSchedule;
            const subjectRecords = result.get(record.subject_id) || [];
            subjectRecords.push(record);
            result.set(record.subject_id, subjectRecords);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load attendance records:", e);
    }
    return result;
  }

  static async getAttendanceRecord(
    subjectId: string,
    year: number,
    month: number,
    day: number,
    hour: number
  ): Promise<CourseSchedule | null> {
    const key = this.getKey(subjectId, year, month, day, hour);
    return storage.get<CourseSchedule>(key);
  }

  static async saveAttendanceRecord(
    subjectId: string,
    year: number,
    month: number,
    day: number,
    hour: number,
    record: CourseSchedule
  ): Promise<void> {
    const key = this.getKey(subjectId, year, month, day, hour);
    storage.set(key, record);
  }

  static async deleteAttendanceRecord(
    subjectId: string,
    year: number,
    month: number,
    day: number,
    hour: number
  ): Promise<void> {
    const key = this.getKey(subjectId, year, month, day, hour);
    storage.delete(key);
  }

  static async checkTimeSlotConflictWithSubjects(
    year: number,
    month: number,
    day: number,
    hour: number,
    allSubjectIds: string[],
    excludeSubjectId?: string
  ): Promise<{ hasConflict: boolean; conflictingSubject?: string }> {
    for (const subjectId of allSubjectIds) {
      if (excludeSubjectId && subjectId === excludeSubjectId) continue;
      const record = await this.getAttendanceRecord(subjectId, year, month, day, hour);
      if (record && record.user_attendance) {
        return { hasConflict: true, conflictingSubject: subjectId };
      }
    }
    return { hasConflict: false };
  }
}

// Duty Leave Database for Web
export class DutyLeaveDatabase {
  private static KEY = "bunkmate_duty_leaves";

  static async getAllDutyLeaves(): Promise<DutyLeave[]> {
    return storage.get<DutyLeave[]>(this.KEY) || [];
  }

  static async saveDutyLeave(leave: DutyLeave): Promise<void> {
    const leaves = await this.getAllDutyLeaves();
    leaves.push(leave);
    storage.set(this.KEY, leaves);
  }

  static async updateDutyLeave(updatedLeave: DutyLeave): Promise<void> {
    const leaves = await this.getAllDutyLeaves();
    const index = leaves.findIndex((l) => l.id === updatedLeave.id);
    if (index !== -1) {
      leaves[index] = updatedLeave;
      storage.set(this.KEY, leaves);
    }
  }

  static async deleteDutyLeave(id: string): Promise<void> {
    const leaves = await this.getAllDutyLeaves();
    const filtered = leaves.filter((l) => l.id !== id);
    storage.set(this.KEY, filtered);
  }
}

// KTU Grades Cache Database for Web
export class KtuScrapDb {
  private static LOGIN_KEY = "bunkmate_ktu_login";
  private static GRADE_CACHE_KEY = "bunkmate_ktu_grade_cache";

  static async upsertLogin(params: {
    accountId: number;
    username: string;
    password: string;
  }): Promise<{ id: number }> {
    const key = `${this.LOGIN_KEY}_${params.accountId}`;
    const data = { id: params.accountId, ...params };
    storage.set(key, data);
    return { id: params.accountId };
  }

  static async getLogin(params: { accountId: number }): Promise<{
    id: number;
    username: string;
    password: string;
  } | null> {
    const key = `${this.LOGIN_KEY}_${params.accountId}`;
    return storage.get(key);
  }

  static async deleteLogin(params: { accountId: number }): Promise<void> {
    const key = `${this.LOGIN_KEY}_${params.accountId}`;
    storage.delete(key);
  }

  static async upsertGradeCache(params: {
    loginId: number;
    semester: number;
    grades: GradeCardResponse;
  }): Promise<void> {
    const key = `${this.GRADE_CACHE_KEY}_${params.loginId}_${params.semester}`;
    storage.set(key, { data: params.grades, timestamp: Date.now() });
  }

  static async getGradeCache(params: {
    loginId: number;
    semester: number;
  }): Promise<{ data: GradeCardResponse; isOld: boolean } | null> {
    const key = `${this.GRADE_CACHE_KEY}_${params.loginId}_${params.semester}`;
    const cached = storage.get<{ data: GradeCardResponse; timestamp: number }>(key);
    if (!cached) return null;

    // Cache considered old after 7 days
    const isOld = Date.now() - cached.timestamp > 7 * 24 * 60 * 60 * 1000;
    return { data: cached.data, isOld };
  }
}

export const upsertLogin = KtuScrapDb.upsertLogin.bind(KtuScrapDb);
export const getLogin = KtuScrapDb.getLogin.bind(KtuScrapDb);
export const deleteLogin = KtuScrapDb.deleteLogin.bind(KtuScrapDb);
export const upsertGradeCache = KtuScrapDb.upsertGradeCache.bind(KtuScrapDb);
export const getGradeCache = KtuScrapDb.getGradeCache.bind(KtuScrapDb);
