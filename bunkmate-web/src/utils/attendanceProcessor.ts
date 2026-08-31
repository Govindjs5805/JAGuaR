import { AttendanceApiResponse, CourseSchedule } from "../types/api";

/**
 * Process attendance data and create course schedule from API response
 */
export function daysAttended(
  apiData: AttendanceApiResponse
): Map<string, CourseSchedule[]> {
  const courseSchedule = new Map<string, CourseSchedule[]>();

  Object.entries(apiData.studentAttendanceData).forEach(([dateKey, dailyData]) => {
    const [year, month, day] = dateKey.split("-").map(Number);

    Object.entries(dailyData).forEach(([sessionId, attendance]) => {
      if (attendance.course && attendance.attendance !== null) {
        const course = apiData.courses[attendance.course.toString()];
        if (!course) return;

        const subjectId = course.id.toString();
        const attendanceType = apiData.attendanceTypes[attendance.attendance.toString()];

        const record: CourseSchedule = {
          id: 0,
          subject_id: subjectId,
          day,
          hour: parseInt(sessionId, 10),
          month,
          year,
          final_attendance: attendanceType?.name || "Unknown",
          teacher_attendance: attendanceType?.name || "Unknown",
          user_attendance: null,
          is_conflict: 0,
          is_user_override: 0,
          is_entered_by_professor: 1,
          is_entered_by_student: 0,
          created_at: Date.now(),
          updated_at: Date.now(),
          last_teacher_update: Date.now(),
          last_user_update: null,
        };

        const existing = courseSchedule.get(subjectId) || [];
        existing.push(record);
        courseSchedule.set(subjectId, existing);
      }
    });
  });

  return courseSchedule;
}
