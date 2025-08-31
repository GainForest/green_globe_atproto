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
  console.log('[ATproto] generateMemberRecordKey input:', memberId);
  const safeKey = `member-${memberId}`.replace(/[^a-zA-Z0-9._-]/g, '-');
  const finalKey = safeKey.length > 512 ? safeKey.substring(0, 512) : safeKey;
  console.log('[ATproto] generateMemberRecordKey output:', finalKey);
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
    console.log('[ATproto] createCommunityMemberRecord called with:', {
      projectDid,
      userDid: agent.accountDid,
      memberData,
      agent: !!agent,
      accountDid: agent.accountDid,
      agentProperties: Object.getOwnPropertyNames(agent),
      hasApi: !!agent.api,
      hasRepo: !!agent.api?.com?.atproto?.repo,
      sessionInfo: agent.session ? {
        sub: agent.session.sub,
        scope: agent.session.scope,
        aud: agent.session.aud
      } : 'No session'
    });

    if (!agent.accountDid) {
      console.error('[ATproto] Agent not authenticated - no accountDid available');
      console.error('[ATproto] Agent state:', {
        agent,
        session: agent.session,
        did: agent.did,
        hasSession: !!agent.session,
        sessionDid: agent.session?.sub
      });
      throw new Error('Agent not authenticated - no accountDid available. Please sign in to Bluesky first.');
    }

    // Check if agent has the required API methods
    if (!agent.api?.com?.atproto?.repo?.putRecord) {
      console.error('[ATproto] Agent missing required API methods');
      console.error('[ATproto] Available API methods:', Object.keys(agent.api?.com?.atproto?.repo || {}));
      throw new Error('Agent missing required ATproto API methods');
    }

    // Test basic ATproto connectivity by listing existing records
    try {
      console.log('[ATproto] Testing basic ATproto connectivity by listing records...');
      const existingRecords = await agent.api.com.atproto.repo.listRecords({
        repo: agent.accountDid,
        collection: 'app.bsky.actor.profile', // Use a known collection
        limit: 1
      });
      console.log('[ATproto] ✅ Basic ATproto connectivity test passed:', existingRecords.data.records.length, 'records found');
    } catch (connectivityError: any) {
      console.error('[ATproto] ❌ Basic ATproto connectivity test failed:', connectivityError);
      console.error('[ATproto] Connectivity error details:', {
        message: connectivityError.message,
        status: connectivityError.status,
        statusText: connectivityError.statusText
      });

      // If we get a 401, the session is likely expired
      if (connectivityError.status === 401) {
        throw new Error('Your Bluesky session has expired. Please sign in again.');
      }

      throw new Error('ATproto connectivity test failed. Please check your connection and try again.');
    }

    // Generate a unique member ID if not provided
    const memberId = memberData.id || `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Ensure projectDid is decoded before storing
    const decodedProjectDid = decodeURIComponent(projectDid);

    // Generate a consistent record key based on project and member ID
    const recordKey = generateMemberRecordKey(`${decodedProjectDid}-${memberId}`);

    console.log('[ATproto] Creating record with:', {
      originalProjectDid: projectDid,
      decodedProjectDid,
      memberId,
      recordKey
    });
    console.log('[ATproto] Generated member ID:', memberId, 'record key:', recordKey);

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

    console.log('[ATproto] About to create record with:', {
      repo: agent.accountDid, // Write to user's own repository
      collection: 'app.gainforest.community',
      rkey: recordKey,
      record: record,
      recordType: typeof record,
      recordKeys: Object.keys(record)
    });

    // Test if we can create ANY record first
    try {
      console.log('[ATproto] Testing basic record creation first...');
      const testRecord = {
        $type: 'app.gainforest.community',
        id: 'test-record',
        message: 'Test record to verify ATproto connectivity',
        createdAt: new Date().toISOString()
      };

      const testResult = await agent.api.com.atproto.repo.putRecord({
        repo: agent.accountDid,
        collection: 'app.gainforest.community',
        rkey: 'test-connection',
        record: testRecord as unknown as { [x: string]: unknown },
      });

      console.log('[ATproto] ✅ Test record created successfully:', testResult);
    } catch (testError: any) {
      console.error('[ATproto] ❌ Test record creation failed:', testError);
      console.error('[ATproto] This suggests a fundamental ATproto connectivity issue');
    }

    // Create the actual record
    try {
      console.log('[ATproto] Making putRecord API call for actual member...');
      const result = await agent.api.com.atproto.repo.putRecord({
        repo: agent.accountDid, // Write to user's repository, not project repository
        collection: 'app.gainforest.community',
        rkey: recordKey,
        record: record as unknown as { [x: string]: unknown },
      });

      console.log(`[ATproto] ✅ Created community member record successfully:`, result);
      console.log(`[ATproto] Record URI: ${result.data.uri}`);
      return memberId;
    } catch (putRecordError: any) {
      console.error('[ATproto] ❌ putRecord failed for member record:', putRecordError);
      console.error('[ATproto] Error details:', {
        message: putRecordError.message,
        status: putRecordError.status,
        error: putRecordError.error,
        details: putRecordError.details
      });
      throw putRecordError;
    }
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
  console.log('[ATproto] deleteCommunityMemberRecord called with:', {
    projectDid,
    memberId,
    decodedProjectDid: decodeURIComponent(projectDid)
  });

  try {
    // Ensure projectDid is decoded before using
    const decodedProjectDid = decodeURIComponent(projectDid);

    // Use consistent record key based on project and member ID
    const recordKey = generateMemberRecordKey(`${decodedProjectDid}-${memberId}`);
    console.log('[ATproto] Generated record key for deletion:', recordKey);

    // Try to get the existing record first
    let existingRecord: CommunityMemberRecord;

    try {
      console.log('[ATproto] Looking for record to delete:', {
        repo: agent.accountDid,
        collection: 'app.gainforest.community',
        rkey: recordKey
      });

      const existingRecordResponse = await agent.api.com.atproto.repo.getRecord({
        repo: agent.accountDid, // Read from user's repository
        collection: 'app.gainforest.community',
        rkey: recordKey,
      });

      existingRecord = existingRecordResponse.data.value as unknown as CommunityMemberRecord;
      console.log('[ATproto] Found existing record:', existingRecord);
    } catch (getError) {
      console.error('[ATproto] Record not found for deletion:', getError);
      // If record doesn't exist, throw error
      throw new Error('Community member record not found');
    }

    // Delete the record from ATproto
    console.log('[ATproto] Attempting to delete record:', {
      repo: agent.accountDid,
      collection: 'app.gainforest.community',
      rkey: recordKey
    });

    await agent.api.com.atproto.repo.deleteRecord({
      repo: agent.accountDid,
      collection: 'app.gainforest.community',
      rkey: recordKey,
    });

    console.log(`[ATproto] Successfully deleted community member record: ${recordKey} (${memberId}) for project: ${projectDid}`);
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

      record = recordResponse.data.value as unknown as CommunityMemberRecord;

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
    console.log('[ATproto] Project DID decoded for comparison:', decodeURIComponent(projectDid));

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
      projectIdDecoded: decodeURIComponent((r.value as { projectId?: string })?.projectId || '')
    })));

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

        console.log('[ATproto] Filtering record:', {
          uri: record.uri,
          type: value.$type,
          id: value.id,
          projectId: value.projectId,
          projectIdDecoded: recordProjectIdDecoded,
          targetProjectDid: projectDid,
          targetProjectDidDecoded: projectDidDecoded,
          shouldInclude,
          matchReason: value.projectId === projectDid ? 'exact' :
                      value.projectId === projectDidDecoded ? 'record-encoded-target-decoded' :
                      recordProjectIdDecoded === projectDid ? 'record-decoded-target-encoded' :
                      recordProjectIdDecoded === projectDidDecoded ? 'both-decoded' : 'no-match'
        });
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

    console.log(`[ATproto] Final result: ${members.length} community member records for project: ${projectDid}`);
    console.log('[ATproto] Note: Currently only showing records from the current user\'s repository');
    console.log('[ATproto] Member details:', members.map(m => ({ id: m.id, name: `${m.first_name} ${m.last_name}`, title: m.title })));

    // If no members found for this project, also show all community records for debugging
    if (members.length === 0) {
      console.log('[ATproto] No members found for project. All community records in repo:');
      records.data.records.forEach((record, index) => {
        const value = record.value;
        console.log(`${index + 1}. ${value.id} - ${value.firstName} ${value.lastName} (project: ${value.projectId})`);
      });
    }

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
