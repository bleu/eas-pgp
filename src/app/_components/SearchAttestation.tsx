"use client";
import React, { useState } from "react";
import useGetAttestation from "@/hooks/useGetAttestation";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const SearchAttestation: React.FC = () => {
  const [searchKey, setSearchKey] = useState<string>("");

  const { attestations, error, loading } = useGetAttestation(searchKey);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKey(event.target.value);
  };

  const renderDecodedData = (decodedDataJson: string) => {
    const decodedData = JSON.parse(decodedDataJson);
    return (
      <div>
        {decodedData.map((item: any, index: number) => (
          <div key={index} className="mb-4">
            <strong>{item.name}</strong>
            <p>Type: {item.type}</p>
            <p>Signature: {item.signature}</p>
            {/* <div className="whitespace-pre-wrap break-words bg-gray-50 p-4 w-full overflow-auto">
              {typeof item.value === "object"
                ? JSON.stringify(item.value, null, 2)
                : item.value}
            </div> */}
          </div>
        ))}
      </div>
    );
  };

  const renderCard = (data: any[], title: string) => {
    return (
      <div className="mt-4">
        <div className="flex flex-wrap gap-4">
          {data.map((att, index) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>UID:</strong> {att.id}
                </p>
                <p>
                  <strong>Attester:</strong> {att.attester}
                </p>
                <p>
                  <strong>Time Created:</strong>{" "}
                  {new Date(att.timeCreated * 1000).toLocaleString()}
                </p>
                <p>
                  <strong>Revocation Time:</strong>{" "}
                  {att.revocationTime
                    ? new Date(att.revocationTime * 1000).toLocaleString()
                    : "N/A"}
                </p>
                {/* {att.decodedDataJson && (
                  <div>
                    <strong>Decoded Data:</strong>
                    {renderDecodedData(att.decodedDataJson)}
                  </div>
                )} */}
              </CardContent>
              <CardFooter></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-4">
      <Input
        type="text"
        value={searchKey}
        onChange={handleInputChange}
        placeholder="Enter attestation UID or fingerprint"
        className="w-full p-2 mb-4 border rounded-md"
      />
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error.message}</p>}
      {attestations && (
        <div>
          {attestations.selfAttestations.length > 0 &&
            renderCard(attestations.selfAttestations, "Self Attestations")}
          {attestations.thirdPartyAttestations.length > 0 &&
            renderCard(
              attestations.thirdPartyAttestations,
              "Third Party Attestations"
            )}
        </div>
      )}
    </div>
  );
};

export default SearchAttestation;
