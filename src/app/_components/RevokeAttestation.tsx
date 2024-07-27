import { Button } from "@/components/ui/button";
import useRevokeAttestation from "@/hooks/useRevokeOnChainAttestation";

const RevokeAttestationPage = ({
  uid,
  schemaId,
}: {
  uid: string;
  schemaId: string;
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
        disabled={loading}
      >
        Revoke
      </Button>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {success && <p>Attestation revoked successfully</p>}
    </div>
  );
};

export default RevokeAttestationPage;
