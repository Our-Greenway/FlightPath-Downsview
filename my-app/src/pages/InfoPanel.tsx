import { useMapContext } from '../context/MapContext';
import ApproachingPanel from "../pages/ApproachingPanel"
import InsidePanel from "../pages/InsidePanel"

const InfoPanel = () => {
  const { isInside } = useMapContext();


  return (
  <div className="rounded-lg overflow-hidden shadow-lg bg-white flex flex-col min-h-[50vh] max-h-[100dvh]">
    <div className="flex-grow overflow-y-auto">
      {isInside === true && <InsidePanel />}
      {isInside === false && <ApproachingPanel />}
    </div>
  </div>
  );
};

export default InfoPanel;
