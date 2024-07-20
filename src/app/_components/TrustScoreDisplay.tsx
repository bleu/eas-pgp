import { useState } from "react";
import React from "react";
import { usePGPKeyServer } from "./usePGPKeyServer";

/**
 * React component for displaying the trust score of a PGP key
 */
export const TrustScoreDisplay: React.FC = () => {
  const [pgpPublicKey, setPgpPublicKey] = useState("");
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { calculateTrustScore } = usePGPKeyServer();

  console.log({ pgpPublicKey });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const score = await calculateTrustScore(JSON.stringify(pgpPublicKey));
      setTrustScore(score);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={pgpPublicKey}
        onChange={(e) => setPgpPublicKey(e.target.value)}
        placeholder="PGP Public Key"
        required
      />
      <button type="submit" disabled={loading}>
        Calculate Trust Score
      </button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {trustScore !== null && <p>Trust Score: {trustScore.toFixed(2)}</p>}
    </form>
  );
};
