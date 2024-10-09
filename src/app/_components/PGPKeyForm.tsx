// src/app/_components/PGPKeyForm.tsx
"use client";
import React, { useState, useEffect } from "react";
import { usePGPKeyServer } from "@/hooks/usePGPKeyServer";
import { PGPKeyGenerator } from "./PGPKeyGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getKeyFingerprint } from "@/lib/getKeyFingerprint";
import { Separator } from "@/components/ui/separator";

type InputType = "publicKey" | "fingerprint";

export const PGPKeyForm: React.FC = () => {
  const [pgpPublicKey, setPgpPublicKey] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [trustLevel, setTrustLevel] = useState(50);
  const [metadata, setMetadata] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inputType, setInputType] = useState<InputType>("publicKey");
  const { createThirdPartyAttestation, getKeyInfo } = usePGPKeyServer();

  useEffect(() => {
    const updateKeyInfo = async () => {
      if (pgpPublicKey) {
        try {
          const keyInfo = await getKeyInfo(pgpPublicKey);
          setFingerprint(keyInfo.fingerprint);
          setMetadata(
            JSON.stringify(
              {
                userIds: keyInfo.userIds,
                created: keyInfo.created,
                expires: keyInfo.expires,
              },
              null,
              2
            )
          );
        } catch (err) {
          console.error("Error getting key info:", err);
          setFingerprint("");
          setMetadata("");
        }
      } else {
        setFingerprint("");
        setMetadata("");
      }
    };
    updateKeyInfo();
  }, [pgpPublicKey, getKeyInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const attestationHash = await createThirdPartyAttestation(
        inputType === "publicKey" ? pgpPublicKey : fingerprint,
        trustLevel,
        metadata
      );
      setSuccess(
        `Attestation created with transaction hash: ${attestationHash}`
      );
    } catch (err) {
      setError((err as Error).message);
      console.log(err);
    }
  };

  const handleKeyGenerated = (publicKey: string) => {
    setPgpPublicKey(publicKey);
    setInputType("publicKey");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="font-medium text-lg">New Third Party Attestation</div>
      <div>
        <div className="description-text">
          <div>Third party Attestation Schema</div>
          <div>
            UID:0xa2bcb9b27c17c609a12e38f848118af93fcd7d6ea6f6f7d4cb234ce33e568c63
          </div>
        </div>
      </div>
      <Separator />
      <PGPKeyGenerator onKeyGenerated={handleKeyGenerated} />

      <RadioGroup
        value={inputType}
        onValueChange={(value: InputType) => setInputType(value)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="publicKey" id="publicKey" />
          <Label htmlFor="publicKey">Use Public Key</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="fingerprint" id="fingerprint" />
          <Label htmlFor="fingerprint">Use Fingerprint</Label>
        </div>
      </RadioGroup>

      {inputType === "publicKey" ? (
        <div>
          <Label htmlFor="pgp-key">PGP Public Key</Label>
          <Textarea
            id="pgp-key"
            value={pgpPublicKey}
            onChange={(e) => setPgpPublicKey(e.target.value)}
            placeholder="Paste PGP Public Key here"
            required
            className="h-32"
          />
        </div>
      ) : (
        <div>
          <Label htmlFor="fingerprint">Key Fingerprint</Label>
          <Input
            id="fingerprint"
            value={fingerprint}
            onChange={(e) => setFingerprint(e.target.value)}
            placeholder="Enter PGP Key Fingerprint"
            required
            className="font-mono"
          />
        </div>
      )}

      {fingerprint && inputType === "publicKey" && (
        <div>
          <Label htmlFor="fingerprint-display">Key Fingerprint</Label>
          <Input
            id="fingerprint-display"
            value={fingerprint}
            readOnly
            className="font-mono"
          />
        </div>
      )}

      <div>
        <Label htmlFor="trust-level">Trust Level: {trustLevel}</Label>
        <Slider
          id="trust-level"
          min={0}
          max={100}
          step={1}
          value={[trustLevel]}
          onValueChange={(value) => setTrustLevel(value[0])}
        />
      </div>

      <div>
        <Label htmlFor="metadata">Metadata</Label>
        <Textarea
          id="metadata"
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          placeholder="Key metadata (auto-generated for public key, can be edited)"
          className="h-32 font-mono"
        />
      </div>

      <div className="w-full flex justify-end">
        <Button type="submit">Attest to Key</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </form>
  );
};
