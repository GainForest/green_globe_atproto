"use client";

import { Button } from "@/components/ui/button";
import { useStackedDialog } from "@/components/ui/StackedDialog/context";
import { usePrivy } from "@privy-io/react-auth";
import { useUserContext } from "@/app/_contexts/User";
import { Loader2, User } from "lucide-react";

const WalletButton = () => {
  const { ready, authenticated } = usePrivy();
  const { bluesky } = useUserContext();
  const { openDialog, isOpen } = useStackedDialog();

  if (!ready || !bluesky.isInitialized) {
    return <Loader2 className="animate-spin" />;
  }

  const hasAnyAuth = authenticated || bluesky.isAuthenticated;

  if (hasAnyAuth) {
    return (
      <Button
        variant="outline"
        onClick={() => {
          openDialog("account");
        }}
      >
        <User />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      disabled={isOpen}
      onClick={() => {
        openDialog("onboarding");
      }}
    >
      Sign in
    </Button>
  );
};

export default WalletButton;
