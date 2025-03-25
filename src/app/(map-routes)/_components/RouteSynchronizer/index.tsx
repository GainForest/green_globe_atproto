"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import useRouteStore from "./store";
import useAppTabsStore from "../Sidebar/AppTabs/store";
import useProjectOverlayStore from "../ProjectOverlay/store";
import useSearchOverlayStore from "../SearchOverlay/store";
import useReadViews from "./hooks/useReadViews";
export default function RouteSynchronizer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialized = useRouteStore((state) => state.initialized);
  const syncToURL = useRouteStore((state) => state.syncToURL);
  const syncFromURL = useRouteStore((state) => state.syncFromURL);

  // Get values from Dedicated Stores
  const appTab = useAppTabsStore((state) => state.activeTab);
  const projectId = useProjectOverlayStore((state) => state.projectId);
  // const projectOverlayTab = useProjectOverlayStore((state) => state.activeTab);
  const searchQuery = useSearchOverlayStore((state) => state.searchQuery);
  const activeSite = useProjectOverlayStore((state) => state.activeSite);

  const views = useReadViews();

  useEffect(() => {
    syncFromURL(pathname, searchParams);
  }, [pathname, searchParams, syncFromURL]);

  useEffect(
    () => {
      if (!initialized) {
        return;
      }

      if (projectId) {
        if (!views) return;
        syncToURL({
          _routeType: "project",
          config: {
            "app-tab": appTab,
            "project-id": projectId,
            "site-id": activeSite?.id ?? null,
            views,
          },
        });
        return;
      }

      if (searchQuery && searchQuery !== "") {
        syncToURL({
          _routeType: "search",
          config: {
            q: searchQuery,
          },
        });
        return;
      }

      syncToURL({
        _routeType: "home",
        config: null,
      });
    },

    // DEPENDENCIES:
    [
      appTab,
      projectId,
      activeSite,
      //  projectOverlayTab,
      searchQuery,
      views,
      initialized,
      syncToURL,
    ]
  );

  return null;
}
