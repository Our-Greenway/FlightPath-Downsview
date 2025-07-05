import { useMapContext } from '../context/MapContext';

const ApproachingPanel = () => {
  const { nearestPolygon, distance } = useMapContext();

  const props = nearestPolygon?.properties;
  const heroImage = props?.heroImage;
  const locationName = props?.id || 'Unknown Location';
  const dist = typeof distance === 'number' ? Math.round(distance * 1000) : null;

  return (
    <div className="rounded-lg h-screen overflow-hidden shadow-lg bg-white">
      <div className="relative h-full w-full bg-gray-200 flex">
        <div
          className="w-[12%] bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />

        <div className="flex-grow relative">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-green-800" />
          
          <div className="relative z-10 flex flex-col justify-between text-white h-full">
            {/* Approaching text */}
            <div className="flex-grow flex items-center pl-10 break-words">
              <div>
                <p className="text-3xl font-medium">Approaching:</p>
                <h1 className="text-4xl font-bold">{locationName}</h1>
              </div>
            </div>

            {/* Distance */}
            {dist !== null && (
              <div className="w-full bg-black py-10">
                <div className="text-white text-3xl pb-10 pl-10 font-bold">
                  In {dist}m
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ApproachingPanel;
