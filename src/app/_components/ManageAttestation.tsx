"use client";
import React from "react";
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
import { formatTime } from "@/lib/formatTime";
import { useRouter } from "next/navigation";
import { trimAddress } from "@/lib/trimAddress";
const ManageAttestation: NextPage = () => {
  const { attestations, loading, error } = useGetAttestations();

  const router = useRouter();
  const handleNavigateById = useCallback(
    (id: string) => {
      router.push(`/manage/${id}`);
    },
    [router]
  );
  const tableHeads = [
    "ID",
    "Recipient",
    "Attester",
    "Revocation Time",
    "Expiration Time",
  ];
  const renderTableHeader = () => (
    <TableRow>
      <TableHead className="font-semibold">Action</TableHead>
      {tableHeads.map((key) => (
        <TableHead className="font-semibold" key={key}>
          {key}
        </TableHead>
      ))}
    </TableRow>
  );
  const renderTableRows = useCallback(() => {
    return attestations?.map((attestation) => (
      <TableRow
        key={attestation.id}
        onClick={handleNavigateById.bind(null, attestation.id)}
      >
        <TableCell className="text-right">
          <RevokeAttestation
            uid={attestation.id}
            schemaId={attestation.schema.id}
            isRevoked={attestation.revoked}
          />
        </TableCell>
        <TableCell
          className="cursor-pointer hover:font-bold"
          onClick={() => handleNavigateById(attestation.id)}
        >
          {trimAddress(attestation.id, 5, 5)}
        </TableCell>
        <TableCell
          className="cursor-pointer"
          onClick={() => handleNavigateById(attestation.id)}
        >
          {trimAddress(attestation.recipient, 5, 5)}
        </TableCell>
        <TableCell
          className="cursor-pointer"
          onClick={() => handleNavigateById(attestation.id)}
        >
          {trimAddress(attestation.attester, 5, 5)}
        </TableCell>
        <TableCell
          className="cursor-pointer"
          onClick={() => handleNavigateById(attestation.id)}
        >
          {formatTime(Number(attestation.revocationTime), "revocationTime")}
        </TableCell>
        <TableCell
          className="cursor-pointer"
          onClick={() => handleNavigateById(attestation.id)}
        >
          {formatTime(Number(attestation.expirationTime), "expirationTime")}
        </TableCell>
      </TableRow>
    ));
  }, [attestations, handleNavigateById]);

  if (loading) {
    return (
      <div className="w-full h-96 items-center justify-center text-lg flex">
        <div>Loading...</div>
      </div>
    );
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
        <TableHeader>{renderTableHeader()}</TableHeader>
        <TableBody>{renderTableRows()}</TableBody>
      </Table>
    </div>
  );
};

export default ManageAttestation;
