import { useMapContext } from '../context/MapContext';

const ApproachingPanel = () => {
  const { nearestPolygon, distance } = useMapContext();

  const props = nearestPolygon?.properties;
  const heroImage = props?.heroImage;
  const locationName = props?.id || 'Unknown Location';
  const dist = typeof distance === 'number' ? Math.round(distance * 1000) : null;

  return (
    <div className="rounded-lg h-screen overflow-hidden shadow-lg bg-white">
      <div className="relative h-full w-full bg-gray-200">
        <div
          className="z-90 absolute inset-0 bg-cover bg-center w-[12%]"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-green-800" />
          <div className="absolute inset-0 flex flex-col justify-between text-white">

          {/*Approaching text */}
          <div className="flex-grow flex items-center pl-1 md:pl-15 lg:pl-30">
            <div>
              <p className="text-3xl font-medium">Approaching:</p>
              <h1 className="text-4xl font-bold">{locationName}</h1>
            </div>
          </div>

          {/* Distance */}
          {dist !== null && (
            <div className="w-full bg-black py-6">
              <div className="text-white text-3xl pl-1 md:pl-15 lg:pl-30 font-bold">
                In {dist}m
              </div>
            </div>
          )}
        </div>
          



      </div>

    </div>
  );
};

export default ApproachingPanel;
