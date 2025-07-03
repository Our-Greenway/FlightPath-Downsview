import { useEffect } from 'react';
import type { Feature, LineString, Polygon, MultiPolygon } from 'geojson';
import { buildGraph } from "../context/GraphContext";

type Coordinates = [number, number];

type Neighbour = {
  path: string;
  weight: number;
};

type Graph = Record<
  string,
  {
    id: string;
    neighbors: Neighbour[];
    coordinates: Coordinates[];
    heroImage?: string;
    description?: string;
  }
>;

// Static files
const polygonFiles = [
  "BoakesGrove.geojson",
  "DogsviewPark.geojson",
  "FestivalTerrance.geojson",
  "Hummingbird.geojson",
  "LakeLookout.geojson",
  "NorthFarm.geojson",
  "NorthHill.geojson",
  "Offices.geojson",
  "Orchard.geojson",
  "OtherPond.geojson",
  "Playground.geojson",
  "SesquicentennialMonument.geojson",
  "SouthHill.geojson",
  "SwanLake.geojson",
  "UrbanFarm.geojson",
  "KeeleWycombe.geojson",
  "KeeleDiana.geojson"
];

const pathFiles = [
    "boakesgrove_to_lakelookout.geojson",
    "dogsviewpark_to_otherpond.geojson",
    "dogsviewpark_to_southhill.geojson",
    "hummingbird_to_northhill.geojson",
    "keelediana_to_swanlake.geojson",
    "keelewycombe_to_keelediana.geojson",
    "lakelookout_to_keelediana.geojson",
    "lakelookout_to_keelewycombe.geojson",
    "lakelookout_to_sesquicentennialmonument.geojson",
    "northfarm_to_keelewycombe.geojson",
    "orchard_to_dogsviewpark.geojson",
    "orchard_to_lakelookout.geojson",
    "orchard_to_swanlake.geojson",
    "orchard_to_urbanfarm.geojson",
    "otherpond_to_northhill.geojson",
    "playground_to_sesquicentennialmonument.geojson",
    "sesquicentennialmonument_to_boakesgrove.geojson",
    "sesquicentennialmonument_to_hummingbird.geojson",
    "sesquicentennialmonument_to_keelediana.geojson",
    "sesquicentennialmonument_to_keelewycombe.geojson",
    "sheppardkeele_to_northfarm.geojson",
    "sheppardkeele_to_playground.geojson",
    "swanlake_to_keelewycombe.geojson",
    "swanlake_to_lakelookout.geojson",
    "swanlake_to_sesquicentennialmonument.geojson",
    "urbanfarm_to_otherpond.geojson",
    "urbanfarm_to_southhill.geojson"
  ];


// Load polygon features from /geojson/
const loadPolygons = async (basePath: string, files: string[]) => {
    const polygons: Feature<Polygon | MultiPolygon>[] = [];
  
    for (const file of files) {
      const url = `${basePath}/${file}`;
      try {
        const res = await fetch(url);
        const geojson = await res.json();
  
        if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
          polygons.push(...geojson.features);
        } else {
          console.warn(`Skipped (invalid FeatureCollection): ${file}`, geojson);
        }
      } catch (err) {
        console.error(`Failed to load polygon file: ${file}`, err);
      }
    }
  
    return polygons;
  };

// Load paths from /geojson/paths/
const loadPathCollections = async (
    basePath: string,
    files: string[]
  ): Promise<Record<string, Feature<LineString>[]>> => {
    const result: Record<string, Feature<LineString>[]> = {};
  
    for (const file of files) {
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
const GraphTest = () => {
  useEffect(() => {
    const test = async () => {
      const polygons = await loadPolygons('/geojson', polygonFiles);
      const pathCollections = await loadPathCollections('/geojson/paths', pathFiles);

      const graph: Graph = buildGraph(polygons, pathCollections);
      console.log('Built Graph:', graph);

      Object.entries(graph).forEach(([id, node]) => {
        console.log(`Node: ${id}`);
        node.neighbors.forEach(n => {
          const to = n.path.split('_to_')[1];
          console.log(`  → ${to} via ${n.path}, weight: ${n.weight}`);
        });
      });
    };

    test();
  }, []);

  return null;
};

export default GraphTest;
