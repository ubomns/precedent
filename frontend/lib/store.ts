import { create } from "zustand";

export interface Stakeholder {
  name: string;
  role: string;
}

export interface Brief {
  project_objective: string;
  stakeholders: Stakeholder[];
  scope_in: string[];
  scope_out: string[];
  target_users: string;
  regulatory_context: string;
}

export interface FeedbackItem {
  severity: "low" | "medium" | "high";
  issue: string;
  suggestion: string;
  accepted?: boolean;
  rejected?: boolean;
}

export interface SectionOutput {
  content: Record<string, any>;
  feedback: FeedbackItem[];
}

export interface BRD {
  executive_summary?: SectionOutput;
  business_objective?: SectionOutput;
  scope?: SectionOutput;
  stakeholders?: SectionOutput;
  functional_requirements?: SectionOutput;
  non_functional_requirements?: SectionOutput;
  assumptions?: SectionOutput;
  constraints?: SectionOutput;
  acceptance_criteria?: SectionOutput;
  user_access_management?: SectionOutput;
  security_controls?: SectionOutput;
  benefits_realization?: SectionOutput;
}

interface AppState {
  brief: Brief | null;
  brd: BRD | null;
  isGenerating: boolean;
  hasCritique: boolean;
  visitedSections: Set<string>;
  setBrief: (brief: Brief) => void;
  setBRD: (brd: BRD) => void;
  setGenerating: (val: boolean) => void;
  setHasCritique: (val: boolean) => void;
  visitSection: (key: string) => void;
  updateSection: (key: string, section: SectionOutput) => void;
  acceptFeedback: (sectionKey: string, feedbackIndex: number) => void;
  rejectFeedback: (sectionKey: string, feedbackIndex: number) => void;
  clear: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  brief: null,
  brd: null,
  isGenerating: false,
  hasCritique: false,
  visitedSections: new Set(),

  setBrief: (brief) => set({ brief }),
  setBRD: (brd) => set({ brd, hasCritique: false }),
  setGenerating: (val) => set({ isGenerating: val }),
  setHasCritique: (val) => set({ hasCritique: val }),

  visitSection: (key) =>
    set((state) => ({
      visitedSections: new Set([...state.visitedSections, key]),
    })),

  updateSection: (key, section) =>
    set((state) => ({
      brd: state.brd
        ? { ...state.brd, [key]: section }
        : { [key]: section },
    })),

  acceptFeedback: (sectionKey, feedbackIndex) =>
    set((state) => {
      if (!state.brd) return state;
      const sec = state.brd[sectionKey as keyof BRD] as SectionOutput | undefined;
      if (!sec) return state;
      const newFeedback = sec.feedback.map((f, i) =>
        i === feedbackIndex ? { ...f, accepted: true } : f
      );
      return {
        brd: {
          ...state.brd,
          [sectionKey]: { ...sec, feedback: newFeedback },
        },
      };
    }),

  rejectFeedback: (sectionKey, feedbackIndex) =>
    set((state) => {
      if (!state.brd) return state;
      const sec = state.brd[sectionKey as keyof BRD] as SectionOutput | undefined;
      if (!sec) return state;
      const newFeedback = sec.feedback.map((f, i) =>
        i === feedbackIndex ? { ...f, rejected: true } : f
      );
      return {
        brd: {
          ...state.brd,
          [sectionKey]: { ...sec, feedback: newFeedback },
        },
      };
    }),

  clear: () =>
    set({
      brief: null,
      brd: null,
      isGenerating: false,
      hasCritique: false,
      visitedSections: new Set(),
    }),
}));
