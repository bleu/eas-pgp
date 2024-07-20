// src/hooks/useAttestationCreation.ts

import { useCallback } from "react";
import * as openpgp from "openpgp";
import { useEASConnection } from "./useEASConnection";
import { encodePacked, keccak256, zeroAddress } from "viem";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { getKeyFingerprint } from "@/lib/getKeyFingerprint";

export const SELF_ATTESTATION_SCHEMA =
  "string publicKey, string fingerprint, string signedMessage, uint256 timestamp";
export const THIRD_PARTY_ATTESTATION_SCHEMA =
  "string publicKeyOrFingerprint, uint8 trustLevel, string metadata, uint256 timestamp";

export const SELF_ATTESTATION_SCHEMA_ENCODER = new SchemaEncoder(
  SELF_ATTESTATION_SCHEMA,
);
export const THIRD_PARTY_ATTESTATION_SCHEMA_ENCODER = new SchemaEncoder(
  THIRD_PARTY_ATTESTATION_SCHEMA,
);

export const SELF_ATTESTATION_SCHEMA_UID = keccak256(
  encodePacked(
    ["string", "address", "bool"],
    [SELF_ATTESTATION_SCHEMA, zeroAddress, true],
  ),
);

export const THIRD_PARTY_ATTESTATION_SCHEMA_UID = keccak256(
  encodePacked(
    ["string", "address", "bool"],
    [THIRD_PARTY_ATTESTATION_SCHEMA, zeroAddress, true],
  ),
);

export const useAttestationCreation = () => {
  const { eas } = useEASConnection();

  const createSelfAttestation = useCallback(
    async (pgpPublicKey: string, signedMessage: string): Promise<string> => {
      if (!eas) throw new Error("EAS not initialized");

      const fingerprint = await getKeyFingerprint(pgpPublicKey);
      const timestamp = Math.floor(Date.now() / 1000);

      const encodedData = SELF_ATTESTATION_SCHEMA_ENCODER.encodeData([
        {
          name: "publicKey",
          value: encodeURIComponent(pgpPublicKey),
          type: "string",
        },
        { name: "fingerprint", value: fingerprint, type: "string" },
        {
          name: "signedMessage",
          value: encodeURIComponent(signedMessage),
          type: "string",
        },
        { name: "timestamp", value: timestamp, type: "uint256" },
      ]);

      const tx = await eas.attest({
        schema: SELF_ATTESTATION_SCHEMA_UID,
        data: {
          recipient: zeroAddress,
          expirationTime: 0n,
          revocable: true,
          data: encodedData,
        },
      });

      return await tx.wait();
    },
    [eas],
  );

  const createThirdPartyAttestation = useCallback(
    async (
      publicKeyOrFingerprint: string,
      trustLevel: number,
      metadata: string,
    ): Promise<string> => {
      if (!eas) throw new Error("EAS not initialized");

      const timestamp = Math.floor(Date.now() / 1000);

      const encodedData = THIRD_PARTY_ATTESTATION_SCHEMA_ENCODER.encodeData([
        {
          name: "publicKeyOrFingerprint",
          value: encodeURIComponent(publicKeyOrFingerprint),
          type: "string",
        },
        { name: "trustLevel", value: trustLevel, type: "uint8" },
        {
          name: "metadata",
          value: encodeURIComponent(metadata),
          type: "string",
        },
        { name: "timestamp", value: timestamp, type: "uint256" },
      ]);

      const tx = await eas.attest({
        schema: THIRD_PARTY_ATTESTATION_SCHEMA_UID,
        data: {
          recipient: zeroAddress,
          expirationTime: 0n,
          revocable: true,
          data: encodedData,
        },
      });

      return await tx.wait();
    },
    [eas],
  );

  return { createSelfAttestation, createThirdPartyAttestation };
};
