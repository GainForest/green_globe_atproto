"use client";

import ProjectOverlay from "./ProjectOverlay";
import LayersOverlay from "./LayersOverlay";
import { AnimatePresence } from "framer-motion";
import useAppTabsStore from "@/app/_components/Sidebar/AppTabs/store";
import SearchOverlay from "./SearchOverlay";
const OverlayRenderer = () => {
  const appActiveTab = useAppTabsStore((state) => state.activeTab);

  let overlay = null;
  if (appActiveTab === "search") overlay = <SearchOverlay />;
  if (appActiveTab === "project") overlay = <ProjectOverlay />;
  if (appActiveTab === "layers") overlay = <LayersOverlay />;

  return <AnimatePresence>{overlay}</AnimatePresence>;
};

export default OverlayRenderer;
