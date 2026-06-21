import {
  emptyAnswers,
  validateStep,
  type StepKey,
  type WizardAnswers,
} from "./brief";
import { STEPS, REVIEW_STEP } from "./steps";

export type WizardStatus = "answering" | "review" | "submitting" | "error";

export interface WizardState {
  answers: WizardAnswers;
  currentStep: number; // 0..5 answering; REVIEW_STEP (6) = review
  editingKey: StepKey | null;
  status: WizardStatus;
  stepError: string | null;
  submitError: string;
  nextStakeholderId: number;
}

export type WizardAction =
  | { type: "SET_TEXT"; key: "objective" | "scopeIn" | "scopeOut" | "users" | "regulatory"; value: string }
  | { type: "ADD_STAKEHOLDER" }
  | { type: "REMOVE_STAKEHOLDER"; id: number }
  | { type: "UPDATE_STAKEHOLDER"; id: number; field: "name" | "role"; value: string }
  | { type: "SUBMIT_STEP" }
  | { type: "BACK" }
  | { type: "EDIT"; key: StepKey }
  | { type: "SAVE_EDIT" }
  | { type: "BEGIN_SUBMIT" }
  | { type: "SUBMIT_FAILURE"; message: string };

export const initialState: WizardState = {
  answers: emptyAnswers,
  currentStep: 0,
  editingKey: null,
  status: "answering",
  stepError: null,
  submitError: "",
  nextStakeholderId: emptyAnswers.stakeholders.length + 1,
};

const clearErrors = { stepError: null, submitError: "" } as const;

export function reduce(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_TEXT":
      return {
        ...state,
        answers: { ...state.answers, [action.key]: action.value },
        ...clearErrors,
      };

    case "ADD_STAKEHOLDER":
      return {
        ...state,
        answers: {
          ...state.answers,
          stakeholders: [
            ...state.answers.stakeholders,
            { id: state.nextStakeholderId, name: "", role: "" },
          ],
        },
        nextStakeholderId: state.nextStakeholderId + 1,
      };

    case "REMOVE_STAKEHOLDER":
      if (state.answers.stakeholders.length <= 1) return state;
      return {
        ...state,
        answers: {
          ...state.answers,
          stakeholders: state.answers.stakeholders.filter((s) => s.id !== action.id),
        },
      };

    case "UPDATE_STAKEHOLDER":
      return {
        ...state,
        answers: {
          ...state.answers,
          stakeholders: state.answers.stakeholders.map((s) =>
            s.id === action.id ? { ...s, [action.field]: action.value } : s
          ),
        },
        ...clearErrors,
      };

    case "SUBMIT_STEP": {
      if (state.editingKey !== null || state.status !== "answering") return state;
      const step = STEPS[state.currentStep];
      const error = validateStep(step.key, state.answers);
      if (error) return { ...state, stepError: error };
      if (state.currentStep >= STEPS.length - 1) {
        return { ...state, currentStep: REVIEW_STEP, status: "review", stepError: null };
      }
      return { ...state, currentStep: state.currentStep + 1, stepError: null };
    }

    case "BACK":
      if (state.status !== "answering" || state.currentStep <= 0) return state;
      return { ...state, currentStep: state.currentStep - 1, stepError: null };

    case "EDIT":
      return { ...state, editingKey: action.key, stepError: null };

    case "SAVE_EDIT": {
      if (state.editingKey === null) return state;
      const error = validateStep(state.editingKey, state.answers);
      if (error) return { ...state, stepError: error };
      return { ...state, editingKey: null, stepError: null };
    }

    case "BEGIN_SUBMIT":
      return { ...state, status: "submitting", submitError: "" };

    case "SUBMIT_FAILURE":
      return { ...state, status: "error", submitError: action.message };

    default:
      return state;
  }
}
