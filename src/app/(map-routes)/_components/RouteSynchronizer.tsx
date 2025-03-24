"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import useProjectOverlayStore from "./ProjectOverlay/store";
import useRouteStore from "../_stores/route-store";
import useAppTabsStore from "./Sidebar/AppTabs/store";
import useSearchOverlayStore from "./SearchOverlay/store";

export default function RouteSynchronizer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const syncFromURL = useRouteStore((state) => state.syncFromURL);

  // Get values from Dedicated Stores
  const appTab = useAppTabsStore((state) => state.activeTab);
  const projectId = useProjectOverlayStore((state) => state.projectId);
  const projectOverlayTab = useProjectOverlayStore((state) => state.activeTab);
  const searchOverlayQueryString = useSearchOverlayStore(
    (state) => state.searchQuery
  );

  // Sync from URL to stores when URL changes
  useEffect(() => {
    console.log("change detected in URL", {
      pathname,
      searchParams,
    });
    syncFromURL(pathname, searchParams);
  }, [pathname, searchParams, syncFromURL]);

  // Sync from ProjectOverlayStore to URL when store values change
  useEffect(
    () => {
      console.log("change detected in dedicated stores", {
        appTab,
        projectId,
        projectOverlayTab,
        searchOverlayQueryString,
      });
      // Only update if there's a change to avoid loops
      useRouteStore.getState().syncToURL({
        "app-tab": appTab,
        "project-id": projectId,
        "project-overlay-tab": projectOverlayTab,
        "search-overlay-query-string": searchOverlayQueryString,
      });
    },

    // DEPENDENCIES:
    [
      appTab,
      projectId,
      projectOverlayTab,
      // Adding searchOverlayQueryString may cause synchronous blocking when typing fast in the search
      // searchOverlayQueryString
    ]
  );

  return null;
}
