"use client";
import { useEASConnection } from "@/hooks/useEASConnection";
import { useRevokeAttestationStore } from "@/store/useRevokeAttestationState";

const useRevokeOnChainAttestation = () => {
  const { eas } = useEASConnection();

  const { setStatus } = useRevokeAttestationStore();

  const revokeAttestation = async (uid: string, schemaId: string) => {
    if (!eas) {
      return;
    }
    setStatus(uid, { loading: true, error: null, success: false });

    try {
      const transaction = await eas.revoke({
        schema: schemaId,
        data: { uid },
      });

      await transaction.wait();
      setStatus(uid, { loading: false, error: null, success: true });
    } catch (error) {
      setStatus(uid, {
        loading: false,
        error: "Error revoking",
        success: false,
      });
    }
  };

  return { revokeAttestation };
};
export default useRevokeOnChainAttestation;
