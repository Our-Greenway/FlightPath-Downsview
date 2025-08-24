import { useEffect, useRef, useState, useCallback } from 'react';
import L, { Marker, Circle, LayerGroup } from 'leaflet';
import '../App.css';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import type {Feature, Polygon, MultiPolygon } from 'geojson';
import { useMapContext } from '../context/MapContext';
import { useOrientation } from '../context/Orientation';

const DEFAULT_LAT = 43.7439869729327;
const DEFAULT_LNG = -79.4841983609762;
const DEFAULT_ZOOM = 15;

const trackingIcon = L.icon({
  iconUrl: "./LocationIcon.svg",
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [1, -34],
  shadowSize: [46, 46],
  className: 'location-tracking-icon'
});

function MapPage() {
  const { setNearestPolygon, pathFinder, allPolygons, allPaths } = useMapContext();
  const markerRef = useRef<Marker | null>(null);
  const circleRef = useRef<Circle | null>(null);
  const accuracyCircleRef = useRef<Circle | null>(null);
  const orientation = useOrientation() as 'portrait' | 'landscape';
  const prevOrientation = useRef<'portrait' | 'landscape' | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);
  
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [routeInfoCollapsed, setRouteInfoCollapsed] = useState(false);
  
  // Layer groups for organizing map content
  const normalLayersRef = useRef<LayerGroup | null>(null);
  const routeLayersRef = useRef<LayerGroup | null>(null);
  const pathLayersRef = useRef<LayerGroup | null>(null);

  const mapOptions: any = {
    tap: false,
    touchZoom: 'center',
  };

  const resetToDefaultView = () => {
    if (mapRef.current) {
      mapRef.current.setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);
    }
  };

  const handleLocationSuccess = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;
    const newPosition: [number, number] = [longitude, latitude];
    
    setUserPosition(newPosition);
    setLocationAccuracy(accuracy);
    
    console.log(`Location updated: ${latitude}, ${longitude} (±${accuracy}m)`);
  }, []);

  const handleLocationError = useCallback((error: GeolocationPositionError) => {
    console.error('Location error:', error);
    // Silently handle error - you could add minimal error handling here if needed
  }, []);

  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleLocationSuccess,
      handleLocationError,
      options
    );
  }, [handleLocationSuccess, handleLocationError]);

  const centreOnUser = useCallback(() => {
    if (mapRef.current && userPosition) {
      mapRef.current.setView([userPosition[1], userPosition[0]], 17);
    }
  }, [userPosition]);

  useEffect(() => {
    if (mapRef.current) return; 

    const map = L.map('map', mapOptions).setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);
    const mapContainer = map.getContainer();
    let lastTap = 0;

    mapRef.current = map;
    
    normalLayersRef.current = L.layerGroup().addTo(map);
    routeLayersRef.current = L.layerGroup();
    pathLayersRef.current = L.layerGroup();
    
    //double tap checker
    mapContainer.addEventListener('touchend', (e) => {
      const now = new Date().getTime();
      const timeSince = now - lastTap;
      lastTap = now;
    
      if (timeSince < 300) {
        const zoom = map.getZoom();
    
        if (zoom > 17) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      }
    }, { passive: false }); 

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a>',
    }).addTo(map);

    startLocationTracking();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startLocationTracking]);

  useEffect(() => {
    if (!mapRef.current || !allPolygons.length) return;

    normalLayersRef.current?.clearLayers();
    routeLayersRef.current?.clearLayers();

    if (pathFinder.isActive && pathFinder.pathNodes.length > 0) {
      //pathfinder
      const routePolygons = allPolygons.filter(polygon => 
        pathFinder.pathNodes.includes(polygon.properties?.id)
      );

      routePolygons.forEach(polygon => {
        const isStart = polygon.properties?.id === pathFinder.startNode;
        const isEnd = polygon.properties?.id === pathFinder.endNode;
        
        const color = isStart ? '#10b981' : isEnd ? '#ef4444' : '#3b82f6';
        const fillOpacity = 0.6;
        
        const layer = L.geoJSON(polygon, {
          style: {
            fillColor: color,
            weight: 2,
            opacity: 1,
            color: '#1f2937',
            fillOpacity: fillOpacity
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            if (props?.id) {
              const nodeType = isStart ? ' (Start)' : isEnd ? ' (End)' : ' (Route)';
              layer.bindPopup(`<strong>${props.id}${nodeType}</strong>`);
            }
          }
        });
        
        routeLayersRef.current?.addLayer(layer);
      });

      mapRef.current.addLayer(routeLayersRef.current!);
      
      if (routePolygons.length > 0) {
        const group = L.featureGroup();
        routePolygons.forEach(polygon => {
          group.addLayer(L.geoJSON(polygon));
        });
        mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
      }

    } else {
      // normal mode
      allPolygons.forEach(polygon => {
        const layer = L.geoJSON(polygon, {
          style: {
            fillColor: '#6366f1',
            weight: 1,
            opacity: 1,
            color: '#4f46e5',
            fillOpacity: 0.4
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            if (props?.id) {
              layer.bindPopup(`<strong>${props.id}</strong>`);
            }
          }
        });
        
        normalLayersRef.current?.addLayer(layer);
      });

      mapRef.current.addLayer(normalLayersRef.current!);
    }

  }, [allPolygons, pathFinder]);

  useEffect(() => {
    if (!mapRef.current || !Object.keys(allPaths).length) return;

    pathLayersRef.current?.clearLayers();

    if (pathFinder.isActive && pathFinder.pathGeometries.length > 0) {
      pathFinder.pathGeometries.forEach(pathFeature => {
        const routePath = L.geoJSON(pathFeature, {
          style: {
            color: '#fbbf24',
            weight: 4,
            opacity: 0.8
          }
        });
        
        const animatedPath = L.geoJSON(pathFeature, {
          style: {
            color: '#ffffff',
            weight: 2,
            opacity: 0.8,
            dashArray: '10, 10'
          }
        });

        pathLayersRef.current?.addLayer(routePath);
        pathLayersRef.current?.addLayer(animatedPath);
      });

      mapRef.current.addLayer(pathLayersRef.current!);

    } else {
      Object.values(allPaths).forEach(pathArray => {
        pathArray.forEach(pathFeature => {
          const layer = L.geoJSON(pathFeature, {
            style: {
              color: '#9ca3af',
              weight: 2,
              opacity: 0.4
            }
          });
          
          pathLayersRef.current?.addLayer(layer);
        });
      });

      mapRef.current.addLayer(pathLayersRef.current!);
    }

  }, [allPaths, pathFinder]);

  //user location
  useEffect(() => {
    if (!mapRef.current || !userPosition) return;

    const latlng = L.latLng(userPosition[1], userPosition[0]);
    const icon = trackingIcon;

    if (!markerRef.current) {
      markerRef.current = L.marker(latlng, { icon }).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng(latlng).setIcon(icon);
    }

    const accuracyRadius = locationAccuracy || 30;
    if (!circleRef.current) {
      circleRef.current = L.circle(latlng, { 
        radius: accuracyRadius,
        color: '#007AFF',
        fillColor: '#007AFF',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(mapRef.current);
    } else {
      circleRef.current.setLatLng(latlng).setRadius(accuracyRadius);
    }

    if (locationAccuracy && locationAccuracy > 50) {
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = L.circle(latlng, {
          radius: locationAccuracy,
          color: '#007AFF',
          fillColor: '#007AFF',
          fillOpacity: 0.1,
          weight: 1,
          dashArray: '5, 5'
        }).addTo(mapRef.current);
      } else {
        accuracyCircleRef.current.setLatLng(latlng).setRadius(locationAccuracy);
      }
    } else if (accuracyCircleRef.current) {
      mapRef.current.removeLayer(accuracyCircleRef.current);
      accuracyCircleRef.current = null;
    }

    if (!pathFinder.isActive && allPolygons.length > 0) {
      const pt = turf.point(userPosition);
      let nearestFeature: Feature<Polygon | MultiPolygon> | null = null;
      let minDist = Infinity;

      for (const feature of allPolygons) {
        const centre = turf.centroid(feature);
        const dist = turf.distance(pt, centre);

        if (dist < minDist) {
          minDist = dist;
          nearestFeature = feature;
        }
      }

      if (nearestFeature) {
        setNearestPolygon(nearestFeature);
      }
    }

  }, [userPosition, locationAccuracy, allPolygons, pathFinder.isActive, setNearestPolygon]);

  // orientation
  useEffect(() => {
    if (
      prevOrientation.current &&
      prevOrientation.current !== orientation &&
      mapRef.current
    ) {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
          const currentBounds = mapRef.current.getBounds();
          mapRef.current.fitBounds(currentBounds);
        }
      }, 100);
    }
  
    prevOrientation.current = orientation;
  }, [orientation]);

  return (
    <div className="relative">
      <div
        id="map"
        style={{
          height: orientation === 'landscape' ? '100dvh' : '50dvh'
        }}
      />
      
      {/* Control panel */}
      <div className="absolute bottom-4 left-4 flex flex-col space-y-2 z-[1000]">
        <button 
          onClick={resetToDefaultView} 
          className="!bg-white !text-gray-700 hover:bg-gray-50 p-3 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 touch-manipulation select-none appearance-none border-none outline-none"
          title="Reset to default view"
        >
          <i className="fas fa-refresh"></i>
          <span className="text-sm font-medium">Reset View</span>
        </button>
        
        {userPosition && (
          <button 
            onClick={centreOnUser}
            className="!bg-white !text-gray-700  hover:bg-gray-50 p-3 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 touch-manipulation select-none appearance-none border-none outline-none"
            title="Centre on my location"
          >
            <i className="fas fa-crosshairs"></i>
            <span className="text-sm font-medium">Centre View</span>
          </button>
        )}
      </div>

      {/* Route info overlay */}
      {pathFinder.isActive && pathFinder.pathNodes.length > 0 && (
        <div className={`absolute top-4 right-4 bg-white rounded-lg shadow-lg max-w-sm z-[1000] transition-all duration-300 ${routeInfoCollapsed ? 'p-2' : 'p-3'}`}>
          {!routeInfoCollapsed ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-900 font-semibold text-sm">Active Route</h4>
                <button onClick={() => setRouteInfoCollapsed(true)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <i className="fas fa-chevron-down w-4 h-4"></i>
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                From: <span className="font-medium text-green-600">{pathFinder.startNode}</span>
              </p>
              <p className="text-xs text-gray-600 mb-1">
                To: <span className="font-medium text-red-600">{pathFinder.endNode}</span>
              </p>
              <p className="text-xs text-gray-600 mb-2">
                Distance: <span className="font-medium">
                  {pathFinder.distance ? `${(pathFinder.distance * 100000).toFixed(0)}m` : 'N/A'}
                </span>
              </p>
              <div className="flex items-center text-xs text-gray-500 space-x-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>Start
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>Route
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>End
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-6 h-1 bg-yellow-400 mr-2"></div>Route Path
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <button onClick={() => setRouteInfoCollapsed(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <i className="fas fa-chevron-up w-4 h-4"></i>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MapPage;