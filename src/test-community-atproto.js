// Simple test script to verify ATproto community member integration
// This can be run in the browser console to test the functionality

// Test function to check ATproto agent status
async function testAtprotoAgent() {
  try {
    console.log('🔍 Testing ATproto Agent Status...');

    const agent = window.__atprotoAgent;
    if (!agent) {
      console.error('❌ ATproto agent not found in window.__atprotoAgent');
      return false;
    }

    console.log('✅ Agent found:', {
      accountDid: agent.accountDid,
      did: agent.did,
      hasApi: !!agent.api,
      hasRepo: !!agent.api?.com?.atproto?.repo,
      hasPutRecord: !!agent.api?.com?.atproto?.repo?.putRecord,
      hasListRecords: !!agent.api?.com?.atproto?.repo?.listRecords
    });

    // Test basic connectivity
    try {
      console.log('🔍 Testing basic ATproto connectivity...');
      const existingRecords = await agent.api.com.atproto.repo.listRecords({
        repo: agent.accountDid,
        collection: 'app.bsky.actor.profile', // Use a known collection
        limit: 1
      });
      console.log('✅ Basic ATproto connectivity test passed:', existingRecords.data.records.length, 'records found');
    } catch (connectivityError) {
      console.error('❌ Basic ATproto connectivity test failed:', connectivityError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Agent test failed:', error);
    return false;
  }
}

// Test function to create a simple test record
async function testCreateSimpleRecord() {
  try {
    console.log('🔍 Testing simple record creation...');

    const agent = window.__atprotoAgent;
    if (!agent) {
      console.error('❌ ATproto agent not found');
      return false;
    }

    const testRecord = {
      $type: 'app.gainforest.community',
      id: 'test-record',
      message: 'Test record to verify ATproto connectivity',
      createdAt: new Date().toISOString()
    };

    const result = await agent.api.com.atproto.repo.putRecord({
      repo: agent.accountDid,
      collection: 'app.gainforest.community',
      rkey: 'test-connection',
      record: testRecord,
    });

    console.log('✅ Simple test record created successfully!');
    console.log('Record URI:', result.data.uri);
    return result.data.uri;
  } catch (error) {
    console.error('❌ Simple record creation failed:', error);
    return false;
  }
}

// Test function to create a community member record
async function testCreateCommunityMember() {
  try {
    console.log('🔍 Testing community member creation...');

    const agent = window.__atprotoAgent;
    if (!agent) {
      console.error('❌ ATproto agent not found');
      return false;
    }

    const testMember = {
      first_name: 'Test',
      last_name: 'User',
      title: 'Community Tester',
      bio: 'This is a test community member record',
      display_order: 1
    };

    const projectDid = 'did:plc:qc42fmqqlsmdq7jiypiiigww';

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Creating record:', {
      repo: agent.accountDid,
      collection: 'app.gainforest.community',
      rkey: recordKey,
      record: record
    });

    const result = await agent.api.com.atproto.repo.putRecord({
      repo: agent.accountDid,
      collection: 'app.gainforest.community',
      rkey: recordKey,
      record: record,
    });

    console.log('✅ Community member record created successfully!');
    console.log('Record URI:', result.data.uri);

    // Test retrieval
    console.log('🔍 Testing record retrieval...');
    const readResult = await agent.api.com.atproto.repo.getRecord({
      repo: agent.accountDid,
      collection: 'app.gainforest.community',
      rkey: recordKey,
    });

    console.log('✅ Record retrieved successfully:', readResult.data.value);
    return result.data.uri;
  } catch (error) {
    console.error('❌ Community member creation failed:', error);
    return false;
  }
}

// Test function to list community member records
async function testListCommunityMembers() {
  try {
    console.log('🔍 Testing community member listing...');

    const agent = window.__atprotoAgent;
    if (!agent) {
      console.error('❌ ATproto agent not found');
      return false;
    }

    const records = await agent.api.com.atproto.repo.listRecords({
      repo: agent.accountDid,
      collection: 'app.gainforest.community',
    });

    console.log(`Found ${records.data.records.length} community records:`);

    records.data.records.forEach((record, index) => {
      const value = record.value;
      console.log(`${index + 1}. ${value.firstName || value.message || 'Unknown'} (${value.title || 'No title'}) - Project: ${value.projectId || 'N/A'}`);
    });

    return records.data.records;
  } catch (error) {
    console.error('❌ List test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running ATproto Community Tests...\n');

  const agentOk = await testAtprotoAgent();
  if (!agentOk) {
    console.error('❌ Agent test failed - stopping tests');
    return;
  }

  console.log('');

  const simpleRecordOk = await testCreateSimpleRecord();
  if (!simpleRecordOk) {
    console.error('❌ Simple record test failed - stopping tests');
    return;
  }

  console.log('');

  const memberRecordOk = await testCreateCommunityMember();
  if (!memberRecordOk) {
    console.error('❌ Member record test failed');
    return;
  }

  console.log('');

  const listOk = await testListCommunityMembers();
  if (!listOk) {
    console.error('❌ List test failed');
    return;
  }

  console.log('\n✅ All tests passed!');
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  window.testAtprotoAgent = testAtprotoAgent;
  window.testCreateSimpleRecord = testCreateSimpleRecord;
  window.testCreateCommunityMember = testCreateCommunityMember;
  window.testListCommunityMembers = testListCommunityMembers;
  window.runAllTests = runAllTests;

  console.log('🧪 Community ATproto test functions loaded!');
  console.log('Available functions:');
  console.log('• testAtprotoAgent() - Check agent status');
  console.log('• testCreateSimpleRecord() - Test basic record creation');
  console.log('• testCreateCommunityMember() - Test member record creation');
  console.log('• testListCommunityMembers() - Test listing records');
  console.log('• runAllTests() - Run all tests automatically');
}
