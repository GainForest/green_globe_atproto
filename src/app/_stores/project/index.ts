import { create } from "zustand";
import {
  fetchMeasuredTreesShapefile,
  fetchPolygonByCID,
  fetchProjectDetails,
} from "./utils";
import {
  Project,
  ProjectPolygonAPIResponse,
  MeasuredTreesGeoJSON,
} from "./types";

type State = {
  activeProjectId: string | undefined;
  activeProjectDetails: {
    status: "idle" | "loading" | "success" | "error";
    data: Project | null;
  };
  activeProjectPolygon: ProjectPolygonAPIResponse | null;
  activeProjectMeasuredTreesShapefile: {
    status: "idle" | "loading" | "success" | "error";
    data: MeasuredTreesGeoJSON | null;
  };
};

type Actions = {
  setActiveProjectId: (id: string | undefined) => void;
  setActiveProjectPolygonByCID: (polygonAWSCID: string | undefined) => void;
  resetState: () => void;
};

const initialState: State = {
  activeProjectId: undefined,
  activeProjectDetails: { status: "idle", data: null },
  activeProjectPolygon: null,
  activeProjectMeasuredTreesShapefile: { status: "idle", data: null },
};

export const useProjectStore = create<State & Actions>((set, get) => {
  // Helper function to check if project ID is still active
  const isProjectStillActive = (id: string) => get().activeProjectId === id;

  return {
    ...initialState,
    resetState: () => set(initialState),

    setActiveProjectId: async (id) => {
      // Reset state if no id provided
      if (!id) {
        get().resetState();
        return;
      }

      // Step 1: Set initial loading state
      set({
        activeProjectId: id,
        activeProjectDetails: { status: "loading", data: null },
      });

      // Step 2: Fetch project details
      try {
        const projectDetails = await fetchProjectDetails(id);

        // Verify that the project id state hasn't changed since then
        if (!isProjectStillActive(id)) return;

        if (!projectDetails) {
          set({
            activeProjectDetails: { status: "error", data: null },
          });
          return;
        }

        // Step 3: Update project details
        set({
          activeProjectDetails: { status: "success", data: projectDetails },
        });

        // Step 4: Fetch measured trees shapefile
        try {
          set({
            activeProjectMeasuredTreesShapefile: {
              status: "loading",
              data: null,
            },
          });
          const treeShapefile = await fetchMeasuredTreesShapefile(
            projectDetails.name
          );
          if (!isProjectStillActive(id)) return;
          set({
            activeProjectMeasuredTreesShapefile: {
              status: "success",
              data: treeShapefile,
            },
          });
        } catch {
          // Error doesn't occur for now because the function doesn't throw an error explicitly.
        }
      } catch {
        // Verify that the project id state hasn't changed since then
        if (isProjectStillActive(id)) {
          set({
            activeProjectDetails: { status: "error", data: null },
          });
        }
      }
    },
    setActiveProjectPolygonByCID: async (polygonAWSCID) => {
      if (!polygonAWSCID) {
        set({ activeProjectPolygon: null });
        return;
      }

      try {
        const polygon = await fetchPolygonByCID(polygonAWSCID);
        if (!get().activeProjectDetails.data) {
          set({ activeProjectPolygon: null });
          return;
        }
        set({ activeProjectPolygon: polygon });
      } catch {
        set({ activeProjectPolygon: null });
      }
    },
  };
});
