"use client";

import { Layers, LucideProps, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useEffect, useMemo, useRef } from "react";
import useAppTabsStore, { AppTabsState } from "./store";
import useProjectOverlayStore from "../../ProjectOverlay/store";
import useHoveredTreeOverlayStore from "../../HoveredTreeOverlay/store";

type TabButton = {
  icon: React.FC<LucideProps>;
  label: string;
  onClick?: () => void;
  shouldBeDisabled: boolean;
  key: Exclude<AppTabsState["activeTab"], undefined>;
};

const AppTabs = () => {
  const activeTab = useAppTabsStore((state) => state.activeTab);
  const setActiveTab = useAppTabsStore((state) => state.setActiveTab);
  const activeProjectId = useProjectOverlayStore((state) => state.projectId);
  const hoveredTree = useHoveredTreeOverlayStore(
    (state) => state.treeInformation
  );

  const underlayRef = useRef<HTMLDivElement>(null);

  const buttons: TabButton[] = useMemo(
    () => [
      {
        icon: Search,
        label: "Search",
        shouldBeDisabled: false,
        key: "search",
      },
      {
        icon: Layers,
        label: "Layers",
        shouldBeDisabled: false,
        key: "layers",
      },
      {
        icon: MapPin,
        label: "Project",
        shouldBeDisabled: activeProjectId !== undefined,
        key: "project",
      },
    ],
    [activeProjectId, hoveredTree]
  );

  const updateUnderlay = (buttonKey: string | undefined) => {
    const underlay = underlayRef.current;
    if (!underlay) return;

    if (!buttonKey) {
      underlay.style.left = "0px";
      underlay.style.width = "0px";
      return;
    }

    const button = document.querySelector(
      `[data-button-key="${buttonKey}"]`
    ) as HTMLButtonElement | null;
    if (!button) return;

    underlay.style.left = `${button.offsetLeft}px`;
    underlay.style.width = `${button.offsetWidth}px`;
  };

  useEffect(() => {
    const button = buttons.find((button) => button.key === activeTab);
    if (!button) {
      updateUnderlay(undefined);
    }
    updateUnderlay(activeTab);
  }, [activeTab, buttons]);

  return (
    <div className="flex items-center gap-1 relative">
      <div
        className="absolute top-0 bottom-0 bg-foreground/20 rounded-md transition-all"
        ref={underlayRef}
      ></div>
      {buttons.map((button, index) => {
        return (
          <React.Fragment key={button.key}>
            <Button
              data-button-key={button.key}
              variant={"ghost"}
              className="flex-1"
              onClick={() => {
                setActiveTab(button.key);
              }}
              disabled={button.shouldBeDisabled}
            >
              <button.icon /> {button.label}
            </Button>
            {index !== buttons.length - 1 && (
              <div className="h-5 w-[2px] bg-border rounded-full" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default AppTabs;
