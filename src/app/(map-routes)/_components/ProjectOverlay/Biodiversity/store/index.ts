import { create } from "zustand";

export type BiodiversityState = {
  activeTab: "predictions" | "observations";
};

export type BiodiversityActions = {
  setActiveTab: (tab: "predictions" | "observations") => void;
};

const initialState: BiodiversityState = {
  activeTab: "predictions",
};

const useBiodiversityStore = create<BiodiversityState & BiodiversityActions>(
  (set) => ({
    ...initialState,
    setActiveTab: (tab) => set({ activeTab: tab }),
  })
);

export default useBiodiversityStore;
