import React from "react";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({
    address,
  });

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-red-500 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Optimism PGP Attestations</h1>
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white text-red-500">
                  {ensName
                    ? ensName
                    : address?.slice(0, 6) + "..." + address?.slice(-4)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => disconnect()}>
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white text-red-500">
                  Connect Wallet
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {connectors.map((connector) => (
                  <DropdownMenuItem
                    key={connector.id}
                    onClick={() => connect({ connector })}
                  >
                    {connector.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <main className="container mx-auto py-8">{children}</main>
      <footer className="bg-gray-200 text-center p-4">
        <p>&copy; 2024 Optimism PGP Attestations</p>
      </footer>
    </div>
  );
};

export default Layout;
