import EthAvatar from "@/components/eth-avatar";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent } from "@/components/ui/StackedDialog";
import { StackedDialogContext } from "@/components/ui/StackedDialog/context";
import { usePrivy } from "@privy-io/react-auth";
import { useUserContext } from "@/app/_contexts/User";
import { useAtproto } from "../../Providers/AtprotoProvider";
import { Loader2, LogOut, User, Wallet, Bird } from "lucide-react";
import { useState } from "react";

const Account = ({ openDialog }: StackedDialogContext) => {
  const { ready, authenticated, user, logout } = usePrivy();
  const { bluesky } = useUserContext();
  const { signOut: blueskySignOut } = useAtproto();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isBlueskyLoggingOut, setIsBlueskyLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("[Account] Logout failed:", {
        error,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleBlueskyLogout = async () => {
    try {
      setIsBlueskyLoggingOut(true);
      await blueskySignOut();
    } catch (error) {
      console.error("[Account] Bluesky logout failed:", {
        error,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsBlueskyLoggingOut(false);
    }
  };

  // Show loading state
  if (!ready) {
    return (
      <DialogContent
        title={<span>Account</span>}
        description="Loading..."
        showCloseButton={true}
      >
        <div className="w-full flex justify-center py-8">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </DialogContent>
    );
  }

  // Redirect to sign in if not authenticated with either Privy or Bluesky
  const hasAnyAuth = authenticated || bluesky.isAuthenticated;
  if (!hasAnyAuth) {
    openDialog("onboarding");
    return null;
  }

  // Get user details safely
  const userEmail = user?.email?.address;
  const walletAddress = user?.wallet?.address;

  return (
    <DialogContent
      title={<span>Account</span>}
      description="Manage your account"
      showCloseButton={true}
    >
      <div className="flex flex-col w-full gap-6">
        {/* User Info Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            {walletAddress ? (
              <EthAvatar
                address={walletAddress as `0x${string}`}
                className="h-12 w-12"
              />
            ) : (
              <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                <User className="size-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-medium">My Account</span>
              <span className="text-sm text-muted-foreground">
                {userEmail ?? "No email provided"}
              </span>
            </div>
          </div>

          {/* Wallet Section */}
          {walletAddress && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Wallet className="size-5 text-muted-foreground" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium">Connected Wallet</span>
                <span className="text-xs text-muted-foreground truncate">
                  {walletAddress}
                </span>
              </div>
            </div>
          )}

          {/* Bluesky Section */}
          {bluesky.isAuthenticated && bluesky.profile && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Bird className="size-5 text-muted-foreground" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium">Bluesky Account</span>
                <span className="text-xs text-muted-foreground">
                  @{bluesky.profile.handle}
                </span>
                {bluesky.profile.displayName && (
                  <span className="text-xs text-muted-foreground">
                    {bluesky.profile.displayName}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className="flex flex-col w-full items-center gap-1">
          {authenticated && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />{" "}
                  Disconnecting...
                </>
              ) : (
                <>
                  <LogOut className="size-4 mr-2" /> Disconnect Wallet/Email
                </>
              )}
            </Button>
          )}
          {bluesky.isAuthenticated && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleBlueskyLogout}
              disabled={isBlueskyLoggingOut}
            >
              {isBlueskyLoggingOut ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />{" "}
                  Disconnecting...
                </>
              ) : (
                <>
                  <LogOut className="size-4 mr-2" /> Disconnect Bluesky
                </>
              )}
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DialogClose>
        </div>
      </div>
    </DialogContent>
  );
};

export default Account;
