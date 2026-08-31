import { ATTENDANCE_THRESHOLDS } from "../constants/config";

export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

export const getAttendanceStatus = (
  percentage: number
): "safe" | "warning" | "danger" => {
  if (percentage < ATTENDANCE_THRESHOLDS.DANGER) return "danger";
  if (percentage < ATTENDANCE_THRESHOLDS.WARNING) return "warning";
  return "safe";
};

export const getStatusColor = (
  status: "safe" | "warning" | "danger"
): string => {
  switch (status) {
    case "safe":
      return "#22c55e"; // green
    case "warning":
      return "#f59e0b"; // yellow
    case "danger":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(date);
};

export const generateAcademicYears = (): Array<{
  value: string;
  label: string;
}> => {
  const currentYear = new Date().getFullYear();
  const years = [{ value: "0", label: "All Years" }];
  for (let year = 2023; year <= currentYear; year++) {
    const nextYear = year + 1;
    const value = `${year}-${nextYear.toString().slice(-2)}`;
    years.push({
      value,
      label: value,
    });
  }

  return years;
};

export const generateSemesters = (): Array<{
  value: string;
  label: string;
}> => {
  return [
    { value: "0", label: "All Semesters" },
    { value: "odd", label: "Odd Semester" },
    { value: "even", label: "Even Semester" },
  ];
};

export const getDefaultAcademicYear = (): string => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  if (currentMonth >= 6) {
    return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
  } else {
    return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
  }
};

export const getDefaultSemester = (): string => {
  const currentMonth = new Date().getMonth() + 1;
  if (currentMonth >= 6) {
    return "odd";
  } else {
    return "even";
  }
};

/**
 * Calculate enhanced attendance statistics using user-marked data when available and no conflicts exist
 */
export const calculateEnhancedAttendanceStats = (
  apiSubject: any,
  courseScheduleRecords: any[] = []
): {
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  userMarkedCount: number;
  conflictCount: number;
} => {
  let totalClasses = apiSubject.total_classes || 0;
  let attendedClasses = apiSubject.attended_classes || 0;
  let userMarkedCount = 0;
  let conflictCount = 0;

  if (courseScheduleRecords && courseScheduleRecords.length > 0) {
    for (const record of courseScheduleRecords) {
      if (record.is_conflict === 1) {
        conflictCount++;
      }

      if (record.is_entered_by_student === 1) {
        userMarkedCount++;
      }

      let attendanceToUse = null;
      if (record.final_attendance) {
        attendanceToUse = record.final_attendance;
      } else if (
        record.is_conflict === 0 &&
        record.user_attendance &&
        record.is_entered_by_student === 1
      ) {
        attendanceToUse = record.user_attendance;
      } else if (
        record.teacher_attendance &&
        record.is_entered_by_professor === 1
      ) {
        attendanceToUse = record.teacher_attendance;
      }

      if (attendanceToUse) {
        const normalizedAttendance = attendanceToUse.toLowerCase();
        const isNewClass = !record.is_entered_by_professor;

        if (isNewClass) {
          totalClasses++;
          if (
            normalizedAttendance === "present" ||
            normalizedAttendance === "p"
          ) {
            attendedClasses++;
          }
        } else {
          const teacherNorm = record.teacher_attendance?.toLowerCase();

          if (teacherNorm === "absent" && normalizedAttendance === "present") {
            attendedClasses++;
          } else if (
            teacherNorm === "present" &&
            normalizedAttendance === "absent"
          ) {
            attendedClasses--;
          }
        }
      }
    }
  }

  const percentage =
    totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

  return {
    totalClasses,
    attendedClasses,
    percentage: Math.round(percentage * 100) / 100,
    userMarkedCount,
    conflictCount,
  };
};

/**
 * Enhanced calculation for classes to attend, using the correct formula
 * that accounts for future classes increasing the total.
 */
export const calculateEnhancedClassesToAttend = (
  currentStats: {
    totalClasses: number;
    attendedClasses: number;
    percentage: number;
  },
  targetPercentage: number = ATTENDANCE_THRESHOLDS.DANGER
): number => {
  const targetRatio = targetPercentage / 100;
  if (currentStats.percentage >= targetPercentage) return 0;

  const { totalClasses, attendedClasses } = currentStats;

  const classesNeeded = Math.ceil(
    (targetRatio * totalClasses - attendedClasses) / (1 - targetRatio)
  );

  return Math.max(0, classesNeeded);
};

/**
 * Enhanced calculation for classes that can be missed, using the correct
 * formula that accounts for future classes increasing the total.
 */
export const calculateEnhancedClassesCanMiss = (
  currentStats: {
    totalClasses: number;
    attendedClasses: number;
    percentage: number;
  },
  targetPercentage: number = ATTENDANCE_THRESHOLDS.SAFE
): number => {
  const targetRatio = targetPercentage / 100;
  if (currentStats.percentage < targetPercentage) return 0;

  const { totalClasses, attendedClasses } = currentStats;

  const classesCanMiss = Math.floor(
    (attendedClasses - targetRatio * totalClasses) / targetRatio
  );

  return Math.max(0, classesCanMiss);
};

/**
 * Normalizes various attendance strings into a standard format.
 */
export const normalizeAttendance = (
  status: string | null | undefined
): "present" | "absent" | "none" => {
  if (!status) return "none";

  const normalized = status.toLowerCase();
  if (
    normalized === "present" ||
    normalized === "p" ||
    normalized === "duty leave"
  ) {
    return "present";
  }
  if (normalized === "absent" || normalized === "a") {
    return "absent";
  }
  return "none";
};
