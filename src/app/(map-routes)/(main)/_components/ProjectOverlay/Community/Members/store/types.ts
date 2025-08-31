export type CommunityMember = {
  id: string;
  wallet_address_id: null | number;
  project_id: number;
  first_name: string;
  last_name: string;
  title: string;
  bio: string;
  profile_image_url: string | null;
  display_order: number | null;
};

// ATproto record structure for community members
export interface CommunityMemberRecord {
  $type: 'app.gainforest.community';
  id: string;
  projectId: string; // DID of the project
  firstName: string;
  lastName: string;
  title: string;
  bio?: string;
  profileImageUrl?: string | null;
  displayOrder?: number | null;
  walletAddressId?: number | null;
  isActive: boolean;
  joinedAt: string; // ISO date string
  lastActiveAt?: string; // ISO date string
}
