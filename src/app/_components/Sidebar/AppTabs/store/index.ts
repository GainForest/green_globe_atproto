import { create } from "zustand";

export type AppTabsState = {
  activeTab: "project" | "hovered-tree" | "layers" | "search";
};

export type AppTabsActions = {
  setActiveTab: (activeTab: AppTabsState["activeTab"]) => void;
};

const useAppTabsStore = create<AppTabsState & AppTabsActions>((set) => ({
  activeTab: "search",
  setActiveTab: (activeTab) => set({ activeTab }),
}));

export default useAppTabsStore;
