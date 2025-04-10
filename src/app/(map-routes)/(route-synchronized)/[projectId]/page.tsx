"use client";

import { useSearchParams } from "next/navigation";
import { use, useCallback, useEffect } from "react";
import useProjectOverlayStore from "../../_components/ProjectOverlay/store";
import useOverlayTabsStore from "../../_components/Overlay/OverlayTabs/store";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const queryParams = useSearchParams();

  const overlayTab = queryParams.get("overlay-tab");
  const siteId = queryParams.get("site-id");

  const updateStores = useCallback(() => {
    console.log("updating stores", projectId);
    useProjectOverlayStore
      .getState()
      .setProjectId(projectId, siteId ?? undefined);

    if (overlayTab) {
      useOverlayTabsStore
        .getState()
        .setActiveTab(overlayTab as "search" | "project" | "hovered-tree");
    } else {
      useOverlayTabsStore.getState().setActiveTab("search");
    }
  }, [projectId, overlayTab, siteId]);

  useEffect(() => {
    updateStores();
  }, [updateStores]);

  return null;
}
