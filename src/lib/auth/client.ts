// OAuth client for Atproto/Bsky authentication
interface OAuthClient {
  authorize: (handle: string, options: { scope: string }) => Promise<{ toString: () => string }>;
  callback: (params: URLSearchParams) => Promise<{ session: { did: string } }>;
  clientMetadata: unknown;
  restore: (did: string) => Promise<unknown | null>;
}

let globalOAuthClient: OAuthClient | null = null;

export function getGlobalOAuthClient(): Promise<OAuthClient> {
  return new Promise((resolve) => {
    if (!globalOAuthClient) {
      // Initialize OAuth client if needed
      console.log('OAuth client initialized');
      globalOAuthClient = {
        authorize: async (handle: string, options: { scope: string }) => {
          // Mock implementation - replace with actual OAuth client
          return {
            toString: () => `https://bsky.app/oauth/authorize?handle=${encodeURIComponent(handle)}&scope=${encodeURIComponent(options.scope)}`
          };
        },
        callback: async (params: URLSearchParams) => {
          // Mock implementation - replace with actual OAuth callback
          const did = params.get('did') || 'mock-did';
          return {
            session: { did }
          };
        },
        clientMetadata: {
          client_id: 'mock-client-id',
          client_name: 'Mock Client',
          redirect_uris: ['http://localhost:3000/callback']
        },
        restore: async (did: string): Promise<null> => {
          // Mock implementation - replace with actual OAuth restore
          console.log('Restoring session for:', did);
          // Return null for mock implementation to avoid Agent constructor issues
          return null;
        }
      };
    }
    resolve(globalOAuthClient);
  });
}
