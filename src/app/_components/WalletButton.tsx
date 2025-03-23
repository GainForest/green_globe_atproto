"use client";

import { Button } from "@/components/ui/button";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { Loader2, User, Wallet } from "lucide-react";

const WalletButton = () => {
  const { open } = useAppKit();
  const { address, status } = useAppKitAccount();

  const isConnecting =
    status === undefined ||
    status === "connecting" ||
    status === "reconnecting";
  const isConnected = status === "connected" && address !== undefined;

  // Only render on client side
  if (typeof window === "undefined") {
    return (
      <Button variant="ghost">
        <Wallet size={16} />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      disabled={isConnecting}
      onClick={() => {
        open();
      }}
    >
      {isConnecting ? (
        <Loader2 className="animate-spin" />
      ) : isConnected ? (
        <User />
      ) : (
        <Wallet />
      )}
      {isConnecting
        ? "Connecting..."
        : isConnected
        ? address?.slice(0, 6) + "..." + address?.slice(-4)
        : "Connect Wallet"}
    </Button>
  );
};

export default WalletButton;
