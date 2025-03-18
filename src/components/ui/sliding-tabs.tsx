"use client";

import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

// Context to share state between SlidingTabs and Underlay
type SlidingTabsContextType = {
  activeKey: string | null;
  setActiveKey: (key: string) => void;
};

const SlidingTabsContext = createContext<SlidingTabsContextType | null>(null);

const useSlidingTabsContext = () => {
  const context = useContext(SlidingTabsContext);
  if (!context) {
    throw new Error(
      "SlidingTabs components must be used within a SlidingTabs component"
    );
  }
  return context;
};

export interface SlidingTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultActiveKey?: string;
  activeKey?: string;
  onTabChange?: (key: string) => void;
}

export const SlidingTabs = ({
  children,
  className,
  defaultActiveKey,
  activeKey: controlledActiveKey,
  onTabChange,
  ...props
}: SlidingTabsProps) => {
  const [activeKey, setActiveKeyState] = useState<string | null>(
    defaultActiveKey || null
  );

  // Handle controlled component pattern
  const isControlled = controlledActiveKey !== undefined;
  const currentActiveKey = isControlled ? controlledActiveKey : activeKey;

  const setActiveKey = (key: string) => {
    if (!isControlled) {
      setActiveKeyState(key);
    }
    onTabChange?.(key);
  };

  return (
    <SlidingTabsContext.Provider
      value={{
        activeKey: currentActiveKey,
        setActiveKey,
      }}
    >
      <div
        className={cn("flex items-center gap-1 relative", className)}
        {...props}
      >
        {children}
      </div>
    </SlidingTabsContext.Provider>
  );
};

export const Underlay = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { activeKey } = useSlidingTabsContext();
  const underlayRef = useRef<HTMLDivElement>(null);
  const [tabElements, setTabElements] = useState<Record<string, HTMLElement>>(
    {}
  );

  // Use a simpler approach to find tab elements
  useEffect(() => {
    const findTabElements = () => {
      const container = underlayRef.current?.parentElement;
      if (!container) return;

      const elements: Record<string, HTMLElement> = {};
      container.querySelectorAll("[data-sliding-tab]").forEach((el) => {
        const key = el.getAttribute("data-sliding-tab");
        if (key) {
          elements[key] = el as HTMLElement;
        }
      });

      setTabElements(elements);
    };

    // Find elements immediately and after a short delay to ensure DOM is ready
    findTabElements();
    const timeout = setTimeout(findTabElements, 50);

    // Also set up a mutation observer for dynamic changes
    const observer = new MutationObserver(findTabElements);
    const container = underlayRef.current?.parentElement;
    if (container) {
      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-sliding-tab"],
      });
    }

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  // Update underlay position when active tab changes
  useEffect(() => {
    const updateUnderlay = () => {
      const underlay = underlayRef.current;
      if (!underlay) return;

      if (!activeKey || !tabElements[activeKey]) {
        underlay.style.opacity = "0";
        return;
      }

      const activeElement = tabElements[activeKey];
      underlay.style.left = `${activeElement.offsetLeft}px`;
      underlay.style.width = `${activeElement.offsetWidth}px`;
      underlay.style.opacity = "1";
    };

    updateUnderlay();
    window.addEventListener("resize", updateUnderlay);
    return () => window.removeEventListener("resize", updateUnderlay);
  }, [activeKey, tabElements]);

  return (
    <div
      className={cn(
        "absolute top-0 bottom-0 bg-foreground/20 rounded-md transition-all duration-200",
        className
      )}
      ref={underlayRef}
      style={{ opacity: 0 }} // Start invisible until positioned
      {...props}
    />
  );
};

export interface TabProps extends React.HTMLAttributes<HTMLDivElement> {
  tabKey: string;
  asChild?: boolean;
}

export const Tab = ({
  children,
  className,
  tabKey,
  asChild = false,
  ...props
}: TabProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      className={cn("flex items-center", className)}
      data-sliding-tab={tabKey}
      {...props}
    >
      {children}
    </Comp>
  );
};
