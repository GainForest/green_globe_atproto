"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl, { GeoJSONSource, Map } from "mapbox-gl";
import "./styles.css";

import "mapbox-gl/dist/mapbox-gl.css";
import {
  addAllSourcesAndLayers,
  setProjectMarkers,
  addProjectMarkerHandlers,
  spinGlobe,
} from "./utils";
import { useProjectStore } from "../../stores/project";
import useAppViewsStore from "../../stores/app-views";
import bbox from "@turf/bbox";

const Mapbox = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const activeProjectPolygon = useProjectStore(
    (state) => state.activeProjectPolygon
  );
  const setActiveProjectId = useProjectStore(
    (actions) => actions.setActiveProjectId
  );

  const mapView = useAppViewsStore((state) => state.mapView);
  const setMapView = useAppViewsStore((actions) => actions.setMapView);
  const projectOverlayTab = useAppViewsStore(
    (state) => state.projectOverlayTab
  );
  const setProjectOverlayTab = useAppViewsStore(
    (actions) => actions.setProjectOverlayTab
  );

  const handleProjectMarkerClick = (projectId: string) => {
    setMapView("project");
    setActiveProjectId(projectId);
    if (!projectOverlayTab) setProjectOverlayTab("info");
  };

  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoic2FkYW1hbnQiLCJhIjoiY2tuenNwdnJtMDh5MTJ3b2JlZzZ3dTFxYiJ9.NnGoRZHBZTWBxNTVKc8gOQ";
    if (mapContainerRef.current === null) return;

    const map = new mapboxgl.Map({
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
      setProjectMarkers(map);
      addProjectMarkerHandlers(map, handleProjectMarkerClick);
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
    if (mapView !== "project") return;
    const map = mapRef.current as Map | null;
    if (!map || !activeProjectPolygon) return;

    // Calculate the bounding box and ensure it's 2D
    const boundingBox = bbox(activeProjectPolygon).slice(0, 4) as [
      number,
      number,
      number,
      number
    ];
    map.fitBounds(boundingBox, {
      padding: { top: 40, bottom: 40, left: 40, right: 40 },
    });
    (map.getSource("highlightedSite") as GeoJSONSource)?.setData(
      activeProjectPolygon
    );
  }, [mapView, activeProjectPolygon]);

  return (
    <div
      style={{ height: "100%" }}
      ref={mapContainerRef}
      className="map-container flex-1"
    ></div>
  );
};

export default Mapbox;
