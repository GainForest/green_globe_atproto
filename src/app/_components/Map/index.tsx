"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl, {
  GeoJSONSource,
  Map as MapInterface,
  MapMouseEvent,
} from "mapbox-gl";
import "./styles.css";

import "mapbox-gl/dist/mapbox-gl.css";
import {
  addAllSourcesAndLayers,
  setProjectMarkers,
  addProjectMarkerHandlers,
  spinGlobe,
} from "./utils";
import useProjectOverlayStore from "../ProjectOverlay/store";
import useAppTabsStore from "../Header/AppTabs/store";
import bbox from "@turf/bbox";
import { toggleMeasuredTreesLayer } from "./sources-and-layers/measured-trees";
import { useHoveredTreeInfo } from "./hooks/useHoveredTreeInfo";
import useMapStore from "./store";

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const activeProjectId = useProjectOverlayStore((state) => state.projectId);
  const setActiveProjectId = useProjectOverlayStore(
    (actions) => actions.setProjectId
  );

  const currentView = useMapStore((state) => state.currentView);
  const setCurrentView = useMapStore((actions) => actions.setCurrentView);
  const projectPolygon = useMapStore((state) => state.projectPolygon);

  const projectTrees = useMapStore((state) => state.projectTrees);
  const setAppActiveTab = useAppTabsStore((actions) => actions.setActiveTab);

  const handleProjectMarkerClick = (projectId: string) => {
    setCurrentView("project");
    setAppActiveTab("project");
    setActiveProjectId(projectId);
  };

  const mapRef = useRef<MapInterface | null>(null);

  // Use our custom hook for hovered tree functionality
  const { handleMouseMoveUnclusteredTrees, cleanup: cleanupHoveredTreeInfo } =
    useHoveredTreeInfo();

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoic2FkYW1hbnQiLCJhIjoiY2tuenNwdnJtMDh5MTJ3b2JlZzZ3dTFxYiJ9.NnGoRZHBZTWBxNTVKc8gOQ";
    if (mapContainerRef.current === null) return;

    const map = new MapInterface({
      container: mapContainerRef.current,
      projection: "globe",
      style: "mapbox://styles/mapbox/satellite-v9",
      zoom: 2,
      center: [102, 9],
    });
    mapRef.current = map;

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
    };

    map.on("load", onLoad);

    return () => {
      map.off("load", onLoad);
      map.off("moveend", continueSpin);
      map.off("mousedown", stopSpin);
      map.off("touchstart", stopSpin);
    };
  }, []);

  // When the active project polygon changes, fit the map to the polygon and update the highlighted site source
  useEffect(() => {
    if (currentView !== "project") return;
    const map = mapRef.current as MapInterface | null;
    if (!map || !projectPolygon) return;

    // Calculate the bounding box and ensure it's 2D
    const boundingBox = bbox(projectPolygon).slice(0, 4) as [
      number,
      number,
      number,
      number
    ];
    map.fitBounds(boundingBox, {
      padding: { top: 40, bottom: 40, left: 40, right: 40 },
    });
    (map.getSource("highlightedSite") as GeoJSONSource | undefined)?.setData(
      projectPolygon
    );
  }, [currentView, projectPolygon]);

  useEffect(() => {
    if (currentView !== "project") return;
    const map = mapRef.current as MapInterface | null;
    if (!map || !projectTrees) return;

    // TODO: Ask Sharfy a question about this
    // if (activeProjectTreesPlanted !== normalizedData) {
    //   map.getSource('trees')?.setData(normalizedData)
    // }

    (map.getSource("trees") as GeoJSONSource | undefined)?.setData(
      projectTrees
    );
  }, [currentView, projectTrees]);

  // Set hovered tree ID on mouse move
  useEffect(() => {
    if (currentView !== "project" || !activeProjectId) return;
    const map = mapRef.current as MapInterface | null;
    if (!map) return;

    const onClickProjectFill = () => {
      toggleMeasuredTreesLayer(map, "visible");
    };

    const onMouseMoveUnclusteredTrees = (e: MapMouseEvent) => {
      handleMouseMoveUnclusteredTrees(e, map, activeProjectId);
    };

    map.on("click", "projectFill", onClickProjectFill);
    map.on("mousemove", "unclusteredTrees", onMouseMoveUnclusteredTrees);

    return () => {
      if (map) {
        map.off("click", "projectFill", onClickProjectFill);
        map.off("mousemove", "unclusteredTrees", onMouseMoveUnclusteredTrees);
      }
      // Clean up the hovered tree info
      cleanupHoveredTreeInfo();
    };
  }, [
    currentView,
    activeProjectId,
    handleMouseMoveUnclusteredTrees,
    cleanupHoveredTreeInfo,
  ]);

  return (
    <div
      style={{ height: "100%" }}
      ref={mapContainerRef}
      className="map-container flex-1"
    ></div>
  );
};

export default Map;
