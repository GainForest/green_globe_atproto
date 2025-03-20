import { Project, ProjectDataApiResponse } from "./types";

export const fetchProjectData = async (projectId: string) => {
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
      return project;
    } else {
      return null;
    }
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
