
import { useMapContext } from '../context/MapContext';
import { useOrientation } from '../context/Orientation';

const LocationPrompt = () => {
  const { setUserPoint } = useMapContext();
  const orientation = useOrientation();

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
  <div className="z-10001 fixed top-0 left-0 w-full h-full bg-black/70 z-50">
    <div className={`flex flex-col md:flex-row ${orientation === "portrait" ? "items-start" : "items-center justify-center"}  gap-8 h-full max-h-full overflow-y-auto p-8 text-white`}>
      <div className="max-w-md">
        <h1 className={`text-xl font-bold mb-4 ${orientation === "portrait" ? "pt-5" : " "}`}>Welcome to FlightPath Downsview!</h1>
        <p className="mb-4">
          FlightPath Downsview is a navigation tool built by Our Greenway for Cycling Without Age rides in the Downsview Park area. It includes a path-finding feature and a visual guide to local attractions, designed to help people who are deaf and hard of hearing. 
        </p>
        <p className="mb-6">
          To get started, click on the button below. This program requires a GPS-enabled device.
        </p>
        <button
          className="!bg-white !text-black font-semibold px-4 py-2 rounded"
          onClick={requestLocation}
        >
          Allow Location Access
        </button>
        <p className="mt-6 ">
          Developmental documentation available <a className="!text-white !underline" href="https://brand.ourgreenway.ca/flightpath">here</a>. GitHub repository available <a className="!text-white !underline" href="https://github.com/Our-Greenway/FlightPath-Downsview">here</a>. 
        </p>
      </div>
      
      <div>
        <img src="/FlightPathDownsviewVertical.png" alt="FlightPath on a vertical phone" className="hidden md:block w-64 h-auto" />
        <img src="/FlightPathDownsviewLandscape.png" alt="FlightPath on a horizontal phone" className="block md:hidden  w-auto h-auto" />
      </div>
    </div>
  </div>

  );
};

export default LocationPrompt;
