import { create } from "zustand";

export const APP_TABS = ["project", "layers", "search"] as const;

export type AppTab = (typeof APP_TABS)[number];

export type AppTabsState = {
  activeTab: AppTab;
};

export type AppTabsActions = {
  setActiveTab: (activeTab: AppTabsState["activeTab"]) => void;
};

const useAppTabsStore = create<AppTabsState & AppTabsActions>((set) => ({
  activeTab: "search",
  setActiveTab: (activeTab) => set({ activeTab }),
}));

export default useAppTabsStore;
