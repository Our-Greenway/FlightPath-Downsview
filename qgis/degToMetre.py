import json
import os
from geopy.distance import geodesic

files = [
    "boakesgrove_to_lakelookout.geojson",
    "dogsviewpark_to_lowerpond.geojson",
    "dogsviewpark_to_minimound.geojson",
    "hummingbird_to_mound.geojson",
    "keelediana_to_swanlake.geojson",
    "keelewycombe_to_keelediana.geojson",
    "lakelookout_to_keelediana.geojson",
    "lakelookout_to_keelewycombe.geojson",
    "lakelookout_to_sesquicentennialmonument.geojson",
    "lowerpond_to_minimound.geojson",
    "lowerpond_to_mound.geojson",
    "northfarm_to_keelewycombe.geojson",
    "northplaza_to_northfarm.geojson",
    "northplaza_to_playground.geojson",
    "orchard_to_dogsviewpark.geojson",
    "orchard_to_lakelookout.geojson",
    "orchard_to_swanlake.geojson",
    "orchard_to_urbanfarm.geojson",
    "playground_to_sesquicentennialmonument.geojson",
    "sesquicentennialmonument_to_boakesgrove.geojson",
    "sesquicentennialmonument_to_hummingbird.geojson",
    "sesquicentennialmonument_to_keelediana.geojson",
    "sesquicentennialmonument_to_keelewycombe.geojson",
    "swanlake_to_keelewycombe.geojson",
    "swanlake_to_lakelookout.geojson",
    "swanlake_to_sesquicentennialmonument.geojson",
    "urbanfarm_to_lowerpond.geojson",
    "urbanfarm_to_minimound.geojson"
]

def line_length(coords):
    total = 0
    for i in range(len(coords) - 1):
        pt1 = (coords[i][1], coords[i][0]) 
        pt2 = (coords[i+1][1], coords[i+1][0])
        total += geodesic(pt1, pt2).meters
    return total

for filename in files:
    full_path = "my-app/public/geojson/paths/" + filename
    if not os.path.exists(full_path):
        print(f"File not found: {full_path}")
        continue
    with open(full_path, "r") as f:
        gj = json.load(f)
    for feature in gj.get("features", []):
        if feature["geometry"]["type"] == "LineString":
            coords = feature["geometry"]["coordinates"]
            if "length" in feature["properties"]:
                feature["properties"]["degreeLength"] = feature["properties"]["length"]
            feature["properties"]["length"] = line_length(coords)
        elif feature["geometry"]["type"] == "MultiLineString":
            coords = feature["geometry"]["coordinates"]
            if "length" in feature["properties"]:
                feature["properties"]["degreeLength"] = feature["properties"]["length"]
            feature["properties"]["length"] = sum(line_length(line) for line in coords)
    with open(full_path, "w") as f:
        json.dump(gj, f, indent=2)
    print(f"Updated: {full_path}")
