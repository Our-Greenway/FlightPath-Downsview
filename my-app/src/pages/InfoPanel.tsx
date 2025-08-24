import { useMapContext } from '../context/MapContext';
import ApproachingPanel from "../pages/ApproachingPanel"
import InsidePanel from "../pages/InsidePanel"
import { useOrientation } from '../context/Orientation';

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-full bg-white">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
      <p className="text-gray-600 text-lg">Loading location data...</p>
    </div>
  </div>
);

const InfoPanel = () => {
  const { isInside, isLoading } = useMapContext();
  const orientation = useOrientation();

  return (
    <div className={`${orientation === 'landscape' ? 'h-[100dvh]' : 'sticky bottom-0 h-[50vh]'} max-h-[100dvh] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col w-full`}>
      <div className={`${orientation === 'landscape' ? 'flex-grow' : 'h-full'} overflow-y-auto`}>
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <>
            {isInside === true && <InsidePanel />}
            {isInside === false && <ApproachingPanel />}
          </>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;