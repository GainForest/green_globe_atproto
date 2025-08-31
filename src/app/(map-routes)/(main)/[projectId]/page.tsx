"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, use } from "react";
import useStoreUrlSync from "../_features/navigation/use-store-url-sync";

function Project({ projectId }: { projectId: string }) {
  console.log('[Project Component] Rendered with projectId:', projectId);
  const queryParams = useSearchParams();
  console.log('[Project Component] Query params:', Object.fromEntries(queryParams.entries()));

  // Always call hooks at the top level
  useStoreUrlSync(queryParams, { projectId });

  // Check URL parameters to determine if this should be treated as a profile vs project
  const activeTab = queryParams.get('overlay-active-tab');
  const isProfileView = activeTab === 'profile' || queryParams.has('profile-view');

  // If this is a DID and it's explicitly a profile view, redirect
  if (projectId.startsWith('did:plc:') && isProfileView) {
    console.log('[ProjectPage] Detected DID with profile view, redirecting to profile:', projectId);
    if (typeof window !== 'undefined') {
      window.location.replace(`/profile/${projectId}`);
    }
    return null;
  }

  // Otherwise, treat DID as a project (user's environmental project)
  console.log('[ProjectPage] Loading DID as project:', projectId);
  console.log('[ProjectPage] Query params:', Object.fromEntries(queryParams.entries()));

  return null;
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  return (
    <Suspense>
      <Project projectId={projectId} />
    </Suspense>
  );
}
