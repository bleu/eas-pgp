import { gql } from "urql";

export const ATTESTATIONS_FOR_SPECIFIC_ATTESTER = gql`
  query AttestationsForSpecificAttester($attester: String!) {
    attestations(where: { attester: { equals: $attester } }) {
      id
      attester
      recipient
      revocable
      revocationTime
      expirationTime
      revoked
      schema {
        id
      }
    }
  }
`;
