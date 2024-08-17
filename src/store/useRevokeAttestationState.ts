import { create } from "zustand";

interface RevokeAttestationState {
  loading: boolean;
  error: string | null;
  success: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: boolean) => void;
}

export const useRevokeAttestationStore = create<RevokeAttestationState>(
  (set) => ({
    loading: false,
    error: null,
    success: false,
    setLoading: (loading) => set(() => ({ loading })),
    setError: (error) => set(() => ({ error })),
    setSuccess: (success) => set(() => ({ success })),
  })
);
