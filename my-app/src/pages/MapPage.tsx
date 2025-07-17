import { useEffect, useRef } from 'react';
import L, { Marker, Circle } from 'leaflet';
import '../App.css';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import type { FeatureCollection, Feature, Polygon } from 'geojson';
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
  const { userPoint, setNearestPolygon } = useMapContext();
  const markerRef = useRef<Marker | null>(null);
  const circleRef = useRef<Circle | null>(null);
  const orientation = useOrientation() as 'portrait' | 'landscape';
  const prevOrientation = useRef<'portrait' | 'landscape' | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const mapOptions: any = {
    tap: false,
    touchZoom: 'center',
  };
  
  useEffect(() => {
    const map = L.map('map', mapOptions).setView([43.8094086, -79.2696282], 13);
    const mapContainer = map.getContainer();
    let lastTap = 0;

    mapRef.current = map;
    
    // Checks for double tap and allows browser to escape it without leaflet interference 
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

    const files = [
      "BoakesGrove.geojson",
      "DogsviewPark.geojson",
      "FestivalTerrance.geojson",
      "Hummingbird.geojson",
      "KeeleDiana.geojson",
      "KeeleWycombe.geojson",
      "LakeLookout.geojson",
      "LowerPond.geojson",
      "MiniMound.geojson",
      "Mound.geojson",
      "NorthFarm.geojson",
      "NorthPlaza.geojson",
      "Orchard.geojson",
      "Playground.geojson",
      "SesquicentennialMonument.geojson",
      "SwanLake.geojson",
      "UrbanFarm.geojson"
    ];

    const polygons: FeatureCollection<Polygon> = {
      type: "FeatureCollection",
      features: []
    };

    Promise.all(files.map(file =>
      fetch(`/geojson/${file}`).then(res => res.json())
    )).then(dataArray => {
      dataArray.forEach(data => {
        polygons.features.push(...data.features);
        L.geoJSON(data).addTo(map);
      });

      if (userPoint) {
        const pt = turf.point(userPoint);

        let nearestFeature: Feature<Polygon> | null = null;
        let minDist = Infinity;

        for (const feature of polygons.features) {
          const centre = turf.centroid(feature);
          const dist = turf.distance(pt, centre);

          if (dist < minDist) {
            minDist = dist;
            nearestFeature = feature;
          }
        }

        if (nearestFeature) {
          setNearestPolygon(nearestFeature);
          const bounds = L.geoJSON(nearestFeature).getBounds();
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        const latlng = L.latLng(userPoint[1], userPoint[0]);
        if (!markerRef.current) {
          markerRef.current = L.marker(latlng, { icon: customIcon }).addTo(map);
        } else {
          markerRef.current.setLatLng(latlng).setIcon(customIcon);
        }
        if (!circleRef.current) {
          circleRef.current = L.circle(latlng, { radius: 30 }).addTo(map);
        } else {
          circleRef.current.setLatLng(latlng).setRadius(30);
        }
      }
    });

    
    return () => {
      map.remove();
    };
  }, [userPoint]); 
  

  useEffect(() => {
    if (
      prevOrientation.current &&
      prevOrientation.current !== orientation &&
      mapRef.current
    ) {
      // Forces a refresh if the orientation is changed
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 0);
    }
  
    prevOrientation.current = orientation;
  }, [orientation]);

  return   <div
    id="map"
    className={`${
      orientation === 'portrait'
        ? 'w-screen h-[100%]'
        : 'w-[100%] h-screen'
    }`}
  ></div>;
}

export default MapPage;
