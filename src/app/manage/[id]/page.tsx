"use client";
import React, { useMemo } from "react";
import useGetAttestations from "@/hooks/useGetAttestations";
import { usePathname } from "next/navigation";
import { formatTime } from "@/lib/formatTime";
import RevokeAttestation from "@/app/_components/RevokeAttestation";
import useRevokeOnChainAttestation from "@/hooks/useRevokeOnChainAttestation";

export type Attestation = {
  id: string;
  attester: string;
  recipient: string;
  revocable: boolean;
  revocationTime: number;
  expirationTime: number;
  revoked: boolean;
  schema: {
    id: string;
    __typename: string;
  };
  __typename: string;
};

function AttestationDetails() {
  const { attestations, loading, error } = useGetAttestations();
  const pathname = usePathname();
  const {
    loading: revokeLoading,
    error: revokeError,
    success: revokeSuccess,
  } = useRevokeOnChainAttestation();

  const currentId = useMemo(() => pathname.split("/").pop(), [pathname]);
  const attestation = useMemo(
    () =>
      attestations?.find(
        (attestation: Attestation) => attestation.id === currentId
      ),
    [attestations, currentId]
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;
  if (!attestations?.length) return <p>No attestations found.</p>;
  if (!attestation) return <p>Attestation not found.</p>;

  return (
    <div className="py-6">
      <div className="flex justify-between mb-4 pb-4 border-b">
        <h2 className="text-2xl font-semibold">Self-Attestation</h2>
        <RevokeAttestation
          uid={attestation.id}
          schemaId={attestation.schema.id}
          isRevoked={attestation.revoked}
        />
      </div>

      <div className="space-y-4">
        {[
          { label: "UID", value: attestation.id },
          { label: "Attester", value: attestation.attester },
          { label: "Recipient", value: attestation.recipient },
          {
            label: "Revocation Time",
            value: formatTime(attestation.revocationTime, "revocationTime"),
          },
          {
            label: "Expiration Time",
            value: formatTime(attestation.revocationTime, "expirationTime"),
          },
          { label: "Schema ID", value: attestation.schema.id },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between border-b pb-2">
            <strong className="block">{label}</strong>
            <span className="text-gray-600">{value}</span>
          </div>
        ))}
      </div>
      <div className="text-center p-4 font-semibold">
        {revokeLoading && <p>Loading...</p>}
        {revokeError && <p className="text-red-500">{revokeError}</p>}
        {revokeSuccess && (
          <p className="text-green-500">Attestation revoked successfully</p>
        )}
      </div>
    </div>
  );
}

export default AttestationDetails;
