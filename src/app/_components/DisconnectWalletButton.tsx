"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { useAppKit } from "@reown/appkit/react";
import { useAppKitAccount } from "@reown/appkit/react";
import { LogOut } from "lucide-react";
import { forwardRef } from "react";

interface DisconnectWalletButtonProps extends ButtonProps {
  showIcon?: boolean;
  label?: string;
}

const DisconnectWalletButton = forwardRef<
  HTMLButtonElement,
  DisconnectWalletButtonProps
>(({ showIcon = true, label = "Disconnect", className, ...props }, ref) => {
  const { open } = useAppKit();
  const { isConnected, status } = useAppKitAccount();

  if (!isConnected || status !== "connected") {
    return null;
  }

  return (
    <Button
      ref={ref}
      variant="outline"
      size="sm"
      onClick={() => open()}
      className={className}
      {...props}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {label}
    </Button>
  );
});

DisconnectWalletButton.displayName = "DisconnectWalletButton";

export default DisconnectWalletButton;
