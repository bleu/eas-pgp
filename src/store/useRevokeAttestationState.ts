import { create } from "zustand";

interface RevokeAttestationState {
  statuses: {
    [id: string]: {
      loading: boolean;
      error: string | null;
      success: boolean;
    };
  };
  setStatus: (
    id: string,
    status: { loading: boolean; error: string | null; success: boolean }
  ) => void;
}

export const useRevokeAttestationStore = create<RevokeAttestationState>(
  (set) => ({
    statuses: {},
    setStatus: (id, status) =>
      set((state) => ({
        statuses: { ...state.statuses, [id]: status },
      })),
  })
);
