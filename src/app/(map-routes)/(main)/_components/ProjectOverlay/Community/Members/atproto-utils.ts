import { Agent } from '@atproto/api';
import { CommunityMemberRecord } from '@/lib/lexicon/types/app/gainforest/community';
import { CommunityMember } from './store/types';

// Utility functions for ATproto community member operations

export interface AtprotoCommunityUtils {
  createMember: (agent: Agent, projectDid: string, memberData: Partial<CommunityMember>) => Promise<string>;
  updateMember: (agent: Agent, projectDid: string, memberId: string, memberData: Partial<CommunityMember>) => Promise<void>;
  deleteMember: (agent: Agent, projectDid: string, memberId: string) => Promise<void>;
  getMember: (agent: Agent, projectDid: string, memberId: string) => Promise<CommunityMember | null>;
  listMembers: (agent: Agent, projectDid: string) => Promise<CommunityMember[]>;
}

/**
 * Generate a unique record key for a community member
 * Uses the member ID as the key for consistency and uniqueness
 */
export const generateMemberRecordKey = (memberId: string): string => {
  // Use member ID as rkey, but ensure it's URL-safe and within limits
  // ATproto rkeys should be 1-512 characters, URL-safe
  const safeKey = `member-${memberId}`.replace(/[^a-zA-Z0-9._-]/g, '-');
  const finalKey = safeKey.length > 512 ? safeKey.substring(0, 512) : safeKey;
  return finalKey;
};

/**
 * Create a new community member record in ATproto
 */
export const createCommunityMemberRecord = async (
  agent: Agent,
  projectDid: string,
  memberData: Partial<CommunityMember>
): Promise<string> => {
  try {


    if (!agent.accountDid) {
      throw new Error('Agent not authenticated - no accountDid available. Please sign in to Bluesky first.');
    }

    // Check if agent has the required API methods
    if (!agent.api?.com?.atproto?.repo?.putRecord) {
      throw new Error('Agent missing required ATproto API methods');
    }

    // Generate a unique member ID if not provided
    const memberId = memberData.id || `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Ensure projectDid is decoded before storing
    const decodedProjectDid = decodeURIComponent(projectDid);

    // Generate a consistent record key based on project and member ID
    const recordKey = generateMemberRecordKey(`${decodedProjectDid}-${memberId}`);



    const record: CommunityMemberRecord = {
      $type: 'app.gainforest.community',
      id: memberId,
      projectId: decodedProjectDid,
      firstName: memberData.first_name || '',
      lastName: memberData.last_name || '',
      title: memberData.title || '',
      bio: memberData.bio || undefined,
      profileImageUrl: memberData.profile_image_url || undefined,
      displayOrder: memberData.display_order || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };



    // Create the actual record
    try {
      await agent.api.com.atproto.repo.putRecord({
        repo: agent.accountDid, // Write to user's repository, not project repository
        collection: 'app.gainforest.community',
        rkey: recordKey,
        record: record as unknown as { [x: string]: unknown },
      });

      return memberId;
    } catch (putRecordError) {
      throw putRecordError;
    }
  } catch {
    throw new Error('Failed to create community member record');
  }
};

/**
 * Update an existing community member record in ATproto
 */
export const updateCommunityMemberRecord = async (
  agent: Agent,
  projectDid: string,
  memberId: string,
  memberData: Partial<CommunityMember>
): Promise<void> => {
  try {
    // Ensure projectDid is decoded before using
    const decodedProjectDid = decodeURIComponent(projectDid);

    // Use consistent record key based on project and member ID
    const recordKey = generateMemberRecordKey(`${decodedProjectDid}-${memberId}`);

    // Try to get the existing record first
    let existingRecord: CommunityMemberRecord;

    try {
      const existingRecordResponse = await agent.api.com.atproto.repo.getRecord({
        repo: agent.accountDid, // Read from user's repository
        collection: 'app.gainforest.community',
        rkey: recordKey,
      });

      existingRecord = existingRecordResponse.data.value as unknown as CommunityMemberRecord;
    } catch {
      // If record doesn't exist, throw error
      throw new Error('Community member record not found');
    }

    // Update the record with new data
    const updatedRecord: CommunityMemberRecord = {
      ...existingRecord,
      $type: 'app.gainforest.community',
      firstName: memberData.first_name ?? existingRecord.firstName,
      lastName: memberData.last_name ?? existingRecord.lastName,
      title: memberData.title ?? existingRecord.title,
      bio: memberData.bio ?? existingRecord.bio,
      profileImageUrl: memberData.profile_image_url ?? existingRecord.profileImageUrl,
      displayOrder: memberData.display_order ?? existingRecord.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    // Update the record in the user's repository
    await agent.api.com.atproto.repo.putRecord({
      repo: agent.accountDid, // Write to user's repository
      collection: 'app.gainforest.community',
      rkey: recordKey,
      record: updatedRecord as unknown as { [x: string]: unknown },
    });


  } catch {
    throw new Error('Failed to update community member record');
  }
};

/**
 * Delete (deactivate) a community member record in ATproto
 */
export const deleteCommunityMemberRecord = async (
  agent: Agent,
  projectDid: string,
  memberId: string
): Promise<void> => {
  try {
    // Ensure projectDid is decoded before using
    const decodedProjectDid = decodeURIComponent(projectDid);

    // Use consistent record key based on project and member ID
    const recordKey = generateMemberRecordKey(`${decodedProjectDid}-${memberId}`);

    // Try to get the existing record first
    try {
      await agent.api.com.atproto.repo.getRecord({
        repo: agent.accountDid, // Read from user's repository
        collection: 'app.gainforest.community',
        rkey: recordKey,
      });
    } catch {
      // If record doesn't exist, throw error
      throw new Error('Community member record not found');
    }

    // Delete the record from ATproto
    await agent.api.com.atproto.repo.deleteRecord({
      repo: agent.accountDid,
      collection: 'app.gainforest.community',
      rkey: recordKey,
    });
  } catch {
    throw new Error('Failed to delete community member record');
  }
};

/**
 * Get a specific community member record from ATproto
 */
export const getCommunityMemberRecord = async (
  agent: Agent,
  projectDid: string,
  memberId: string
): Promise<CommunityMember | null> => {
  try {
    // Ensure projectDid is decoded before using
    const decodedProjectDid = decodeURIComponent(projectDid);

    // Use consistent record key based on project and member ID
    const recordKey = generateMemberRecordKey(`${decodedProjectDid}-${memberId}`);

    // Try to get the specific record from the current user's repository
    let record: CommunityMemberRecord;

    try {
      const recordResponse = await agent.api.com.atproto.repo.getRecord({
        repo: agent.accountDid, // Read from user's repository
        collection: 'app.gainforest.community',
        rkey: recordKey,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      record = recordResponse.data.value as any as CommunityMemberRecord;

      // Records exist if they can be retrieved, no need to check isActive
    } catch {
      // If record doesn't exist, return null
      return null;
    }

    // Convert to the expected format
    return {
      id: record.id,
      wallet_address_id: null, // Not used in simplified version
      project_id: parseInt(record.projectId) || 1, // Default fallback
      first_name: record.firstName,
      last_name: record.lastName,
      title: record.title,
      bio: record.bio ?? '',
      profile_image_url: record.profileImageUrl ?? null,
      display_order: record.displayOrder ?? null,
    };
  } catch {
    throw new Error('Failed to get community member record');
  }
};

/**
 * List all active community member records from ATproto
 * Note: This currently only shows records from the current user's repository.
 * In a real implementation, you'd need to aggregate from all participants.
 */
export const listCommunityMemberRecords = async (
  agent: Agent,
  projectDid: string
): Promise<CommunityMember[]> => {
  try {
    // List records from the current user's repository
    const records = await agent.api.com.atproto.repo.listRecords({
      repo: agent.accountDid, // Read from user's repository
      collection: 'app.gainforest.community',
    });

    // Filter and convert records
    const members: CommunityMember[] = records.data.records
      .filter(record => {
        const value = record.value as unknown as CommunityMemberRecord;
        // Only include records for the specific project (ATproto has no soft delete)
        const projectDidDecoded = decodeURIComponent(projectDid);
        const recordProjectIdDecoded = decodeURIComponent(value.projectId || '');

        const shouldInclude = value.$type === 'app.gainforest.community' &&
                             (value.projectId === projectDid ||
                              value.projectId === projectDidDecoded ||
                              recordProjectIdDecoded === projectDid ||
                              recordProjectIdDecoded === projectDidDecoded);


        return shouldInclude;
      })
      .map(record => {
        const value = record.value as unknown as CommunityMemberRecord;
        return {
          id: value.id,
          wallet_address_id: null, // Not used in simplified version
          project_id: parseInt(value.projectId) || 1, // Default fallback
          first_name: value.firstName,
          last_name: value.lastName,
          title: value.title,
          bio: value.bio ?? '',
          profile_image_url: value.profileImageUrl ?? null,
          display_order: value.displayOrder ?? null,
        };
      })
      // Sort by display order, then by name
      .sort((a, b) => {
        const aOrder = a.display_order ?? null;
        const bOrder = b.display_order ?? null;

        if (aOrder !== null && bOrder !== null) {
          return aOrder - bOrder;
        }
        if (aOrder !== null) return -1;
        if (bOrder !== null) return 1;

        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });



    return members;
  } catch {
    throw new Error('Failed to list community member records');
  }
};

// Export the utility functions
export const atprotoCommunityUtils: AtprotoCommunityUtils = {
  createMember: createCommunityMemberRecord,
  updateMember: updateCommunityMemberRecord,
  deleteMember: deleteCommunityMemberRecord,
  getMember: getCommunityMemberRecord,
  listMembers: listCommunityMemberRecords,
};
