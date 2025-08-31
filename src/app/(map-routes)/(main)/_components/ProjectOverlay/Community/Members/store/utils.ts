import { CommunityMember } from "./types";
import { listCommunityMemberRecords } from "../atproto-utils";
import { Agent } from '@atproto/api';

export const fetchCommunityMembers = async (
  projectId: string,
  agent?: Agent | null
): Promise<CommunityMember[] | null> => {
  // For DID-based projects (ATproto), use ATproto directly
  if (projectId.startsWith('did:plc:')) {
    if (!agent) {
      console.log('[fetchCommunityMembers] No ATproto agent available for DID project:', projectId);
      return [];
    }

    try {
      console.log('[fetchCommunityMembers] Fetching community members from ATproto for DID project:', projectId);
      const members = await listCommunityMemberRecords(agent, projectId);
      return members;
    } catch (error) {
      console.error('[fetchCommunityMembers] ATproto fetch failed, returning mock data:', error);
      return [{
        id: '1',
        wallet_address_id: null,
        project_id: 1,
        first_name: 'Project',
        last_name: 'Owner',
        title: 'Project Lead',
        bio: 'This is a decentralized project managed through ATproto.',
        profile_image_url: null,
        display_order: 1,
      }];
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
