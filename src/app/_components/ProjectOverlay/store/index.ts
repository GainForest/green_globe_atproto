import { create } from "zustand";
import { Project, SiteAsset } from "./types";
import { fetchProjectData } from "./utils";
import useMapStore from "../../Map/store";

type ProjectSiteOption = {
  value: string;
  label: string;
};

type ProjectOverlayStateCatalog = {
  loading: {
    projectData: null;
    projectDataStatus: "loading";
    allSitesOptions: null;
    activeSite: null;
  };
  success: {
    projectData: Project;
    projectDataStatus: "success";
    allSitesOptions: ProjectSiteOption[];
    activeSite: SiteAsset | null;
  };
  error: {
    projectData: null;
    projectDataStatus: "error";
    allSitesOptions: null;
    activeSite: null;
  };
};

type ProjectOverlayStateVariant =
  ProjectOverlayStateCatalog[keyof ProjectOverlayStateCatalog];

export type ProjectOverlayState = {
  projectId: string | undefined;
  activeTab:
    | "info"
    | "ask-ai"
    | "biodiversity"
    | "media"
    | "remote-sensing-analysis"
    | "community-donations"
    | "logbook"
    | "edit";
} & ProjectOverlayStateVariant;

export type ProjectOverlayActions = {
  setProjectId: (projectId: ProjectOverlayState["projectId"]) => void;
  setActiveSite: (siteId: string) => void;
  setActiveTab: (tab: ProjectOverlayState["activeTab"]) => void;
  resetState: () => void;
};

const initialState: ProjectOverlayState = {
  projectId: undefined,
  projectDataStatus: "loading",
  projectData: null,
  allSitesOptions: null,
  activeSite: null,
  activeTab: "info",
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
        projectDataStatus: "loading",
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
      });
      useMapStore.getState().setProjectTrees(projectData.name);

      if (defaultSite) {
        get().setActiveSite(defaultSite.id);
      } else if (allSitesOptions.length > 0) {
        get().setActiveSite(allSitesOptions[0].value);
      }
    },
    setActiveSite: (siteId) => {
      const projectData = get().projectData;
      if (!projectData) return;
      const projectSites = getAllSiteAssets(projectData);
      const selectedSite = projectSites.find((site) => site.id === siteId);
      if (!selectedSite) return;

      useMapStore.getState().setProjectPolygon(selectedSite.awsCID);
      set({ activeSite: selectedSite });
    },
    setActiveTab: (tab) => {
      set({ activeTab: tab });
    },
    resetState: () => set(initialState),
  };
});

export default useProjectOverlayStore;
