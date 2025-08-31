import { toKebabCase } from "@/lib/utils";
import {
  MeasuredTreesGeoJSON,
  NormalizedTreeFeature,
  Project,
  ProjectDataApiResponse,
  ProjectPolygonAPIResponse,
  TreeFeature,
} from "./types";
import { getTreeSpeciesName } from "../../Map/sources-and-layers/measured-trees";
import { backendApiURL } from "@/config/endpoints";
import { Agent } from '@atproto/api';

interface GainForestProfileData {
  organizationAffiliation?: string;
  location?: string;
  description?: string;
  objective?: string;
}

export const fetchProjectDataFromAtproto = async (
  projectDid: string,
  agent: Agent | null
): Promise<Project | null> => {
  console.log('[fetchProjectDataFromAtproto] Called with:', projectDid);
  console.log('[fetchProjectDataFromAtproto] Agent available:', !!agent);

  if (!agent) {
    console.error('[fetchProjectDataFromAtproto] No ATproto agent available');
    return null;
  }

  try {
    // projectDid is already decoded from the parent function
    const decodedDid = projectDid;
    console.log('[fetchProjectDataFromAtproto] Using decoded DID:', decodedDid);
    
    // Fetch both Bluesky profile and GainForest profile in parallel
    console.log('[fetchProjectDataFromAtproto] Making API calls...');
    const [blueskyResponse, gainForestResponse] = await Promise.allSettled([
      agent.getProfile({ actor: decodedDid }),
      agent.api.com.atproto.repo.getRecord({
        repo: decodedDid,
        collection: 'app.gainforest.profile',
        rkey: 'self',
      })
    ]);

    console.log('[fetchProjectDataFromAtproto] Bluesky response:', {
      status: blueskyResponse.status,
      success: blueskyResponse.status === 'fulfilled' ? blueskyResponse.value.success : 'N/A',
      error: blueskyResponse.status === 'rejected' ? blueskyResponse.reason : 'N/A'
    });

    console.log('[fetchProjectDataFromAtproto] GainForest response:', {
      status: gainForestResponse.status,
      success: gainForestResponse.status === 'fulfilled' ? gainForestResponse.value.success : 'N/A',
      error: gainForestResponse.status === 'rejected' ? gainForestResponse.reason : 'N/A'
    });

    // Get basic profile info from Bluesky
    let displayName = 'Anonymous User';
    let avatar = '';

    if (blueskyResponse.status === 'fulfilled' && blueskyResponse.value.success) {
      const blueskyProfile = blueskyResponse.value.data;
      console.log('[fetchProjectDataFromAtproto] Bluesky profile data:', {
        displayName: blueskyProfile.displayName,
        handle: blueskyProfile.handle,
        avatar: !!blueskyProfile.avatar,
        banner: !!blueskyProfile.banner
      });
      displayName = blueskyProfile.displayName || blueskyProfile.handle || 'Anonymous User';
      avatar = blueskyProfile.avatar || '';
    }

    // Get GainForest-specific data
    let gainForestData: GainForestProfileData = {};
    if (gainForestResponse.status === 'fulfilled' && gainForestResponse.value.success) {
      gainForestData = gainForestResponse.value.data.value as GainForestProfileData;
      console.log('[fetchProjectDataFromAtproto] GainForest profile data:', gainForestData);
    } else {
      console.log('[fetchProjectDataFromAtproto] No GainForest profile found');
    }

    // Create a project object from the profile data
    const project: Project = {
      id: decodedDid,
      name: gainForestData.organizationAffiliation || `${displayName}'s Environmental Project`,
      country: gainForestData.location || '',
      dataDownloadUrl: '',
      dataDownloadInfo: '',
      description: gainForestData.description || 'Environmental conservation project managed through ATproto.',
      longDescription: gainForestData.objective || gainForestData.description || 'This project is managed through the decentralized ATproto network.',
      stripeUrl: '',
      discordId: null,
      lat: 0, // TODO: Parse from location if available
      lon: 0, // TODO: Parse from location if available
      area: 0,
      objective: gainForestData.objective || 'Environmental conservation and sustainability',
      assets: [], // Profile-based projects start with no assets
      communityMembers: [{
        id: 1,
        firstName: displayName.split(' ')[0] || 'User',
        lastName: displayName.split(' ').slice(1).join(' ') || '',
        priority: 1,
        role: 'Project Lead',
        bio: gainForestData.description || 'Environmental advocate',
        fundsReceived: null,
        profileUrl: avatar || null,
        Wallet: {
          CeloAccounts: null,
          SOLAccounts: null,
        },
      }],
      Wallet: {
        CeloAccounts: [],
        SOLAccounts: [],
      },
    };

    console.log('[fetchProjectDataFromAtproto] Generated project from ATproto profile:', {
      id: project.id,
      name: project.name,
      description: project.longDescription?.substring(0, 100) + '...',
      objective: project.objective?.substring(0, 50) + '...',
      communityMembers: project.communityMembers?.length || 0
    });
    return project;
  } catch (error) {
    console.error('Error fetching project from ATproto:', error);
    return null;
  }
};

export const fetchProjectData = async (projectId: string) => {
  // URL-decode the projectId to handle URL-encoded DIDs
  const decodedProjectId = decodeURIComponent(projectId);

  // Check if this is a DID (new ATproto format)
  if (decodedProjectId.startsWith('did:plc:')) {
    console.log('[fetchProjectData] Detected DID project:', decodedProjectId);

    // For DID projects, return a basic project structure immediately
    // The component will handle fetching the actual ATproto data
    console.log('[fetchProjectData] Returning basic DID project structure, component will fetch ATproto data');
    return {
      id: decodedProjectId,
      name: `${decodedProjectId} Project`,
      country: '',
      dataDownloadUrl: '',
      dataDownloadInfo: '',
      description: '',
      longDescription: '',
      stripeUrl: '',
      discordId: null,
      lat: 0,
      lon: 0,
      area: 0,
      objective: '',
      assets: [],
      communityMembers: [],
      Wallet: {
        CeloAccounts: [],
        SOLAccounts: [],
      },
    };
  }

  // Original database fetching logic (kept as fallback)
  const endpoint = `${process.env.NEXT_PUBLIC_GAINFOREST_ENDPOINT}/api/graphql`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
                  query {
                    project(id:"${projectId}") {
                      id
                      name
                      country
                      dataDownloadUrl
                      dataDownloadInfo
                      description
                      longDescription
                      stripeUrl
                      discordId
                      lat
                      lon
                      area
                      objective
                      assets {
                        id
                        name
                        classification
                        awsCID
                        shapefile {
                          default
                          isReference
                          shortName
                        }
                      }
                      communityMembers {
                        id
                        firstName
                        lastName
                        priority
                        role
                        bio
                        Wallet {
                          CeloAccounts
                          SOLAccounts
                        }
                        fundsReceived
                        profileUrl
                      }
                      Wallet {
                        CeloAccounts
                        SOLAccounts
                      }
                    }
                  }
                `,
      }),
    });
    const responseData: ProjectDataApiResponse = await response.json();
    if ("project" in responseData.data && responseData.data.project) {
      const project = responseData.data.project;
      try {
        const projectFromNewBackendResponse = await fetch(
          `${backendApiURL}/projects/${projectId}`
        );
        if (projectFromNewBackendResponse.ok) {
          const projectFromNewBackendData =
            await projectFromNewBackendResponse.json();
          const {
            name,
            country,
            short_description,
            long_description,
            objective,
          } = projectFromNewBackendData;
          project.name = name;
          project.country = country;
          project.description = short_description;
          project.longDescription = long_description;
          project.objective = objective;
        }
      } catch {}

      return project;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchProjectPolygon = async (awsCID: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AWS_STORAGE}/${awsCID}`
    );
    const data: ProjectPolygonAPIResponse = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getProjectSplashImageURLFromProject = (project: Project) => {
  const splashImage = project.assets.find(
    (asset) => asset.classification === "Project Splash"
  );
  if (splashImage?.awsCID) {
    return `${process.env.NEXT_PUBLIC_AWS_STORAGE}/${splashImage?.awsCID}`;
  } else {
    return null;
  }
};

export const fetchMeasuredTreesShapefile = async (
  projectName: string
): Promise<MeasuredTreesGeoJSON | null> => {
  // For DID-based projects (ATproto), return empty GeoJSON
  if (projectName.startsWith('did:plc:')) {
    console.log(`[fetchMeasuredTreesShapefile] Returning empty GeoJSON for DID project: ${projectName}`);
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  const kebabCaseProjectName = toKebabCase(projectName);

  const endpoint = `shapefiles/${kebabCaseProjectName}-all-tree-plantings.geojson`;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AWS_STORAGE}/${endpoint}`
    );
    if (response.ok) {
      const result =
        (await response.json()) as MeasuredTreesGeoJSON<TreeFeature>;

      const normalizedFeatures: NormalizedTreeFeature[] = result.features.map(
        (feature, index: number) => ({
          ...feature,
          properties: {
            ...feature.properties,
            species:
              getTreeSpeciesName(feature.properties)?.trim() ?? "Unknown",
            type: "measured-tree",
          },
          id: index,
        })
      );
      const normalizedResult: MeasuredTreesGeoJSON = {
        ...result,
        features: normalizedFeatures,
      };
      return normalizedResult;
    } else {
      console.log(`[fetchMeasuredTreesShapefile] No shapefile found for project: ${projectName}`);
      return null;
    }
  } catch (error) {
    console.error(`[fetchMeasuredTreesShapefile] Error fetching shapefile for ${projectName}:`, error);
    return null;
  }
};
