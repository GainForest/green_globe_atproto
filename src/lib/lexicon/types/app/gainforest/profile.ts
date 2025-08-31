// Lexicon types for GainForest user profiles
export const Profile = {
  RECORD_TYPE: 'app.gainforest.profile',
  validateRecord: (record: unknown) => {
    console.log('Validating GainForest profile record:', record);
    return { success: true };
  },
  isRecord: (record: unknown) => {
    console.log('Checking if record is GainForest profile:', record);
    return true; // Mock implementation for now
  },
};

// TypeScript types for GainForest profile records
export interface GainForestProfileRecord {
  $type: 'app.gainforest.profile';
  banner?: string; // URL to banner image
  description?: string; // User's bio/description
  objective?: string; // User's environmental objective/mission
  location?: string; // User's location/country
  hectares?: number; // Area in hectares under management/protection
  website?: string; // User's website
  specializations?: string[]; // Areas of expertise (e.g., "forestry", "biodiversity", "climate")
  yearsOfExperience?: number; // Years of experience in environmental work
  organizationAffiliation?: string; // Organization or company
  certifications?: string[]; // Environmental certifications
  preferredLanguages?: string[]; // ISO language codes
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface GainForestProfile {
  did: string;
  banner?: string;
  description?: string;
  objective?: string;
  location?: string;
  hectares?: number;
  website?: string;
  specializations?: string[];
  yearsOfExperience?: number;
  organizationAffiliation?: string;
  certifications?: string[];
  preferredLanguages?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
