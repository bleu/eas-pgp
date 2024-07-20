// src/app/page.tsx
"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { PGPKeyForm } from "./_components/PGPKeyForm";
import { TrustScoreDisplay } from "./_components/TrustScoreDisplay";
import { SCHEMA_UID, usePGPKeyServer } from "./_components/usePGPKeyServer";

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { fetchOrInitializeSchema } = usePGPKeyServer();

  return (
    <>
      <div>
        <h2>Account</h2>
        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>
        {account.status === "connected" && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

      <h2>Initialize Schema</h2>
      <input value={SCHEMA_UID ?? ""} disabled />
      <button onClick={fetchOrInitializeSchema}>Initialize Schema</button>

      <h2>Attest to PGP Key</h2>
      <PGPKeyForm />

      <h2>Calculate Trust Score</h2>
      <TrustScoreDisplay />
    </>
  );
}

export default App;
