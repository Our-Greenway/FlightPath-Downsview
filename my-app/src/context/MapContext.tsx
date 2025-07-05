import { createContext, useState, useContext, useEffect } from 'react';
import type { Feature, Polygon, MultiPolygon, LineString, MultiLineString } from 'geojson';
import * as turf from '@turf/turf';

type Coordinates = [number, number];

interface MapContextType {
  userPoint: Coordinates | null;
  nearestPolygon: Feature<Polygon | MultiPolygon> | null;
  distance: number | null;
  isInside: boolean | null;
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
  const [isInside, setIsInside] = useState<boolean | null>(null);
  const [currentPolygonData, setCurrentPolygonData] = useState<{
    id: string;
    heroImage: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPoint([longitude, latitude]);
      },
      (error) => {
        console.error("Error getting user location:", error);
      }
    );
  }, []);

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

      let isInside = false;
      if (nearestPolygon && turf.getType(nearestPolygon) === "Polygon" || turf.getType(nearestPolygon) === "MultiPolygon") {
        isInside = turf.booleanPointInPolygon(pt, nearestPolygon);
      }

      const distance = turf.distance(pt, snapped, { units: "kilometers" });

      setDistance(distance);
      setIsInside(isInside);
      console.log("Inside status:", isInside);
  
      console.log("Snapped Point:", snapped);
      console.log("Distance:", distance);
      const props = nearestPolygon.properties;
      console.log(props?.id);
      console.log(props?.heroImage);
      setCurrentPolygonData({
        id: props?.id,
        heroImage: props?.heroImage,
        description: props?.description,
      });
    }
  }, [userPoint, nearestPolygon]);
  return (
    <MapContext.Provider
      value={{
        userPoint,
        nearestPolygon,
        currentPolygonData,
        distance,
        isInside,
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
