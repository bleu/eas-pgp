import { Chain as ViemChain, sepolia } from "viem/chains";
import { Abi, http } from "viem";

import sepoliaSchemaRegistry from "@ethereum-attestation-service/eas-contracts/deployments/sepolia/SchemaRegistry.json";
import sepoliaEAS from "@ethereum-attestation-service/eas-contracts/deployments/sepolia/EAS.json";

const supportedChains = [sepolia] as ViemChain[];

const chains = supportedChains as [ViemChain, ...ViemChain[]];

export const NAME_SCHEMA_UID =
  "0x44d562ac1d7cd77e232978687fea027ace48f719cf1d58c7888e509663bb87fc";

export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

type Hash = `0x${string}`;

export const ZERO_UID =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

export const DEPLOYMENT = {
  [sepolia.name]: {
    chain: sepolia,
    schemaRegistry: {
      address: sepoliaSchemaRegistry.address as Hash,
      deploymentTxn: sepoliaSchemaRegistry.transactionHash as Hash,
      abi: sepoliaSchemaRegistry.abi as Abi,
    },
    eas: {
      address: sepoliaEAS.address as Hash,
      deploymentTxn: sepoliaEAS.transactionHash as Hash,
      abi: sepoliaEAS.abi as Abi,
    },
    blockBatchSize: 2048n,
    delayBetweenRPCRequests: 0,
    transportFactory: () => http(),
  },
} as const;

export type Chain = keyof typeof DEPLOYMENT;

export function isChain(key: any): key is Chain {
  return key in DEPLOYMENT;
}
