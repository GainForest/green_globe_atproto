import { CommunityMember } from "./types";
import { listCommunityMemberRecords } from "../atproto-utils";
import { Agent } from '@atproto/api';

export const fetchCommunityMembers = async (
  projectId: string,
  agent?: Agent | null
): Promise<CommunityMember[] | null> => {
  console.log('[fetchCommunityMembers] Called with:', {
    projectId,
    isDidProject: projectId.startsWith('did:plc:'),
    hasAgent: !!agent,
    agentAccountDid: agent?.accountDid
  });

  // For DID-based projects (ATproto), use ATproto directly
  if (projectId.startsWith('did:plc:')) {
    if (!agent) {
      console.log('[fetchCommunityMembers] No ATproto agent available for DID project:', projectId);
      return [];
    }

    try {
      console.log('[fetchCommunityMembers] Fetching community members from ATproto for DID project:', projectId);
      const members = await listCommunityMemberRecords(agent, projectId);
      console.log('[fetchCommunityMembers] ATproto fetch result:', {
        membersCount: members?.length || 0,
        members: members
      });
      return members;
    } catch (error) {
      console.error('[fetchCommunityMembers] ATproto fetch failed, returning empty array:', error);
      return []; // Return empty array instead of mock data
    }
  }

  // For traditional database projects, use the API
  try {
    const response = await fetch(`/api/projects/${projectId}/members`);
    const data = await response.json();
    if (data.success === true) {
      return data.data;
    } else {
      throw new Error(data.error || 'Failed to fetch members');
    }
  } catch (error) {
    console.error('[fetchCommunityMembers] API call failed, returning null:', error);
    return null;
  }
};
