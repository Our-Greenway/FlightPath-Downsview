import { useEffect, useRef } from 'react'
import L, { Marker, Circle } from 'leaflet'
import './App.css'
import 'leaflet/dist/leaflet.css';

function App() {
  const mapRef = useRef(null)
  const markerRef = useRef<Marker | null>(null)
  const circleRef = useRef<Circle | null>(null)

  useEffect(() => {
    const map = L.map('map').setView([43.8094086, -79.2696282], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a>'
    }).addTo(map);


    const files = ["Orchard.geojson", "UrbanFarm.geojson"];

    files.forEach(file => {
      fetch(`/geojson/${file}`)
        .then(res => res.json())
        .then(data => {
          L.geoJSON(data).addTo(map);
        });
    });
  
    map.locate({ setView: true, maxZoom: 16, watch: true })

    map.on('locationfound', (e) => {
      const { latlng, accuracy } = e

      if (!markerRef.current) {
        markerRef.current = L.marker(latlng).addTo(map)
      } else {
        markerRef.current.setLatLng(latlng)
      }

      if (!circleRef.current) {
        circleRef.current = L.circle(latlng, { radius: accuracy }).addTo(map)
      } else {
        circleRef.current.setLatLng(latlng).setRadius(accuracy)
      }
    })
    return () => {
      map.remove();
    };
  });

  return (
    <>
      <div id="map" style={{ height: "100vh", width: "100vw" }}></div> 
    </>
  )
}

export default App
