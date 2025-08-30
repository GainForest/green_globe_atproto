"use client";

import React from "react";
import Image from "next/image";
import { useStackedDialog } from "@/components/ui/StackedDialog/context";
import { User2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useAtproto } from "../../../../_components/Providers/AtprotoProvider";

const Header = ({ showBrandName = true }: { showBrandName?: boolean }) => {
  // const { address } = useAppKitAccount();
  // const { open } = useAppKit();
  const { authenticated: privyAuthenticated, ready: privyReady, logout: privyLogout } = usePrivy();
  const { isAuthenticated: blueskyAuthenticated, isInitialized: blueskyInitialized, userProfile, signOut: blueskySignOut } = useAtproto();
  const { openDialog } = useStackedDialog();

  // Check if user is authenticated with either Privy or Bluesky
  const hasAnyAuth = privyAuthenticated || blueskyAuthenticated;
  const isReady = privyReady && blueskyInitialized;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Image
          src="/assets/logo.webp"
          alt="logo"
          width={28}
          height={28}
          className="rounded-full"
        />
        {showBrandName && <span className="font-bold text-lg">GainForest</span>}
      </div>

      {/* Authentication UI */}
      {!isReady ? (
        <Button variant={"ghost"} size={"icon"}>
          <Loader2 className="animate-spin" />
        </Button>
      ) : hasAnyAuth ? (
        <div className="flex items-center gap-2">
          {/* Show user greeting for Bluesky */}
          {blueskyAuthenticated && userProfile && (
            <span className="text-sm font-medium">
              Hello, {userProfile.displayName || userProfile.handle || 'User'}!
            </span>
          )}

          {/* Show Projects link for Privy users */}
          {privyAuthenticated && (
            <Link href="/projects">
              <Button variant={"ghost"} size={"sm"}>
                Projects
              </Button>
            </Link>
          )}

          {/* Account/User button */}
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={() => openDialog("account")}
            title="Account Settings"
          >
            <User2 />
          </Button>

          {/* Logout button */}
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={async () => {
              if (blueskyAuthenticated) {
                await blueskySignOut();
              }
              if (privyAuthenticated) {
                await privyLogout();
              }
            }}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant={"outline"}
          onClick={() => openDialog("onboarding")}
          size={"sm"}
          className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
        >
          Sign in
        </Button>
      )}
    </div>
  );
};

export default Header;
