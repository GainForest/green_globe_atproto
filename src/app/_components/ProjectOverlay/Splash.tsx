"use client";
import { Project } from "@/app/_stores/project/types";
import useAppViewsStore from "@/app/_stores/app-views";
import Image from "next/image";

type SplashProps = {
  imageURL: string | null;
  projectDetails: Project;
};

const Splash = ({ imageURL, projectDetails }: SplashProps) => {
  const { projectOverlayTab } = useAppViewsStore((state) => state);
  console.log("projectOverlayTab", projectOverlayTab);
  if (projectOverlayTab === "ask-ai") return null;
  return (
    <>
      {imageURL ? (
        <div>
          <Image
            src={imageURL}
            alt={projectDetails.name}
            width={300}
            height={300}
            className="w-full h-[300px] object-cover object-center [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]"
          />
        </div>
      ) : (
        "No splash image found"
      )}
    </>
  );
};

export default Splash;
