import { gql } from "@apollo/client";

export const ATTESTATIONS_FOR_SPECIFIC_ATTESTER = gql`
  query AttestationsForSpecificAttester($attester: String!) {
    attestations(where: { attester: { equals: $attester } }) {
      id
      attester
      recipient
      revocable
      revocationTime
      expirationTime
      schema {
        id
      }
    }
  }
`;
