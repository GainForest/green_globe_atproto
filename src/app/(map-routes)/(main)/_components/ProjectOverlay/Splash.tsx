"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Project } from "./store/types";
import useProjectOverlayStore from "./store";
import { useAtproto } from "@/app/_components/Providers/AtprotoProvider";
import { useUserContext } from "@/app/_contexts/User";
import { GainForestProfileRecord } from "@/lib/lexicon/types/app/gainforest/profile";

type SplashProps = {
  imageURL: string | null;
  projectDetails: Project;
};

const Splash = ({ imageURL, projectDetails }: SplashProps) => {
  const activeTab = useProjectOverlayStore((state) => state.activeTab);
  const { agent } = useAtproto();
  const { bluesky } = useUserContext();
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [showBannerEdit, setShowBannerEdit] = useState(false);

  const isOwnProject = bluesky.isAuthenticated && bluesky.profile?.did === projectDetails.id;
  const isAtprotoProject = projectDetails.id.startsWith('did:plc:');

  // Always call hooks at the top level
  // Fetch banner data for ATproto projects
  useEffect(() => {
    if (!isAtprotoProject || !agent) {
      setBannerLoading(false);
      return;
    }

    const fetchBanner = async () => {
      try {
        setBannerLoading(true);

        const blueskyResponse = await agent.getProfile({ actor: projectDetails.id });

        // Set banner
        if (blueskyResponse.success && blueskyResponse.data.banner) {
          setBannerUrl(blueskyResponse.data.banner);
        }

      } catch (error) {
        console.error('Failed to fetch banner:', error);
      } finally {
        setBannerLoading(false);
      }
    };

    fetchBanner();
  }, [agent, projectDetails.id, isAtprotoProject]);

  if (activeTab === "ask-ai") return null;

  const updateProfileField = async (field: string, value: string) => {
    if (!agent || !isOwnProject) {
      throw new Error('Not authorized to update profile');
    }

    try {
      // Get current profile
      const currentResponse = await agent.api.com.atproto.repo.getRecord({
        repo: projectDetails.id,
        collection: 'app.gainforest.profile',
        rkey: 'self',
      });

      let currentData: GainForestProfileRecord = {} as GainForestProfileRecord;
      if (currentResponse.success) {
        currentData = currentResponse.data.value as GainForestProfileRecord;
      }

      // Update the field
      const updatedData = {
        ...currentData,
        [field]: value,
        updatedAt: new Date().toISOString(),
        createdAt: currentData.createdAt || new Date().toISOString(),
        $type: 'app.gainforest.profile'
      };

      // Put the updated record
      await agent.api.com.atproto.repo.putRecord({
        repo: projectDetails.id,
        collection: 'app.gainforest.profile',
        rkey: 'self',
        record: updatedData,
      });

      console.log(`Successfully updated ${field}`);
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      throw error;
    }
  };

  // For ATproto projects, show banner or loading state
  if (isAtprotoProject) {
    return (
      <div className="relative">
        {bannerLoading ? (
          <div className="w-full h-[200px] bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : bannerUrl ? (
          <div className="relative group">
            <Image
              src={bannerUrl}
              alt="Profile banner"
              width={800}
              height={200}
              className="w-full h-[200px] object-cover object-center [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]"
              onError={() => setBannerUrl(null)}
            />
            {isOwnProject && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => setShowBannerEdit(true)}
                  className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Change Banner
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-[200px] bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center">
            {isOwnProject ? (
              <button
                onClick={() => setShowBannerEdit(true)}
                className="text-green-600 hover:text-green-700 underline underline-offset-2 text-sm font-medium"
              >
                Add a banner image
              </button>
            ) : (
              <div className="text-gray-500 text-sm">No banner image</div>
            )}
          </div>
        )}

        {/* Banner Edit Modal */}
        {showBannerEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Update Banner</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Banner Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/your-banner.jpg"
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        updateProfileField('banner', input.value).then(() => {
                          setBannerUrl(input.value);
                          setShowBannerEdit(false);
                        });
                      } else if (e.key === 'Escape') {
                        setShowBannerEdit(false);
                      }
                    }}
                  />
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Enter a URL to an image you&apos;d like to use as your banner.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowBannerEdit(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                      if (input?.value) {
                        updateProfileField('banner', input.value).then(() => {
                          setBannerUrl(input.value);
                          setShowBannerEdit(false);
                        });
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Save Banner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // For regular projects, use existing logic
  return (
    <>
      {imageURL ? (
        <div>
          <Image
            src={imageURL}
            alt={projectDetails.name}
            width={300}
            height={300}
            className="w-full h-[200px] object-cover object-center [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]"
          />
        </div>
      ) : (
        "No splash image found"
      )}
    </>
  );
};

export default Splash;
