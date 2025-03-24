import { create } from "zustand";
import useProjectOverlayStore, {
  PROJECT_OVERLAY_TABS,
} from "@/app/(map-routes)/_components/ProjectOverlay/store";
import { ProjectOverlayState } from "@/app/(map-routes)/_components/ProjectOverlay/store/index";
import useAppTabsStore, {
  APP_TABS,
  AppTabsState,
} from "../_components/Sidebar/AppTabs/store";
import useSearchOverlayStore from "../_components/SearchOverlay/store";

// Entities, that need to be tracked:
export type RouteState = {
  "project-id": string | null;
  "project-overlay-tab": ProjectOverlayState["activeTab"] | null;
  "app-tab": AppTabsState["activeTab"] | null;
  "search-overlay-query-string": string | null;
};

export type RouteActions = {
  syncFromURL: (pathname: string, searchParams: URLSearchParams) => void;
  syncToURL: (state: Partial<RouteState>) => void;
};

const INITIAL_STATE: RouteState = {
  "project-id": null,
  "project-overlay-tab": null,
  "app-tab": null,
  "search-overlay-query-string": null,
};

const useRouteStore = create<RouteState & RouteActions>((set, get) => ({
  ...INITIAL_STATE,

  syncFromURL: (pathname: string, searchParams: URLSearchParams) => {
    console.log("syncFromURL", pathname, searchParams);
    // Remove leading and trailing slashes
    const pathCrumbs = pathname
      .replace(/^\//, "")
      .replace(/\/$/, "")
      .split("/");
    if (pathCrumbs.length === 0) {
      return;
    }
    const firstPathCrumb = pathCrumbs[0];
    if (firstPathCrumb === "") {
      return;
    }

    const updateIfChanged = (
      state: Partial<{
        [key in keyof RouteState]: {
          thisStoreValue: RouteState[key];
          dedicatedStoreValueSetter?: () => void;
        };
      }>
    ) => {
      Object.keys(state).forEach((key) => {
        const stateKey = key as keyof RouteState;
        const record = state[stateKey];
        if (!record) return;
        const { thisStoreValue, dedicatedStoreValueSetter } = record;
        if (get()[stateKey] !== thisStoreValue) {
          set({ [stateKey]: thisStoreValue });
        }
        dedicatedStoreValueSetter?.();
      });
    };

    // Handle search route
    if (firstPathCrumb === "search") {
      const queryString = searchParams.get("search-overlay-query-string");

      updateIfChanged({
        "app-tab": {
          thisStoreValue: "search",
          dedicatedStoreValueSetter: () => {
            const currentValue = useAppTabsStore.getState().activeTab;
            if (currentValue !== "search") {
              useAppTabsStore.getState().setActiveTab("search");
            }
          },
        },
        "search-overlay-query-string": {
          thisStoreValue: queryString ?? null,
          dedicatedStoreValueSetter: () => {
            const currentValue = useSearchOverlayStore.getState().searchQuery;
            if (currentValue !== queryString) {
              useSearchOverlayStore
                .getState()
                .setSearchQuery(queryString ?? "");
            }
          },
        },
        "project-id": {
          thisStoreValue: null,
        },
        "project-overlay-tab": {
          thisStoreValue: null,
        },
      });

      return;
    }

    // Handle project route
    // NOW ONLY PROJECT ROUTE IS LEFT, WHICH IS DYNAMIC

    let projectOverlayTab = searchParams.get("project-overlay-tab");
    type ProjectOverlayTab = (typeof PROJECT_OVERLAY_TABS)[number];
    if (projectOverlayTab) {
      if (
        PROJECT_OVERLAY_TABS.includes(projectOverlayTab as ProjectOverlayTab)
      ) {
        projectOverlayTab = projectOverlayTab as ProjectOverlayTab;
      } else {
        projectOverlayTab = null;
      }
    }

    let appTab = searchParams.get("app-tab");
    type AppTab = (typeof APP_TABS)[number];
    if (appTab) {
      if (APP_TABS.includes(appTab as AppTab)) {
        appTab = appTab as AppTab;
      } else {
        appTab = null;
      }
    }

    updateIfChanged({
      "project-id": {
        thisStoreValue: firstPathCrumb,
        dedicatedStoreValueSetter: () => {
          useProjectOverlayStore.getState().setProjectId(firstPathCrumb);
        },
      },
      "project-overlay-tab": {
        thisStoreValue: projectOverlayTab as ProjectOverlayTab,
        dedicatedStoreValueSetter: () => {
          useProjectOverlayStore
            .getState()
            .setActiveTab(projectOverlayTab as ProjectOverlayTab);
        },
      },
      "app-tab": {
        thisStoreValue: appTab as AppTab,
        dedicatedStoreValueSetter: () => {
          useAppTabsStore.getState().setActiveTab(appTab as AppTab);
        },
      },
      "search-overlay-query-string": {
        thisStoreValue: null,
      },
    });
  },

  syncToURL: (stateValuesFromDedicatedStores) => {
    console.trace("syncToURL", stateValuesFromDedicatedStores);
    const {
      "project-id": projectId,
      "app-tab": appTab,
      "search-overlay-query-string": searchQuery,
    } = stateValuesFromDedicatedStores;

    // Handle search route
    if (appTab === "search" && !projectId) {
      window.history.pushState(
        {},
        "",
        `/search?search-overlay-query-string=${searchQuery}`
      );
      return;
    }

    const generateParamsFromState = (
      state: Partial<RouteState>,
      skipKeys: (keyof RouteState)[] = []
    ) => {
      return Object.entries(state)
        .filter(
          ([key, value]) =>
            value !== null &&
            value !== undefined &&
            !skipKeys.includes(key as keyof RouteState)
        )
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
    };

    // Handle project route
    if (projectId) {
      window.history.pushState(
        {},
        "",
        `/${projectId}?${generateParamsFromState(
          stateValuesFromDedicatedStores,
          ["project-id"]
        )}`
      );
      return;
    }

    // set({ projectId: newProjectId, projectOverlayTab: validTab });
  },
}));

export default useRouteStore;
