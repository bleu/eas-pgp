"use client";

import { ATTESTATIONS_FOR_SPECIFIC_ATTESTER } from "@/lib/graphql/queries";
import { useQuery } from "urql";
import { useAccount } from "wagmi";

const useGetAttestations = () => {
  const { address } = useAccount();
  const [result] = useQuery({
    query: ATTESTATIONS_FOR_SPECIFIC_ATTESTER,
    variables: { attester: address || "" },
    pause: !address,
  });

  const { data, fetching, error } = result;
  return { attestations: data?.attestations, loading: fetching, error };
};

export default useGetAttestations;
