#Internal usage for qgis path exports

import os

# Change depending on qgis paths
outputDirectory = NULL

for layer in QgsProject.instance().mapLayers().values():
    if layer.type() == QgsMapLayer.VectorLayer and layer.geometryType() == QgsWkbTypes.LineGeometry:
        
        # Copy of layer 
        layerCopy = QgsVectorLayer("LineString?crs=" + layer.crs().authid(), layer.name(), "memory")
        layerCopyData = layerCopy.dataProvider()
        layerCopyData.addAttributes(layer.fields())
        layerCopy.updateFields()
        
        # length field
        lengthField = QgsField("length", QVariant.Double)
        layerCopyData.addAttributes([lengthField])
        layerCopy.updateFields()
        
        for feat in layer.getFeatures():
            geom = feat.geometry()
            length = geom.length() 
            newFeat = QgsFeature(layerCopy.fields())
            newFeat.setGeometry(geom)
            newFeat.setAttributes(feat.attributes() + [length])
            layerCopyData.addFeature(newFeat)

        # Export layer
        name = layer.name().replace(" ", "_").lower()
        outputPath = os.path.join(outputDirectory, f"{name}.geojson")
        
        QgsVectorFileWriter.writeAsVectorFormat(
            layerCopy,
            outputPath,
            "UTF-8",
            layerCopy.crs(),
            "GeoJSON"
        )
        print(f"{name} exported!")
        

print("Export complete!")

