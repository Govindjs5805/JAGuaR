import { create } from "zustand";
import {
  AttendanceDetailedResponse,
  SubjectAttendance,
  CourseSchedule,
} from "../types/api";
import { attendanceService } from "../api/attendance";
import { AttendanceDatabase } from "../utils/database";

interface AttendanceState {
  data: AttendanceDetailedResponse | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  courseSchedule: Map<string, CourseSchedule[]> | null;
  hasInitFetched: boolean;

  // Actions
  fetchAttendance: (forceRefresh?: boolean) => Promise<void>;
  initFetchAttendance: () => Promise<void>;
  refreshAttendance: () => Promise<void>;
  getSubjectAttendance: (subjectId: number) => SubjectAttendance | null;
  clearError: () => void;
  checkForConflicts: (params: {
    hour: number;
    day: number;
    month: number;
    year: number;
  }) => Promise<boolean>;
  markManualAttendance: (params: {
    subjectId: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    attendance: "present" | "absent";
  }) => Promise<void>;
  deleteManualAttendance: (params: {
    subjectId: string;
    year: number;
    month: number;
    day: number;
    hour: number;
  }) => Promise<void>;
  resolveConflict: (
    conflict: {
      subject_id: string;
      year: number;
      month: number;
      day: number;
      hour: number;
    },
    resolution: "accept_teacher" | "keep_user"
  ) => Promise<void>;
  clearAttendanceData: () => void;
}

let requestId = 0;
let latestRequestId = 0;

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  courseSchedule: null,
  hasInitFetched: false,

  fetchAttendance: async () => {
    set({ isLoading: true, error: null });
    const currentId = ++requestId;
    latestRequestId = currentId;

    try {
      const { transformedData, courseSchedule: apiSchedule } =
        await attendanceService.fetchAttendanceDetailed();
      if (currentId !== latestRequestId) return;

      const manualRecords =
        await AttendanceDatabase.getAllManualAttendanceRecords();

      const mergedSchedule = new Map(apiSchedule);

      for (const [subjectId, manualSubjectRecords] of manualRecords.entries()) {
        const apiSubjectRecords = mergedSchedule.get(subjectId) || [];

        for (const manualRecord of manualSubjectRecords) {
          const apiRecordIndex = apiSubjectRecords.findIndex(
            (apiRecord) =>
              apiRecord.year === manualRecord.year &&
              apiRecord.month === manualRecord.month &&
              apiRecord.day === manualRecord.day &&
              apiRecord.hour === manualRecord.hour
          );

          if (apiRecordIndex > -1) {
            const teacherRecord = apiSubjectRecords[apiRecordIndex];
            const teacherAtt = teacherRecord.teacher_attendance;
            const userAtt = manualRecord.user_attendance;

            const mergedRecord = {
              ...teacherRecord,
              ...manualRecord,
              is_entered_by_professor: Math.max(
                teacherRecord.is_entered_by_professor || 0,
                manualRecord.is_entered_by_professor || 0
              ),
            };

            if (teacherAtt && userAtt && teacherAtt !== userAtt) {
              mergedRecord.is_conflict = 1;
              mergedRecord.final_attendance = null;
            } else {
              mergedRecord.is_conflict = 0;
              mergedRecord.final_attendance = userAtt || teacherAtt;
            }
            apiSubjectRecords[apiRecordIndex] = mergedRecord;
          } else {
            apiSubjectRecords.push(manualRecord);
          }
        }
        mergedSchedule.set(subjectId, apiSubjectRecords);
      }

      set({
        data: transformedData,
        courseSchedule: mergedSchedule,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to fetch attendance data",
      });
      throw error;
    }
  },

  refreshAttendance: async () => {
    await get().fetchAttendance();
  },

  initFetchAttendance: async () => {
    if (get().hasInitFetched) return;
    try {
      await get().fetchAttendance();
      set({ hasInitFetched: true });
    } catch (error) {
      console.error("Error during initial attendance fetch:", error);
    }
  },

  getSubjectAttendance: (subjectId: number) => {
    const data = get().data;
    if (!data) return null;
    return (
      data.subjects.find((subject) => subject.subject.id === subjectId) || null
    );
  },

  clearError: () => set({ error: null }),

  checkForConflicts: async ({ hour, day, month, year }) => {
    try {
      const courseSchedule = get().courseSchedule;
      if (!courseSchedule) return false;

      const subjects = Array.from(courseSchedule.values()).flat();
      for (const subject of subjects) {
        if (
          subject.day === day &&
          subject.hour === hour &&
          subject.month === month &&
          subject.year === year
        ) {
          return true;
        }
      }

      const allSubjectIds = Array.from(courseSchedule.keys());
      const { hasConflict } =
        await AttendanceDatabase.checkTimeSlotConflictWithSubjects(
          year,
          month,
          day,
          hour,
          allSubjectIds
        );

      return hasConflict;
    } catch (error) {
      console.error("Error checking for conflicts:", error);
      return false;
    }
  },

  markManualAttendance: async ({
    subjectId,
    year,
    month,
    day,
    hour,
    attendance,
  }) => {
    try {
      const allSubjectIds = Array.from(get().courseSchedule?.keys() || []);
      const { hasConflict } =
        await AttendanceDatabase.checkTimeSlotConflictWithSubjects(
          year,
          month,
          day,
          hour,
          allSubjectIds,
          subjectId
        );

      if (hasConflict) {
        throw new Error(
          `Time slot conflict: Attendance is already marked for another subject at this time.`
        );
      }

      const existingRecord = await AttendanceDatabase.getAttendanceRecord(
        subjectId,
        year,
        month,
        day,
        hour
      );

      const memoryRecord = get()
        .courseSchedule?.get(subjectId)
        ?.find(
          (r) =>
            r.year === year &&
            r.month === month &&
            r.day === day &&
            r.hour === hour
        );

      const recordToSave: CourseSchedule = {
        ...(existingRecord ||
          memoryRecord || {
            id: 0,
            subject_id: subjectId,
            year,
            month,
            day,
            hour,
            is_entered_by_student: 1,
            created_at: Date.now(),
            teacher_attendance: null,
            is_conflict: 0,
            is_entered_by_professor: 0,
          }),
        user_attendance: attendance,
        final_attendance: attendance,
        is_user_override: 1,
        updated_at: Date.now(),
        last_user_update: Date.now(),
      };

      await AttendanceDatabase.saveAttendanceRecord(
        subjectId,
        year,
        month,
        day,
        hour,
        recordToSave
      );

      const savedRecord = await AttendanceDatabase.getAttendanceRecord(
        subjectId,
        year,
        month,
        day,
        hour
      );
      if (!savedRecord) {
        throw new Error("Failed to save and retrieve the updated record.");
      }

      set((state) => {
        const newSchedule = new Map(state.courseSchedule);
        const subjectRecords = newSchedule.get(subjectId) || [];

        const recordIndex = subjectRecords.findIndex(
          (r) =>
            r.year === year &&
            r.month === month &&
            r.day === day &&
            r.hour === hour
        );

        if (recordIndex > -1) {
          subjectRecords[recordIndex] = savedRecord;
        } else {
          subjectRecords.push(savedRecord);
        }

        newSchedule.set(subjectId, [...subjectRecords]);
        return { courseSchedule: newSchedule };
      });
    } catch (error: any) {
      console.error("Error in markManualAttendance:", error);
      throw error;
    }
  },

  deleteManualAttendance: async ({ subjectId, year, month, day, hour }) => {
    try {
      await AttendanceDatabase.deleteAttendanceRecord(
        subjectId,
        year,
        month,
        day,
        hour
      );

      set((state) => {
        if (!state.courseSchedule) return {};

        const newSchedule = new Map(state.courseSchedule);
        const subjectRecords = newSchedule.get(subjectId);
        if (!subjectRecords) return { courseSchedule: newSchedule };

        const updatedSubjectRecords = subjectRecords
          .map((record) => {
            if (
              record.year === year &&
              record.month === month &&
              record.day === day &&
              record.hour === hour
            ) {
              if (record.is_entered_by_professor) {
                return {
                  ...record,
                  user_attendance: null,
                  is_conflict: 0,
                  is_user_override: 0,
                  is_entered_by_student: 0,
                  is_entered_by_professor: 1,
                  final_attendance: record.teacher_attendance,
                  last_user_update: null,
                };
              } else {
                return null;
              }
            }
            return record;
          })
          .filter((record) => record !== null) as CourseSchedule[];

        if (updatedSubjectRecords.length > 0) {
          newSchedule.set(subjectId, updatedSubjectRecords);
        } else {
          newSchedule.delete(subjectId);
        }

        return { courseSchedule: newSchedule };
      });
    } catch (error: any) {
      console.error("[STORE] Error in deleteManualAttendance:", error);
      throw new Error("Failed to delete attendance record.");
    }
  },

  resolveConflict: async (conflict, resolution) => {
    set((state) => {
      const newSchedule = new Map(state.courseSchedule);
      const subjectRecords = newSchedule.get(conflict.subject_id);

      if (!subjectRecords) return { courseSchedule: newSchedule };

      const updatedRecords = subjectRecords.map((record) => {
        if (
          record.year === conflict.year &&
          record.month === conflict.month &&
          record.day === conflict.day &&
          record.hour === conflict.hour
        ) {
          if (resolution === "accept_teacher") {
            const newRecord = {
              ...record,
              is_conflict: 0,
              is_user_override: 0,
              is_entered_by_student: 0,
              is_entered_by_professor: 1,
              user_attendance: null,
              final_attendance: record.teacher_attendance,
              last_user_update: null,
            };

            return newRecord;
          }
        }
        return record;
      });

      newSchedule.set(conflict.subject_id, updatedRecords);

      return { courseSchedule: newSchedule };
    });

    try {
      if (resolution === "accept_teacher") {
        await AttendanceDatabase.deleteAttendanceRecord(
          conflict.subject_id,
          conflict.year,
          conflict.month,
          conflict.day,
          conflict.hour
        );
      }
    } catch (error) {
      console.error("Error persisting conflict resolution:", error);
      throw new Error("Failed to resolve conflict in the database.");
    }
  },

  clearAttendanceData: () => {
    set({
      data: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
      courseSchedule: null,
      hasInitFetched: false,
    });
  },
}));
