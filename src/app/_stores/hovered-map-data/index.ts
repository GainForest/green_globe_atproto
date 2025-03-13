import { create } from "zustand";

export type State = {
  treesInformation: {
    treeName: string;
    treeHeight: string;
    treeDBH: string;
    treePhotos: string[];
    dateOfMeasurement: string;
  } | null;
};

export type Actions = {
  setTreesInformation: (treesInformation: State["treesInformation"]) => void;
};

const initialState: State = {
  treesInformation: null,
};

const useHoveredMapDataStore = create<State & Actions>((set) => {
  return {
    ...initialState,
    setTreesInformation: (treesInformation) => {
      set({ treesInformation });
    },
  };
});

export default useHoveredMapDataStore;
