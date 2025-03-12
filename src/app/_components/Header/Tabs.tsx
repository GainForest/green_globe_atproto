"use client";

import { Layers, Leaf, LucideProps, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useEffect, useMemo, useRef } from "react";
import { useProjectStore } from "@/app/_stores/project";
import useAppViewsStore, {
  State as AppViewsState,
} from "@/app/_stores/app-views";

type TabButton = {
  icon: React.FC<LucideProps>;
  label: string;
  onClick?: () => void;
  shouldBeVisible: boolean;
  key: Exclude<AppViewsState["appActiveTab"], undefined>;
};

const Tabs = () => {
  const appActiveTab = useAppViewsStore((state) => state.appActiveTab);
  const setAppActiveTab = useAppViewsStore((state) => state.setAppActiveTab);
  const activeProjectId = useProjectStore((state) => state.activeProjectId);

  const underlayRef = useRef<HTMLDivElement>(null);

  const buttons: TabButton[] = useMemo(
    () => [
      {
        icon: Search,
        label: "Search",
        shouldBeVisible: true,
        key: "search",
      },
      {
        icon: Layers,
        label: "Layers",
        shouldBeVisible: true,
        key: "layers",
      },
      {
        icon: Leaf,
        label: "Project",
        shouldBeVisible: activeProjectId !== undefined,
        key: "project",
      },
    ],
    [activeProjectId]
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
    updateUnderlay(appActiveTab);
  }, [appActiveTab]);

  return (
    <div className="flex items-center gap-1 relative">
      <div
        className="absolute top-0 bottom-0 bg-foreground/20 rounded-md transition-all"
        ref={underlayRef}
      ></div>
      {buttons.map((button) => {
        if (!button.shouldBeVisible) return null;
        return (
          <Button
            key={button.key}
            data-button-key={button.key}
            variant={"ghost"}
            onClick={() => {
              setAppActiveTab(button.key);
            }}
          >
            <button.icon /> {button.label}
          </Button>
        );
      })}
    </div>
  );
};

export default Tabs;
