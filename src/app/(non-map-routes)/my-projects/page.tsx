import { getServerSession } from "next-auth/next";
import UnauthorizedPage from "../_components/UnauthorizedPage";
import Container from "@/components/Container";
import { Project } from "@/app/api/types";
import { authOptions } from "@/app/api/auth/options";
export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.address) {
    // User is not authenticated
    return (
      <>
        <UnauthorizedPage />
      </>
    );
  }

  // const address = session.address;

  const projects: Project[] = await new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          country: "United States",
          description: "Project 1",
          endDate: "2021-01-01",
          startDate: "2020-01-01",
          objective: "Project 1",
          lat: "37.774929",
          lon: "-122.419418",
        },
      ]);
    }, 1000);
  });
  return (
    <Container>
      {projects.map((project) => (
        <div key={project.id}>
          <h2>{project.country}</h2>
          <p>{project.description}</p>
          <p>{project.endDate}</p>
          <p>{project.startDate}</p>
        </div>
      ))}
    </Container>
  );
}
