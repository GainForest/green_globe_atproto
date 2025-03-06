import { create } from "zustand";
import { useProjectStore } from "./project";

// type MapViewStateCatalog = {
//   project: {
//     type: "project";
//     projectId: string;
//     siteAssetAWSCID: string;
//   };
//   geojson: {
//     type: "geojson";
//     geojson: GeoJSON.FeatureCollection;
//   };
// };

// type MapViewState = MapViewStateCatalog[keyof MapViewStateCatalog];

export type State = {
  mapView: "project" | "geojson" | undefined;
  projectOverlayTab:
    | "info"
    | "ask-ai"
    | "biodiversity"
    | "media"
    | "remote-sensing-analysis"
    | "community-donations"
    | "logbook"
    | "edit"
    | undefined;
};

export type Actions = {
  setMapView: (mapView: State["mapView"]) => void;
  setProjectOverlayTab: (projectOverlayTab: State["projectOverlayTab"]) => void;
};

const initialState: State = {
  mapView: undefined,
  projectOverlayTab: undefined,
};

const useAppViewsStore = create<State & Actions>((set) => {
  return {
    ...initialState,
    setMapView: (mapView) => {
      set({ mapView });
      if (!mapView) {
        useProjectStore.getState().resetState();
      }
    },
    setProjectOverlayTab: (projectOverlayTab: State["projectOverlayTab"]) =>
      set({ projectOverlayTab }),
  };
});

export default useAppViewsStore;
