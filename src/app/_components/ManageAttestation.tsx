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
import RevokeAttestationPage from "./RevokeAttestation";

const ManageAttestation: NextPage = () => {
  const { attestations, loading, error } = useGetAttestations();
  console.log(attestations);

  const renderTableHeader = () => {
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
    return null;
  };

  const renderTableRows = () => {
    return attestations?.map((attestation: any) => (
      <TableRow key={attestation.id}>
        <TableCell className="text-right">
          <RevokeAttestationPage
            uid={attestation.id}
            schemaId={attestation.schema.id}
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
  };

  const formatKey = (key: string): string => {
    // Replace underscores with spaces and split camelCase words with a space
    const result = key
      .replace(/([A-Z])/g, " $1") // Insert space before each uppercase letter
      .replace(/_/g, " ") // Replace underscores with spaces
      .trim(); // Remove leading and trailing spaces

    // Capitalize the first letter of each word
    return result
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatTime = (timestamp: number, timeType: string) => {
    if (timestamp === 0 && timeType === "revocationTime") {
      return "No Previous revocation";
    }
    if (timestamp === 0 && timeType === "expirationTime") {
      return "No Expiration";
    }
    const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
    return date.toLocaleString(); // Format the date as a human-readable string
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>{error.message}</p>}
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
