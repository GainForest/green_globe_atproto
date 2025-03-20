import { create } from "zustand";
import { Feature } from "../Map/sources-and-layers/types";

export type SearchOverlayState = {
  allProjects: Feature[];
  searchQuery: string;
};

export type SearchOverlayActions = {
  setSearchQuery: (searchQuery: string) => void;
  setAllProjects: (projects: Feature[]) => void;
};

const initialState: SearchOverlayState = {
  searchQuery: "",
  allProjects: [],
};

const useSearchOverlayStore = create<SearchOverlayState & SearchOverlayActions>(
  (set) => {
    return {
      ...initialState,
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setAllProjects: (projects) => set({ allProjects: projects }),
    };
  }
);

export default useSearchOverlayStore;
