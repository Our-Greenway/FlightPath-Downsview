import { useEffect, useRef } from 'react'
import L, { Marker, Circle } from 'leaflet'
import '../App.css'
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import type { FeatureCollection, Feature, Polygon } from 'geojson';
import { useMapContext, MapProvider } from '../context/MapContext';

function MapPage() {
  const { setUserPoint, setNearestPolygon } = useMapContext();
  const mapRef = useRef(null)
  const markerRef = useRef<Marker | null>(null)
  const circleRef = useRef<Circle | null>(null)
  
  let minDist = Infinity;
  let nearestFeature = null;

  useEffect(() => {
    const map = L.map('map').setView([43.8094086, -79.2696282], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a>'
    }).addTo(map);


    const files = ["Orchard.geojson", "UrbanFarm.geojson", "NorthFarm.geojson"];

    const polygons: FeatureCollection<Polygon>= {
      type: "FeatureCollection",
      features: []
    };
    Promise.all(
      files.map(file =>
        fetch(`/geojson/${file}`).then(res => res.json())
      )
    ).then(dataArray => {
      dataArray.forEach(data => {
        polygons.features.push(...data.features); 
        L.geoJSON(data).addTo(map);              
      });
      
      map.locate({ setView: true, maxZoom: 16, watch: true });

      map.on("locationfound", function (e) {
        const userPoint = turf.point([e.latlng.lng, e.latlng.lat]);
        const coords = userPoint.geometry.coordinates; 
        const latlng = L.latLng(coords[1], coords[0]);
        const accuracy = e.accuracy;

        if (!markerRef.current) {
          markerRef.current = L.marker(latlng).addTo(map);
        } else {
          markerRef.current.setLatLng(latlng);
        }
        
        if (!circleRef.current) {
          circleRef.current = L.circle(latlng, { radius: accuracy }).addTo(map);
        } else {
          circleRef.current.setLatLng(latlng).setRadius(accuracy);
        }


      
        let nearestFeature: Feature<Polygon> | null = null;
        let minDist = Infinity;
      
        for (const feature of polygons.features) {
          const centre = turf.centroid(feature);
          const dist = turf.distance(userPoint, centre); 
          console.log(nearestFeature);
          
          if (dist < minDist) {
            minDist = dist;
            nearestFeature = feature;
          }
        
          console.log("Centroid valid:", centre?.geometry?.coordinates, "Distance:", dist);
          console.log(nearestFeature);
      
        }
      
        console.log("Nearest polygon:", nearestFeature?.properties?.id || "none");
      
        if (nearestFeature) {
          const bounds = L.geoJSON(nearestFeature).getBounds();
          map.fitBounds(bounds, { padding: [50, 50] });
        }
        setUserPoint([coords[0], coords[1]]);
        setNearestPolygon(nearestFeature);

      });

    });

    
    return () => {
      map.remove();
    };
  
  }, []); 

  return (
    <>
    <MapProvider>
      <div id="map" style={{ height: "100vh", width: "66vw" }}></div> 
    </MapProvider>
    </>
  )
}

export default MapPage;