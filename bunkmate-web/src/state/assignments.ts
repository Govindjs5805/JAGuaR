import { create } from "zustand";
import assignmentsApi from "../api/assignments";
import { AssignmentData, QA } from "../types/assignments";
import {
  formatAssignmentData,
  mergeQuestionsAndAnswers,
} from "../utils/assignments";

interface AssignmentState {
  assignments: Map<string, AssignmentData[]>;
  isLoading: boolean;
  fetchAssignments: () => Promise<void>;
  fetchSpecificAssignment: (id: string) => Promise<{
    list: QA[];
    totalScore: number;
    totalMaxMarks: number;
  }>;
  clearAssignments: () => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: new Map<string, AssignmentData[]>(),
  isLoading: false,

  fetchAssignments: async () => {
    set({ isLoading: true });
    try {
      const data = await assignmentsApi.getAssignments();
      const formattedData = formatAssignmentData(data);
      set({ assignments: formattedData });
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSpecificAssignment: async (id) => {
    try {
      const { questions, answers, questionGroups } =
        await assignmentsApi.getAssignmentDetails(id);
      return mergeQuestionsAndAnswers(questions, answers, questionGroups);
    } catch (error) {
      console.error("Failed to fetch assignment details:", error);
      throw error;
    }
  },

  clearAssignments: () => {
    set({ assignments: new Map<string, AssignmentData[]>() });
  },
}));
