"use client";
import React from "react";
import useProjectOverlayStore from "./store";
import ProjectInfo from "./ProjectInfo";
import AIAssistant from "./AIAssistant";
import { Project } from "./store/types";

const TabMapper = ({ projectData }: { projectData: Project }) => {
  const activeTab = useProjectOverlayStore((state) => state.activeTab);

  switch (activeTab) {
    case "info":
      return <ProjectInfo projectData={projectData} />;
    case "ask-ai":
      return <AIAssistant />;
    default:
      return null;
  }
};

export default TabMapper;
