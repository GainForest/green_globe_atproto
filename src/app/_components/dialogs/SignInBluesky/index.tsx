"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogContent } from "@/components/ui/StackedDialog";
import { StackedDialogContext } from "@/components/ui/StackedDialog/context";
import { useAtproto } from "../../Providers/AtprotoProvider";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import React from "react";

const SignInBluesky = ({ closeAll }: StackedDialogContext) => {
  const [handle, setHandle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signIn, signOut, isInitialized, error, isAuthenticated } = useAtproto();

  // Debug logging
  console.log("[SignInBluesky] Component state:", {
    isInitialized,
    isAuthenticated,
    error,
    handle
  });

  // Handle authentication state changes
  useEffect(() => {
    // Only close if we become authenticated during this dialog session
    // (not if we were already authenticated when the dialog opened)
    if (isAuthenticated && handle.length > 0) {
      console.log('[SignInBluesky] User authenticated, closing dialog');
      closeAll();
    }
  }, [isAuthenticated, handle.length, closeAll]);

  // Handle errors from the provider
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  const handleSignIn = async () => {
    try {
      setErrorMessage(null);
      await signIn(handle);
      // This will redirect the user to Bluesky for authentication
    } catch (error) {
      console.error("[SignInBluesky] Failed to initiate sign in:", {
        handle,
        error,
        timestamp: new Date().toISOString(),
      });
      setErrorMessage("Failed to initiate sign in. Please try again.");
    }
  };

  // If already authenticated, show a different state
  if (isAuthenticated) {
    return (
      <DialogContent
        title={<span>Already Signed In</span>}
        description="You're already authenticated with Bluesky."
      >
        <div className="w-full flex flex-col items-center py-8 gap-4">
          <div className="text-green-500 text-4xl">✅</div>
          <p className="text-center text-muted-foreground">
            You&apos;re already signed in with Bluesky. You can close this dialog or sign out if you want to sign in with a different account.
          </p>
          <div className="flex flex-col w-full gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                console.log('[SignInBluesky] Signing out user');
                try {
                  await signOut();
                  console.log('[SignInBluesky] Successfully signed out');
                } catch (error) {
                  console.error('[SignInBluesky] Failed to sign out:', error);
                }
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  }

  // If not initialized, show loading state
  if (!isInitialized) {
    return (
      <DialogContent
        title={<span className="font-serif">Sign in with Bluesky</span>}
        description="Loading..."
      >
        <div className="w-full flex flex-col items-center py-8 gap-4">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Initializing Bluesky authentication...
          </p>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent
      title={<span>Sign in with Bluesky</span>}
      description="Enter your Bluesky handle to sign in."
    >
      <div className="w-full flex flex-col gap-2 my-4">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="bluesky-handle-input"
            className="has-[input:disabled]:text-muted-foreground"
          >
            Bluesky Handle
          </Label>
          <Input
            id="bluesky-handle-input"
            placeholder="yourname.bsky.social"
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            disabled={!isInitialized}
          />
          <p className="text-sm text-muted-foreground">
            Enter your Bluesky handle (e.g., yourname.bsky.social)
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-destructive/15 border border-destructive text-destructive text-sm rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col w-full items-center gap-1">
        <Button
          className="w-full"
          onClick={handleSignIn}
          disabled={handle.length === 0 || !isInitialized}
        >
          Sign in with Bluesky
        </Button>
      </div>
    </DialogContent>
  );
};

export default SignInBluesky;
