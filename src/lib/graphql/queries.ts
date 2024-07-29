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

export const ATTESTATIONS_FOR_SPECIFIC_KEY = gql`
  query ($publicKeyOrFingerprintOrUid: String!) {
    selfAttestations: attestations(
      where: {
        OR: [
          { id: { equals: $publicKeyOrFingerprintOrUid } }
          { decodedDataJson: { contains: $publicKeyOrFingerprintOrUid } }
        ]
      }
    ) {
      id
      attester
      decodedDataJson
      timeCreated
      revocationTime
    }
    thirdPartyAttestations: attestations(
      where: {
        OR: [
          { id: { equals: $publicKeyOrFingerprintOrUid } }
          { decodedDataJson: { contains: $publicKeyOrFingerprintOrUid } }
        ]
      }
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
