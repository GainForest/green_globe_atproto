import { create } from "zustand";
import { Project, SiteAsset } from "./types";
import {
  fetchMeasuredTreesShapefile,
  fetchProjectData,
  fetchProjectPolygon,
} from "./utils";
import useMapStore from "../../Map/store";
import bbox from "@turf/bbox";
import useRouteStore from "../../RouteSynchronizer/store";
import { MeasuredTreesGeoJSON } from "./types";
import { AsyncData } from "@/lib/types";
type ProjectSiteOption = {
  value: string;
  label: string;
};

type ProjectStateCatalog = {
  loading: {
    projectData: null;
    projectDataStatus: "loading";
    allSitesOptions: null;
    activeSite: null;
    treesAsync: null;
  };
  success: {
    projectData: Project;
    projectDataStatus: "success";
    allSitesOptions: ProjectSiteOption[];
    activeSite: SiteAsset | null;
    treesAsync: AsyncData<MeasuredTreesGeoJSON | null>;
  };
  error: {
    projectData: null;
    projectDataStatus: "error";
    allSitesOptions: null;
    activeSite: null;
    treesAsync: null;
  };
};

type ProjectState = ProjectStateCatalog[keyof ProjectStateCatalog];

export const PROJECT_OVERLAY_TABS = [
  "info",
  "ask-ai",
  "biodiversity",
  "media",
  "remote-sensing-analysis",
  "community",
  "logbook",
  "edit",
] as const;

export type ProjectOverlayState = {
  projectId: string | undefined;
  activeTab: (typeof PROJECT_OVERLAY_TABS)[number];
  isMaximized: boolean;
} & ProjectState;

export type ProjectOverlayActions = {
  setProjectId: (projectId: ProjectOverlayState["projectId"]) => void;
  setActiveSite: (siteId: string) => void;
  setActiveTab: (tab: ProjectOverlayState["activeTab"]) => void;
  resetState: () => void;
  setIsMaximized: (isMaximized: ProjectOverlayState["isMaximized"]) => void;
};

const initialProjectState: ProjectState = {
  projectDataStatus: "loading",
  projectData: null,
  treesAsync: null,
  allSitesOptions: null,
  activeSite: null,
};

const initialState: ProjectOverlayState = {
  projectId: undefined,
  ...initialProjectState,
  activeTab: "info",
  isMaximized: false,
};

const useProjectOverlayStore = create<
  ProjectOverlayState & ProjectOverlayActions
>((set, get) => {
  const isProjectStillActive = (id: string) => get().projectId === id;

  const getAllSiteAssets = (projectData: Project) => {
    return projectData.assets.filter((asset) => {
      if (asset.classification !== "Shapefiles") return false;
      if (asset.shapefile === null) return false;
      const shapefile = asset.shapefile;
      return Boolean(shapefile.shortName && !shapefile.isReference);
    }) as SiteAsset[];
  };

  return {
    ...initialState,
    setProjectId: async (projectId) => {
      // Reset state if no id provided
      if (!projectId) {
        get().resetState();
        return;
      }

      // Set initial loading state
      set({
        projectId: projectId,
        ...initialProjectState,
      });

      // Fetch project data
      const projectData = await fetchProjectData(projectId);
      if (!isProjectStillActive(projectId)) return;

      if (!projectData) {
        set({
          projectDataStatus: "error",
          projectData: null,
        });
        return;
      }

      // Compute project site options
      const projectSites = getAllSiteAssets(projectData);

      const defaultSite = projectSites.find((site) => site.shapefile.default);
      const allSitesOptions = projectSites.map((site) => ({
        value: site.id,
        label: site.shapefile.shortName,
      }));

      set({
        projectDataStatus: "success",
        projectData: projectData,
        allSitesOptions: allSitesOptions,
        treesAsync: {
          _status: "loading",
          data: null,
        },
      });

      // Handle site selection first (synchronous operation)
      const { _routeType, config } = useRouteStore.getState();
      let siteToActivate = null;

      if (_routeType === "project" && config["site-id"]) {
        const siteId = config["site-id"];
        const site = projectSites.find((site) => site.id === siteId);
        if (site) {
          siteToActivate = siteId;
        }
      }

      if (!siteToActivate) {
        if (defaultSite) {
          siteToActivate = defaultSite.id;
        } else if (allSitesOptions.length > 0) {
          siteToActivate = allSitesOptions[0].value;
        }
      }

      if (siteToActivate) {
        get().setActiveSite(siteToActivate);
      }

      // Then fetch trees data (asynchronous operation)
      try {
        const data = await fetchMeasuredTreesShapefile(projectData.name);
        if (!isProjectStillActive(projectId)) return;
        set({
          treesAsync: {
            _status: "success",
            data,
          },
        });
      } catch (error) {
        console.error("Error fetching measured trees shapefile", error);
        if (!isProjectStillActive(projectId)) return;
        set({
          treesAsync: {
            _status: "error",
            data: null,
          },
        });
      }
    },
    setActiveSite: (siteId) => {
      const projectData = get().projectData;
      if (!projectData) return;
      const projectSites = getAllSiteAssets(projectData);
      const selectedSite = projectSites.find((site) => site.id === siteId);
      if (!selectedSite) return;

      useMapStore.getState().setCurrentView("project");
      fetchProjectPolygon(selectedSite.awsCID).then((data) => {
        if (data === null) return;
        const boundingBox = bbox(data).slice(0, 4) as [
          number,
          number,
          number,
          number
        ];
        useMapStore.getState().setMapBounds(boundingBox);
        useMapStore.getState().setHighlightedPolygon(data);
      });

      set({ activeSite: selectedSite });
    },
    setActiveTab: (tab) => {
      set({ activeTab: tab });
    },
    setIsMaximized: (isMaximized) => {
      set({ isMaximized });
    },
    resetState: () => set(initialState),
  };
});

export default useProjectOverlayStore;
