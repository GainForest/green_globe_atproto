import { PROJECT_OVERLAY_TABS } from "../../ProjectOverlay/store";
import { OverlayTabsState } from "../../Overlay/OverlayTabs/store";

export type RouteStateCatalog = {
  home: {
    _routeType: "home";
    config: null;
  };
  search: {
    _routeType: "search";
    config: {
      q: string | null;
    };
  };
  project: {
    _routeType: "project";
    config: {
      "app-tab": OverlayTabsState["activeTab"] | null;
      "project-id": string;
      "site-id": string | null;
      views: [(typeof PROJECT_OVERLAY_TABS)[number], ...string[]];
    };
  };
};

export type RouteDependentState = RouteStateCatalog[keyof RouteStateCatalog];

export type RouteStoreMetadata = {
  initialized: boolean;
};

export type LayersState = {
  "historical-satellite-date": string | null;
  "enabled-layers": string[];
};

export type RouteIndependentState = LayersState;
