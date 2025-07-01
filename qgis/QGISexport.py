#Internal usage for qgis path exports

import os
from qgis.core import *
from PyQt5.QtCore import QVariant
import json

# Change depending on qgis paths
outputDirectory = r"NULL"

# Collect all vector polygon layers in proj
polygonLayers = [
    layer for layer in QgsProject.instance().mapLayers().values()
    if layer.type() == QgsMapLayer.VectorLayer and layer.geometryType() == QgsWkbTypes.PolygonGeometry
]

#Create the neighbours column if not exists
for polyLayer in polygonLayers:
    if "neighbours" not in [field.name() for field in polyLayer.fields()]:
        polyLayer.startEditing()
        polyLayer.dataProvider().addAttributes([QgsField("neighbours", QVariant.StringList)])
        polyLayer.updateFields()
        polyLayer.commitChanges()
        
for layer in QgsProject.instance().mapLayers().values():
    if layer.type() == QgsMapLayer.VectorLayer and layer.geometryType() == QgsWkbTypes.LineGeometry:

        # Copy layer and calculate length
        layerCopy = QgsVectorLayer("LineString?crs=" + layer.crs().authid(), layer.name(), "memory")
        layerCopyData = layerCopy.dataProvider()
        layerCopyData.addAttributes(layer.fields())
        layerCopy.updateFields()

        # Add "length" column
        layerCopyData.addAttributes([QgsField("length", QVariant.Double)])
        layerCopy.updateFields()

        for feat in layer.getFeatures():
            geom = feat.geometry()
            length = geom.length()
            newFeat = QgsFeature(layerCopy.fields())
            newFeat.setGeometry(geom)
            newFeat.setAttributes(feat.attributes() + [length])
            layerCopyData.addFeature(newFeat)

        # Attempt to parse the line layer name as "A to B"
        name = layer.name().replace(" ", "_").lower()
        
        if " to " in layer.name():
            # sort to remove duplicates
            a, b = layer.name().split(" to ")
            nodes = sorted([a.strip(), b.strip()])
            linkID = "_to_".join(nodes)

            for polyLayer in polygonLayers:
                polyLayer.startEditing()
                polyLayer.updateFields()
                neighbourIndex = polyLayer.fields().indexFromName("neighbours")

                for feature in polyLayer.getFeatures():
                    polyID = feature["id"]
                    print(f"Comparing polygon id='{polyID}' with a='{a}' and b='{b}'")
                    if polyID in [a, b]:
                        current = feature["neighbours"]
                        if current is None:
                            currentList = []
                        else:
                            currentList = list(current)  # Convert QStringList to Python list

                        # Checks if length is greater than one to avoid parsing each char itself
                        if linkID not in currentList  and len(linkID) > 1: 
                            currentList = [item for item in currentList if len(str(item)) > 1]
                            currentList.append(linkID)

                            polyLayer.changeAttributeValue(
                                feature.id(),
                                neighbourIndex,
                                currentList  
                            )
                            print(f"Added neighbour '{linkID}' to polygon '{polyID}'")

                polyLayer.commitChanges()

        # Export line layer as GeoJSON, export to /path if it is a linestr
        if layer.geometryType() == QgsWkbTypes.LineGeometry:
            outputPath = os.path.join(outputDirectory, f"{name}.geojson")
        else:
            outputPath = os.path.join(outputDirectory, "path", f"{name}.geojson")

        QgsVectorFileWriter.writeAsVectorFormat(
            layerCopy,
            outputPath,
            "UTF-8",
            layerCopy.crs(),
            "GeoJSON"
        )
        print(f"{name} exported!")

print("Export complete!")
