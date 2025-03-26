import { create } from "zustand";
import {
  RouteDependentState,
  RouteIndependentState,
  RouteStateCatalog,
  RouteStoreMetadata,
} from "./types";
import { dispatchSearchStatesFromURL } from "./utils/search";
import {
  dispatchProjectStatesFromURL,
  generateURLFromProjectStates,
} from "./utils/project";
import { generateURLFromSearchStates } from "./utils/search";
import {
  dispatchLayersStatesFromURL,
  generateQueryParamsFromLayersStates,
  joinURLParams,
} from "./utils/layers";
// Entities, that need to be tracked:
export type RouteState = RouteDependentState &
  RouteIndependentState &
  RouteStoreMetadata;

export type RouteActions = {
  syncFromURL: (pathname: string, searchParams: URLSearchParams) => void;
  syncToURL: (state: Omit<RouteState, keyof RouteStoreMetadata>) => void;
};

const useRouteStore = create<RouteState & RouteActions>((set, get) => ({
  _routeType: "home",
  config: null,
  initialized: false,
  "historical-satellite-date": null,
  "enabled-layers": [],
  syncFromURL: (pathname: string, searchParams: URLSearchParams) => {
    // Remove leading and trailing slashes
    const pathCrumbs = pathname
      .replace(/^\//, "")
      .replace(/\/$/, "")
      .split("/");

    const layersState = dispatchLayersStatesFromURL(searchParams);

    if (layersState) {
      set({ ...layersState });
    }

    if (pathCrumbs.length === 0) {
      set({ _routeType: "home", config: null, initialized: true });
      return;
    }

    const firstPathCrumb = pathCrumbs[0];
    if (firstPathCrumb === "") {
      set({ _routeType: "home", config: null, initialized: true });
      return;
    }

    if (firstPathCrumb === "search") {
      const state = dispatchSearchStatesFromURL(searchParams);
      if (state) {
        set({ ...state, initialized: true });
      }
      return;
    }

    // Handle project route
    // NOW ONLY PROJECT ROUTE IS LEFT, WHICH IS DYNAMIC

    const state = dispatchProjectStatesFromURL(firstPathCrumb, searchParams);
    if (state) {
      set({ ...state, initialized: true });
    }
    return;
  },

  syncToURL: (stateValuesFromDedicatedStores) => {
    const {
      _routeType,
      "historical-satellite-date": historicalSatelliteDate,
      "enabled-layers": enabledLayers,
    } = stateValuesFromDedicatedStores;

    if (!get().initialized) {
      return;
    }

    const layersQueryParams = generateQueryParamsFromLayersStates({
      "historical-satellite-date": historicalSatelliteDate,
      "enabled-layers": enabledLayers,
    });
    if (_routeType === "home") {
      window.history.pushState({}, "", joinURLParams("/", layersQueryParams));
      return;
    }

    if (_routeType === "search") {
      const url = generateURLFromSearchStates(
        stateValuesFromDedicatedStores as RouteStateCatalog["search"]
      );
      window.history.pushState({}, "", joinURLParams(url, layersQueryParams));
      return;
    }

    if (_routeType === "project") {
      const url = generateURLFromProjectStates(
        stateValuesFromDedicatedStores as RouteStateCatalog["project"]
      );
      window.history.pushState({}, "", joinURLParams(url, layersQueryParams));
      return;
    }
  },
}));

export default useRouteStore;
