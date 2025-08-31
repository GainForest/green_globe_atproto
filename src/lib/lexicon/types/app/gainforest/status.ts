// Lexicon types for status
export const Status = {
  // Mock status types
  RECORD_TYPE: 'app.gainforest.status',
  // Add other status-related types as needed
  validateRecord: (record: unknown) => {
    // Simple validation - always return success for mock implementation
    console.log('Validating record:', record);
    return { success: true };
  },
};
