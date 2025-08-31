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

// TypeScript types for community records
export interface CommunityRecord {
  $type: 'app.gainforest.community';
  projectId: string; // Reference to the associated project
  members?: CommunityMember[];
  donations?: Donation[];
  settings?: CommunitySettings;
  createdAt: string;
  updatedAt?: string;
}

export interface CommunityMember {
  $type: 'app.gainforest.community';
  id: string;
  projectId: string;
  firstName: string;
  lastName: string;
  title?: string; // Job title or role
  bio?: string; // Personal bio/description
  profileImageUrl?: string; // URL to profile image
  displayOrder?: number; // Order for displaying in UI
  walletAddressId?: number; // Reference to wallet
  walletAddresses?: WalletAddresses; // Blockchain wallet addresses
  contactInfo?: ContactInfo; // Contact information
  socialLinks?: SocialLinks; // Social media links
  specialization?: string[]; // Areas of expertise
  location?: string; // Geographic location
  isActive: boolean; // Whether member is active in community
  joinedAt: string; // When member joined the community
  lastActiveAt?: string; // Last activity timestamp
}

export interface WalletAddresses {
  celo?: string[]; // Celo blockchain addresses
  solana?: string[]; // Solana blockchain addresses
  ethereum?: string[]; // Ethereum blockchain addresses
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  github?: string;
  bluesky?: string; // AT Protocol handle
}

export interface Donation {
  $type: 'app.gainforest.community#donation';
  id: string;
  projectId: string;
  amount: number;
  currency: string;
  blockchain: 'Solana' | 'Celo' | 'Ethereum' | 'FIAT';
  timestamp: string;
  from?: DonorInfo; // Donor information (if available)
  to: RecipientInfo; // Recipient information
  transactionHash?: string; // Blockchain transaction hash
  attestationUid?: string; // Attestation UID for verified transactions
  motive?: string; // Reason for donation
  category?: DonationCategory; // Type of donation
  status: DonationStatus; // Transaction status
  metadata?: DonationMetadata; // Additional transaction data
}

export interface DonorInfo {
  firstName?: string;
  lastName?: string;
  profileUrl?: string;
  walletAddress?: string;
  anonymous?: boolean; // Whether donor wishes to remain anonymous
}

export interface RecipientInfo {
  id?: string; // Community member ID if donation to specific member
  firstName?: string;
  lastName?: string;
  walletAddress: string; // Recipient wallet address
  communityMemberId?: string; // Reference to community member
}

export type DonationCategory =
  | 'direct_support'
  | 'project_funding'
  | 'community_development'
  | 'environmental_impact'
  | 'research'
  | 'education'
  | 'other';

export type DonationStatus =
  | 'pending'
  | 'confirmed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface DonationMetadata {
  originalAmount?: string; // Original amount as string (for fiat)
  exchangeRate?: number; // Exchange rate used
  fee?: number; // Transaction fee
  gasUsed?: number; // Gas used for blockchain transactions
  network?: string; // Network name (e.g., 'mainnet', 'testnet')
  tokenSymbol?: string; // Token symbol (e.g., 'cUSD', 'SOL')
  contractAddress?: string; // Smart contract address if applicable
  memo?: string; // Additional memo/notes
}

export interface CommunitySettings {
  $type: 'app.gainforest.community#settings';
  allowAnonymousDonations: boolean;
  requireDonorInfo: boolean;
  defaultDonationCategory: DonationCategory;
  supportedCurrencies: string[]; // List of supported currencies
  supportedBlockchains: string[]; // List of supported blockchains
  donationGoals?: DonationGoal[]; // Fundraising goals
  memberVisibility: MemberVisibility; // Who can see member information
  donationVisibility: DonationVisibility; // Who can see donation information
}

export interface DonationGoal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currency: string;
  currentAmount: number;
  deadline?: string; // ISO date string
  category: DonationCategory;
  isActive: boolean;
}

export type MemberVisibility = 'public' | 'community_only' | 'private';
export type DonationVisibility = 'public' | 'community_only' | 'anonymous' | 'private';

// Community statistics and analytics
export interface CommunityStats {
  $type: 'app.gainforest.community#stats';
  totalMembers: number;
  activeMembers: number;
  totalDonations: number;
  totalDonationAmount: { [currency: string]: number };
  donationCountByCategory: { [category in DonationCategory]?: number };
  donationAmountByBlockchain: { [blockchain: string]: number };
  recentActivity: CommunityActivity[];
  topDonors?: DonorRanking[];
  topRecipients?: RecipientRanking[];
}

export interface CommunityActivity {
  id: string;
  type: 'member_joined' | 'donation_received' | 'donation_sent' | 'member_updated';
  timestamp: string;
  description: string;
  actor?: {
    id: string;
    name: string;
    profileImageUrl?: string;
  };
  metadata?: { [key: string]: unknown };
}

export interface DonorRanking {
  donor: DonorInfo;
  totalAmount: number;
  donationCount: number;
  lastDonation: string;
}

export interface RecipientRanking {
  recipient: RecipientInfo;
  totalReceived: number;
  donationCount: number;
  lastReceived: string;
}

// Community map view specific types
export interface CommunityMapView {
  $type: 'app.gainforest.community#mapView';
  projectId: string;
  members: CommunityMemberMapMarker[];
  donationFlows: DonationFlow[];
  impactZones: ImpactZone[];
  viewSettings: MapViewSettings;
}

export interface CommunityMemberMapMarker {
  id: string;
  memberId: string;
  position: {
    lat: number;
    lng: number;
  };
  member: CommunityMember;
  donationStats?: {
    totalReceived: number;
    donationCount: number;
    lastDonation?: string;
  };
  isVisible: boolean;
}

export interface DonationFlow {
  id: string;
  from: {
    lat: number;
    lng: number;
  };
  to: {
    lat: number;
    lng: number;
  };
  amount: number;
  currency: string;
  timestamp: string;
  category: DonationCategory;
  opacity: number; // For visualization
}

export interface ImpactZone {
  id: string;
  name: string;
  description?: string;
  geometry: GeoJSON.Geometry;
  impactType: 'conservation' | 'restoration' | 'community_development' | 'education';
  associatedMembers: string[]; // Member IDs
  totalImpact?: number;
  color: string; // For map visualization
}

export interface MapViewSettings {
  showMemberMarkers: boolean;
  showDonationFlows: boolean;
  showImpactZones: boolean;
  donationFlowMinAmount?: number;
  donationFlowMaxOpacity: number;
  clusterMembers: boolean;
  memberMarkerSize: 'small' | 'medium' | 'large';
  dateRange?: {
    start: string;
    end: string;
  };
}

// Community editing permissions and roles
export interface CommunityPermissions {
  $type: 'app.gainforest.community#permissions';
  projectId: string;
  roles: CommunityRole[];
  memberPermissions: { [memberId: string]: MemberPermission[] };
}

export interface CommunityRole {
  id: string;
  name: string;
  description?: string;
  permissions: MemberPermission[];
  color?: string; // For UI display
}

export type MemberPermission =
  | 'view_members'
  | 'edit_members'
  | 'view_donations'
  | 'edit_donations'
  | 'manage_settings'
  | 'view_analytics'
  | 'manage_roles'
  | 'delete_records';

// Utility types for API responses
export interface CommunityApiResponse {
  community: CommunityRecord;
  stats?: CommunityStats;
  mapView?: CommunityMapView;
  permissions?: CommunityPermissions;
}

export interface CommunityListResponse {
  communities: CommunityRecord[];
  totalCount: number;
  hasMore: boolean;
}

// Community notification types
export interface CommunityNotification {
  $type: 'app.gainforest.community#notification';
  id: string;
  projectId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: { [key: string]: unknown };
}

export type NotificationType =
  | 'new_member'
  | 'new_donation'
  | 'donation_goal_reached'
  | 'member_updated'
  | 'system_update';
