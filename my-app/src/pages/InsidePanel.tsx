import { useMapContext } from '../context/MapContext';
import { useEffect, useState } from 'react';
import MenuBar from '../components/MenuBar';
import { supabase } from '../supabase';
import Description from '../components/Description';
import { useOrientation } from '../context/Orientation';

interface DescriptionInterface {
  id: number;
  location: string;
  created_at: string;
  feature: string;
  image: string;
  "bg-colour": string | null;
}

const InsidePanel = () => {
  const { nearestPolygon, setIsLoading } = useMapContext(); // Get setIsLoading from context
  const orientation = useOrientation();

  const props = nearestPolygon?.properties;
  const heroImage = props?.heroImage;
  const locationName = props?.id || 'Unknown Location';

  const [items, setItems] = useState<DescriptionInterface[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!locationName || locationName === 'Unknown Location') {
        setItems([]);
        return;
      }

      setIsLoading(true); // Use context loading state
      try {
        const { data, error } = await supabase
          .from('descriptions')
          .select('*')
          .eq('location', locationName);

        if (error) {
          console.error('Error fetching descriptions:', error);
          setItems([]);
        } else {
          setItems(data as DescriptionInterface[]); 
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setItems([]);
      } finally {
        setIsLoading(false); // Use context loading state
      }
    };

    fetchData();
  }, [locationName, setIsLoading]); 

  return (
    <div className="flex flex-col h-[50dvh] bg-white">
      <div className={`rounded-lg shadow-lg bg-white flex flex-col ${orientation === 'landscape' ? 'h-screen' : 'flex-1 w-full'}`}>
        <div className="relative pt-28 pb-5 w-full bg-gray-200">
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
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#3A5F3A] to-green-900" />

          <div className="absolute bottom-0 w-full p-4 bg-opacity-80 text-white">
            <p className="text-lg font-medium">You are at:</p>
            <h1 className="text-3xl font-bold">{locationName}</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-28">
          {items.length > 0 ? (
            items.map((item) => (
              <Description key={item.id} data={item} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No details available for this location.
            </div>
          )}
        </div>
        
        <div className="sticky bottom-0">
          <MenuBar/>
        </div>
      </div>
    </div>
  );
};

export default InsidePanel;