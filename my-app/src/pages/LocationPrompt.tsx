
import { useMapContext } from '../context/MapContext';

const LocationPrompt = () => {
  const { setUserPoint } = useMapContext();

  const requestLocation = () => {
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPoint([longitude, latitude]);
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
      }
    );
  };

  return (
    <div className="z-10001 fixed top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-50">
      <button
        className="bg-white text-black font-semibold px-4 py-2 rounded"
        onClick={requestLocation}
      >
        Allow Location Access
      </button>
    </div>
  );
};

export default LocationPrompt;
