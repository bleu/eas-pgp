"use client";

import { ATTESTATIONS_FOR_SPECIFIC_ATTESTER } from "@/lib/graphql/queries";
import { useQuery } from "urql";
import { useAccount } from "wagmi";

export interface Data {
  attestations: Attestation[];
}

export interface Attestation {
  id: string;
  attester: string;
  recipient: string;
  revocable: boolean;
  revocationTime: number;
  expirationTime: number;
  revoked: boolean;
  schema: Schema;
  __typename: string;
}

export interface Schema {
  id: string;
  __typename: string;
}

const useGetAttestations = (): {
  attestations: Attestation[] | undefined;
  loading: boolean;
  error: any;
} => {
  const { address } = useAccount();
  const [result] = useQuery<Data>({
    query: ATTESTATIONS_FOR_SPECIFIC_ATTESTER,
    variables: { attester: address || "" },
    pause: !address,
  });

  const { data, fetching, error } = result;
  return { attestations: data?.attestations, loading: fetching, error };
};

export default useGetAttestations;
