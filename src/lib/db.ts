// Database initialization for Atproto/Bsky
export async function initializeGlobalDb() {
  // Initialize database connection if needed
  console.log('Database initialized');
}

export function getGlobalDb() {
  // Return mock database instance
  console.log('Getting global database');
  return {
    insertStatus: async (data: unknown) => {
      console.log('Inserting status:', data);
      return { success: true };
    },
    getStatuses: async (limit: number) => {
      console.log('Getting statuses with limit:', limit);
      // Return array with proper type for mock
      return [] as Array<{ authorDid: string }>;
    },
    getStatusByAuthor: async (authorDid: string) => {
      console.log('Getting status by author:', authorDid);
      return null; // Return null for mock
    },
    // Add other database methods as needed
  };
}
