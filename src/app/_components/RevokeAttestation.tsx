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
  const { revokeAttestation, loading } = useRevokeAttestation();

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
    </div>
  );
};

export default RevokeAttestation;
