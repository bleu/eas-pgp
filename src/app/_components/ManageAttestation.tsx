"use client";
import { NextPage } from "next";
import useGetAttestations from "@/hooks/useGetAttestations";
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import RevokeAttestation from "./RevokeAttestation";
import { useCallback, useMemo } from "react";
import { formatKey } from "@/lib/formatKey";
import { formatTime } from "@/lib/formatTime";
const ManageAttestation: NextPage = () => {
  const { attestations, loading, error } = useGetAttestations();

  const renderTableHeader = useMemo(() => {
    if (attestations && attestations.length > 0) {
      return (
        <TableRow>
          <TableHead className="font-semibold">Action</TableHead>
          {Object.keys(attestations[0]).map((key) => (
            <TableHead className="font-semibold" key={key}>
              {formatKey(key)}
            </TableHead>
          ))}
        </TableRow>
      );
    }
    return <></>;
  }, [attestations]);

  const renderTableRows = useCallback(() => {
    return attestations?.map((attestation: any) => (
      <TableRow key={attestation.id}>
        <TableCell className="text-right">
          <RevokeAttestation
            uid={attestation.id}
            schemaId={attestation.schema.id}
            isRevoked={attestation.revoked}
          />
        </TableCell>
        {Object.entries(attestation).map(([key, value], index) => (
          <TableCell
            key={index}
            className={
              index === Object.entries(attestation).length - 1
                ? "text-right"
                : ""
            }
          >
            {key === "revocationTime" || key === "expirationTime"
              ? formatTime(Number(value), key)
              : key === "schema"
                ? (value as any).id // Ensure value is treated as an object
                : String(value)}
          </TableCell>
        ))}
      </TableRow>
    ));
  }, [attestations]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <div>
      <Table>
        <TableCaption>
          {attestations
            ? "A list of your attestations"
            : "Please connect wallet"}
        </TableCaption>
        <TableHeader>{renderTableHeader}</TableHeader>
        <TableBody>{renderTableRows()}</TableBody>
      </Table>
    </div>
  );
};

export default ManageAttestation;
