import { create } from "zustand";

export const APP_TABS = [
  "project",
  "hovered-tree",
  "layers",
  "search",
] as const;

export type OverlayTab = (typeof APP_TABS)[number];

export type OverlayTabsState = {
  activeTab: OverlayTab;
};

export type OverlayTabsActions = {
  setActiveTab: (activeTab: OverlayTabsState["activeTab"]) => void;
};

const useOverlayTabsStore = create<OverlayTabsState & OverlayTabsActions>(
  (set) => ({
    activeTab: "search",
    setActiveTab: (activeTab) => set({ activeTab }),
  })
);

export default useOverlayTabsStore;
