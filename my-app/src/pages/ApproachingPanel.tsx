import { useMapContext } from '../context/MapContext';
import MenuBar from '../components/MenuBar';
import { useOrientation } from '../context/Orientation';

const ApproachingPanel = () => {
  const { nearestPolygon, distance } = useMapContext();
  const orientation = useOrientation();

  const props = nearestPolygon?.properties;
  const heroImage = props?.heroImage;
  const locationName = props?.id || 'Unknown Location';
  const dist = typeof distance === 'number' ? Math.round(distance * 1000) : null;


  return (
<div className="flex flex-grow h-[50dvh]">
  <div className={`rounded-lg shadow-lg bg-white flex flex-col w-full ${orientation === 'landscape' ? '' : 'h-[50vh] sticky bottom-0 overflow-hidden max-h-[100dvh]'}`} style={{ height: orientation === 'landscape' ? '100dvh' : 'auto' }}>
    <div className={`${orientation === 'landscape' ? '' : 'overflow-y-auto flex-grow'} flex flex-grow w-full bg-gray-200 min-h-0`}>
      <div className="w-[12%] bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}></div>
      <div className="flex-grow relative">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-green-800" />
        <div className="relative z-10 flex flex-col justify-between text-white h-full">
          <div className="flex flex-grow pt-3 pb-3 items-center pl-10 break-words">
            <div>
              <p className="text-3xl font-medium">Approaching:</p>
              <h1 className="text-4xl font-bold">{locationName}</h1>
            </div>
          </div>
          {dist !== null && (
            <div className="w-full bg-black py-3 md:py-10">
              <div className="text-white text-3xl pb-4 md:pb-10 pl-10 font-bold">In {dist}m</div>
            </div>
          )}
        </div>
      </div>
    </div>
    <div className="w-full">
      <MenuBar />
    </div>
  </div>
</div>



  );
};

export default ApproachingPanel;
