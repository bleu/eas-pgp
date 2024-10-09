import { Button } from "@/components/ui/button";
import useRevokeAttestation from "@/hooks/useRevokeOnChainAttestation";
import { useRevokeAttestationStore } from "@/store/useRevokeAttestationState";

const RevokeAttestation = ({
  uid,
  schemaId,
  isRevoked,
}: {
  uid: string;
  schemaId: string;
  isRevoked: boolean;
}) => {
  const { revokeAttestation } = useRevokeAttestation();
  const loading = useRevokeAttestationStore(
    (state) => state.loading[uid] || false
  );
  const setLoading = useRevokeAttestationStore((state) => state.setLoading);

  const handleRevoke = async (event: React.MouseEvent) => {
    event.stopPropagation();

    setLoading(uid, true);
    try {
      await revokeAttestation(uid, schemaId);
    } finally {
      setLoading(uid, false);
    }
  };

  return (
    <div>
      <Button
        variant={"default"}
        className="w-full"
        onClick={handleRevoke}
        disabled={loading || isRevoked}
      >
        {isRevoked ? "Revoked" : "Revoke"}
      </Button>
    </div>
  );
};

export default RevokeAttestation;
