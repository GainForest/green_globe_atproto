import { countryToEmoji } from "@/lib/country-emojis";
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Info,
  Leaf,
  MessageCircleQuestion,
  PencilOff,
  Satellite,
  FileClock,
  ImagePlay,
  LucideProps,
  Users2,
} from "lucide-react";
import QuickTooltip from "@/components/ui/quick-tooltip";
import { cn } from "@/lib/utils";
import useProjectOverlayStore, { ProjectOverlayState } from "./store";
import { Project } from "./store/types";

const TabButton = ({
  children,
  tooltipContent,
  isActive,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  tooltipContent: string;
  isActive: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  return (
    <QuickTooltip tooltipContent={tooltipContent}>
      <Button
        variant={isActive ? "default" : "secondary"}
        className="w-full"
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
    </QuickTooltip>
  );
};

const TABS_CONFIG: {
  tooltipContent: string;
  icon: React.FC<LucideProps>;
  id: Exclude<ProjectOverlayState["activeTab"], undefined>;
}[] = [
  {
    tooltipContent: "Project Info",
    icon: Info,
    id: "info" as const,
  },
  {
    tooltipContent: "Ask AI Assistant",
    icon: MessageCircleQuestion,
    id: "ask-ai" as const,
  },
  {
    tooltipContent: "Biodiversity",
    icon: Leaf,
    id: "biodiversity" as const,
  },
  {
    tooltipContent: "Media",
    icon: ImagePlay,
    id: "media" as const,
  },
  {
    tooltipContent: "Remote Sensing Analysis",
    icon: Satellite,
    id: "remote-sensing-analysis" as const,
  },
  {
    tooltipContent: "Community",
    icon: Users2,
    id: "community" as const,
  },
  {
    tooltipContent: "Logbook",
    icon: FileClock,
    id: "logbook" as const,
  },
];
const Tabs = () => {
  const activeTab = useProjectOverlayStore((state) => state.activeTab);
  const setActiveTab = useProjectOverlayStore((state) => state.setActiveTab);
  return (
    <div className="grid grid-cols-4 gap-2 mt-4">
      {TABS_CONFIG.map((tab) => (
        <TabButton
          key={tab.id}
          tooltipContent={tab.tooltipContent}
          isActive={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
        >
          <tab.icon size={16} />
        </TabButton>
      ))}
      <TabButton
        tooltipContent="Connect wallet to edit project"
        isActive={false}
        disabled
      >
        <PencilOff size={16} />
      </TabButton>
    </div>
  );
};

const Header = ({ projectData }: { projectData: Project }) => {
  const countryDetails = Object.keys(countryToEmoji).includes(
    projectData.country
  )
    ? countryToEmoji[projectData.country as keyof typeof countryToEmoji]
    : null;
  const area = Math.round(projectData.area / 10000);

  const activeTab = useProjectOverlayStore((state) => state.activeTab);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const header = headerRef.current;
      const parent = document.querySelector("#project-overlay .scrollable");
      if (!header || !parent) return;
      const headerRect = header.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      setIsStuck(headerRect.top - parentRect.top <= 2);
    };

    handleScroll();
    const parent = document.querySelector("#project-overlay .scrollable");
    if (!parent) return;

    parent.addEventListener("scroll", handleScroll);
    return () => parent.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  return (
    <div
      className={cn(
        "p-4 sticky top-20 -translate-y-20 z-10 bg-gradient-to-b",
        isStuck
          ? "from-neutral-50/90 dark:from-neutral-900/90 to-neutral-50 dark:to-neutral-900 border-b border-b-border backdrop-blur-lg shadow-xl"
          : "from-black/0 via-black/20 to-black/0"
      )}
      ref={headerRef}
    >
      <h1
        className="text-2xl font-bold text-balance"
        style={{
          textShadow: "0px 0px 16px rgb(0 0 0 / 1)",
        }}
      >
        {projectData.name}
      </h1>
      {countryDetails && (
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <span className="px-2 py-1 bg-background/50 backdrop-blur-lg rounded-full text-sm">
            {countryDetails.emoji}
            &nbsp;&nbsp;
            {countryDetails.name}
          </span>
          <span className="px-2 py-1 bg-background/50 backdrop-blur-lg rounded-full text-sm">
            <b>{area}</b> {area === 1 ? "hectare" : "hectares"}
          </span>
        </div>
      )}
      <Tabs />
    </div>
  );
};

export default Header;
