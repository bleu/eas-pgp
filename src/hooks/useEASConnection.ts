import { useState, useEffect } from "react";
import { EAS } from "@ethereum-attestation-service/eas-sdk";
import { useSigner } from "@/hooks/useSigner";

const EAS_CONTRACT_ADDRESS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26

export const useEASConnection = () => {
  const signer = useSigner();
  const [eas, setEas] = useState<EAS | null>(null);

  useEffect(() => {
    if (signer) {
      const newEas = new EAS(EAS_CONTRACT_ADDRESS);
      newEas.connect(signer);
      setEas(newEas);
    }
  }, [signer]);

  return { eas };
};
