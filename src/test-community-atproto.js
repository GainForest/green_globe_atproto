// Simple test script to verify ATproto community member integration
// This can be run in the browser console to test the functionality

// Test function to create a community member record
async function testCreateCommunityMember() {
  try {
    // Get the ATproto agent from the global window object
    const agent = window.__atprotoAgent;

    if (!agent) {
      console.error('ATproto agent not found. Make sure you are logged in.');
      return;
    }

    console.log('Testing community member creation...');
    console.log('User DID:', agent.accountDid);

    // Import the utility function (in a real scenario, this would be available)
    // For now, let's manually test the API call

    const testMember = {
      first_name: 'Test',
      last_name: 'User',
      title: 'Community Tester',
      bio: 'This is a test community member record',
      display_order: 1
    };

    const projectDid = 'did:plc:qc42fmqqlsmdq7jiypiiigww'; // Example project DID

    // Generate record key
    const memberId = `test-member-${Date.now()}`;
    const recordKey = `member-${projectDid}-${memberId}`.replace(/[^a-zA-Z0-9._-]/g, '-');

    const record = {
      $type: 'app.gainforest.community',
      id: memberId,
      projectId: projectDid,
      firstName: testMember.first_name,
      lastName: testMember.last_name,
      title: testMember.title,
      bio: testMember.bio,
      displayOrder: testMember.display_order,
      isActive: true,
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    console.log('Creating record:', {
      repo: agent.accountDid,
      collection: 'app.gainforest.community',
      rkey: recordKey,
      record: record
    });

    // Create the record
    const result = await agent.api.com.atproto.repo.putRecord({
      repo: agent.accountDid,
      collection: 'app.gainforest.community',
      rkey: recordKey,
      record: record,
    });

    console.log('✅ Community member record created successfully!');
    console.log('Record URI:', result.data.uri);

    // Now try to read it back
    console.log('Testing record retrieval...');
    const readResult = await agent.api.com.atproto.repo.getRecord({
      repo: agent.accountDid,
      collection: 'app.gainforest.community',
      rkey: recordKey,
    });

    console.log('✅ Record retrieved successfully:', readResult.data.value);

    return result.data.uri;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Test function to list community member records
async function testListCommunityMembers() {
  try {
    const agent = window.__atprotoAgent;

    if (!agent) {
      console.error('ATproto agent not found. Make sure you are logged in.');
      return;
    }

    console.log('Testing community member listing...');

    const records = await agent.api.com.atproto.repo.listRecords({
      repo: agent.accountDid,
      collection: 'app.gainforest.community',
    });

    console.log(`Found ${records.data.records.length} community records:`);

    records.data.records.forEach((record, index) => {
      const value = record.value;
      console.log(`${index + 1}. ${value.firstName} ${value.lastName} (${value.title}) - Project: ${value.projectId}`);
    });

    return records.data.records;
  } catch (error) {
    console.error('❌ List test failed:', error);
    throw error;
  }
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  window.testCreateCommunityMember = testCreateCommunityMember;
  window.testListCommunityMembers = testListCommunityMembers;

  console.log('🧪 Community ATproto test functions loaded!');
  console.log('Run testCreateCommunityMember() to test creating a member');
  console.log('Run testListCommunityMembers() to test listing members');
}
