
import { useMapContext } from '../context/MapContext';

const InfoPanel = () => {
  const { userPoint, nearestPolygon } = useMapContext();

  return (
    <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
      <h3>User Location</h3>
      {userPoint ? (
        <p>Lat: {userPoint[1].toFixed(5)}, Lng: {userPoint[0].toFixed(5)}</p>
      ) : (
        <p>Location not available</p>
      )}

      <h3>Nearest Polygon</h3>
      {nearestPolygon ? (
        nearestPolygon.properties ? (
          <pre>{JSON.stringify(nearestPolygon.properties, null, 2)}</pre>
        ) : (
          <p>Polygon has no properties.</p>
        )
      ) : (
        <p>No polygon found yet.</p>
      )}
    </div>
  );
};

export default InfoPanel;
