import {map} from "./map.js"

export let drawingList = [];
//format of [id:number,name:String,coorIndex:[[coords]],radius:null/number]
//format of [coords]= [[lat,long],[latitude,longitude],...]

// Group that stores all user drawings
const drawnItems = new L.FeatureGroup();
//Adding a layer for the drawn items
map.addLayer(drawnItems);

// drawing controls
const drawControl = new L.Control.Draw({

    draw: {
        polygon: true,
        rectangle: true,
        circle: true,
        marker: false,
        polyline: false,
        circlemarker: false
    },
    edit: {
        featureGroup: drawnItems
    }
});
//Adding the drawing controls to the map
map.addControl(drawControl);

//After a drawing is finished:
//detects when a drawing was made
map.on(L.Draw.Event.CREATED, function(event) {
    //using id to know which to modify (linking it to drawingList)
    const id = drawingList.length;
    // Constant of the shape drawn
    const layer = event.layer;
    // Add it to the map
    drawnItems.addLayer(layer);

    //Saving the coordinates of the drawn item
    let drawing = {
        id:id,
        name:"",
        coordIndex:[],
        radius:null
    }

    if (layer instanceof L.Circle) {
        drawing.name = "Circle";
        const center = layer.getLatLng();
        drawing.coordIndex = [center.lng, center.lat];
        drawing.radius = layer.getRadius();
    }
    else {
        drawing.name = "Square";
        const geoJSON = layer.toGeoJSON();
        drawing.coordIndex = geoJSON.geometry.coordinates;
    }
    if (layer instanceof L.Rectangle) {
        drawing.name = "Rectangle";
        const geoJSON = layer.toGeoJSON();
        drawing.coordIndex = geoJSON.geometry.coordinates;
    }
    else if (layer instanceof L.polygon){
        drawing.name = "Polygon";
        const geoJSON = layer.toGeoJSON();
        drawing.coordIndex = geoJSON.geometry.coordinates;
    }

    drawingList.push(drawing);
    layer.drawingID = id;
    //display
    layer.bindTooltip("ID: "+id,{permanent:true, direction:"center"});
    console.log(drawingList);
});

//After a drawing has been edited:
//detects when user modifies a drawing
map.on(L.Draw.Event.EDITED, function(event) {
    event.layers.eachLayer(function(layer) {
        const id = layer.drawingID;
        // Replace the existing object
        drawingList[id] = {
            isCircle: layer instanceof L.Circle,
            coordinates: layer.toGeoJSON().geometry.coordinates,
            radius: layer instanceof L.Circle ? layer.getRadius() : null,
            drawingID: id
        };
    });
    console.log(drawingList);
});

//After a drawing has been deleted:
//detects when user deletes a drawing
map.on(L.Draw.Event.DELETED, function(event) {
    const deletedIDs = [];
    event.layers.eachLayer(function(layer) {
        deletedIDs.push(layer.drawingID);
    })
    deletedIDs.sort((a, b) => b - a);
    //deleting
    deletedIDs.forEach(deletedID => {
        drawingList.splice(deletedID, 1);
        drawnItems.eachLayer(function(layer) {
            if(layer.drawingID>deletedID){
                layer.drawingID--;
                drawingList[layer.drawingID].drawingID=layer.drawingID;
                layer.setTooltipContent("ID: "+layer.drawingID);
            }
        })
    })
    console.log(drawingList);
});

