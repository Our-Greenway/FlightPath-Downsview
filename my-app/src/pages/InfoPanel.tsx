import { useMapContext } from '../context/MapContext';
import ApproachingPanel from "../pages/ApproachingPanel"
import InsidePanel from "../pages/InsidePanel"
import { useOrientation } from '../context/Orientation';

const InfoPanel = () => {
  const { isInside } = useMapContext();
  const orientation = useOrientation();


  return (
<div className={`${orientation === 'landscape' ? 'h-[100dvh]' : 'sticky bottom-0 h-[50vh]'} max-h-[100dvh] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col w-full`}>
  <div className={`${orientation === 'landscape' ? 'flex-grow' : 'h-full'} overflow-y-auto`}>
    {isInside === true && <InsidePanel />}
    {isInside === false && <ApproachingPanel />}
  </div>
</div>

  );
};

export default InfoPanel;
