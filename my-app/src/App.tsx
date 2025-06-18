import { MapProvider } from './context/MapContext';
import MapPage from './pages/MapPage';
import InfoPanel from './pages/InfoPanel';

function App() {
  return (
    <MapProvider>
      <MapPage />
      <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 1000 }}>
        <InfoPanel />
      </div>
    </MapProvider>
  );
}

export default App;