"use client";
import React, { useState, useEffect } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Project } from "./store/types";
import useProjectOverlayStore from "./store";
import useNavigation from "../../_features/navigation/use-navigation";
import { useAtproto } from "@/app/_components/Providers/AtprotoProvider";
import { useUserContext } from "@/app/_contexts/User";
import { Bird } from "lucide-react";
import Link from "next/link";



const AtprotoProfileProject = ({ projectData }: { projectData: Project }) => {
  const { agent } = useAtproto();
  const { bluesky } = useUserContext();
  const isOwnProject = bluesky.isAuthenticated && bluesky.profile?.did === projectData.id;
  const isAtprotoProject = projectData.id.startsWith('did:plc:');

  // Simple state for each field
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingObjective, setEditingObjective] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [editingHectares, setEditingHectares] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Debug logging for component mount
  console.log('[AtprotoProfileProject] Component mounted with:', {
    projectId: projectData.id,
    isAtprotoProject,
    agentAvailable: !!agent,
    isOwnProject
  });

  const [descriptionValue, setDescriptionValue] = useState(projectData.longDescription || '');
  const [objectiveValue, setObjectiveValue] = useState(projectData.objective || '');
  const [organizationValue, setOrganizationValue] = useState(
    projectData.name !== `${projectData.id} Project` ? projectData.name : ''
  );
  const [locationValue, setLocationValue] = useState<string>('');
  const [hectaresValue, setHectaresValue] = useState<number | null>(null);

  // Fetch ATproto profile data when component mounts for DID projects
  useEffect(() => {
    console.log('[AtprotoProfileProject] useEffect triggered for data fetching:', {
      isAtprotoProject,
      agentAvailable: !!agent,
      projectId: projectData.id
    });

    if (!isAtprotoProject) {
      console.log('[AtprotoProfileProject] Skipping - Not an ATproto project');
      return;
    }

    if (!agent) {
      console.log('[AtprotoProfileProject] Skipping - Agent not available yet');
      return;
    }

    const fetchAtprotoProfile = async () => {
      try {
        console.log('[AtprotoProfileProject] Starting to fetch ATproto profile data for:', projectData.id);
        setIsLoadingData(true);

        const [blueskyResponse, gainForestResponse] = await Promise.allSettled([
          agent.getProfile({ actor: projectData.id }),
          agent.api.com.atproto.repo.getRecord({
            repo: projectData.id,
            collection: 'app.gainforest.profile',
            rkey: 'self',
          })
        ]);

        console.log('[AtprotoProfileProject] Bluesky response:', blueskyResponse);
        console.log('[AtprotoProfileProject] GainForest response:', gainForestResponse);

        // Update state with fetched data
        if (blueskyResponse.status === 'fulfilled' && blueskyResponse.value.success) {
          const blueskyProfile = blueskyResponse.value.data;
          console.log('[AtprotoProfileProject] Bluesky profile data:', blueskyProfile);
        }

        if (gainForestResponse.status === 'fulfilled' && gainForestResponse.value.success) {
          const gainForestData = gainForestResponse.value.data.value;
          console.log('[AtprotoProfileProject] GainForest profile data:', gainForestData);

                              // Update state with GainForest profile data
                    if (gainForestData) {
                      setDescriptionValue((gainForestData.description as string) || '');
                      setObjectiveValue((gainForestData.objective as string) || '');
                      setOrganizationValue((gainForestData.organizationAffiliation as string) || '');
                      setLocationValue((gainForestData.location as string) || '');
                      setHectaresValue((gainForestData.hectares as number) || null);
                    }
        } else if (gainForestResponse.status === 'rejected') {
          console.log('[AtprotoProfileProject] GainForest profile not found (expected for new profiles):', gainForestResponse.reason);
        }

        console.log('[AtprotoProfileProject] ATproto profile data fetch completed');
      } catch (error) {
        console.error('[AtprotoProfileProject] Failed to fetch ATproto profile data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAtprotoProfile();
  }, [projectData.id, isAtprotoProject, agent]);

  // Also trigger fetch when agent becomes available
  useEffect(() => {
    console.log('[AtprotoProfileProject] Agent availability check:', {
      isAtprotoProject,
      agentAvailable: !!agent,
      isLoadingData,
      hasEmptyData: !descriptionValue && !objectiveValue && !organizationValue && !locationValue && hectaresValue === null,
      hasDefaultName: organizationValue === '' && projectData.name === `${projectData.id} Project`
    });

    if (isAtprotoProject && agent && !isLoadingData) {
      // If we have an agent now but haven't fetched data yet, trigger a fetch
      console.log('[AtprotoProfileProject] Agent became available, checking if we need to fetch data');

      // Check if we have empty/default data, which indicates we haven't fetched yet
      const hasEmptyData = !descriptionValue && !objectiveValue && !organizationValue && !locationValue && hectaresValue === null;
      const hasDefaultName = organizationValue === '' && projectData.name === `${projectData.id} Project`;

      console.log('[AtprotoProfileProject] Data state check:', {
        descriptionValue,
        objectiveValue,
        organizationValue,
        hasEmptyData,
        hasDefaultName,
        projectName: projectData.name
      });

      if (hasEmptyData || hasDefaultName) {
        console.log('[AtprotoProfileProject] Data appears empty/default, triggering fetch');
        const fetchAtprotoProfile = async () => {
          try {
            console.log('[AtprotoProfileProject] Fetching ATproto profile data (agent became available):', projectData.id);
            setIsLoadingData(true);

            const [blueskyResponse, gainForestResponse] = await Promise.allSettled([
              agent.getProfile({ actor: projectData.id }),
              agent.api.com.atproto.repo.getRecord({
                repo: projectData.id,
                collection: 'app.gainforest.profile',
                rkey: 'self',
              })
            ]);

            console.log('[AtprotoProfileProject] Agent available fetch - Bluesky response:', blueskyResponse);
            console.log('[AtprotoProfileProject] Agent available fetch - GainForest response:', gainForestResponse);

            // Update state with fetched data
            if (blueskyResponse.status === 'fulfilled' && blueskyResponse.value.success) {
              const blueskyProfile = blueskyResponse.value.data;
              console.log('[AtprotoProfileProject] Agent available fetch - Bluesky profile data:', blueskyProfile);
            }

            if (gainForestResponse.status === 'fulfilled' && gainForestResponse.value.success) {
              const gainForestData = gainForestResponse.value.data.value;
              console.log('[AtprotoProfileProject] Agent available fetch - GainForest profile data:', gainForestData);

              // Update state with GainForest profile data
              if (gainForestData) {
                setDescriptionValue((gainForestData.description as string) || '');
                setObjectiveValue((gainForestData.objective as string) || '');
                setOrganizationValue((gainForestData.organizationAffiliation as string) || '');
                setLocationValue((gainForestData.location as string) || '');
                setHectaresValue((gainForestData.hectares as number) || null);
              }
            } else if (gainForestResponse.status === 'rejected') {
              console.log('[AtprotoProfileProject] Agent available fetch - GainForest profile not found:', gainForestResponse.reason);
            }

            console.log('[AtprotoProfileProject] Agent available fetch completed');
          } catch (error) {
            console.error('[AtprotoProfileProject] Agent available fetch failed:', error);
          } finally {
            setIsLoadingData(false);
          }
        };

        fetchAtprotoProfile();
      }
    }
  }, [agent, isAtprotoProject]);

  const saveField = async (field: string, value: string | number) => {
    if (!agent || !isOwnProject) return;

    try {
      const response = await agent.api.com.atproto.repo.getRecord({
        repo: projectData.id,
        collection: 'app.gainforest.profile',
        rkey: 'self',
      });

      const currentProfile = response.success ? response.data.value : {};

      // Handle different field types
      let processedValue: string | number;
      if (field === 'hectares') {
        processedValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      } else {
        processedValue = typeof value === 'string' ? value.trim() : value.toString();
      }

      const updatedProfile = {
        $type: 'app.gainforest.profile',
        ...currentProfile,
        [field]: processedValue,
        updatedAt: new Date().toISOString(),
      };

      await agent.api.com.atproto.repo.putRecord({
        repo: projectData.id,
        collection: 'app.gainforest.profile',
        rkey: 'self',
        record: updatedProfile,
      });

      console.log(`Saved ${field}:`, processedValue);
    } catch (error) {
      console.error(`Failed to save ${field}:`, error);
    }
  };

  const cancelField = async (field: string) => {
    if (!agent) return;

    try {
      const response = await agent.api.com.atproto.repo.getRecord({
        repo: projectData.id,
        collection: 'app.gainforest.profile',
        rkey: 'self',
      });

      if (response.success) {
        const gainForestData = response.data.value;
        if (gainForestData) {
          if (field === 'location') {
            setLocationValue((gainForestData.location as string) || '');
          } else if (field === 'hectares') {
            setHectaresValue((gainForestData.hectares as number) || null);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to cancel ${field}:`, error);
    }
  };

  // Show loading state while fetching ATproto data
  if (isAtprotoProject && isLoadingData) {
    return (
      <div className="flex flex-col gap-4">
        {/* Project Type Section */}
        <section className="flex flex-col gap-0.5">
          <span className="font-bold">Project Type</span>
          <p className="leading-snug text-muted-foreground">Decentralized Environmental Profile</p>
        </section>

        {/* Loading indicator */}
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Loading profile data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Project Type Section */}
      <section className="flex flex-col gap-0.5">
        <span className="font-bold">Project Type</span>
        <p className="leading-snug text-muted-foreground">Decentralized Environmental Profile</p>
      </section>

      {/* Description Section */}
      <section className="flex flex-col gap-0.5">
        <span className="font-bold">Description</span>
        {editingDescription ? (
          <div className="space-y-2">
            <textarea
              value={descriptionValue}
              onChange={(e) => setDescriptionValue(e.target.value)}
              placeholder="Share your environmental story and initiatives..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  await saveField('description', descriptionValue);
                  setEditingDescription(false);
                }}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDescriptionValue(projectData.longDescription || '');
                  setEditingDescription(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {descriptionValue ? (
              <p
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors leading-snug"
                onClick={() => setEditingDescription(true)}
              >
                {descriptionValue}
              </p>
            ) : (
              isOwnProject ? (
                <p
                  className="cursor-pointer text-muted-foreground italic hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                  onClick={() => setEditingDescription(true)}
                >
                  Click to add a description...
                </p>
              ) : (
                <p className="text-muted-foreground italic">No description available</p>
              )
            )}
          </div>
        )}
      </section>

      {/* Objectives Section */}
      <section className="flex flex-col gap-0.5">
        <span className="font-bold">Environmental Mission</span>
        {editingObjective ? (
          <div className="space-y-2">
            <textarea
              value={objectiveValue}
              onChange={(e) => setObjectiveValue(e.target.value)}
              placeholder="What's your environmental mission or objective?"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  await saveField('objective', objectiveValue);
                  setEditingObjective(false);
                }}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setObjectiveValue(projectData.objective || '');
                  setEditingObjective(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {objectiveValue ? (
              <p
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors leading-snug"
                onClick={() => setEditingObjective(true)}
              >
                {objectiveValue}
              </p>
            ) : (
              isOwnProject ? (
                <p
                  className="cursor-pointer text-muted-foreground italic hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                  onClick={() => setEditingObjective(true)}
                >
                  Click to add your mission...
                </p>
              ) : (
                <p className="text-muted-foreground italic">No mission statement available</p>
              )
            )}
          </div>
        )}
      </section>



      {/* Organization Section */}
      <section className="flex flex-col gap-0.5">
        <span className="font-bold">Organization</span>
        {editingOrganization ? (
          <div className="space-y-2">
            <input
              value={organizationValue}
              onChange={(e) => setOrganizationValue(e.target.value)}
              placeholder="What's your organization or project name?"
              type="text"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  await saveField('organizationAffiliation', organizationValue);
                  setEditingOrganization(false);
                }}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setOrganizationValue(projectData.name !== `${projectData.id} Project` ? projectData.name : '');
                  setEditingOrganization(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {organizationValue ? (
              <p
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors leading-snug"
                onClick={() => setEditingOrganization(true)}
              >
                {organizationValue}
              </p>
            ) : (
              isOwnProject ? (
                <p
                  className="cursor-pointer text-muted-foreground italic hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                  onClick={() => setEditingOrganization(true)}
                >
                  Click to add organization...
                </p>
              ) : (
                <p className="text-muted-foreground italic">No organization specified</p>
              )
            )}
          </div>
        )}
      </section>

      {/* Location Section */}
      <section className="flex flex-col gap-0.5">
        <span className="font-bold">Location</span>
        {editingLocation ? (
          <div className="space-y-2">
            <input
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              placeholder="Where is your environmental project located?"
              type="text"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  await saveField('location', locationValue);
                  setEditingLocation(false);
                }}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await cancelField('location');
                  setEditingLocation(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {locationValue ? (
              <p
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors leading-snug"
                onClick={() => setEditingLocation(true)}
              >
                {locationValue}
              </p>
            ) : (
              isOwnProject ? (
                <p
                  className="cursor-pointer text-muted-foreground italic hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                  onClick={() => setEditingLocation(true)}
                >
                  Click to add location...
                </p>
              ) : (
                <p className="text-muted-foreground italic">No location specified</p>
              )
            )}
          </div>
        )}
      </section>

      {/* Hectares Section */}
      <section className="flex flex-col gap-0.5">
        <span className="font-bold">Area (Hectares)</span>
        {editingHectares ? (
          <div className="space-y-2">
            <input
              value={hectaresValue || ''}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = value === '' ? null : parseFloat(value);
                setHectaresValue(numValue);
              }}
              placeholder="How many hectares does your project cover?"
              type="number"
              min="0"
              step="0.01"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  await saveField('hectares', hectaresValue ?? 0);
                  setEditingHectares(false);
                }}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await cancelField('hectares');
                  setEditingHectares(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {hectaresValue !== null ? (
              <p
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors leading-snug"
                onClick={() => setEditingHectares(true)}
              >
                {hectaresValue.toLocaleString()} hectares
              </p>
            ) : (
              isOwnProject ? (
                <p
                  className="cursor-pointer text-muted-foreground italic hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                  onClick={() => setEditingHectares(true)}
                >
                  Click to add area in hectares...
                </p>
              ) : (
                <p className="text-muted-foreground italic">No area specified</p>
              )
            )}
          </div>
        )}
      </section>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live on ATproto</span>
        </div>
        <Link href={`/profile/${projectData.id}`}>
          <Button variant="outline" size="sm" className="text-xs">
            <Bird className="w-3 h-3 mr-1" />
            Full Profile
          </Button>
        </Link>
      </div>
    </div>
  );
};

const ProjectSitesSection = () => {
  const projectSitesOptions = useProjectOverlayStore(
    (state) => state.allSitesOptions
  );
  const navigate = useNavigation();
  const siteId = useProjectOverlayStore((state) => state.siteId);
  const setSiteId = useProjectOverlayStore((state) => state.setSiteId);
  const activateSite = useProjectOverlayStore((state) => state.activateSite);

  const handleProjectSiteChange = (siteId: string) => {
    setSiteId(siteId, navigate);
    activateSite(true, navigate);
  };

  if (!projectSitesOptions || projectSitesOptions.length === 0) return null;

  return (
    <section className="flex items-center gap-2">
      <span className="text-muted-foreground font-bold">
        Project Site{projectSitesOptions.length > 1 ? "s" : ""}
      </span>
      {projectSitesOptions.length > 1 ? (
        <Combobox
          options={projectSitesOptions}
          value={siteId ?? undefined}
          onChange={handleProjectSiteChange}
          className="flex-1 max-w-[300px]"
          searchIn="label"
        />
      ) : (
        <span className="text-muted-foreground flex-1 bg-accent px-2 py-1 rounded-md">
          {projectSitesOptions[0].label}
        </span>
      )}
    </section>
  );
};

const ProjectObjectivesSection = ({
  projectData,
}: {
  projectData: Project;
}) => {
  const objectives = projectData.objective?.split(",") || [];
  return (
    <section className="flex flex-col gap-0.5">
      <span className="font-bold">Objective</span>
      <div className="flex flex-wrap gap-2 mt-1">
        {objectives.map((objective) => (
          <span
            key={objective}
            className="px-2 py-1 bg-foreground/10 backdrop-blur-lg rounded-full text-sm"
          >
            {objective}
          </span>
        ))}
      </div>
    </section>
  );
};

const ProjectInfo = ({ projectData }: { projectData: Project }) => {
  const isAtprotoProject = projectData.id.startsWith('did:plc:');

  // Use the specialized ATproto profile component for DID-based projects
  if (isAtprotoProject) {
    return <AtprotoProfileProject projectData={projectData} />;
  }

  // Use the regular project layout for traditional projects
  return (
    <div className="flex flex-col gap-4">
      <ProjectSitesSection />
      <section className="flex flex-col gap-0.5">
        <span className="font-bold">Description</span>
        <p className="leading-snug">{projectData.longDescription}</p>
      </section>
      <ProjectObjectivesSection projectData={projectData} />
    </div>
  );
};

export default ProjectInfo;
