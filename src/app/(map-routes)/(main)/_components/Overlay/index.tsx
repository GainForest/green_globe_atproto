"use client";

import React, { useEffect } from "react";
import useOverlayStore from "./store";
import DesktopOverlay from "./DesktopOverlay";
import SmallerDeviceOverlay from "./SmallerDeviceOverlay";
import useMediaQuery from "@/hooks/useMediaQuery";

const Overlay = () => {
  const isMediumSizeOrGreater = useMediaQuery("(width >= 48rem)");
  const size = useOverlayStore((state) => state.size);
  const setSize = useOverlayStore((state) => state.setSize);

  useEffect(() => {
    if (isMediumSizeOrGreater) {
      setSize("desktop");
    } else {
      setSize("smaller");
    }
  }, [isMediumSizeOrGreater, setSize]);

  return size === "desktop" ? <DesktopOverlay /> : <SmallerDeviceOverlay />;
};

export default Overlay;
