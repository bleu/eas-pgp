"use client";
import React, { useMemo } from "react";
import useGetAttestations from "@/hooks/useGetAttestations";
import { usePathname } from "next/navigation";
import { formatTime } from "@/lib/formatTime";
import RevokeAttestation from "@/app/_components/RevokeAttestation";
import { useRevokeAttestationStore } from "@/store/useRevokeAttestationState";
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
  const { statuses } = useRevokeAttestationStore();

  const currentId = useMemo(() => pathname.split("/").pop(), [pathname]);
  const attestation = useMemo(
    () =>
      attestations?.find(
        (attestation: Attestation) => attestation.id === currentId
      ),
    [attestations, currentId]
  );

  if (loading)
    return (
      <div className="w-full h-96 items-center justify-center text-lg flex">
        <div>Loading...</div>
      </div>
    );
  if (error)
    return (
      <div className="w-full h-96 items-center justify-center text-lg flex">
        Error loading data: {error.message}
      </div>
    );
  if (!attestations?.length)
    return (
      <div className="w-full h-96 items-center justify-center text-lg flex">
        No attestations found.
      </div>
    );
  if (!attestation)
    return (
      <div className="w-full h-96 items-center justify-center text-lg flex">
        Attestation not found.
      </div>
    );

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
        {statuses[attestation.id]?.loading && "Revoking..."}
        {statuses[attestation.id]?.error && statuses[attestation.id]?.error}
        {statuses[attestation.id]?.success && "Revoked"}
      </div>
    </div>
  );
}

export default AttestationDetails;
