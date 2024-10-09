import { useState } from "react";
import { Button } from "@/components/ui/button";
import useRevokeAttestation from "@/hooks/useRevokeOnChainAttestation";

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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRevoke = async (event: React.MouseEvent) => {
    event.stopPropagation();

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await revokeAttestation(uid, schemaId);
      setSuccess(true);
    } catch (error) {
      setError("Error revoking attestation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="default"
        className="w-full"
        onClick={handleRevoke}
        disabled={loading || isRevoked}
      >
        {loading ? "Revoking..." : isRevoked ? "Revoked" : "Revoke"}
      </Button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default RevokeAttestation;
