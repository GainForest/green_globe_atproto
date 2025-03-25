import { create } from "zustand";
import { RouteStateCatalog } from "./types";
import { dispatchSearchStatesFromURL } from "./utils/search";
import {
  dispatchProjectStatesFromURL,
  generateURLFromProjectStates,
} from "./utils/project";
import { generateURLFromSearchStates } from "./utils/search";

// Entities, that need to be tracked:
export type RouteState = RouteStateCatalog[keyof RouteStateCatalog];

export type RouteStoreMetadata = {
  initialized: boolean;
};

export type RouteActions = {
  syncFromURL: (pathname: string, searchParams: URLSearchParams) => void;
  syncToURL: (state: RouteState) => void;
};

const useRouteStore = create<RouteState & RouteStoreMetadata & RouteActions>(
  (set, get) => ({
    _routeType: "home",
    config: null,
    initialized: false,
    syncFromURL: (pathname: string, searchParams: URLSearchParams) => {
      // Remove leading and trailing slashes
      const pathCrumbs = pathname
        .replace(/^\//, "")
        .replace(/\/$/, "")
        .split("/");

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
      const { _routeType } = stateValuesFromDedicatedStores;

      if (!get().initialized) {
        return;
      }

      if (_routeType === "home") {
        window.history.pushState({}, "", "/");
        return;
      }

      if (_routeType === "search") {
        const url = generateURLFromSearchStates(stateValuesFromDedicatedStores);
        window.history.pushState({}, "", url);
        return;
      }

      if (_routeType === "project") {
        const url = generateURLFromProjectStates(
          stateValuesFromDedicatedStores
        );
        window.history.pushState({}, "", url);
        return;
      }
    },
  })
);

export default useRouteStore;
