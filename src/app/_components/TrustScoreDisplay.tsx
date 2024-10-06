"use client";
import React, { useState, useEffect } from "react";
import { usePGPKeyServer } from "@/hooks/usePGPKeyServer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { getKeyFingerprint } from "@/lib/getKeyFingerprint";

export const TrustScoreDisplay: React.FC = () => {
  const [pgpPublicKey, setPgpPublicKey] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { calculateTrustScore } = usePGPKeyServer();

  useEffect(() => {
    const updateFingerprint = async () => {
      if (pgpPublicKey) {
        try {
          const fp = await getKeyFingerprint(pgpPublicKey);
          setFingerprint(fp);
        } catch (err) {
          console.error("Error getting fingerprint:", err);
          setFingerprint("");
        }
      } else {
        setFingerprint("");
      }
    };
    updateFingerprint();
  }, [pgpPublicKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const score = await calculateTrustScore(fingerprint);
      setTrustScore(score);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {fingerprint && (
        <div>
          <Label htmlFor="fingerprint">Key Fingerprint</Label>
          <Input
            id="fingerprint"
            value={fingerprint}
            readOnly
            className="font-mono"
          />
        </div>
      )}

      <Button
        type="submit"
        variant={"secondary"}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Calculating...
          </>
        ) : (
          "Calculate Trust Score"
        )}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {trustScore !== null && (
        <Alert>
          <AlertTitle>Trust Score Result</AlertTitle>
          <AlertDescription>
            The calculated trust score for the key with fingerprint{" "}
            {fingerprint} is: {trustScore.toFixed(2)}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
};
