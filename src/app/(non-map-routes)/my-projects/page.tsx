import { getServerSession } from "next-auth/next";
import UnauthorizedPage from "../_components/UnauthorizedPage";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Projects</h1>
      <div className="bg-muted rounded-lg p-4">
        <p>Connected Address: {session.address}</p>
        <p>Chain ID: {session.chainId}</p>
      </div>
      {/* Add your projects content here */}
    </div>
  );
}
