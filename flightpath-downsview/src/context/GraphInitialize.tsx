import { useEffect } from 'react';
import type { Feature, LineString, Polygon, MultiPolygon } from 'geojson';
import { dijkstra, reconstructPath, buildGraph } from "./GraphContext";

type Coordinates = [number, number];

type Neighbour = {
  path: string;
  weight: number;
};

type Graph = Record<
  string,
  {
    id: string;
    neighbours: Neighbour[];
    coordinates: Coordinates[];
    heroImage?: string;
    description?: string;
  }>;

// Static files
const polygonFiles = [
  "BoakesGrove.geojson",
  "DogsviewPark.geojson",
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

//Getter function to run dijkstras
export const findPath = async (start: string, end: string) => {
  const polygons = await loadPolygons('/geojson', polygonFiles);
  const pathCollections = await loadPathCollections('/geojson/paths', pathFiles);

  const graph: Graph = buildGraph(polygons, pathCollections);
  const result = dijkstra(graph, start);
  const path = reconstructPath(result, end);
  const distance = result[end]?.distance ?? null;
  console.log(result)

  return { path, distance };
};

//Helper function to get ids of the polys 
export const getAllNodes = async (): Promise<string[]> => {
  const polygons = await loadPolygons('/geojson', polygonFiles);
  return polygons.map((f) => f.properties?.id).filter(Boolean);
};

const GraphTest = () => {
  useEffect(() => {
    const test = async () => {
      const polygons = await loadPolygons('/geojson', polygonFiles);
      const pathCollections = await loadPathCollections('/geojson/paths', pathFiles);

      const graph: Graph = buildGraph(polygons, pathCollections);
      console.log('Built Graph:', graph);

      const start = "Mound";
      const end = "Orchard";
      console.log(graph["MiniMound"].neighbours);

      const result = dijkstra(graph, start);
      const path = reconstructPath(result, end);

      console.log(`→ Shortest path from ${start} to ${end}:`, path);
      console.log(`→ Total distance:`, result[end]?.distance ?? "No path found");

      Object.entries(graph).forEach(([id, node]) => {
        console.log(`Node: ${id}`);
        node.neighbours.forEach(n => {
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
