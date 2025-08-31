// ID resolver utilities for Atproto/Bsky
export function createIdResolver() {
  // Mock ID resolver
  console.log('Creating ID resolver');
  return {
    resolve: async (did: string) => {
      console.log('Resolving DID:', did);
      return { success: true, data: { did } };
    }
  };
}

export function createBidirectionalResolver(baseResolver?: unknown) {
  // Mock bidirectional resolver
  console.log('Creating bidirectional resolver with base:', baseResolver);
  return {
    resolve: async (id: string) => {
      console.log('Resolving ID:', id);
      return { success: true, data: { id } };
    },
    resolveDidsToHandles: async (dids: string[]) => {
      console.log('Resolving DIDs to handles:', dids);
      // Return empty map for mock
      return {};
    }
  };
}
