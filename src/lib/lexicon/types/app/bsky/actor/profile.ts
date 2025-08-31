// Lexicon types for Bsky actor profile
export const Profile = {
  RECORD_TYPE: 'app.bsky.actor.profile',
  validateRecord: (record: unknown) => {
    console.log('Validating profile record:', record);
    return { success: true };
  },
  isRecord: (record: unknown) => {
    console.log('Checking if record is profile:', record);
    return true; // Mock implementation
  },
};
