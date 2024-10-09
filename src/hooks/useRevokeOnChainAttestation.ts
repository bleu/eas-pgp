"use client";
import { useEASConnection } from "@/hooks/useEASConnection";
import { useRevokeAttestationStore } from "@/store/useRevokeAttestationState";

const useRevokeOnChainAttestation = () => {
  const { eas } = useEASConnection();
  const { setLoading, setError, setSuccess } = useRevokeAttestationStore();

  const revokeAttestation = async (uid: string, schemaId: string) => {
    if (!eas) {
      setError(uid, "EAS is not connected");
      return;
    }

    setLoading(uid, true);
    setError(uid, null);
    setSuccess(uid, false);

    try {
      const transaction = await eas.revoke({
        schema: schemaId,
        data: { uid },
      });

      await transaction.wait();
      setSuccess(uid, true);
    } catch (error) {
      setError(uid, "Error revoking attestation");
      console.error(`Error revoking attestation for UID ${uid}:`, error);
    } finally {
      setLoading(uid, false);
    }
  };

  return { revokeAttestation };
};

export default useRevokeOnChainAttestation;
