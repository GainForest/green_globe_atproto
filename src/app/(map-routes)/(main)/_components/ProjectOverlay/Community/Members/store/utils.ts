import { PaginatedApiResponse } from "@/lib/types";
import { CommunityMember } from "./types";

export const fetchCommunityMembers = async (projectId: string) => {
  // For DID-based projects (ATproto), return a mock community member
  if (projectId.startsWith('did:plc:')) {
    console.log('[fetchCommunityMembers] Returning mock community member for DID project:', projectId);
    return [{
      id: 1,
      firstName: 'Project',
      lastName: 'Owner',
      priority: 1,
      role: 'Project Lead',
      bio: 'This is a decentralized project managed through ATproto.',
      fundsReceived: null,
      profileUrl: null,
      Wallet: {
        CeloAccounts: null,
        SOLAccounts: null,
      },
    }];
  }

  try {
    const response = await fetch(`/api/users?projectId=${projectId}`);
    const data: PaginatedApiResponse<CommunityMember> = await response.json();
    if (data.success === true) {
      return data.data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('[fetchCommunityMembers] API call failed, returning null:', error);
    return null;
  }
};
