"use client";

import { Button } from "@/components/ui/button";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { Loader2, User, Wallet } from "lucide-react";

const ConnectWalletButton = () => {
  const { open } = useAppKit();
  const { address, status } = useAppKitAccount();

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
      disabled={
        status === undefined ||
        status === "connecting" ||
        status === "reconnecting"
      }
      onClick={() => {
        open();
      }}
    >
      {status === undefined ||
      status === "connecting" ||
      status === "reconnecting" ? (
        <Loader2 className="animate-spin" />
      ) : status === "disconnected" ? (
        <Wallet />
      ) : (
        <User />
      )}
      {status === undefined ||
      status === "connecting" ||
      status === "reconnecting"
        ? "Connecting..."
        : status === "disconnected"
        ? "Connect Wallet"
        : address}
    </Button>
  );
};

export default ConnectWalletButton;
