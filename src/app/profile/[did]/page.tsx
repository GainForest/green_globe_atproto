"use client";

import { useParams } from 'next/navigation';
import { useAtproto } from '@/app/_components/Providers/AtprotoProvider';
import { useEffect, useState } from 'react';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { User, MapPin, Bird, Target, FileText, Image } from 'lucide-react';
import Link from 'next/link';
import { GainForestProfile, GainForestProfileRecord } from '@/lib/lexicon/types/app/gainforest/profile';
import { useUserContext } from '@/app/_contexts/User';
import EditablePlaceholder from './_components/EditablePlaceholder';
import BannerUpload from './_components/BannerUpload';

interface UserProfile {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const did = params.did as string;
  // URL-decode the DID parameter first
  const decodedDid = decodeURIComponent(did);

  const { agent } = useAtproto();
  const { bluesky } = useUserContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gainForestProfile, setGainForestProfile] = useState<GainForestProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [showBannerUpload, setShowBannerUpload] = useState(false);

  // Check if current user is viewing their own profile
  const isOwnProfile = bluesky.isAuthenticated && bluesky.profile?.did === decodedDid;

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('[ProfilePage] Debug info:', {
      did,
      isAuthenticated: bluesky.isAuthenticated,
      blueskyProfileDid: bluesky.profile?.did,
      isOwnProfile,
      agent: !!agent,
      blueskyInitialized: bluesky.isInitialized,
    });
  }

  // Profile update functions
  const updateGainForestProfile = async (updates: Partial<GainForestProfile>) => {
    if (!agent || !isOwnProfile) {
      throw new Error('Not authorized to update profile');
    }

    try {
      // Get current profile or create new one
      const currentProfile = gainForestProfile || {
        did: decodedDid,
        createdAt: new Date().toISOString(),
      };

      const updatedProfile: GainForestProfileRecord = {
        $type: 'app.gainforest.profile',
        banner: updates.banner ?? currentProfile.banner,
        description: updates.description ?? currentProfile.description,
        objective: updates.objective ?? currentProfile.objective,
        location: updates.location ?? currentProfile.location,
        website: updates.website ?? currentProfile.website,
        specializations: updates.specializations ?? currentProfile.specializations,
        yearsOfExperience: updates.yearsOfExperience ?? currentProfile.yearsOfExperience,
        organizationAffiliation: updates.organizationAffiliation ?? currentProfile.organizationAffiliation,
        certifications: updates.certifications ?? currentProfile.certifications,
        preferredLanguages: updates.preferredLanguages ?? currentProfile.preferredLanguages,
        socialLinks: updates.socialLinks ?? currentProfile.socialLinks,
        createdAt: currentProfile.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to ATproto
      await agent.api.com.atproto.repo.putRecord({
        repo: decodedDid,
        collection: 'app.gainforest.profile',
        rkey: 'self',
        record: updatedProfile as GainForestProfileRecord,
      });

      // Update local state
      setGainForestProfile(prev => ({
        ...prev,
        ...updates,
        did: decodedDid,
        updatedAt: updatedProfile.updatedAt,
      }));

      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!did || !agent) {
        setLoading(false);
        setGainForestLoading(false);
        return;
      }

      try {
        setLoading(true);
        setGainForestLoading(true);
        setError(null);

        // Fetch both profiles in parallel
        const [blueskyResponse, gainForestResponse] = await Promise.allSettled([
          agent.getProfile({ actor: decodedDid }),
          agent.api.com.atproto.repo.getRecord({
            repo: decodedDid,
            collection: 'app.gainforest.profile',
            rkey: 'self',
          })
        ]);

        // Handle Bluesky profile
        if (blueskyResponse.status === 'fulfilled' && blueskyResponse.value.success) {
          setProfile(blueskyResponse.value.data);
        } else {
          console.warn('Failed to fetch Bluesky profile:', blueskyResponse);
        }

        // Handle GainForest profile
        if (gainForestResponse.status === 'fulfilled' && gainForestResponse.value.success) {
          const record = gainForestResponse.value.data.value as unknown as GainForestProfileRecord;
          setGainForestProfile({
            did: decodedDid,
            banner: record.banner,
            description: record.description,
            objective: record.objective,
            location: record.location,
            website: record.website,
            specializations: record.specializations,
            yearsOfExperience: record.yearsOfExperience,
            organizationAffiliation: record.organizationAffiliation,
            certifications: record.certifications,
            preferredLanguages: record.preferredLanguages,
            socialLinks: record.socialLinks,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
          });
        } else {
          // No GainForest profile exists yet - this is normal for new users
          console.log('No GainForest profile found for user:', decodedDid);
          setGainForestProfile(null);
        }
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Error loading profile');
      } finally {
        setLoading(false);
        setGainForestLoading(false);
      }
    };

    fetchProfiles();
  }, [decodedDid, agent]);

  if (!decodedDid.startsWith('did:plc:')) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Invalid Profile</h1>
          <p className="text-muted-foreground mt-2">
            This doesn&apos;t appear to be a valid DID profile URL.
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Make sure you&apos;re using the correct URL format: <code>/profile/did:plc:...</code>
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Received DID: <code>{decodedDid}</code>
          </p>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          {/* Banner skeleton */}
          <Skeleton className="w-full h-48 rounded-lg mb-4" />
          
          <div className="relative px-6">
            {/* Avatar skeleton */}
            <Skeleton className="w-24 h-24 rounded-full absolute -top-12 border-4 border-background" />
            
            <div className="pt-16">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Banner */}
        <div 
          className="w-full h-48 rounded-lg mb-4 relative overflow-hidden group"
          style={{
            backgroundImage: (gainForestProfile?.banner || profile?.banner) ? `url(${gainForestProfile?.banner || profile?.banner})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Default banner pattern if no custom banner */}
          {!(gainForestProfile?.banner || profile?.banner) && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bird className="w-16 h-16 text-white/50" />
              </div>
            </div>
          )}
          
          {/* Banner edit overlay for own profile */}
          {isOwnProfile && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowBannerUpload(true)}
              >
                <Image className="w-4 h-4 mr-2" />
                {gainForestProfile?.banner ? 'Change Banner' : 'Add Banner'}
              </Button>
            </div>
          )}

          {/* Banner Upload Modal */}
          {showBannerUpload && (
            <BannerUpload
              currentBanner={gainForestProfile?.banner}
              onSave={async (url) => {
                await updateGainForestProfile({ banner: url });
              }}
              onCancel={() => setShowBannerUpload(false)}
            />
          )}
        </div>
        
        <div className="relative px-6">
          {/* Avatar */}
          <div className="absolute -top-12">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.displayName || profile.handle}
                className="w-24 h-24 rounded-full border-4 border-background object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-background bg-muted flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="pt-16">
            {/* Profile Info */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold">
                  {profile?.displayName || 'Anonymous User'}
                </h1>
                <p className="text-muted-foreground">@{profile?.handle || decodedDid}</p>
                
                {/* Stats */}
                {(profile?.followersCount !== undefined || profile?.followsCount !== undefined || profile?.postsCount !== undefined) && (
                  <div className="flex gap-4 mt-3 text-sm">
                    {profile?.postsCount !== undefined && (
                      <span><strong>{profile.postsCount}</strong> posts</span>
                    )}
                    {profile?.followersCount !== undefined && (
                      <span><strong>{profile.followersCount}</strong> followers</span>
                    )}
                    {profile?.followsCount !== undefined && (
                      <span><strong>{profile.followsCount}</strong> following</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`https://bsky.app/profile/${profile?.handle || decodedDid}`} target="_blank">
                    <Bird className="w-4 h-4 mr-2" />
                    View on Bluesky
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* GainForest Profile Sections */}
            <div className="mt-6 space-y-6">
              {/* Description */}
              <EditablePlaceholder
                value={gainForestProfile?.description}
                placeholder={isOwnProfile ? "Share your story, background, and passion for environmental conservation..." : "This user hasn't added a description yet."}
                onSave={async (value) => {
                  await updateGainForestProfile({ description: value });
                }}
                isOwner={isOwnProfile}
                icon={<FileText className="w-5 h-5 text-muted-foreground" />}
                title="About"
              />

              {/* Environmental Objective */}
              <EditablePlaceholder
                value={gainForestProfile?.objective}
                placeholder={isOwnProfile ? "What's your environmental mission? What impact do you want to make?" : "This user hasn't shared their environmental objective yet."}
                onSave={async (value) => {
                  await updateGainForestProfile({ objective: value });
                }}
                isOwner={isOwnProfile}
                icon={<Target className="w-5 h-5 text-muted-foreground" />}
                title="Environmental Objective"
              />

              {/* Additional Profile Info */}
              {(gainForestProfile?.location || gainForestProfile?.organizationAffiliation || isOwnProfile) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location */}
                  <EditablePlaceholder
                    value={gainForestProfile?.location}
                    placeholder={isOwnProfile ? "Add your location" : "Location not specified"}
                    onSave={async (value) => {
                      await updateGainForestProfile({ location: value });
                    }}
                    isOwner={isOwnProfile}
                    type="text"
                    icon={<MapPin className="w-4 h-4 text-muted-foreground" />}
                    title="Location"
                    className="text-sm"
                  />

                  {/* Organization */}
                  <EditablePlaceholder
                    value={gainForestProfile?.organizationAffiliation}
                    placeholder={isOwnProfile ? "Add your organization" : "No organization specified"}
                    onSave={async (value) => {
                      await updateGainForestProfile({ organizationAffiliation: value });
                    }}
                    isOwner={isOwnProfile}
                    type="text"
                    icon={<User className="w-4 h-4 text-muted-foreground" />}
                    title="Organization"
                    className="text-sm"
                  />
                </div>
              )}
            </div>
            
            {/* Projects Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Projects</h2>
              <div className="p-6 bg-muted/50 rounded-lg text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Projects will be displayed here once the user creates them.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Users can manage environmental projects through their ATproto profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
