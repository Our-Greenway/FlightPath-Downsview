import { useMapContext } from '../context/MapContext';
import ApproachingPanel from "../pages/ApproachingPanel"
import InsidePanel from "../pages/InsidePanel"

const InfoPanel = () => {
  const { isInside } = useMapContext();


  return (
    <div className="rounded-lg overflow-hidden shadow-lg bg-white">
      {isInside === true && <InsidePanel />}
      {isInside === false && <ApproachingPanel />}
    </div>
  );
};

export default InfoPanel;
