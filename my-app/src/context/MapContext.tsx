import { createContext, useState, useContext } from 'react';
import type { Feature, Polygon, MultiPolygon } from 'geojson';

type Coordinates = [number, number];

interface MapContextType {
  userPoint: Coordinates | null;
  nearestPolygon: Feature<Polygon | MultiPolygon> | null;
  setUserPoint: (pt: Coordinates) => void;
  setNearestPolygon: (f: Feature<Polygon | MultiPolygon>) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [userPoint, setUserPoint] = useState<Coordinates | null>(null);
  const [nearestPolygon, setNearestPolygon] = useState<Feature<Polygon | MultiPolygon> | null>(null);

  return (
    <MapContext.Provider value={{ userPoint, nearestPolygon, setUserPoint, setNearestPolygon }}>
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
