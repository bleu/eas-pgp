"use client";
import React, { useState, useEffect } from "react";
import { usePGPKeyServer } from "@/hooks/usePGPKeyServer";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import * as openpgp from "openpgp";
import { getKeyFingerprint } from "@/lib/getKeyFingerprint";

export const SelfAttestation: React.FC = () => {
  const [pgpPublicKey, setPgpPublicKey] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isValidKey, setIsValidKey] = useState(false);
  const [isValidSignature, setIsValidSignature] = useState(false);
  const { createSelfAttestation } = usePGPKeyServer();
  const { address } = useAccount();

  const messageToSign = address
    ? address.toLowerCase()
    : "Please connect your wallet";

  useEffect(() => {
    const validateKey = async () => {
      try {
        await openpgp.readKey({ armoredKey: pgpPublicKey });
        setIsValidKey(true);
        const fp = await getKeyFingerprint(pgpPublicKey);
        setFingerprint(fp);
        setError("");
      } catch (err) {
        setIsValidKey(false);
        setFingerprint("");
        setError("Invalid PGP public key format");
      }
    };

    if (pgpPublicKey) {
      validateKey();
    } else {
      setIsValidKey(false);
      setFingerprint("");
      setError("");
    }
  }, [pgpPublicKey]);

  useEffect(() => {
    const validateSignature = async () => {
      if (!isValidKey || !signedMessage) {
        setIsValidSignature(false);
        return;
      }

      try {
        const publicKey = await openpgp.readKey({ armoredKey: pgpPublicKey });
        const verificationResult = await openpgp.verify({
          message: await openpgp.readCleartextMessage({
            cleartextMessage: signedMessage,
          }),
          verificationKeys: publicKey,
        });

        const isValid = await verificationResult.signatures[0].verified;
        setIsValidSignature(isValid);

        if (!isValid) {
          setError(
            "Invalid signature or message does not match the expected content"
          );
        } else {
          setError("");
        }
      } catch (err) {
        setIsValidSignature(false);
        setError("Error verifying signature: " + (err as Error).message);
      }
    };

    validateSignature();
  }, [pgpPublicKey, signedMessage, isValidKey, messageToSign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidKey || !isValidSignature) {
      setError(
        "Please ensure both the PGP public key and signed message are valid"
      );
      return;
    }

    try {
      const attestationHash = await createSelfAttestation(
        pgpPublicKey,
        signedMessage
      );
      setSuccess(
        `Self-attestation created with transaction hash: ${attestationHash}`
      );
    } catch (err) {
      console.log(err);
      setError((err as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>
        <AlertTitle>
          Instructions for Generating a New PGP Key and Self-Attestation
        </AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Install GPG if you haven&apos;t already:
              <ul className="list-disc list-inside ml-4">
                <li>
                  On macOS: <code>brew install gnupg</code>
                </li>
                <li>
                  On Ubuntu: <code>sudo apt-get install gnupg</code>
                </li>
                <li>
                  On Windows: Download from{" "}
                  <a
                    href="https://www.gnupg.org/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.gnupg.org/download/
                  </a>
                </li>
              </ul>
            </li>
            <li>
              Generate a new GPG key:
              <code className="block bg-gray-100 p-2 my-2 rounded">
                gpg --full-generate-key
              </code>
              Follow the prompts to set up your key. Choose RSA and RSA, a key
              size of 4096 bits, and an expiration date (or no expiration).
            </li>
            <li>
              List your GPG keys to find the key ID:
              <code className="block bg-gray-100 p-2 my-2 rounded">
                gpg --list-secret-keys --keyid-format=long
              </code>
              Look for the line starting with &quot;sec&quot; and note the key
              ID after the &quot;/&quot;.
            </li>
            <li>
              Export your public key in ASCII armor format:
              <code className="block bg-gray-100 p-2 my-2 rounded">
                gpg --armor --export YOUR_KEY_ID
              </code>
              Replace YOUR_KEY_ID with the key ID from step 3. This output is
              your GPG armor (public key).
            </li>
            <li>
              Copy the entire GPG armor output (including the BEGIN and END
              lines) and paste it in the &quot;PGP Public Key&quot; field below.
            </li>
            <li>
              Sign your Ethereum address with your new PGP key:
              <code className="block bg-gray-100 p-2 my-2 rounded">
                echo -n &quot;{messageToSign}&quot; | gpg --clearsign
              </code>
            </li>
            <li>
              Copy the entire output of the signing command (including the BEGIN
              and END lines) and paste it in the &quot;Signed Message&quot;
              field below.
            </li>
          </ol>
        </AlertDescription>
      </Alert>

      <div>
        <Label htmlFor="pgp-public-key">PGP Public Key (GPG Armor)</Label>
        <Textarea
          id="pgp-public-key"
          value={pgpPublicKey}
          onChange={(e) => setPgpPublicKey(e.target.value)}
          placeholder="Paste your GPG armored public key here"
          required
          className={`h-32 ${isValidKey ? "border-green-500" : "border-red-500"}`}
        />
        {isValidKey && <p className="text-green-500">Valid PGP public key</p>}
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

      <div>
        <Label htmlFor="signed-message">Signed Message</Label>
        <Textarea
          id="signed-message"
          value={signedMessage}
          onChange={(e) => setSignedMessage(e.target.value)}
          placeholder="Paste your signed message here"
          required
          className={`h-32 ${isValidSignature ? "border-green-500" : "border-red-500"}`}
        />
        {isValidSignature && <p className="text-green-500">Valid signature</p>}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!isValidKey || !isValidSignature}
      >
        Create Self-Attestation
      </Button>

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
