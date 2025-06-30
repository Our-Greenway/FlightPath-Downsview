import { useMapContext } from '../context/MapContext';

const ApproachingPanel = () => {
  const { userPoint, nearestPolygon, distance } = useMapContext();

  const props = nearestPolygon?.properties;
  const heroImage = props?.heroImage;
  const locationName = props?.id || 'Unknown Location';
  const dist = typeof distance === 'number' ? Math.round(distance * 1000) : null;

  return (
    <div className="rounded-lg h-screen overflow-hidden shadow-lg bg-white">
      <div className="relative h-full p-25 w-full bg-gray-200">
        {heroImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-800/50 to-cyan-900" />

        <div className="absolute bottom-0 w-full p-4 bg-opacity-80 text-white">
          <p className="text-lg font-medium">Approaching:</p>
          <h1 className="text-3xl font-bold">{locationName}</h1>
          {dist !== null && <p className="text-lg mt-1">{dist} meters away</p>}
        </div>
      </div>

    </div>
  );
};

export default ApproachingPanel;
