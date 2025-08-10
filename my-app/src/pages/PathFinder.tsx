import { useState, useEffect, useCallback, useRef } from "react";
import { findPath, getAllNodes } from "../pages/GraphTest";
import { useMapContext } from "../context/MapContext";
import MenuBar from "../components/MenuBar";
import { useOrientation } from '../context/Orientation';

const PathFinder = () => {
  const [nodes, setNodes] = useState<string[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const processingRef = useRef(false);
  const lastProcessedRef = useRef<string>("");
  const orientation = useOrientation();
  
  const { 
    pathFinder, 
    setPathFinderResult, 
    clearPathFinder, 
    setPathFinderActive,
    allPolygons
  } = useMapContext();

  // check if data loaded
  useEffect(() => {
    if (allPolygons && allPolygons.length > 0) {
      setIsLoading(false);
    }
  }, [allPolygons]);

  useEffect(() => {
    if (!isLoading) {
      getAllNodes()
        .then(setNodes)
        .catch(error => {
          console.error("Error loading nodes:", error);
        });
    }
  }, [isLoading]);

  // avoids duplicate work via caching and to find paths
  const handleFindPath = useCallback(async (startNode: string, endNode: string) => {
    const pathKey = `${startNode}->${endNode}`;
    
    if (processingRef.current || lastProcessedRef.current === pathKey) {
      return;
    }
    
    processingRef.current = true;
    lastProcessedRef.current = pathKey;
    setIsProcessing(true);
    
    try {
      setPathFinderActive(true);
      const { path, distance } = await findPath(startNode, endNode);
      
      await setPathFinderResult({
        startNode,
        endNode,
        pathNodes: path,
        distance
      });
    } catch (error) {
      console.error("Error finding path:", error);
      clearPathFinder();
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  }, [setPathFinderActive, setPathFinderResult, clearPathFinder]);

  // rest vals
  const handleClearPath = useCallback(() => {
    setStart("");
    setEnd("");
    lastProcessedRef.current = "";
    clearPathFinder();
  }, [clearPathFinder]);

  const handleManualFindPath = useCallback(async () => {
    if (start && end && !isProcessing) {
      await handleFindPath(start, end);
    }
  }, [start, end, handleFindPath, isProcessing]);

  // only triggers if new (start, end) and if not curently handling
  useEffect(() => {
    if (!start || !end) {
      if (pathFinder.isActive) {
        lastProcessedRef.current = "";
        clearPathFinder();
      }
      return;
    }

    if (start && end && !isProcessing && !processingRef.current) {
      const pathKey = `${start}->${end}`;
      
      if (lastProcessedRef.current !== pathKey) {
        const timeoutId = setTimeout(() => {
          handleFindPath(start, end);
        }, 100);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [start, end, handleFindPath, isProcessing, pathFinder.isActive, clearPathFinder]);

  useEffect(() => {
    return () => {
      processingRef.current = false;
    };
  }, [start, end]);

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Path Finder</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-lg bg-white w-full overflow-hidden ${ orientation === 'landscape'  ? 'h-full'  : 'sticky bottom-0 max-h-[100dvh]'}`}
    style={{
      height: orientation === 'portrait' ? 'calc(50vh - env(safe-area-inset-bottom, 0px))' : '100%',
      paddingBottom: orientation === 'portrait' ? 'env(safe-area-inset-bottom, 0px)' : '0'
    }}>
    <div className="flex flex-col h-full">
      <div className={`${orientation === 'landscape' ? 'flex-grow' : 'h-full overflow-y-auto overflow-x-hidden'}`}>
        <div className="pt-4 pb-4 md:pt-8 md:pb-8 pl-4 bg-[#3A5F3A] w-full">
          <h1 className="text-xl font-bold text-white">Path Finder</h1>
        </div>
  
        <div className="p-4 bg-white">
          <div className="flex flex-wrap gap-4 mb-4 sm:flex-row">
            <select className="bg-white dark:bg-white border p-2 rounded min-w-[150px]" value={start} onChange={e => setStart(e.target.value)} disabled={isProcessing}>
              <option value="">Select start</option>
              {nodes.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
  
            <select className="bg-white dark:bg-white border p-2 rounded min-w-[150px]" value={end} onChange={e => setEnd(e.target.value)} disabled={isProcessing}>
              <option value="">Select end</option>
              {nodes.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
  
          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={handleManualFindPath} disabled={!start || !end || isProcessing} className="!bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isProcessing ? "Finding..." : "Find Path"}
            </button>
  
            <button onClick={handleClearPath} disabled={isProcessing} className="!bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
              Clear
            </button>
          </div>
  
          {isProcessing && (
            <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <p className="text-sm text-blue-700">Finding path from {start} to {end}...</p>
              </div>
            </div>
          )}
  
          {pathFinder.isActive && pathFinder.pathNodes.length > 0 && !isProcessing && (
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Route Found:</h3>
              <p className="text-sm text-gray-700 mb-2"><strong>Path:</strong> {pathFinder.pathNodes.join(" → ")}</p>
              <p className="text-sm text-gray-700 mb-2"><strong>Total distance:</strong> {pathFinder.distance != null ? `${(pathFinder.distance * 100000).toFixed(2)} m` : "N/A"}</p>
            </div>
          )}
        </div>
      </div>
  
      <div className={`${orientation === 'landscape' ? 'w-full border-t' : 'sticky bottom-0 w-full bg-white border-t'}`}>
        <MenuBar />
      </div>
    </div>
  </div>
  );
};

export default PathFinder;