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
  const { nearestPolygon } = useMapContext();
  const orientation = useOrientation();

  const props = nearestPolygon?.properties;
  const heroImage = props?.heroImage;
  const locationName = props?.id || 'Unknown Location';

  const [items, setItems] = useState<DescriptionInterface[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false); 

  useEffect(() => {
    const fetchData = async () => {
      if (!locationName || locationName === 'Unknown Location') {
        setItems([]);
        return;
      }

      setIsLoadingContent(true); 
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
        setIsLoadingContent(false);
      }
    };

    fetchData();
  }, [locationName]);

  return (
    <div className="flex flex-grow h-[50dvh]">
      <div className={`rounded-lg shadow-lg bg-white flex flex-col w-full ${orientation === 'landscape' ? '' : 'h-[50vh] sticky bottom-0 overflow-hidden max-h-[100dvh]'}`} style={{ height: orientation === 'landscape' ? '100dvh' : 'auto' }}>
        <div className={`${orientation === 'landscape' ? '' : 'overflow-y-auto flex-grow'} flex flex-col flex-grow w-full min-h-0`}>
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

          <div className="flex-1 overflow-y-auto p-4">
            {isLoadingContent ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
                <span className="text-gray-600">Loading details...</span>
              </div>
            ) : items.length > 0 ? (
              items.map((item) => (
                <Description key={item.id} data={item} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No details available for this location.
              </div>
            )}
          </div>
        </div>
        <div className="w-full">
          <MenuBar />
        </div>
      </div>
    </div>
  );
};

export default InsidePanel;