"use client";
import { useQuery } from "urql";
import { ATTESTATIONS_FOR_SPECIFIC_KEY } from "@/lib/graphql/queries";

const useGetAttestation = (key: string) => {
  const [result] = useQuery({
    query: ATTESTATIONS_FOR_SPECIFIC_KEY,
    variables: { publicKeyOrFingerprintOrUid: key },
    pause: !key,
  });

  const { data, fetching, error } = result;
  return { attestations: data, loading: fetching, error };
};

export default useGetAttestation;
