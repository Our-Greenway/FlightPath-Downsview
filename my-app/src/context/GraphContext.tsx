import type { Feature, Polygon, MultiLineString, MultiPolygon, LineString } from 'geojson';

type PolygonFeature = Feature<Polygon | MultiPolygon>;
type Coordinates = [number, number];

type PathMap = Record<string, number>;
type Neighbour = {
    path: string;
    weight: number;
  };
type DijkstraResult = {
  distance: number;
  previous: string | null;
};
  
type Graph = Record<
  string,
  {
    id: string;
    neighbours: Neighbour[];
    coordinates: Coordinates[];
    heroImage?: string;
    description?: string;
  }
>;

// Function to build a undirected graph given nodes, neighbour paths. Assume neighbour paths of X_to_Y or Y_to_X, where X, Y = id of node
export function buildGraph(polygons: PolygonFeature[], pathCollections: Record<string, Feature<LineString | MultiLineString>[]>): Graph {
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

    // Ensure node exists in graph
    if (!graph[id]) {
      graph[id] = {
        id,
        neighbours: [],
        coordinates,
        heroImage,
        description,
      };
    }

    // Add neighbours + reverse links
    for (const pathName of neighboursList) {
      const weight =
        pathLengths[pathName] ??
        pathLengths[pathName.toLowerCase()] ??
        pathLengths[
          Object.keys(pathLengths).find(
            key =>
              key.toLowerCase() === pathName.toLowerCase() ||
              key.toLowerCase() === pathName
                .toLowerCase()
                .split("_to_")
                .reverse()
                .join("_to_")
          ) || ""
        ] ?? Infinity;

      const [from, to] = pathName.split("_to_");

      // Forward edge with dedup guard
      if (!graph[id].neighbours.some(n => n.path === pathName)) {
        graph[id].neighbours.push({ path: pathName, weight });
      }

      // Reverse edge (ensure 'to' exists)
      if (!graph[to]) {
        graph[to] = {
          id: to,
          neighbours: [],
          coordinates: [], // unknown, unless you want to populate later
        };
      }

      const reversePath = `${to}_to_${from}`;

      //Reverse edge with dedup guard
      if (!graph[to].neighbours.some(n => n.path === reversePath)) {
        graph[to].neighbours.push({ path: reversePath, weight });
      }
    }
  }

  return graph;
}

export function dijkstra(graph: Graph, startId: string): Record<string, DijkstraResult> {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited: Set<string> = new Set();

  // Set distances of all nodes to infinity 
  for (const nodeId in graph) {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
  }
  // Set start id to 0
  distances[startId] = 0;

  const queue: [string, number][] = [[startId, 0]];

  while (queue.length > 0) {
    // Sort queue by distance, pop the smallest
    queue.sort((a, b) => a[1] - b[1]);

    // Takes first item of queue (not undefined)
    const [currentId] = queue.shift()!;

    // Set as visited 
    if (visited.has(currentId)) {
      continue;
    } else {
      visited.add(currentId);
    }

    const currentNode = graph[currentId];

    // Check if X, Y node id exists
    if (!currentNode){
      continue
    }

    for (const neighbor of currentNode.neighbours) {
      const neighboursID = neighbor.path.split('_to_')[1];
      const alt = distances[currentId] + neighbor.weight;

      // Compare paths and checks for shortests
      if (alt < distances[neighboursID]) {
        distances[neighboursID] = alt;
        previous[neighboursID] = currentId;
        queue.push([neighboursID, alt]);
      }
    }
  }

  // Returns result
  const result: Record<string, DijkstraResult> = {};
  for (const nodeId in distances) {
    result[nodeId] = {
      distance: distances[nodeId],
      previous: previous[nodeId],
    };
  }

  return result;
}

export function reconstructPath(result: Record<string, DijkstraResult>,endId: string): string[] {
  const path: string[] = [];
  let current: string | null = endId;

  while (current) {
    path.unshift(current);
    current = result[current].previous;
  }

  return path;
}