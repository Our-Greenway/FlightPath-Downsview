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

  // Create all nodes from polygon features only
  const validNodeIds = new Set<string>();
  for (const feature of polygons) {
    const props = feature.properties || {};
    const id = props.id;

    if (!id) continue;
    
    validNodeIds.add(id);

    const heroImage = props.heroImage;
    const description = props.description || "";

    const rawCoords =
      feature.geometry.type === "Polygon"
        ? feature.geometry.coordinates[0]
        : feature.geometry.coordinates[0][0];

    const coordinates: Coordinates[] = rawCoords.map(
      (pos: number[]): Coordinates => [pos[0], pos[1]]
    );

    graph[id] = {
      id,
      neighbours: [],
      coordinates,
      heroImage,
      description,
    };
  }

  //  Add neighbors only if both nodes exist as valid polygons
  for (const feature of polygons) {
    const props = feature.properties || {};
    const id = props.id;
    const neighboursList = props.neighbours;

    if (!id || !Array.isArray(neighboursList)) continue;

    for (const pathName of neighboursList) {
      const [from, to] = pathName.split("_to_");
      
      if (!validNodeIds.has(from) || !validNodeIds.has(to)) {
        console.warn(`Skipping path ${pathName}: one or both nodes don't exist as polygons`);
        continue;
      }

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

      // Forward edge with dedup guard
      if (!graph[id].neighbours.some(n => n.path === pathName)) {
        graph[id].neighbours.push({ path: pathName, weight });
      }

      // Reverse edge with dedup guard (only if 'to' node exists)
      const reversePath = `${to}_to_${from}`;
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

  // Set distances of all nodes to infinity and start to 0
  for (const nodeId in graph) {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
  }
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
    console.log(`Processing node: ${currentId}, neighbors:`, currentNode.neighbours.map(n => n.path));

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