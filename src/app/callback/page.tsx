"use client";

import { useAtproto } from "../_components/Providers/AtprotoProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
  const { isInitialized, isAuthenticated, userProfile, error } = useAtproto();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    // Add a small delay to allow OAuth processing to complete
    const timer = setTimeout(() => {
      if (error) {
        setStatus('error');
        return;
      }

      if (isAuthenticated && userProfile) {
        setStatus('success');
        // Redirect to main page after successful authentication
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else if (isInitialized && !error) {
        // If we're initialized but not authenticated and no error,
        // this might be an invalid callback or normal page load
        console.warn('Callback page loaded but no authentication found');
        setStatus('error');
      }
    }, 1000); // Wait 1 second for OAuth processing

    return () => clearTimeout(timer);
  }, [isInitialized, isAuthenticated, userProfile, error, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="size-8 animate-spin mx-auto" />
          <h1 className="text-xl font-semibold">Completing sign in...</h1>
          <p className="text-muted-foreground">Please wait while we finish authenticating you.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h1 className="text-xl font-semibold">Authentication Failed</h1>
          <p className="text-muted-foreground">
            There was an issue completing your sign in. Please try again.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success' && userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-green-500 text-4xl">✅</div>
          <h1 className="text-xl font-semibold">Welcome, {userProfile.displayName || userProfile.handle}!</h1>
          <p className="text-muted-foreground">
            You have successfully signed in with Bluesky.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting you to the main page...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
