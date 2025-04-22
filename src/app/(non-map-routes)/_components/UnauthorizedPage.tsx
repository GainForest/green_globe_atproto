"use client";

import { Button } from "@/components/ui/button";
import { useAppKit } from "@reown/appkit/react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Loader2, Lock, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
export default function UnauthorizedPage() {
  const { open } = useAppKit();
  const { isConnected, status: appKitStatus } = useAppKitAccount();
  const { status } = useSession();
  const router = useRouter();

  // Handle inconsistent state (wallet connected but session not authenticated)
  const inconsistentState =
    isConnected && appKitStatus === "connected" && status === "unauthenticated";

  const handleClearCookies = () => {
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.trim().split("=");
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    window.location.reload();
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.refresh();
    }
  }, [status]);

  // const [mounted, setMounted] = useState(false);
  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  // if (!mounted) return null;

  const isLoading =
    appKitStatus === "connecting" || appKitStatus === "reconnecting";
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground">
            You need to connect your wallet to access your projects.
          </p>
        </div>

        <div className="space-y-4">
          {inconsistentState && (
            <div className="bg-yellow-500/10 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm">
                  Your wallet appears to be connected, but your session is
                  invalid. This may be due to conflicting cookies.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCookies}
                  className="flex items-center"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Clear cookies and refresh
                </Button>
              </div>
            </div>
          )}

          {!inconsistentState && (
            <div className="bg-muted p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Connecting your wallet allows you to view and manage your
                projects securely.
              </p>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              open();
            }}
            disabled={isLoading || status === "loading"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
