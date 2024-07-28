// src/hooks/usePGPKeyServer.ts

import { useState, useEffect, useCallback } from "react";
import {
  EAS,
  SchemaEncoder,
  SchemaRegistry,
} from "@ethereum-attestation-service/eas-sdk";
import * as openpgp from "openpgp";
import { useProvider } from "@/hooks/useProvider";
import { useSigner } from "@/hooks/useSigner";
import { encodePacked, keccak256, zeroAddress } from "viem";
import {
  useWriteContract,
  useTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import sepoliaEAS from "@ethereum-attestation-service/eas-contracts/deployments/sepolia/EAS.json";
import {
  SELF_ATTESTATION_SCHEMA,
  SELF_ATTESTATION_SCHEMA_ENCODER,
  SELF_ATTESTATION_SCHEMA_UID,
  THIRD_PARTY_ATTESTATION_SCHEMA,
  THIRD_PARTY_ATTESTATION_SCHEMA_ENCODER,
  THIRD_PARTY_ATTESTATION_SCHEMA_UID,
  useAttestationCreation,
} from "./useAttestationCreation";
import { useAttestationVerification } from "./useAttestationVerification";

const EAS_CONTRACT_ADDRESS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26
const SCHEMA_REGISTRY_ADDRESS = "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0"; // Sepolia 0.26

const graphqlFetch = async (query: string, variables: any) => {
  //TODO: it should be an environment variable
  const response = await fetch("https://sepolia.easscan.org/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  return response.json();
};

export const usePGPKeyServer = () => {
  const signer = useSigner();
  const provider = useProvider();
  const { createSelfAttestation, createThirdPartyAttestation } =
    useAttestationCreation();
  const { verifySelfAttestation } = useAttestationVerification();
  const [eas, setEas] = useState<EAS | null>(null);
  const [schemaRegistry, setSchemaRegistry] = useState<SchemaRegistry | null>(
    null
  );

  useEffect(() => {
    if (signer) {
      const newEas = new EAS(EAS_CONTRACT_ADDRESS);
      newEas.connect(signer);
      setEas(newEas);

      const newSchemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
      newSchemaRegistry.connect(signer);
      setSchemaRegistry(newSchemaRegistry);
    }
  }, [signer]);

  const fetchOrInitializeSchema = useCallback(async () => {
    if (!schemaRegistry || !signer) return;
    try {
      await schemaRegistry.getSchema({ uid: SELF_ATTESTATION_SCHEMA_UID });
      await schemaRegistry.getSchema({
        uid: THIRD_PARTY_ATTESTATION_SCHEMA_UID,
      });
    } catch (e) {
      // If schemas don't exist, create them
      const selfAttestationTx = await schemaRegistry.connect(signer).register({
        schema: SELF_ATTESTATION_SCHEMA,
        resolverAddress: zeroAddress,
        revocable: true,
      });
      await selfAttestationTx.wait();

      const thirdPartyAttestationTx = await schemaRegistry
        .connect(signer)
        .register({
          schema: THIRD_PARTY_ATTESTATION_SCHEMA,
          resolverAddress: zeroAddress,
          revocable: true,
        });
      await thirdPartyAttestationTx.wait();
    }
  }, [schemaRegistry, signer]);

  const getAttestationsForKey = useCallback(
    async (
      publicKeyOrFingerprint: string,
      limit: number = 100,
      offset: number = 0
    ): Promise<any[]> => {
      const query = `
      query($selfSchemaId: String!, $thirdPartySchemaId: String!, $publicKeyOrFingerprint: String!, $limit: Int!, $offset: Int!) {
        selfAttestations: attestations(
          where: {
            schemaId: { equals: $selfSchemaId },
            decodedDataJson: { contains: $publicKeyOrFingerprint }
          }
          take: $limit
          skip: $offset
          orderBy: { timeCreated: desc }
        ) {
          id
          attester
          decodedDataJson
          timeCreated
          revocationTime
        }
        thirdPartyAttestations: attestations(
          where: {
            schemaId: { equals: $thirdPartySchemaId },
            decodedDataJson: { contains: $publicKeyOrFingerprint }
          }
          take: $limit
          skip: $offset
          orderBy: { timeCreated: desc }
        ) {
          id
          attester
          decodedDataJson
          timeCreated
          revocationTime
        }
      }
    `;

      const result = await graphqlFetch(query, {
        selfSchemaId: SELF_ATTESTATION_SCHEMA_UID,
        thirdPartySchemaId: THIRD_PARTY_ATTESTATION_SCHEMA_UID,
        publicKeyOrFingerprint: encodeURIComponent(publicKeyOrFingerprint),
        limit,
        offset,
      });

      const decodeData = (data: string) => {
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          return {};
        }
      };

      const decodeURIComponents = (obj: any) => {
        for (let key in obj) {
          if (typeof obj[key] === "string") {
            obj[key] = decodeURIComponent(obj[key]);
          } else if (typeof obj[key] === "object") {
            obj[key] = decodeURIComponents(obj[key]);
          }
        }
        return obj;
      };

      const selfAttestations = result.data.selfAttestations.map(
        (attestation: any) => ({
          ...attestation,
          type: "self",
          decodedData: decodeURIComponents(
            decodeData(attestation.decodedDataJson)
          ),
        })
      );

      const thirdPartyAttestations = result.data.thirdPartyAttestations.map(
        (attestation: any) => ({
          ...attestation,
          type: "thirdParty",
          decodedData: decodeURIComponents(
            decodeData(attestation.decodedDataJson)
          ),
        })
      );

      return [...selfAttestations, ...thirdPartyAttestations];
    },
    []
  );

  const getAttesterReputation = useCallback(
    async (attesterAddress: string): Promise<number> => {
      const query = `
      query($attester: String!) {
        attestationCount: attestationsConnection(where: { attester: { equals: $attester } }) {
          aggregate {
            count
          }
        }
      }
    `;

      const result = await graphqlFetch(query, { attester: attesterAddress });
      const attestationCount = result.data.attestationCount.aggregate.count;
      return Math.min(100, attestationCount * 5); // 5 points per attestation, max 100
    },
    []
  );

  const calculateTrustScore = useCallback(
    async (publicKeyOrFingerprint: string): Promise<number> => {
      const attestations = await getAttestationsForKey(publicKeyOrFingerprint);
      const validAttestations = attestations.filter(
        (a) =>
          !a.revocationTime &&
          (a.type === "self" ||
            a.decodedData.expirationTime > Date.now() / 1000)
      );

      if (validAttestations.length === 0) return 0;

      let trustScore = 0;
      const selfAttestation = validAttestations.find((a) => a.type === "self");

      if (selfAttestation) {
        const isValid = await verifySelfAttestation(selfAttestation.id);
        if (isValid) {
          trustScore += 30; // Increased base score for valid self-attestation
        }
      }

      for (const attestation of validAttestations.filter(
        (a) => a.type === "thirdParty"
      )) {
        const attesterScore = await getAttesterReputation(attestation.attester);
        const attestationAge =
          (Date.now() / 1000 - attestation.timeCreated) / (365 * 24 * 60 * 60); // Age in years
        const ageFactor = Math.exp(-attestationAge * 0.5); // Slower decay based on age

        const trustLevelWeight = Math.pow(
          attestation.decodedData.trustLevel / 100,
          2
        ); // Quadratic weighting for trust level

        trustScore +=
          (attesterScore * ageFactor * trustLevelWeight) /
          validAttestations.length;
      }

      return Math.min(100, trustScore);
    },
    [getAttestationsForKey, getAttesterReputation, verifySelfAttestation]
  );

  const getKeyInfo = useCallback(
    async (
      pgpPublicKey: string
    ): Promise<{
      fingerprint: string;
      userIds: string[];
      created: Date;
      expires: Date | null;
      isValid: boolean;
    }> => {
      const key = await openpgp.readKey({ armoredKey: pgpPublicKey });
      const expires = await key.getExpirationTime();
      const now = new Date();
      const isValid = (!expires || expires > now) && !(await key.isRevoked());

      return {
        fingerprint: key.getFingerprint().toUpperCase(),
        userIds: key.getUserIDs(),
        created: key.getCreationTime(),
        expires: expires ? new Date(expires) : null,
        isValid,
      };
    },
    []
  );

  return {
    fetchOrInitializeSchema,
    createSelfAttestation,
    createThirdPartyAttestation,
    verifySelfAttestation,
    getAttestationsForKey,
    calculateTrustScore,
    getKeyInfo,
  };
};
