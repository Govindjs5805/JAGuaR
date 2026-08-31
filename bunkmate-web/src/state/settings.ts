import { create } from "zustand";
import {
  generateAcademicYears,
  generateSemesters,
  getDefaultAcademicYear,
  getDefaultSemester,
} from "../utils/helpers";
import { authService } from "../api/auth";

interface SettingsState {
  selectedYear: string;
  selectedSemester: string;
  availableYears: Array<{ value: string; label: string }>;
  availableSemesters: Array<{ value: string; label: string }>;

  setAcademicYear: (year: string) => Promise<void>;
  setSemester: (semester: string) => Promise<void>;
  initializeSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  selectedYear: getDefaultAcademicYear(),
  selectedSemester: getDefaultSemester(),
  availableYears: generateAcademicYears(),
  availableSemesters: generateSemesters(),

  setAcademicYear: async (year: string) => {
    try {
      await authService.setDefaultYear(year);
      set({ selectedYear: year });
    } catch (error) {
      console.error("Failed to set academic year:", error);
      throw error;
    }
  },

  setSemester: async (semester: string) => {
    try {
      await authService.setDefaultSemester(semester);
      set({ selectedSemester: semester });
    } catch (error) {
      console.error("Failed to set semester:", error);
      throw error;
    }
  },

  initializeSettings: () => {
    set({
      availableYears: generateAcademicYears(),
      availableSemesters: generateSemesters(),
    });
  },
}));
