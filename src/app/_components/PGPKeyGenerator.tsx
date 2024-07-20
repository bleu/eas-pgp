// src/app/_components/PGPKeyGenerator.tsx
import React, { useState } from "react";
import * as openpgp from "openpgp";

interface PGPKeyGeneratorProps {
  onKeyGenerated: (publicKey: string) => void;
}

export const PGPKeyGenerator: React.FC<PGPKeyGeneratorProps> = ({
  onKeyGenerated,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const generateKey = async () => {
    setGenerating(true);
    setError("");
    try {
      const { publicKey } = await openpgp.generateKey({
        type: "rsa",
        rsaBits: 4096,
        userIDs: [{ name, email }],
        format: "armored",
      });
      onKeyGenerated(publicKey);
    } catch (err) {
      setError("Error generating key: " + (err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h3>Generate PGP Key</h3>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={generateKey} disabled={generating || !name || !email}>
        {generating ? "Generating..." : "Generate PGP Key"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};
