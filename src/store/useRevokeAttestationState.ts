import { create } from "zustand";

interface RevokeAttestationState {
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  success: Record<string, boolean>;
  setLoading: (uid: string, loading: boolean) => void;
  setError: (uid: string, error: string | null) => void;
  setSuccess: (uid: string, success: boolean) => void;
}

export const useRevokeAttestationStore = create<RevokeAttestationState>(
  (set) => ({
    loading: {},
    error: {},
    success: {},
    setLoading: (uid, loading) =>
      set((state) => ({
        loading: { ...state.loading, [uid]: loading },
      })),
    setError: (uid, error) =>
      set((state) => ({
        error: { ...state.error, [uid]: error },
      })),
    setSuccess: (uid, success) =>
      set((state) => ({
        success: { ...state.success, [uid]: success },
      })),
  })
);
