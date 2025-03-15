import dayjs from "dayjs";
import { Map } from "mapbox-gl";

export const generatePlanetSource = (planetDate: string) => ({
  type: "raster" as const,
  tiles: [
    `https://tiles3.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_${planetDate}_mosaic/gmap/{z}/{x}/{y}.png?api_key=${process.env.NEXT_PUBLIC_NICFI_API_KEY}`,
  ],
  tileSize: 256,
  attribution: `<a target="_top" rel="noopener" href="https://gainforest.earth">Mosaic Date: ${planetDate}</a> | <a target="_top" rel="noopener" href="https://www.planet.com/nicfi/">Imagery ©2023 Planet Labs Inc</a> | <a target="_top" rel="noopener" href="https://gainforest.earth">©2023 GainForest</a>`,
});

export const generatePlanetLayer = (
  planetDate: string,
  visibility: "none" | "visible"
) => ({
  id: `planetLayer${planetDate}`,
  type: "raster" as const,
  source: `planetTile${planetDate}`,
  layout: {
    visibility: visibility,
  },
});

const getPlanetDates = (minDate: dayjs.Dayjs, maxDate: dayjs.Dayjs) => {
  const res = [];
  let monthsBetween = maxDate.diff(minDate, "month");
  while (monthsBetween >= 0) {
    res.push(minDate.format("YYYY-MM"));
    minDate = minDate.add(1, "month");
    monthsBetween--;
  }
  return res;
};

export const addHistoricalSatelliteSourceAndLayers = (map: Map) => {
  const minDate = dayjs("2020-09-01");
  const maxDate = dayjs().subtract(6, "week").set("date", 1);

  const planetDates = getPlanetDates(minDate, maxDate);
  planetDates.forEach((planetDate) => {
    if (map.getSource(`planetTile${planetDate}`)) return;
    const source = generatePlanetSource(planetDate);
    map.addSource(`planetTile${planetDate}`, source);
  });

  planetDates.forEach((planetDate) => {
    const visibility = "none";
    if (map.getLayer(`planetLayer${planetDate}`)) return;
    const newPlanetLayer = generatePlanetLayer(planetDate, visibility);
    map.addLayer(newPlanetLayer);
  });
};
