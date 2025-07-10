import { useMapContext } from '../context/MapContext';
import { useEffect, useState } from 'react';
import MenuBar from '../components/MenuBar';
import { supabase } from '../supabase';
import Description from '../components/Description';


interface DescriptionInterface {
  id: number;
  location: string;
  created_at: string;
  feature: string;
  image: string;
  "bg-colour": string | null;
}

const InsidePanel = () => {
  const { userPoint, nearestPolygon } = useMapContext();

  const props = nearestPolygon?.properties;
  const heroImage = props?.heroImage;
  const locationName = props?.id || 'Unknown Location';

  
  const [items, setItems] = useState<DescriptionInterface[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('descriptions')
        .select('*')
        .eq('location', locationName);
  
      if (error) {
        console.error(error);
      } else {
        setItems(data as DescriptionInterface[]); 
      }
    };
  
    fetchData();
  }, []);

  return (
    <div className="rounded-lg h-screen  shadow-lg bg-white">
      <div className="relative pt-35 pb-5 w-full bg-gray-200">
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

  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-800/50 to-green-900" />

        <div className="absolute bottom-0 w-full p-4 bg-opacity-80 text-white">
          <p className="text-lg font-medium">You are at:</p>
          <h1 className="text-3xl font-bold">{locationName}</h1>
        </div>
      </div>

      <div className="p-4 pb-15 overflow-y-auto max-h-[200px]">
        {items.map(item => (
          <Description key={item.id} data={item} />
        ))}
        {/*
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
          */}
      </div>
      
    <div className="sticky bottom-0">
      <MenuBar/>
    </div>
    </div>
    
  );
};

export default InsidePanel;
