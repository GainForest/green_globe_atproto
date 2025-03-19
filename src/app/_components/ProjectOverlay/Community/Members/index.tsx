"use client";
import React from "react";
import useProjectOverlayStore from "../../store";

const Members = () => {
  const projectData = useProjectOverlayStore((state) => state.projectData);
  if (!projectData) return null;
  const members = projectData.communityMembers;
  return (
    <div>
      <p>
        {members.length} member{members.length === 1 ? "" : "s"} from the local
        communities {members.length === 1 ? "is" : "are"} registered to receive
        financial benefits from this project.
      </p>
      <div className="flex flex-col gap-2"></div>
    </div>
  );
};

export default Members;
