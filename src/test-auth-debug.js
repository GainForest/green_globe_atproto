// Debug script for ATproto authentication issues
// Run this in the browser console to diagnose authentication problems

function debugAuthStatus() {
  console.log('=== ATproto Authentication Debug ===');

  // Check if global agent is available
  if (window.__atprotoAgent) {
    console.log('✅ Global agent found:', window.__atprotoAgent);

    console.log('Agent accountDid:', window.__atprotoAgent.accountDid);
    console.log('Agent session:', window.__atprotoAgent.session);
    console.log('Agent did:', window.__atprotoAgent.did);

    // Test basic API call
    testBasicApiCall();
  } else {
    console.log('❌ No global agent found');
  }

  // Check local storage for session data
  try {
    const keys = Object.keys(localStorage);
    const atprotoKeys = keys.filter(key => key.includes('atproto') || key.includes('bluesky'));
    console.log('ATproto-related localStorage keys:', atprotoKeys);

    atprotoKeys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`${key}:`, value ? 'present' : 'empty');
    });
  } catch (e) {
    console.log('Could not access localStorage:', e);
  }
}

async function testBasicApiCall() {
  if (!window.__atprotoAgent) {
    console.log('❌ No agent available for API test');
    return;
  }

  try {
    console.log('Testing basic API call...');
    const profile = await window.__atprotoAgent.getProfile({ actor: window.__atprotoAgent.accountDid });
    console.log('✅ API call successful:', profile.data);
  } catch (error) {
    console.log('❌ API call failed:', error);
    console.log('Error status:', error.status);
    console.log('Error message:', error.message);
  }
}

async function testCommunityRecordCreation() {
  if (!window.__atprotoAgent) {
    console.log('❌ No agent available for community record test');
    return;
  }

  try {
    console.log('Testing community record creation...');
    const memberId = `test-${Date.now()}`;
    const recordKey = `member-did:plc:test123-${memberId}`;

    const result = await window.__atprotoAgent.api.com.atproto.repo.putRecord({
      repo: window.__atprotoAgent.accountDid,
      collection: 'app.gainforest.community',
      rkey: recordKey,
      record: {
        $type: 'app.gainforest.community',
        id: memberId,
        projectId: 'did:plc:test123',
        firstName: 'Test',
        lastName: 'User',
        title: 'Tester',
        bio: 'Test bio',
        displayOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

    console.log('✅ Community record created:', result);
  } catch (error) {
    console.log('❌ Community record creation failed:', error);
    console.log('Error status:', error.status);
    console.log('Error message:', error.message);
  }
}

// Debug community member records
async function debugCommunityRecords() {
  if (!window.__atprotoAgent) {
    console.log('❌ No agent available for community records debug');
    return;
  }

  try {
    console.log('=== Community Records Debug ===');

    const records = await window.__atprotoAgent.api.com.atproto.repo.listRecords({
      repo: window.__atprotoAgent.accountDid,
      collection: 'app.gainforest.community',
    });

    console.log(`Found ${records.data.records.length} community records:`);

    records.data.records.forEach((record, index) => {
      const value = record.value;
      console.log(`${index + 1}. Record:`, {
        uri: record.uri,
        rkey: record.uri.split('/').pop(),
        type: value.$type,
        id: value.id,
        projectId: value.projectId,
        firstName: value.firstName,
        lastName: value.lastName,
        title: value.title,
        // Show all fields
        allFields: Object.keys(value)
      });

      // If projectId is missing, this is likely the issue
      if (!value.projectId) {
        console.log(`❌ Record ${index + 1} is missing projectId field!`);
      }
    });

    return records.data.records;
  } catch (error) {
    console.log('❌ Failed to fetch community records:', error);
  }
}

// Make functions available globally
window.debugAuthStatus = debugAuthStatus;
window.testBasicApiCall = testBasicApiCall;
window.testCommunityRecordCreation = testCommunityRecordCreation;
window.debugCommunityRecords = debugCommunityRecords;
window.testMembersFetch = testMembersFetch;
window.createProperTestRecord = createProperTestRecord;
window.createMultipleTestMembers = createMultipleTestMembers;
window.quickStatus = quickStatus;

// Clean up old records and create a proper test record
async function createProperTestRecord() {
  if (!window.__atprotoAgent) {
    console.log('❌ No agent available');
    return;
  }

  const projectId = 'did:plc:qc42fmqqlsmdq7jiypiiigww'; // Use the decoded project ID

  try {
    console.log('=== Creating Proper Test Record ===');

    const memberId = `test-member-${Date.now()}`;
    const recordKey = `member-${projectId}-${memberId}`;

    const testRecord = {
      $type: 'app.gainforest.community',
      id: memberId,
      projectId: projectId,
      firstName: 'Test',
      lastName: 'Member',
      title: 'Community Tester',
      bio: 'This is a test community member record',
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating record with:', testRecord);

    const result = await window.__atprotoAgent.api.com.atproto.repo.putRecord({
      repo: window.__atprotoAgent.accountDid,
      collection: 'app.gainforest.community',
      rkey: recordKey,
      record: testRecord
    });

    console.log('✅ Test record created:', result);
    console.log('🔄 Refreshing page to see the new member...');
    window.location.reload();
    return result;
  } catch (error) {
    console.error('❌ Failed to create test record:', error);
  }
}

// Create multiple test members quickly
async function createMultipleTestMembers(count = 3) {
  if (!window.__atprotoAgent) {
    console.log('❌ No agent available');
    return;
  }

  const projectId = 'did:plc:qc42fmqqlsmdq7jiypiiigww';
  const names = [
    { first: 'Alice', last: 'Johnson', title: 'Project Manager' },
    { first: 'Bob', last: 'Smith', title: 'Developer' },
    { first: 'Carol', last: 'Williams', title: 'Designer' },
    { first: 'David', last: 'Brown', title: 'Researcher' },
    { first: 'Eva', last: 'Davis', title: 'Community Lead' }
  ];

  console.log(`=== Creating ${count} Test Members ===`);

  for (let i = 0; i < Math.min(count, names.length); i++) {
    try {
      const memberId = `test-member-${Date.now()}-${i}`;
      const recordKey = `member-${projectId}-${memberId}`;
      const name = names[i];

      const testRecord = {
        $type: 'app.gainforest.community',
        id: memberId,
        projectId: projectId,
        firstName: name.first,
        lastName: name.last,
        title: name.title,
        bio: `Test member ${i + 1}`,
        displayOrder: i + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await window.__atprotoAgent.api.com.atproto.repo.putRecord({
        repo: window.__atprotoAgent.accountDid,
        collection: 'app.gainforest.community',
        rkey: recordKey,
        record: testRecord
      });

      console.log(`✅ Created ${name.first} ${name.last}`);
    } catch (error) {
      console.error(`❌ Failed to create member ${i + 1}:`, error);
    }
  }

  console.log('🔄 Refreshing page to see all new members...');
  setTimeout(() => window.location.reload(), 1000);
}

// Test the complete members fetch flow
async function testMembersFetch() {
  if (!window.__atprotoAgent) {
    console.log('❌ No agent available');
    return;
  }

  // Get current project ID from the URL or store
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('projectId') || window.location.pathname.split('/').pop();
  const decodedProjectId = decodeURIComponent(projectId || '');

  console.log('=== Testing Members Fetch ===');
  console.log('Project ID:', projectId);
  console.log('Decoded Project ID:', decodedProjectId);

  try {
    // First check what records exist
    const records = await debugCommunityRecords();

    // Then try to fetch members for this project
    const { fetchCommunityMembers } = await import('./src/app/(map-routes)/(main)/_components/ProjectOverlay/Community/Members/store/utils.js');
    const members = await fetchCommunityMembers(decodedProjectId, window.__atprotoAgent);

    console.log('✅ Members fetch result:', members);
    return members;
  } catch (error) {
    console.error('❌ Members fetch failed:', error);
  }
}

// Quick status check
async function quickStatus() {
  console.log('=== Quick Status Check ===');

  if (!window.__atprotoAgent) {
    console.log('❌ No ATproto agent');
    return;
  }

  try {
    // Check auth
    console.log('Agent DID:', window.__atprotoAgent.accountDid);

    // Check records
    const records = await window.__atprotoAgent.api.com.atproto.repo.listRecords({
      repo: window.__atprotoAgent.accountDid,
      collection: 'app.gainforest.community',
    });

    console.log(`📊 Found ${records.data.records.length} community records`);

    // Show details
    records.data.records.forEach((record, index) => {
      const value = record.value;
      console.log(`${index + 1}. ${value.id} - ${value.firstName} ${value.lastName} (${value.projectId})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

console.log('Debug functions loaded. Run:');
console.log('- quickStatus() - Quick check of auth and records');
console.log('- debugAuthStatus() - Check authentication status');
console.log('- testBasicApiCall() - Test basic ATproto connectivity');
console.log('- debugCommunityRecords() - List all community records with details');
console.log('- createProperTestRecord() - Create a proper test record with projectId');
console.log('- testMembersFetch() - Test the complete members fetch flow');
console.log('- debugMembersFetch() - Use in the Members component (when on community page)');
