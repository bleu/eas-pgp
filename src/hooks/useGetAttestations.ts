"use client";
import { useQuery } from "@apollo/client";
import { ATTESTATIONS_FOR_SPECIFIC_ATTESTER } from "@/lib/graphql/queries";
import { useAccount } from "wagmi";

const useGetAttestations = () => {
  const { address } = useAccount();
  const { data, loading, error } = useQuery(
    ATTESTATIONS_FOR_SPECIFIC_ATTESTER,
    {
      variables: { attester: address || "" },
      skip: !address,
    }
  );

  return { attestations: data?.attestations, loading, error };
};

export default useGetAttestations;
