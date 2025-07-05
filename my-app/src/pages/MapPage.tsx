import { useEffect, useRef } from 'react';
import L, { Marker, Circle } from 'leaflet';
import '../App.css';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import type { FeatureCollection, Feature, Polygon } from 'geojson';
import { useMapContext } from '../context/MapContext';

function MapPage() {
  const { userPoint, setNearestPolygon, setUserPoint } = useMapContext();
  const markerRef = useRef<Marker | null>(null);
  const circleRef = useRef<Circle | null>(null);

  useEffect(() => {
    const map = L.map('map').setView([43.8094086, -79.2696282], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a>',
    }).addTo(map);

    const files = [
      "BoakesGrove.geojson",
      "DogsviewPark.geojson",
      "FestivalTerrance.geojson",
      "Hummingbird.geojson",
      "LakeLookout.geojson",
      "NorthFarm.geojson",
      "NorthHill.geojson",
      "Offices.geojson",
      "Orchard.geojson",
      "OtherPond.geojson",
      "Playground.geojson",
      "SesquicentennialMonument.geojson",
      "SouthHill.geojson",
      "SwanLake.geojson",
      "UrbanFarm.geojson",
      "KeeleWycombe.geojson",
      "KeeleDiana.geojson"
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
          markerRef.current = L.marker(latlng).addTo(map);
        } else {
          markerRef.current.setLatLng(latlng);
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
  }, [userPoint]); // triggers only if userPoint is set

  return <div id="map" style={{ height: "100vh", width: "66vw" }}></div>;
}

export default MapPage;
