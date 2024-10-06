// src/app/_components/PGPKeyGenerator.tsx
import React, { useState } from "react";
import * as openpgp from "openpgp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="Name"
          className="w-96"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Email"
          className="w-96"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />{" "}
        <Button
          variant={"default"}
          onClick={generateKey}
          disabled={generating || !name || !email}
        >
          {generating ? "Generating..." : "Generate PGP Key"}
        </Button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};
