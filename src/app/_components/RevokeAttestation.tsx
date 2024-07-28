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
  const { revokeAttestation, loading, error, success } = useRevokeAttestation();

  const handleRevoke = () => {
    revokeAttestation(uid, schemaId);
  };

  return (
    <div>
      <Button
        variant={"outline"}
        className="bg-red-500 text-white"
        onClick={handleRevoke}
        disabled={loading || isRevoked}
      >
        Revoke
      </Button>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && (
        <p className="text-green-500">Attestation revoked successfully</p>
      )}
    </div>
  );
};

export default RevokeAttestation;
