import { Agent } from '@atproto/api';
import { CommunityMemberRecord, CommunityMember } from './store/types';

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
  return safeKey.length > 512 ? safeKey.substring(0, 512) : safeKey;
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
    console.log('[ATproto] createCommunityMemberRecord called with:', {
      projectDid,
      userDid: agent.accountDid,
      memberData
    });

    // Generate a unique member ID if not provided
    const memberId = memberData.id || `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate a consistent record key based on project and member ID
    const recordKey = generateMemberRecordKey(`${projectDid}-${memberId}`);
    console.log('[ATproto] Generated member ID:', memberId, 'record key:', recordKey);

    const record: CommunityMemberRecord = {
      $type: 'app.gainforest.community',
      id: memberId,
      projectId: projectDid,
      firstName: memberData.first_name || '',
      lastName: memberData.last_name || '',
      title: memberData.title || '',
      bio: memberData.bio || '',
      profileImageUrl: memberData.profile_image_url || null,
      displayOrder: memberData.display_order || null,
      walletAddressId: memberData.wallet_address_id || null,
      isActive: true,
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    console.log('[ATproto] About to create record with:', {
      repo: agent.accountDid, // Write to user's own repository
      collection: 'app.gainforest.community',
      rkey: recordKey,
      record: record
    });

    // Create the record in the user's own repository
    const result = await agent.api.com.atproto.repo.putRecord({
      repo: agent.accountDid, // Write to user's repository, not project repository
      collection: 'app.gainforest.community',
      rkey: recordKey,
      record: record as unknown as { [x: string]: unknown },
    });

    console.log(`[ATproto] Created community member record successfully:`, result);
    console.log(`[ATproto] Record URI: ${result.data.uri}`);
    return memberId;
  } catch (error) {
    console.error('[ATproto] Failed to create community member record:', error);
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
    // Use consistent record key based on project and member ID
    const recordKey = generateMemberRecordKey(`${projectDid}-${memberId}`);

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
      walletAddressId: memberData.wallet_address_id ?? existingRecord.walletAddressId,
      lastActiveAt: new Date().toISOString(),
    };

    // Update the record in the user's repository
    await agent.api.com.atproto.repo.putRecord({
      repo: agent.accountDid, // Write to user's repository
      collection: 'app.gainforest.community',
      rkey: recordKey,
      record: updatedRecord as unknown as { [x: string]: unknown },
    });

    console.log(`[ATproto] Updated community member record: ${recordKey} (${memberId}) for project: ${projectDid}`);
  } catch (error) {
    console.error('[ATproto] Failed to update community member record:', error);
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
    // Use consistent record key based on project and member ID
    const recordKey = generateMemberRecordKey(`${projectDid}-${memberId}`);

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

    // Soft delete by marking as inactive
    const deletedRecord: CommunityMemberRecord = {
      ...existingRecord,
      $type: 'app.gainforest.community',
      isActive: false,
      lastActiveAt: new Date().toISOString(),
    };

    // Update the record in the user's repository
    await agent.api.com.atproto.repo.putRecord({
      repo: agent.accountDid, // Write to user's repository
      collection: 'app.gainforest.community',
      rkey: recordKey,
      record: deletedRecord as unknown as { [x: string]: unknown },
    });

    console.log(`[ATproto] Deleted (deactivated) community member record: ${recordKey} (${memberId}) for project: ${projectDid}`);
  } catch (error) {
    console.error('[ATproto] Failed to delete community member record:', error);
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
    // Use consistent record key based on project and member ID
    const recordKey = generateMemberRecordKey(`${projectDid}-${memberId}`);

    // Try to get the specific record from the current user's repository
    let record: CommunityMemberRecord;

    try {
      const recordResponse = await agent.api.com.atproto.repo.getRecord({
        repo: agent.accountDid, // Read from user's repository
        collection: 'app.gainforest.community',
        rkey: recordKey,
      });

      record = recordResponse.data.value as unknown as CommunityMemberRecord;

      // Check if the record is active
      if (!record.isActive) {
        return null;
      }
    } catch {
      // If record doesn't exist, return null
      return null;
    }

    // Convert to the expected format
    return {
      id: record.id,
      wallet_address_id: record.walletAddressId ?? null,
      project_id: parseInt(record.projectId) || 1, // Default fallback
      first_name: record.firstName,
      last_name: record.lastName,
      title: record.title,
      bio: record.bio ?? '',
      profile_image_url: record.profileImageUrl ?? null,
      display_order: record.displayOrder ?? null,
    };
  } catch (error) {
    console.error('[ATproto] Failed to get community member record:', error);
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
    console.log('[ATproto] listCommunityMemberRecords called for project:', projectDid, 'user:', agent.accountDid);

    // List records from the current user's repository
    const records = await agent.api.com.atproto.repo.listRecords({
      repo: agent.accountDid, // Read from user's repository
      collection: 'app.gainforest.community',
    });

    console.log('[ATproto] Raw records from ATproto:', records.data.records.length, 'records found');
    console.log('[ATproto] Raw records details:', records.data.records.map(r => ({
      uri: r.uri,
      type: (r.value as { $type?: string })?.$type,
      id: (r.value as { id?: string })?.id,
      projectId: (r.value as { projectId?: string })?.projectId,
      isActive: (r.value as { isActive?: boolean })?.isActive
    })));

    // Filter and convert records
    const members: CommunityMember[] = records.data.records
      .filter(record => {
        const value = record.value as unknown as CommunityMemberRecord;
        // Only include records for the specific project and that are active
        const shouldInclude = value.$type === 'app.gainforest.community' &&
                             value.projectId === projectDid &&
                             value.isActive === true;
        console.log('[ATproto] Filtering record:', {
          uri: record.uri,
          type: value.$type,
          id: value.id,
          projectId: value.projectId,
          isActive: value.isActive,
          shouldInclude
        });
        return shouldInclude;
      })
      .map(record => {
        const value = record.value as unknown as CommunityMemberRecord;
        return {
          id: value.id,
          wallet_address_id: value.walletAddressId ?? null,
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

    console.log(`[ATproto] Final result: ${members.length} community member records for project: ${projectDid}`);
    console.log('[ATproto] Note: Currently only showing records from the current user\'s repository');
    console.log('[ATproto] Member details:', members.map(m => ({ id: m.id, name: `${m.first_name} ${m.last_name}`, title: m.title })));
    return members;
  } catch (error) {
    console.error('[ATproto] Failed to list community member records:', error);
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
