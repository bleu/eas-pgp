// src/hooks/useAttestationVerification.ts

import { useCallback } from "react";
import * as openpgp from "openpgp";
import { useEASConnection } from "./useEASConnection";
import { SELF_ATTESTATION_SCHEMA_ENCODER } from "./useAttestationCreation";

export const useAttestationVerification = () => {
  const { eas } = useEASConnection();

  const verifySelfAttestation = useCallback(
    async (attestationUID: string): Promise<boolean> => {
      if (!eas) throw new Error("EAS not initialized");

      try {
        const attestation = await eas.getAttestation(attestationUID);
        const decodedData = SELF_ATTESTATION_SCHEMA_ENCODER.decodeData(
          attestation.data,
        );

        const publicKey = decodeURIComponent(
          decodedData
            .find((item) => item.name === "publicKey")
            ?.value.value.toString()!,
        );
        const signedMessage = decodeURIComponent(
          decodedData
            .find((item) => item.name === "signedMessage")
            ?.value.value.toString()!,
        );

        if (!publicKey || !signedMessage) {
          throw new Error("Invalid attestation data");
        }

        const key = await openpgp.readKey({ armoredKey: publicKey });

        // Check if the key is expired or revoked
        const expirationTime = await key.getExpirationTime();
        if (expirationTime && expirationTime < new Date()) {
          throw new Error("The PGP key has expired");
        }
        if (await key.isRevoked()) {
          throw new Error("The PGP key has been revoked");
        }

        const verificationResult = await openpgp.verify({
          message: await openpgp.readCleartextMessage({
            cleartextMessage: signedMessage,
          }),
          verificationKeys: key,
        });

        return await verificationResult.signatures[0].verified;
      } catch (error) {
        console.error("Error verifying self-attestation:", error);
        return false;
      }
    },
    [eas],
  );

  return { verifySelfAttestation };
};
