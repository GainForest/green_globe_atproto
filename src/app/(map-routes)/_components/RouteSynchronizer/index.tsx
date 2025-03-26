"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import useRouteStore from "./store";
import useAppTabsStore from "../Sidebar/AppTabs/store";
import useProjectOverlayStore from "../ProjectOverlay/store";
import useSearchOverlayStore from "../SearchOverlay/store";
import useReadViews from "./hooks/useReadViews";
import useLayersOverlayStore from "../LayersOverlay/store";
export default function RouteSynchronizer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialized = useRouteStore((state) => state.initialized);
  const syncToURL = useRouteStore((state) => state.syncToURL);
  const syncFromURL = useRouteStore((state) => state.syncFromURL);

  // Get values from Dedicated Stores
  const appTab = useAppTabsStore((state) => state.activeTab);
  const projectId = useProjectOverlayStore((state) => state.projectId);
  const searchQuery = useSearchOverlayStore((state) => state.searchQuery);
  const activeSite = useProjectOverlayStore((state) => state.activeSite);
  const isHistoricalSatelliteEnabled = useLayersOverlayStore(
    (state) => state.staticLayersVisibility.historicalSatellite
  );
  const historicalSatelliteDate = useLayersOverlayStore(
    (state) => state.historicalSatelliteState.formattedCurrentDate
  );
  const categorizedDynamicLayers = useLayersOverlayStore(
    (state) => state.categorizedDynamicLayers
  );
  const projectSpecificLayers = useLayersOverlayStore(
    (state) => state.projectSpecificLayers
  );
  const enabledLayers = useMemo(() => {
    const arr: string[] = [];
    // If the layers are still loading...
    if (
      categorizedDynamicLayers.length === 0 ||
      projectSpecificLayers.layers === null
    ) {
      return null;
    }
    categorizedDynamicLayers.forEach((category) => {
      const categoryKey = Object.keys(category)[0] as keyof typeof category;
      const layers = category[categoryKey];
      layers.forEach((layer) => {
        if (layer.visible) {
          arr.push(layer.name);
        }
      });
    });
    projectSpecificLayers.layers.forEach((layer) => {
      if (layer.visible) {
        arr.push(layer.name);
      }
    });
    return arr;
  }, [categorizedDynamicLayers, projectSpecificLayers]);

  const views = useReadViews();

  useEffect(() => {
    syncFromURL(pathname, searchParams);
  }, [pathname, searchParams, syncFromURL]);

  useEffect(
    () => {
      if (!initialized) {
        return;
      }

      const layersStates = {
        "historical-satellite-date": isHistoricalSatelliteEnabled
          ? historicalSatelliteDate
          : null,
        "enabled-layers":
          enabledLayers ?? useRouteStore.getState()["enabled-layers"],
      };

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
          ...layersStates,
        });
        return;
      }

      if (searchQuery && searchQuery !== "") {
        syncToURL({
          _routeType: "search",
          config: {
            q: searchQuery,
          },
          ...layersStates,
        });
        return;
      }

      syncToURL({
        _routeType: "home",
        config: null,
        ...layersStates,
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
      isHistoricalSatelliteEnabled,
      historicalSatelliteDate,
      enabledLayers,
    ]
  );

  return null;
}
