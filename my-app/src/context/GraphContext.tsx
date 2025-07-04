import type { Feature, Polygon, MultiLineString, MultiPolygon, LineString } from 'geojson';

type PolygonFeature = Feature<Polygon | MultiPolygon>;
type Coordinates = [number, number];

type PathMap = Record<string, number>;
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


  export function buildGraph(
    polygons: PolygonFeature[],
    pathCollections: Record<string, Feature<LineString | MultiLineString>[]>
  ): Graph {
    const graph: Graph = {};
  
    // Build a map of path lengths from GeoJSON features
    const pathLengths: PathMap = {};
    for (const [pathName, features] of Object.entries(pathCollections)) {
      const totalLength = features.reduce((sum, feat) => {
        const len = feat.properties?.length;
        return typeof len === "number" ? sum + len : sum;
      }, 0);
      pathLengths[pathName] = totalLength;
    }
  
    // Loop through all polygon nodes and build the graph
    for (const feature of polygons) {
      const props = feature.properties || {};
      const id = props.id;
      const neighboursList = props.neighbours;
  
      if (!id || !Array.isArray(neighboursList)) continue;
  
      const heroImage = props.heroImage;
      const description = props.description || "";
  
      const rawCoords =
        feature.geometry.type === "Polygon"
          ? feature.geometry.coordinates[0]
          : feature.geometry.coordinates[0][0];
  
      const coordinates: Coordinates[] = rawCoords.map(
        (pos: number[]): Coordinates => [pos[0], pos[1]]
      );
  
      const neighbors: Neighbour[] = neighboursList.map((pathName: string) => ({
        path: pathName,
        // Some files may be styled as a_to_b, B_to_A, so this tries to format it accordinly
        weight:
            pathLengths[pathName] ??
            pathLengths[pathName.toLowerCase()] ??
            pathLengths[
                Object.keys(pathLengths).find(key =>
                    key.toLowerCase() === pathName.toLowerCase() ||
                    key.toLowerCase() === pathName
                        .toLowerCase()
                        .split('_to_')
                        .reverse()
                        .join('_to_')
                ) || ""
            ] ?? Infinity,
      }));
  
      graph[id] = {
        id,
        neighbors,
        coordinates,
        heroImage,
        description,
      };
    }
  
    return graph;
  }