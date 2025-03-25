"use client";

import UIBase from "@/components/ui/ui-base";
import React from "react";
import AppTabs from "./AppTabs";
import OverlayRenderer from "../OverlayRenderer";
import Header from "./Header";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import useSidebarStore from "./store";
import { cn } from "@/lib/utils";
import useProjectOverlayStore from "../ProjectOverlay/store";
import useAppTabsStore from "./AppTabs/store";

const SIDEBAR_WIDTH = 500;

const Sidebar = () => {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const setIsOpen = useSidebarStore((state) => state.setIsOpen);

  const isMaximized = useProjectOverlayStore((state) => state.isMaximized);
  const activeAppTab = useAppTabsStore((state) => state.activeTab);

  return (
    <motion.div
      className="fixed top-2 left-2 bottom-2 flex items-start gap-2"
      initial={{ opacity: 0, x: -SIDEBAR_WIDTH }}
      animate={{ opacity: 1, x: isOpen ? 0 : -SIDEBAR_WIDTH }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="h-full p-0"
        animate={{
          // maxWidth: isMaximized ? "50vw" : `${SIDEBAR_WIDTH}px`,
          width:
            isMaximized && activeAppTab === "project"
              ? "50vw"
              : `${SIDEBAR_WIDTH}px`,
        }}
      >
        <UIBase
          className="w-full h-full p-0"
          innerClassName="flex flex-col w-full h-full p-0 overflow-scroll"
        >
          <div className="sticky top-0 flex flex-col gap-4 p-4 border-b border-b-border bg-background/50 backdrop-blur-lg shadow-lg z-10">
            <Header />
            <AppTabs />
          </div>
          <div className="w-full flex-1">
            <OverlayRenderer />
          </div>
        </UIBase>
      </motion.div>
      <div className="h-full flex items-center justify-center">
        <button
          className="group rounded-full mt-4 h-80 w-8 flex items-center justify-center shadow-sm bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="h-16 group-hover:h-full w-full rounded-full flex items-center justify-center bg-neutral-800/40 group-hover:bg-neutral-800/60 backdrop-blur-lg text-white transition-all duration-300">
            <ChevronLeft
              size={16}
              className={cn(
                "transition-all duration-300",
                isOpen ? "" : "rotate-180"
              )}
            />
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
