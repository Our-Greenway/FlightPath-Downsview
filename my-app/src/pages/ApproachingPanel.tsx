import { useMapContext } from '../context/MapContext';

const ApproachingPanel = () => {
  const { userPoint, nearestPolygon, distance } = useMapContext();

  const props = nearestPolygon?.properties;
  const heroImage = props?.heroImage;
  const locationName = props?.id || 'Unknown Location';
  const dist = typeof distance === 'number' ? Math.round(distance * 1000) : null;

  return (
    <div className="rounded-lg overflow-hidden shadow-lg bg-white">
      <div className="relative h-72 w-full bg-gray-200">
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

      <div className="p-4">
        <h3 className="text-lg font-semibold">User Location</h3>
        {userPoint ? (
          <p>Lat: {userPoint[1].toFixed(5)}, Lng: {userPoint[0].toFixed(5)}</p>
        ) : (
          <p className="text-gray-500">Location not available</p>
        )}

        <h3 className="text-lg font-semibold mt-4">Polygon Data</h3>
        {props ? (
          <pre className="text-sm text-gray-800 bg-gray-100 p-2 rounded">{JSON.stringify(props, null, 2)}</pre>
        ) : (
          <p className="text-gray-500">No polygon data</p>
        )}
      </div>
    </div>
  );
};

export default ApproachingPanel;
