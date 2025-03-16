import React, { useEffect, useRef } from "react";
import useMapStore from "../store";
import {
  addAllSourcesAndLayers,
  addProjectMarkerHandlers,
  setProjectMarkers,
  spinGlobe,
} from "../utils";
import useProjectOverlayStore from "../../ProjectOverlay/store";
import useAppTabsStore from "@/app/_components/Header/AppTabs/store";
import mapboxgl, { Map as MapInterface } from "mapbox-gl";

const useMapbox = (mapContainerRef: React.RefObject<HTMLDivElement | null>) => {
  const mapRef = useRef<MapInterface | null>(null);
  const setMapRef = useMapStore((state) => state.setMapRef);

  const setMapLoaded = useMapStore((state) => state.setMapLoaded);

  const setCurrentView = useMapStore((state) => state.setCurrentView);
  const setAppActiveTab = useAppTabsStore((actions) => actions.setActiveTab);
  const setActiveProjectId = useProjectOverlayStore(
    (actions) => actions.setProjectId
  );

  const handleProjectMarkerClick = (projectId: string) => {
    setCurrentView("project");
    setAppActiveTab("project");
    setActiveProjectId(projectId);
  };

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOXGL_ACCESSTOKEN;
    if (mapContainerRef.current === null) return;

    const map = new MapInterface({
      container: mapContainerRef.current,
      projection: "globe",
      style: "mapbox://styles/mapbox/satellite-v9",
      zoom: 2,
      center: [102, 9],
    });
    mapRef.current = map;
    setMapRef(mapRef);

    // Start the spin
    let shouldSpin = true;
    const startSpin = () => {
      shouldSpin = true;
      spinGlobe(map, shouldSpin);
    };
    const continueSpin = () => {
      spinGlobe(map, shouldSpin);
    };
    const stopSpin = () => {
      shouldSpin = false;
    };

    startSpin();

    // Spin again once the animation is complete
    map.on("moveend", continueSpin);
    // Stop spinning when the user clicks the map
    map.on("mousedown", stopSpin);
    // Stop spinning when the user touches the map
    map.on("touchstart", stopSpin);

    const onLoad = () => {
      map.setFog({
        color: "#000000",
        "high-color": "rgb(36, 92, 223)",
        "horizon-blend": 0.02,
        "space-color": "rgb(11, 11, 25)",
        "star-intensity": 0.05,
      });
      addAllSourcesAndLayers(map);
      setProjectMarkers(map).then(() => {
        addProjectMarkerHandlers(map, handleProjectMarkerClick);
      });
      setMapLoaded(true);
    };

    map.on("load", onLoad);

    return () => {
      map.off("load", onLoad);
      map.off("moveend", continueSpin);
      map.off("mousedown", stopSpin);
      map.off("touchstart", stopSpin);
    };
  }, []);
};

export default useMapbox;
