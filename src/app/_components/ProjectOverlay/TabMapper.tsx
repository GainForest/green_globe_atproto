"use client";
import React from "react";
import useProjectOverlayStore from "./store";
import ProjectInfo from "./ProjectInfo";
import AIAssistant from "./AIAssistant";
import { Project } from "./store/types";
import Biodiversity from "./Biodiversity";
const TabMapper = ({ projectData }: { projectData: Project }) => {
  const activeTab = useProjectOverlayStore((state) => state.activeTab);

  switch (activeTab) {
    case "info":
      return <ProjectInfo projectData={projectData} />;
    case "ask-ai":
      return <AIAssistant />;
    case "biodiversity":
      return <Biodiversity />;
    default:
      return null;
  }
};

export default TabMapper;
