import { useEffect, useState } from 'react';

export function useOrientation() {
  const getOrientation = (): 'portrait' | 'landscape' =>
    window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(getOrientation());

  useEffect(() => {
    const handleResize = () => {
      setOrientation(getOrientation());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return orientation;
}
