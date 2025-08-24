import { createContext, useState, useContext, useEffect } from 'react';
import type { Feature, Polygon, MultiPolygon, LineString, MultiLineString } from 'geojson';
import * as turf from '@turf/turf';

type Coordinates = [number, number];

interface PathFinderState {
  isActive: boolean;
  startNode: string | null;
  endNode: string | null;
  pathNodes: string[];
  pathGeometries: Feature<LineString>[];
  distance: number | null;
}

interface MapContextType {
  userPoint: Coordinates | null;
  nearestPolygon: Feature<Polygon | MultiPolygon> | null;
  distance: number | null;
  isInside: boolean | null;
  isLoading: boolean;
  currentPolygonData: {
    id: string;
    heroImage: string;
    description: string;
  } | null;

  // PathFinder state
  pathFinder: PathFinderState;
  savedPathFinder: PathFinderState | null;
  allPolygons: Feature<Polygon | MultiPolygon>[];
  allPaths: Record<string, Feature<LineString>[]>;
  
  setUserPoint: (pt: Coordinates) => void;
  setNearestPolygon: (f: Feature<Polygon | MultiPolygon>) => void;
  setIsLoading: (loading: boolean) => void; 
  setPathFinderActive: (active: boolean) => void;
  setPathFinderResult: (result: {
    startNode: string;
    endNode: string;
    pathNodes: string[];
    distance: number | null;
  }) => void;
  clearPathFinder: () => void;
  savePathFinder: () => void;
  restorePathFinder: () => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

// Helper functions to load geojson data
const loadPolygons = async (basePath: string, files: string[]) => {
  
  const polygons: Feature<Polygon | MultiPolygon>[] = [];

  for (const file of files) {
    const url = `${basePath}/${file}`;
    try {
      const res = await fetch(url);
      const geojson = await res.json();

      if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
        polygons.push(...geojson.features);
      }
    } catch (err) {
      console.error(`Failed to load polygon file: ${file}`, err);
    }
  }

  return polygons;
};

const loadPathCollections = async (
  basePath: string,
  files: string[]
): Promise<Record<string, Feature<LineString>[]>> => {
  const result: Record<string, Feature<LineString>[]> = {};

  for (const file of files) {
    if (file === 'pathFiles.txt') continue; // Skip the txt file
    
    const url = `${basePath}/${file}`;
    try {
      const res = await fetch(url);
      const geojson = await res.json();

      if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
        result[file.replace('.geojson', '')] = geojson.features;
      }
    } catch (err) {
      console.error(`Failed to load path file: ${file}`, err);
    }
  }

  return result;
};

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [userPoint, setUserPoint] = useState<Coordinates | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [nearestPolygon, setNearestPolygon] = useState<Feature<Polygon | MultiPolygon> | null>(null);
  const [isInside, setIsInside] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // NEW: Loading state (starts as true)
  const [currentPolygonData, setCurrentPolygonData] = useState<{
    id: string;
    heroImage: string;
    description: string;
  } | null>(null);

  // PathFinder state
  const [pathFinder, setPathFinder] = useState<PathFinderState>({
    isActive: false,
    startNode: null,
    endNode: null,
    pathNodes: [],
    pathGeometries: [],
    distance: null,
  });

  const [savedPathFinder, setSavedPathFinder] = useState<PathFinderState | null>(null);

  const [allPolygons, setAllPolygons] = useState<Feature<Polygon | MultiPolygon>[]>([]);
  const [allPaths, setAllPaths] = useState<Record<string, Feature<LineString>[]>>({});

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); 
      
      const polygonFiles = [
        "BoakesGrove.geojson",
        "DogsviewPark.geojson",
        "FestivalTerrance.geojson",
        "Hummingbird.geojson",
        "KeeleDiana.geojson",
        "KeeleWycombe.geojson",
        "LakeLookout.geojson",
        "LowerPond.geojson",
        "MiniMound.geojson",
        "Mound.geojson",
        "NorthFarm.geojson",
        "NorthPlaza.geojson",
        "Orchard.geojson",
        "Playground.geojson",
        "SesquicentennialMonument.geojson",
        "SwanLake.geojson",
        "UrbanFarm.geojson"
      ];

      const pathFiles = [
        "boakesgrove_to_lakelookout.geojson",
        "dogsviewpark_to_lowerpond.geojson",
        "dogsviewpark_to_minimound.geojson",
        "hummingbird_to_mound.geojson",
        "keelediana_to_swanlake.geojson",
        "keelewycombe_to_keelediana.geojson",
        "lakelookout_to_keelediana.geojson",
        "lakelookout_to_keelewycombe.geojson",
        "lakelookout_to_sesquicentennialmonument.geojson",
        "lowerpond_to_minimound.geojson",
        "lowerpond_to_mound.geojson",
        "northfarm_to_keelewycombe.geojson",
        "northplaza_to_northfarm.geojson",
        "northplaza_to_playground.geojson",
        "orchard_to_dogsviewpark.geojson",
        "orchard_to_lakelookout.geojson",
        "orchard_to_swanlake.geojson",
        "orchard_to_urbanfarm.geojson",
        "playground_to_sesquicentennialmonument.geojson",
        "sesquicentennialmonument_to_boakesgrove.geojson",
        "sesquicentennialmonument_to_hummingbird.geojson",
        "sesquicentennialmonument_to_keelediana.geojson",
        "sesquicentennialmonument_to_keelewycombe.geojson",
        "swanlake_to_keelewycombe.geojson",
        "swanlake_to_lakelookout.geojson",
        "swanlake_to_sesquicentennialmonument.geojson",
        "urbanfarm_to_lowerpond.geojson",
        "urbanfarm_to_minimound.geojson"
      ];

      try {
        const [polygons, paths] = await Promise.all([
          loadPolygons('/geojson', polygonFiles),
          loadPathCollections('/geojson/paths', pathFiles)
        ]);

        setAllPolygons(polygons);
        setAllPaths(paths);
      } catch (error) {
        console.error('Error loading map data:', error);
      } finally {
        setIsLoading(false); 
      }
    };

    loadData();
  }, []);

  // user location
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPoint([longitude, latitude]);
      },
      (error) => {
        console.error("Error getting user location:", error);
        setIsLoading(false); 
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // calculates distance -> nearest poly
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
      if (nearestPolygon && (turf.getType(nearestPolygon) === "Polygon" || turf.getType(nearestPolygon) === "MultiPolygon")) {
        isInside = turf.booleanPointInPolygon(pt, nearestPolygon);
      }

      const distance = turf.distance(pt, snapped, { units: "kilometers" });

      setDistance(distance);
      setIsInside(isInside);

      const props = nearestPolygon.properties;
      setCurrentPolygonData({
        id: props?.id,
        heroImage: props?.heroImage,
        description: props?.description,
      });
    }
  }, [userPoint, nearestPolygon]);

  // loading state based on data availability
  useEffect(() => {
    if (allPolygons.length > 0) {
      if (!userPoint) {
        const timeoutId = setTimeout(() => {
          setIsLoading(false);
        }, 5000); 

        return () => clearTimeout(timeoutId);
      } else {
        setIsLoading(false);
      }
    }
  }, [allPolygons.length, userPoint]);

  const setPathFinderActive = (active: boolean) => {
    setPathFinder(prev => ({ ...prev, isActive: active }));
  };

  const setPathFinderResult = async (result: {
    startNode: string;
    endNode: string;
    pathNodes: string[];
    distance: number | null;
  }) => {
    const pathGeometries: Feature<LineString>[] = [];
    
    for (let i = 0; i < result.pathNodes.length - 1; i++) {
      const from = result.pathNodes[i].toLowerCase();
      const to = result.pathNodes[i + 1].toLowerCase();
      
      const pathKey1 = `${from}_to_${to}`;
      const pathKey2 = `${to}_to_${from}`;
      
      const pathFeatures = allPaths[pathKey1] || allPaths[pathKey2];
      if (pathFeatures && pathFeatures.length > 0) {
        pathGeometries.push(...pathFeatures);
      }
    }

    const newPathFinderState = {
      isActive: true,
      startNode: result.startNode,
      endNode: result.endNode,
      pathNodes: result.pathNodes,
      pathGeometries,
      distance: result.distance,
    };

    setPathFinder(newPathFinderState);
    setSavedPathFinder(newPathFinderState);
  };

  const clearPathFinder = () => {
    setPathFinder({
      isActive: false,
      startNode: null,
      endNode: null,
      pathNodes: [],
      pathGeometries: [],
      distance: null,
    });
    setSavedPathFinder(null);
  };

  const savePathFinder = () => {
    if (pathFinder.isActive) {
      setSavedPathFinder(pathFinder);
    }
  };

  const restorePathFinder = () => {
    if (savedPathFinder) {
      setPathFinder(savedPathFinder);
    }
  };

  return (
    <MapContext.Provider
      value={{
        userPoint,
        nearestPolygon,
        currentPolygonData,
        distance,
        isInside,
        isLoading,
        pathFinder,
        savedPathFinder,
        allPolygons,
        allPaths,
        setUserPoint,
        setNearestPolygon,
        setIsLoading, 
        setPathFinderActive,
        setPathFinderResult,
        clearPathFinder,
        savePathFinder,
        restorePathFinder,
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