// src/app/_components/PGPKeyForm.tsx
import { useState } from "react";
import React from "react";
import { usePGPKeyServer } from "./usePGPKeyServer";
import { PGPKeyGenerator } from "./PGPKeyGenerator";

export const PGPKeyForm: React.FC = () => {
  const [pgpPublicKey, setPgpPublicKey] = useState("");
  const [trustLevel, setTrustLevel] = useState(50);
  const [expirationTime, setExpirationTime] = useState("");
  const [metadata, setMetadata] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { attestToKey } = usePGPKeyServer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const expTime = new Date(expirationTime).getTime() / 1000;
      const attestationUID = await attestToKey(
        pgpPublicKey,
        trustLevel,
        expTime,
        metadata,
      );
      setSuccess(`Attestation created with UID: ${attestationUID}`);
    } catch (err) {
      setError((err as Error).message);
      console.log(err);
    }
  };

  const handleKeyGenerated = (publicKey: string) => {
    setPgpPublicKey(publicKey);
  };

  return (
    <div>
      <PGPKeyGenerator onKeyGenerated={handleKeyGenerated} />
      <form onSubmit={handleSubmit}>
        <textarea
          value={pgpPublicKey}
          onChange={(e) => setPgpPublicKey(e.target.value)}
          placeholder="PGP Public Key"
          required
        />
        <input
          type="number"
          value={trustLevel}
          onChange={(e) => setTrustLevel(Number(e.target.value))}
          min="0"
          max="100"
          required
        />
        <input
          type="datetime-local"
          value={expirationTime}
          onChange={(e) => setExpirationTime(e.target.value)}
          required
        />
        <input
          type="text"
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          placeholder="Metadata (optional)"
        />
        <button type="submit">Attest to Key</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </form>
    </div>
  );
};
