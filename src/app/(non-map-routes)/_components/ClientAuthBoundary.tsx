"use client";

import { useSession } from "next-auth/react";
import { useAppKitAccount } from "@reown/appkit/react";
import UnauthorizedPage from "./UnauthorizedPage";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
export default function ClientAuthBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const { status: appKitStatus } = useAppKitAccount();

  const [
    isInitialConnectingStageComplete,
    setIsInitialConnectingStageComplete,
  ] = useState(false);

  useEffect(() => {
    if (
      appKitStatus !== "connecting" &&
      appKitStatus !== "reconnecting" &&
      appKitStatus !== undefined
    ) {
      setIsInitialConnectingStageComplete(true);
    }
  }, [isInitialConnectingStageComplete, appKitStatus]);

  // Render a loading spinner if the initial connecting stage is not complete
  if (!isInitialConnectingStageComplete) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (status === "authenticated" && appKitStatus === "connected") {
    return children;
  }

  return <UnauthorizedPage />;
}
