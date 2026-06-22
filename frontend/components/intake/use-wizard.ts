"use client";

import { useCallback, useReducer, type Dispatch } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { apiUrl, apiHeaders } from "@/lib/api";
import {
  reduce,
  initialState,
  type WizardState,
  type WizardAction,
} from "./wizard-reducer";
import { createBrief } from "./brief";

export interface UseWizard {
  state: WizardState;
  dispatch: Dispatch<WizardAction>;
  generate: () => Promise<void>;
}

export function useWizard(): UseWizard {
  const [state, dispatch] = useReducer(reduce, initialState);
  const router = useRouter();
  const { setBrief, setBRD, setGenerating } = useAppStore();

  const generate = useCallback(async () => {
    if (state.status === "submitting") return;

    dispatch({ type: "BEGIN_SUBMIT" });
    setGenerating(true);

    const brief = createBrief(state.answers);
    setBrief(brief);

    try {
      const res = await fetch(apiUrl("/api/generate"), {
        method: "POST",
        headers: await apiHeaders(),
        body: JSON.stringify(brief),
      });

      if (!res.ok) {
        const body = await res.text();
        let message = `Server error (${res.status})`;
        try {
          const parsed = JSON.parse(body);
          if (parsed.detail) message = parsed.detail;
          else if (parsed.message) message = parsed.message;
        } catch {
          // keep generic message
        }
        throw new Error(message);
      }

      const data = await res.json();
      setBRD(data.brd);
      router.push("/review");
    } catch (err: any) {
      dispatch({
        type: "SUBMIT_FAILURE",
        message: err?.message || "Failed to generate BRD. Please try again.",
      });
      setGenerating(false);
    }
  }, [state.status, state.answers, router, setBrief, setBRD, setGenerating]);

  return { state, dispatch, generate };
}
