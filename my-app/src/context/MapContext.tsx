import { createContext, useState, useContext, useEffect } from 'react';
import type { Feature, Polygon, MultiPolygon, LineString, MultiLineString } from 'geojson';
import * as turf from '@turf/turf';

type Coordinates = [number, number];

interface MapContextType {
  userPoint: Coordinates | null;
  nearestPolygon: Feature<Polygon | MultiPolygon> | null;
  distance: number | null;
  currentPolygonData: {
    id: string;
    heroImage: string;
    description: string;
  } | null;
  setUserPoint: (pt: Coordinates) => void;
  setNearestPolygon: (f: Feature<Polygon | MultiPolygon>) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [userPoint, setUserPoint] = useState<Coordinates | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [nearestPolygon, setNearestPolygon] = useState<Feature<Polygon | MultiPolygon> | null>(null);
  const [currentPolygonData, setCurrentPolygonData] = useState<{
    id: string;
    heroImage: string;
    description: string;
  } | null>(null);

  let distanceLine: Feature<LineString | MultiLineString> | null = null;
  useEffect(() => {
    if (!userPoint || !nearestPolygon) return;
  
    let distanceLine: Feature<LineString | MultiLineString> | null = null;
    const lineResult = turf.polygonToLine(nearestPolygon);
  
    if (lineResult.type === "FeatureCollection") {
      const firstFeature = lineResult.features[0];
      if (firstFeature.geometry.type === "LineString" || firstFeature.geometry.type === "MultiLineString") {
        distanceLine = firstFeature;
      }
    } else if (
      lineResult.type === "Feature" &&
      (lineResult.geometry.type === "LineString" || lineResult.geometry.type === "MultiLineString")
    ) {
      distanceLine = lineResult;
    }
  
    if (distanceLine) {
      const pt = turf.point(userPoint);
      const snapped = turf.nearestPointOnLine(distanceLine, pt);
      const isInside = turf.booleanPointInPolygon(pt, nearestPolygon);
      const distance = turf.distance(pt, snapped, { units: "kilometers" });

      setDistance(distance);
  
      console.log("Snapped Point:", snapped);
      console.log("Distance:", distance);
  
      if (isInside) {
        const props = nearestPolygon.properties;
        console.log(props?.id);
        console.log(props?.heroImage);
        setCurrentPolygonData({
          id: props?.id,
          heroImage: props?.heroImage,
          description: props?.description,
        });
      } else {
        setCurrentPolygonData(null);
      }
    }
  }, [userPoint, nearestPolygon]);
  return (
    <MapContext.Provider
      value={{
        userPoint,
        nearestPolygon,
        currentPolygonData,
        distance,
        setUserPoint,
        setNearestPolygon,
      }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within a MapProvider");
  }
  return context;
};
