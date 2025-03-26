import { create } from "zustand";
import dayjs from "dayjs";
import { fetchLayers, fetchProjectSpecificLayers } from "./utils";
import { DynamicLayer } from "./types";
import { groupBy } from "@/lib/utils";
import useProjectOverlayStore from "../../ProjectOverlay/store";
import useRouteStore from "../../RouteSynchronizer/store";
export type LayersOverlayState = {
  staticLayersVisibility: {
    historicalSatellite: boolean;
  };
  categorizedDynamicLayers: Record<string, DynamicLayer[]>[];
  projectSpecificLayers: {
    projectId: string | null;
    status: "loading" | "success";
    layers: DynamicLayer[] | null;
  };
  historicalSatelliteState: {
    minDate: dayjs.Dayjs;
    maxDate: dayjs.Dayjs;
    previousDate: dayjs.Dayjs | null;
    formattedPreviousDate: string | null;
    currentDate: dayjs.Dayjs;
    formattedCurrentDate: string;
  };
};

export type LayersOverlayActions = {
  setHistoricalSatelliteDate: (date: dayjs.Dayjs) => void;
  setStaticLayerVisibility: (
    layerView: keyof LayersOverlayState["staticLayersVisibility"],
    value: boolean
  ) => void;
  setDynamicLayerVisibility: (layerName: string, value: boolean) => void;
  setProjectSpecificLayerVisibility: (
    layerName: string,
    value: boolean
  ) => void;
  fetchCategorizedDynamicLayers: () => Promise<void>;
  fetchProjectSpecificLayers: () => Promise<void>;
};

const initialState: LayersOverlayState = {
  staticLayersVisibility: {
    historicalSatellite: false,
  },
  categorizedDynamicLayers: [],
  projectSpecificLayers: {
    projectId: null,
    status: "loading",
    layers: null,
  },
  historicalSatelliteState: {
    minDate: dayjs("2020-09-01"),
    maxDate: dayjs().subtract(6, "week").set("date", 1),
    previousDate: null,
    formattedPreviousDate: null,
    currentDate: dayjs().subtract(6, "week").set("date", 1),
    formattedCurrentDate: dayjs()
      .subtract(6, "week")
      .set("date", 1)
      .format("YYYY-MM"),
  },
};

const useLayersOverlayStore = create<LayersOverlayState & LayersOverlayActions>(
  (set, get) => {
    return {
      ...initialState,
      setStaticLayerVisibility: (layerName, value) =>
        set((state) => ({
          staticLayersVisibility: {
            ...state.staticLayersVisibility,
            [layerName]: value,
          },
        })),
      setDynamicLayerVisibility: (layerName, value) => {
        set((state) => ({
          categorizedDynamicLayers: state.categorizedDynamicLayers.map(
            (categoryObj) => {
              const categoryKey = Object.keys(categoryObj)[0];
              const categoryLayers = categoryObj[categoryKey];
              const newCategoryLayers = categoryLayers.map((layer) =>
                layer.name === layerName ? { ...layer, visible: value } : layer
              );
              return {
                [categoryKey]: newCategoryLayers,
              };
            }
          ),
        }));
      },
      setProjectSpecificLayerVisibility: (layerName, value) => {
        set((state) => {
          const layers = state.projectSpecificLayers.layers;
          if (!layers) {
            return state;
          }
          const newLayers = layers.map((layer) =>
            layer.name === layerName ? { ...layer, visible: value } : layer
          );
          return {
            projectSpecificLayers: {
              ...state.projectSpecificLayers,
              layers: newLayers,
            },
          };
        });
      },
      fetchProjectSpecificLayers: async () => {
        const projectData = useProjectOverlayStore.getState().projectData;
        if (!projectData) {
          set({
            projectSpecificLayers: {
              projectId: null,
              status: "success",
              layers: null,
            },
          });
          return;
        }
        if (projectData.id === get().projectSpecificLayers.projectId) {
          return;
        }
        set({
          projectSpecificLayers: {
            projectId: projectData.id,
            status: "loading",
            layers: null,
          },
        });
        const layers = await fetchProjectSpecificLayers(projectData.name);
        const enabledLayers = useRouteStore.getState()["enabled-layers"];
        const enabledLayersSet = new Set(enabledLayers);
        set({
          projectSpecificLayers: {
            projectId: projectData.id,
            status: "success",
            layers: (layers ?? []).map((layer) => ({
              ...layer,
              visible: enabledLayersSet.has(layer.name),
            })),
          },
        });
      },
      fetchCategorizedDynamicLayers: async () => {
        const layers = await fetchLayers();
        const enabledLayers = useRouteStore.getState()["enabled-layers"];
        const enabledLayersSet = new Set(enabledLayers);
        const dynamicLayers = layers.map((layer) => ({
          ...layer,
          visible: enabledLayersSet.has(layer.name),
        }));
        const categorizedDynamicLayers = groupBy(dynamicLayers, "category");
        set({ categorizedDynamicLayers });
      },
      setHistoricalSatelliteDate: (date) =>
        set((state) => ({
          historicalSatelliteState: {
            ...state.historicalSatelliteState,
            previousDate: state.historicalSatelliteState.currentDate,
            formattedPreviousDate:
              state.historicalSatelliteState.formattedCurrentDate,
            currentDate: date,
            formattedCurrentDate: date.format("YYYY-MM"),
          },
        })),
    };
  }
);

export default useLayersOverlayStore;
