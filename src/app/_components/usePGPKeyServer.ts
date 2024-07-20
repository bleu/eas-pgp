import { useState, useEffect, useCallback } from "react";
import {
  EAS,
  SchemaEncoder,
  SchemaRegistry,
} from "@ethereum-attestation-service/eas-sdk";
import * as openpgp from "openpgp";
import { useProvider } from "@/hooks/useProvider";
import { useSigner } from "@/hooks/useSigner";
import { encodePacked, keccak256, toHex, zeroAddress } from "viem";
import { easAbi } from "@/abi/eas";
import {
  useWriteContract,
  useTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import sepoliaEAS from "@ethereum-attestation-service/eas-contracts/deployments/sepolia/EAS.json";

const isValidPGPKey = async (pgpPublicKey: string): Promise<boolean> => {
  try {
    await openpgp.readKey({ armoredKey: pgpPublicKey });
    return true;
  } catch (error) {
    return false;
  }
};

const SCHEMA_ENCODER = new SchemaEncoder(
  "string pgpPublicKey, uint8 trustLevel, uint256 expirationTime, string metadata",
);

const EAS_CONTRACT_ADDRESS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26
const SCHEMA_REGISTRY_ADDRESS = "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0"; // Sepolia 0.26

const SCHEMA_STRING =
  "string pgpPublicKey, uint8 trustLevel, uint256 expirationTime, string metadata";

// const SCHEMA_UID =
//   "0xa418a20f810f759ce8ec4500d8ed00d4b39c84677bb2a6d7cfd96fbfe7c754b1";

export const SCHEMA_UID = keccak256(
  encodePacked(
    ["string", "address", "bool"],
    [SCHEMA_STRING, zeroAddress, true],
  ),
);

// Simple GraphQL client using fetch
const graphqlFetch = async (query: string, variables: any) => {
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
  const [eas, setEas] = useState<EAS | null>(null);
  const [schemaRegistry, setSchemaRegistry] = useState<SchemaRegistry | null>(
    null,
  );

  const { writeContract, data: attestData } = useWriteContract();

  const { isLoading: isAttestLoading, isSuccess: isAttestSuccess } =
    useTransactionReceipt({
      hash: attestData,
    });

  useWatchContractEvent({
    address: EAS_CONTRACT_ADDRESS,
    abi: sepoliaEAS.abi,
    eventName: "Attested",
    onLogs: (logs) => {
      console.log("Attested event:", logs);
    },
  });

  // Initialize EAS and SchemaRegistry when provider is available
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

  0xa418a20f810f759ce8ec4500d8ed00d4b39c84677bb2a6d7cfd96fbfe7c754b1;
  const fetchOrInitializeSchema = useCallback(async () => {
    if (!schemaRegistry || !signer) return;
    let schema;

    try {
      schema = await schemaRegistry.getSchema({
        uid: SCHEMA_UID,
      });
    } catch (e) {
      // If schema doesn't exist, create a new one
      const transaction = await schemaRegistry.connect(signer).register({
        schema: SCHEMA_STRING,
        resolverAddress: zeroAddress,
        revocable: true,
      });

      await transaction.wait();
    }
  }, [schemaRegistry, signer]);

  const attestToKey = useCallback(
    async (
      pgpPublicKey: string,
      trustLevel: number,
      expirationTime: number,
      metadata: string,
    ): Promise<void> => {
      if (!eas || !signer || !SCHEMA_UID)
        throw new Error("EAS not initialized");

      if (!(await isValidPGPKey(pgpPublicKey))) {
        throw new Error("Invalid PGP public key");
      }

      const encodedData = SCHEMA_ENCODER.encodeData([
        { name: "pgpPublicKey", value: pgpPublicKey, type: "string" },
        { name: "trustLevel", value: trustLevel, type: "uint8" },
        { name: "expirationTime", value: expirationTime, type: "uint256" },
        { name: "metadata", value: metadata, type: "string" },
      ]) as `0x${string}`;

      console.log({
        address: EAS_CONTRACT_ADDRESS,
        abi: sepoliaEAS.abi,
        functionName: "attest",
        args: [
          {
            schema: SCHEMA_UID,
            data: {
              recipient: zeroAddress,
              expirationTime: BigInt(expirationTime),
              revocable: true,
              data: encodedData,
            },
          },
        ],
      });

      const tx = await eas.attest({
        schema: SCHEMA_UID,
        data: {
          recipient: zeroAddress,
          expirationTime: BigInt(expirationTime),
          revocable: true,
          data: encodedData,
        },
      });

      console.log({ tx });
      await tx.wait(1);

      // writeContract({
      //   address: EAS_CONTRACT_ADDRESS,
      //   abi: easAbi,
      //   functionName: "attest",
      //   args: [
      //     {
      //       schema: SCHEMA_UID,
      //       data: {
      //         recipient: zeroAddress,
      //         expirationTime: BigInt(expirationTime),
      //         revocable: true,
      //         data: encodedData,
      //       },
      //     },
      //   ],
      // });

      return;
    },
    [eas, signer, writeContract],
  );

  const getAttestationsForKey = useCallback(
    async (pgpPublicKey: string): Promise<any[]> => {
      const query = `
      query($schemaId: String!, $pgpPublicKey: String!) {
        attestations(where: {
          schemaId: {
            equals: $schemaId
          },
          decodedDataJson: {
            contains: $pgpPublicKey
          }
        }) {
          id
          attester
          decodedDataJson
          timeCreated
          revocationTime
        }
      }
    `;

      const result = await graphqlFetch(query, {
        schemaId: SCHEMA_UID,
        pgpPublicKey,
      });
      return result.data.attestations.map((attestation: any) => ({
        ...attestation,
        decodedData: JSON.parse(attestation.decodedDataJson),
      }));
    },
    [],
  );

  const getAttesterReputation = useCallback(
    async (attesterAddress: string): Promise<number> => {
      const query = `
      query($attester: String!) {
        attestations(where: { attester: { equals: $attester } }) {
          id
        }
      }
    `;

      const result = await graphqlFetch(query, { attester: attesterAddress });
      const attestationCount = result.data.attestations.length;
      return Math.min(100, attestationCount * 5); // 5 points per attestation, max 100
    },
    [],
  );

  const calculateTrustScore = useCallback(
    async (pgpPublicKey: string): Promise<number> => {
      const attestations = await getAttestationsForKey(pgpPublicKey);
      const validAttestations = attestations.filter(
        (a) =>
          !a.revocationTime && a.decodedData.expirationTime > Date.now() / 1000,
      );

      if (validAttestations.length === 0) return 0;

      let trustScore = 0;
      const graph = buildTrustGraph(validAttestations);

      for (const attestation of validAttestations) {
        const attesterScore = await getAttesterReputation(attestation.attester);
        const pathTrust = calculatePathTrust(
          graph,
          attestation.attester,
          pgpPublicKey,
        );
        const attestationAge =
          (Date.now() / 1000 - attestation.timeCreated) / (365 * 24 * 60 * 60); // Age in years
        const ageFactor = Math.exp(-attestationAge); // Exponential decay based on age

        trustScore +=
          attesterScore *
          pathTrust *
          ageFactor *
          (attestation.decodedData.trustLevel / 100);
      }

      return Math.min(100, trustScore / validAttestations.length);
    },
    [getAttestationsForKey, getAttesterReputation],
  );

  const buildTrustGraph = (attestations: any[]): Map<string, Set<string>> => {
    const graph = new Map<string, Set<string>>();

    for (const attestation of attestations) {
      if (!graph.has(attestation.attester)) {
        graph.set(attestation.attester, new Set());
      }
      graph
        .get(attestation.attester)!
        .add(attestation.decodedData.pgpPublicKey);
    }

    return graph;
  };

  const calculatePathTrust = (
    graph: Map<string, Set<string>>,
    start: string,
    end: string,
  ): number => {
    const visited = new Set<string>();
    const queue: [string, number][] = [[start, 1]];

    while (queue.length > 0) {
      const [current, trust] = queue.shift()!;

      if (current === end) return trust;
      if (visited.has(current)) continue;

      visited.add(current);

      for (const neighbor of graph.get(current) || []) {
        queue.push([neighbor, trust * 0.9]); // Decrease trust by 10% for each hop
      }
    }

    return 0;
  };

  const getKeyInfo = async (
    pgpPublicKey: string,
  ): Promise<{
    fingerprint: string;
    userIds: string[];
    created: Date;
    expires: Date | null;
  }> => {
    const key = await openpgp.readKey({ armoredKey: pgpPublicKey });
    const expires = await key.getExpirationTime();
    return {
      fingerprint: key.getFingerprint().toUpperCase(),
      userIds: key.getUserIDs(),
      created: key.getCreationTime(),
      expires: expires ? new Date(expires) : null,
    };
  };

  return {
    fetchOrInitializeSchema,
    attestToKey,
    getAttestationsForKey,
    calculateTrustScore,
    getKeyInfo,
    SCHEMA_UID,
    isAttestLoading,
    isAttestSuccess,
  };
};
