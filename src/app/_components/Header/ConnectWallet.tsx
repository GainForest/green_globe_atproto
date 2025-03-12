import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, User, Wallet } from "lucide-react";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";

const ConnectWalletButton = () => {
  const { address, status } = useAppKitAccount();
  const { open } = useAppKit();
  return (
    <Button
      variant="ghost"
      onClick={() => {
        open();
      }}
    >
      {status === "connecting" || status === "reconnecting" ? (
        <Loader2 className="animate-spin" />
      ) : status === "disconnected" ? (
        <Wallet />
      ) : (
        <User />
      )}
      {status === "connecting" || status === "reconnecting"
        ? "Connecting..."
        : status === "disconnected"
        ? "Connect Wallet"
        : address}
    </Button>
  );
};

export default ConnectWalletButton;
