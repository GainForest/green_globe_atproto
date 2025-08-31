import { create } from "zustand";
import { CommunityMember } from "./types";
import useProjectOverlayStore from "@/app/(map-routes)/(main)/_components/ProjectOverlay/store";
import { fetchCommunityMembers } from "./utils";
import { Agent } from '@atproto/api';
type Data = {
  members: CommunityMember[];
};

type DataCatalog = {
  loading: {
    data: null;
    dataStatus: "loading";
  };
  success: {
    data: Data;
    dataStatus: "success";
  };
  error: {
    data: null;
    dataStatus: "error";
  };
};

type DataVariant = DataCatalog[keyof DataCatalog];

export type CommunityMembersState = {
  projectId: string | null;
} & DataVariant;

export type CommunityMembersActions = {
  fetchData: (agent?: Agent | null, projectId?: string) => Promise<void>;
};

const useCommunityMembersStore = create<
  CommunityMembersState & CommunityMembersActions
>((set, get) => ({
  data: null,
  projectId: null,
  dataStatus: "loading",
  fetchData: async (agent, projectIdParam) => {
    const projectId = projectIdParam || useProjectOverlayStore.getState().projectId;
    console.log('[Zustand fetchData] Called with:', {
      projectIdParam,
      projectId,
      hasAgent: !!agent,
      agentAccountDid: agent?.accountDid
    });

    if (!projectId) {
      console.log('[Zustand fetchData] No projectId, returning early');
      return;
    }

    // Do not fetch data if the projectId is the same and the data is already loaded
    if (projectId === get().projectId && get().dataStatus === "success") {
      console.log('[Zustand fetchData] Same projectId and already loaded, skipping fetch');
      return;
    }

    console.log('[Zustand fetchData] Starting fetch for projectId:', projectId);
    set({ projectId, dataStatus: "loading", data: null });
    try {
      const membersPromise = fetchCommunityMembers(projectId, agent);
      const allPromises = [membersPromise];
      const [members] = await Promise.all(allPromises);

      console.log('[Zustand fetchData] Fetch completed:', {
        membersCount: members?.length || 0,
        members: members
      });

      if (projectId === get().projectId) {
        const newData = { members: members || [] };
        console.log('[Zustand fetchData] About to update state:', {
          currentProjectId: get().projectId,
          newProjectId: projectId,
          currentMembersCount: get().data?.members?.length || 0,
          newMembersCount: newData.members.length,
          members: newData.members
        });
        set({ data: newData, dataStatus: "success" });
        console.log('[Zustand fetchData] State updated successfully');
        console.log('[Zustand fetchData] New store state:', {
          projectId: get().projectId,
          dataStatus: get().dataStatus,
          membersCount: get().data?.members?.length || 0
        });
      } else {
        console.log('[Zustand fetchData] Project ID mismatch, not updating:', {
          storeProjectId: get().projectId,
          fetchProjectId: projectId
        });
      }
    } catch (error) {
      console.error('[Zustand fetchData] Error:', error);
      set({ data: null, dataStatus: "error" });
    }
  },
}));

export default useCommunityMembersStore;
