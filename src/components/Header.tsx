"use client";
import React from "react";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Navbar from "@/app/_components/Navbar";
import Link from "next/link";

function Header() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({
    address,
  });

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  return (
    <nav className="bg-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex-col">
          <Link href="/">
            <Image
              src={"/OPLogo.png"}
              width={0}
              height={0}
              sizes="100vw"
              className="h-auto w-28"
              alt="OP Logo"
            />
            <h1 className="text-base font-bold text-muted-foreground">
              PGP Attestations
            </h1>
          </Link>
        </div>
        <Navbar />
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
              <Button variant={"secondary"}>Connect Wallet</Button>
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
    </nav>
  );
}

export default Header;
