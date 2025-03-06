import { create } from "zustand";
import { fetchPolygonByCID, fetchProjectDetails } from "./utils";
import { Project, ProjectPolygonAPIResponse } from "./types";

type State = {
  activeProjectId: string | undefined;
  activeProjectDetails: {
    status: "idle" | "loading" | "success" | "error";
    data: Project | null;
  };
  activeProjectPolygon: ProjectPolygonAPIResponse | null;
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
      if (!polygonAWSCID || !get().activeProjectDetails.data) {
        set({ activeProjectPolygon: null });
        return;
      }

      try {
        const polygon = await fetchPolygonByCID(polygonAWSCID);
        console.log(polygon);
        set({ activeProjectPolygon: polygon });
      } catch {
        set({ activeProjectPolygon: null });
      }
    },
  };
});
