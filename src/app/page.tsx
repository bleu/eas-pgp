"use client";

import React from "react";
import Layout from "@/components/Layout";
import { PGPKeyForm } from "./_components/PGPKeyForm";
import { TrustScoreDisplay } from "./_components/TrustScoreDisplay";
import { SelfAttestation } from "./_components/SelfAttestation";
import { usePGPKeyServer } from "@/hooks/usePGPKeyServer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SELF_ATTESTATION_SCHEMA_UID,
  THIRD_PARTY_ATTESTATION_SCHEMA_UID,
} from "@/hooks/useAttestationCreation";

const App: React.FC = () => {
  const { fetchOrInitializeSchema } = usePGPKeyServer();

  return (
    <Layout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>PGP Attestation Schemas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              Self-Attestation Schema UID: {SELF_ATTESTATION_SCHEMA_UID}
            </p>
            <p className="mb-4">
              Third-Party Attestation Schema UID:{" "}
              {THIRD_PARTY_ATTESTATION_SCHEMA_UID}
            </p>
            <Button onClick={fetchOrInitializeSchema}>
              Initialize Schemas
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="self-attest">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="self-attest">Self-Attest PGP Key</TabsTrigger>
            <TabsTrigger value="third-party-attest">
              Third-Party Attestation
            </TabsTrigger>
            <TabsTrigger value="query">Query Trust Score</TabsTrigger>
          </TabsList>
          <TabsContent value="self-attest">
            <Card>
              <CardHeader>
                <CardTitle>Self-Attest to PGP Key</CardTitle>
              </CardHeader>
              <CardContent>
                <SelfAttestation />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="third-party-attest">
            <Card>
              <CardHeader>
                <CardTitle>Third-Party Attestation</CardTitle>
              </CardHeader>
              <CardContent>
                <PGPKeyForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="query">
            <Card>
              <CardHeader>
                <CardTitle>Calculate Trust Score</CardTitle>
              </CardHeader>
              <CardContent>
                <TrustScoreDisplay />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default App;
