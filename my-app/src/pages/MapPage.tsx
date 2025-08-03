import { useEffect, useRef } from 'react';
import L, { Marker, Circle, LayerGroup } from 'leaflet';
import '../App.css';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import type { FeatureCollection, Feature, Polygon, MultiPolygon, LineString } from 'geojson';
import { useMapContext } from '../context/MapContext';
import { useOrientation } from '../context/Orientation';

const customIcon = L.icon({
  iconUrl: "/LocationIcon.svg",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapPage() {
  const { userPoint, setNearestPolygon, pathFinder, allPolygons, allPaths } = useMapContext();
  const markerRef = useRef<Marker | null>(null);
  const circleRef = useRef<Circle | null>(null);
  const orientation = useOrientation() as 'portrait' | 'landscape';
  const prevOrientation = useRef<'portrait' | 'landscape' | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  
  // Layer groups for organizing map content
  const normalLayersRef = useRef<LayerGroup | null>(null);
  const routeLayersRef = useRef<LayerGroup | null>(null);
  const pathLayersRef = useRef<LayerGroup | null>(null);

  const mapOptions: any = {
    tap: false,
    touchZoom: 'center',
  };

  useEffect(() => {
    if (mapRef.current) return; 

    const map = L.map('map', mapOptions).setView([43.8094086, -79.2696282], 13);
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

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

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

    //pathfinder
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
      //normal map mode
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
    if (!mapRef.current || !userPoint) return;

    const latlng = L.latLng(userPoint[1], userPoint[0]);

    if (!markerRef.current) {
      markerRef.current = L.marker(latlng, { icon: customIcon }).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng(latlng).setIcon(customIcon);
    }

    if (!circleRef.current) {
      circleRef.current = L.circle(latlng, { 
        radius: 30,
        color: '#ff6b6b',
        fillColor: '#ff6b6b',
        fillOpacity: 0.3
      }).addTo(mapRef.current);
    } else {
      circleRef.current.setLatLng(latlng).setRadius(30);
    }

    if (!pathFinder.isActive && allPolygons.length > 0) {
      const pt = turf.point(userPoint);
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

  }, [userPoint, allPolygons, pathFinder.isActive, setNearestPolygon]);

  // orientation
  useEffect(() => {
    if (
      prevOrientation.current &&
      prevOrientation.current !== orientation &&
      mapRef.current
    ) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 0);
    }
  
    prevOrientation.current = orientation;
  }, [orientation]);

  return (
    <div className="relative">
      <div
        id="map"
        className={`${
          orientation === 'portrait'
            ? 'w-screen h-[100%]'
            : 'w-[100%] h-screen'
        }`}
      />
      
      {/* Route info overlay */}
      {pathFinder.isActive && pathFinder.pathNodes.length > 0 && (
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg max-w-sm z-[1000]">
          <h4 className="font-semibold text-sm mb-2">Active Route</h4>
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
        </div>
      )}
    </div>
  );
}

export default MapPage;