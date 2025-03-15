import { create } from "zustand";

export type HoveredTreeOverlayState = {
  treeInformation: {
    treeName: string;
    treeHeight: string;
    treeDBH: string;
    treePhotos: string[];
    dateOfMeasurement: string;
  } | null;
};

export type HoveredTreeOverlayActions = {
  setTreeInformation: (
    treeInformation: HoveredTreeOverlayState["treeInformation"]
  ) => void;
};

const initialState: HoveredTreeOverlayState = {
  treeInformation: null,
};

const useHoveredTreeOverlayStore = create<
  HoveredTreeOverlayState & HoveredTreeOverlayActions
>((set) => {
  return {
    ...initialState,
    setTreeInformation: (treeInformation) => {
      set({ treeInformation });
    },
  };
});

export default useHoveredTreeOverlayStore;
