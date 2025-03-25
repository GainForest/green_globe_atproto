import { RouteState } from "..";
import useBiodiversityPredictionsStore from "../../../ProjectOverlay/Biodiversity/Predictions/store";
import useBiodiversityStore from "../../../ProjectOverlay/Biodiversity/store";
import useCommunityStore from "../../../ProjectOverlay/Community/store";
import useProjectOverlayStore, {
  PROJECT_OVERLAY_TABS,
} from "../../../ProjectOverlay/store";
import useAppTabsStore, {
  APP_TABS,
  AppTab,
} from "../../../Sidebar/AppTabs/store";
import { RouteStateCatalog } from "../types";
import {
  verifyKeyType,
  isStateChanged,
  generateQueryParamsFromObject,
} from "./index";

type ProjectOverlayTab = (typeof PROJECT_OVERLAY_TABS)[number];

export const getViewsFromStates = () => {
  const view0 = useProjectOverlayStore.getState().activeTab;
  const views: [ProjectOverlayTab, ...string[]] = [view0];
  if (view0 !== "biodiversity" && view0 !== "community") {
    return views;
  }

  if (view0 === "biodiversity") {
    const tab = useBiodiversityStore.getState().activeTab;
    views.push(tab);
    if (tab === "predictions") {
      const subTab = useBiodiversityPredictionsStore.getState().page;
      if (subTab) {
        views.push(subTab);
      }
    }
    return views;
  }

  if (view0 === "community") {
    const tab = useCommunityStore.getState().activeTab;
    views.push(tab);
    return views;
  }

  return views;
};

const MAX_VIEWS = 10;

type ViewNode = null | {
  [key: string]: ViewNode;
};

const viewsMap: Record<ProjectOverlayTab, ViewNode> = {
  info: null,
  community: {
    members: null,
    donations: null,
  },
  biodiversity: {
    predictions: {
      plants: null,
      animals: null,
    },
    observations: null,
  },
  "ask-ai": null,
  media: null,
  "remote-sensing-analysis": null,
  logbook: null,
  edit: null,
} as const;

const generateViewsArrayFromSearchParams = (
  searchParams: URLSearchParams
): [ProjectOverlayTab, ...string[]] => {
  // Initialize an array of null values
  const viewEntries = Array<string | null>(MAX_VIEWS).fill(null);

  const searchParamsObj = Object.fromEntries(searchParams.entries());

  // Iterate over the search params and populate the viewEntries array
  Object.entries(searchParamsObj).map(([key, value]) => {
    let viewIndex;
    try {
      viewIndex = parseInt(key.replace("view-", ""));
    } catch {}

    if (
      viewIndex === undefined ||
      isNaN(viewIndex) ||
      viewIndex < 0 ||
      viewIndex >= MAX_VIEWS
    ) {
      return;
    }

    try {
      viewEntries[viewIndex] = value;
    } catch {}
  });

  const view0 = viewEntries[0];
  if (!verifyKeyType(view0, PROJECT_OVERLAY_TABS)) {
    return ["info"];
  }
  const projectOverlayTab = view0;

  const toReturn: [ProjectOverlayTab, ...string[]] = [projectOverlayTab];
  let viewNode: ViewNode = viewsMap[projectOverlayTab];

  for (const view of viewEntries.slice(1)) {
    if (typeof view !== "string") {
      return toReturn;
    }
    if (viewNode === null) {
      return toReturn;
    }

    const keys = Object.keys(viewNode) as string[];
    if (keys.includes(view)) {
      toReturn.push(view);
      viewNode = structuredClone(viewNode[view as keyof typeof viewNode]);
    } else {
      return toReturn;
    }
  }

  return toReturn;
};

export const setViewsStates = (views: [ProjectOverlayTab, ...string[]]) => {
  const view0 = views[0];
  useProjectOverlayStore.getState().setActiveTab(view0);

  if (view0 === "biodiversity") {
    if (views.length > 1) {
      const view1 = views[1];
      useBiodiversityStore
        .getState()
        .setActiveTab(view1 as "predictions" | "observations");

      if (view1 === "predictions") {
        if (views.length > 2) {
          useBiodiversityPredictionsStore
            .getState()
            .setPage(views[2] as "plants" | "animals");
        }
        return;
      }

      return;
    }
  }

  if (view0 === "community") {
    if (views.length > 1) {
      const view1 = views[1];
      useCommunityStore
        .getState()
        .setActiveTab(view1 as "members" | "donations");
    }
    return;
  }
};

export const dispatchProjectStatesFromURL = (
  projectId: string,
  searchParams: URLSearchParams
): RouteState | null => {
  const appTabParam = searchParams.get("app-tab");
  let appTab: AppTab | null = null;
  if (verifyKeyType(appTabParam, APP_TABS)) {
    appTab = appTabParam as AppTab;
  }
  const siteId = searchParams.get("site-id");
  const views = generateViewsArrayFromSearchParams(searchParams);

  const appTabsStoreState = useAppTabsStore.getState();
  if (appTab && appTabsStoreState.activeTab !== appTab) {
    appTabsStoreState.setActiveTab(appTab);
  }

  const projectStoreState = useProjectOverlayStore.getState();
  if (projectStoreState.projectId !== projectId) {
    projectStoreState.setProjectId(projectId);
  }

  setViewsStates(views);

  const state: RouteState = {
    _routeType: "project",
    config: {
      "app-tab": appTab,
      "project-id": projectId,
      "site-id": siteId,
      views: views,
    },
  };

  return isStateChanged(state) ? state : null;
};

export const generateURLFromProjectStates = (
  state: RouteStateCatalog["project"]
) => {
  const queryParamsString = generateQueryParamsFromObject(state.config, {
    excludeKeys: ["project-id", "views"],
  });
  const viewsString = state.config.views
    .map((view, index) => `view-${index}=${view}`)
    .join("&");
  return `/${state.config["project-id"]}?${queryParamsString}&${viewsString}`;
};
