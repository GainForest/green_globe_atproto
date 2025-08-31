// Lexicon types for GainForest community data
export const Community = {
  RECORD_TYPE: 'app.gainforest.community',
  validateRecord: (record: unknown) => {
    console.log('Validating GainForest community record:', record);
    return { success: true };
  },
  isRecord: (record: unknown) => {
    console.log('Checking if record is GainForest community:', record);
    return true; // Mock implementation for now
  },
};

// Simplified community member record - only the fields from the form
export interface CommunityMemberRecord {
  $type: 'app.gainforest.community';
  id: string; // Unique member identifier
  projectId: string; // Project DID this member belongs to
  firstName: string; // Required: Member's first name
  lastName: string; // Required: Member's last name
  title: string; // Required: Member's role/title
  bio?: string; // Optional: Member's bio/description
  profileImageUrl?: string; // Optional: Profile image URL
  displayOrder?: number; // Optional: Display order in UI
  createdAt: string; // When the record was created
  updatedAt: string; // When the record was last updated
}

// Frontend community member type (for API compatibility)
export interface CommunityMember {
  id: string;
  wallet_address_id: null | number;
  project_id: number;
  first_name: string;
  last_name: string;
  title: string;
  bio: string;
  profile_image_url: string | null;
  display_order: number | null;
}
