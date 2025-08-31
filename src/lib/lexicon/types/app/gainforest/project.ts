// Lexicon types for GainForest projects
export const Project = {
  RECORD_TYPE: 'app.gainforest.project',
  validateRecord: (record: unknown) => {
    console.log('Validating project record:', record);
    return { success: true };
  },
  isRecord: (record: unknown) => {
    console.log('Checking if record is project:', record);
    return true; // Mock implementation for now
  },
};

// TypeScript types for project records
export interface ProjectRecord {
  $type: 'app.gainforest.project';
  name: string;
  country?: string;
  description?: string;
  longDescription?: string;
  objective?: string;
  lat?: number;
  lon?: number;
  area?: number;
  assets?: ProjectAsset[];
  communityMembers?: CommunityMember[];
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectAsset {
  id: string;
  name: string;
  classification: string;
  awsCID: string;
  shapefile?: {
    default: boolean;
    isReference: boolean;
    shortName: string;
  };
}

export interface CommunityMember {
  id: string;
  firstName: string;
  lastName: string;
  priority?: number;
  role?: string;
  bio?: string;
  fundsReceived?: number;
  profileUrl?: string;
  Wallet?: {
    CeloAccounts?: string[];
    SOLAccounts?: string[];
  };
}
