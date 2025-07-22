// pages/PathFinder.tsx
import { useState, useEffect } from "react";
import { findPath, getAllNodes } from "../pages/GraphTest";

const PathFinder = () => {
  const [nodes, setNodes] = useState<string[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [path, setPath] = useState<string[]>([]);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    getAllNodes().then(setNodes);
  }, []);

  const handleFindPath = async () => {
    if (start && end) {
      const { path, distance } = await findPath(start, end);
      setPath(path);
      setDistance(distance);
    }
  };
  useEffect(() => {
    if (start && end) {
      handleFindPath();
    }
  }, [start, end]);

  return (
    <div >
      <h2>Path Finder</h2>

      <div className="flex gap-4 mb-4">
        <select className="border p-2" value={start} onChange={e => setStart(e.target.value)}>
          <option value="">Select start</option>
          {nodes.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <select className="border p-2" value={end} onChange={e => setEnd(e.target.value)}>
          <option value="">Select end</option>
          {nodes.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

      </div>

      {path.length > 0 && (
        <div>
          <p>Shortest path: {path.join(" → ")}</p>
          <p><strong>Total distance:</strong> {distance != null ? (distance * 1000).toFixed(2) : "N/A"} m</p>
        </div>
      )}
    </div>
  );
};

export default PathFinder;
