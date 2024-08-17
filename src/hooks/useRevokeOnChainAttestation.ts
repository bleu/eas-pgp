"use client";
import { useEASConnection } from "@/hooks/useEASConnection";
import { useRevokeAttestationStore } from "@/store/useRevokeAttestationState";
const useRevokeOnChainAttestation = () => {
  const { eas } = useEASConnection();
  const { loading, error, success, setLoading, setError, setSuccess } =
    useRevokeAttestationStore();

  const revokeAttestation = async (uid: string, schemaId: string) => {
    if (!eas) {
      setError("EAS is not connected");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const transaction = await eas.revoke({
        schema: schemaId,
        data: { uid },
      });

      await transaction.wait();
      setSuccess(true);
    } catch (error) {
      setError("Error revoking attestation");
      console.error("Error revoking attestation:", error);
    } finally {
      setLoading(false);
    }
  };

  return { revokeAttestation, loading, error, success };
};

export default useRevokeOnChainAttestation;
