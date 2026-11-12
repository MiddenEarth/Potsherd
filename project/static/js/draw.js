//IMPORT -------------------------------------------------------
import {map} from "./map.js"    //The map variable, displays all the things inside the map

//EXPORT ------------------------------------------------------
export let drawingList = [];
//format of [id:number,name:String,coorIndex:[[coords]],radius:null/number]
//format of [coords]= [[lat,long],[latitude,longitude],...]


//VALUES AND CONSTANTS-------------------------
// Group that stores all user drawings
const drawnItems = new L.FeatureGroup();
//Adding a layer for the drawn items
map.addLayer(drawnItems);   //In this layer we will see all the drawnItems

// drawing controls
const drawControl = new L.Control.Draw({    //Used for the draw ui inside the map
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

//VALUES AND CONSTANTS-------------------------


//EVENTS FOR drawControl-----------------------------------------------------

//After a drawing is finished:
//detects when a drawing was made
//CREATED EVENT ---------------------------------------------------------------
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
    if (layer instanceof L.Rectangle) {
        drawing.name = "Rectangle";
        const geoJSON = layer.toGeoJSON();
        drawing.coordIndex = geoJSON.geometry.coordinates;
    }
    if (layer instanceof L.polygon){
        drawing.name = "Polygon";
        const geoJSON = layer.toGeoJSON();
        drawing.coordIndex = geoJSON.geometry.coordinates;
    }
    drawingList.push(drawing);
    layer.id = id;
    layer.name = drawing.name;
    //display
    layer.bindTooltip("ID: "+id,{permanent:true, direction:"center"});
});
//CREATED EVENT ---------------------------------------------------------------

//After a drawing has been edited:
//detects when user modifies a drawing
//EDITED EVENT ---------------------------------------------------------------
map.on(L.Draw.Event.EDITED, function(event) {
    event.layers.eachLayer(function(layer) {
        const id = layer.id;
        const name = layer.name;

        // Replace the existing object
        drawingList[id] = {
            id:id,
            name:name,
            coordIndex:layer.toGeoJSON().geometry.coordinates,
            radius: layer instanceof L.Circle ? layer.getRadius() : null,//only works for circle
        };
    });
});
//EDITED EVENT ---------------------------------------------------------------

//After a drawing has been deleted:
//detects when user deletes a drawing
//DELETED EVENT ---------------------------------------------------------------
map.on(L.Draw.Event.DELETED, function(event) {
    const deletedIDs = [];
    event.layers.eachLayer(function(layer) {
        deletedIDs.push(layer.id);
    })
    //sorting from highest to lowest
    deletedIDs.sort((a, b) => b - a);
    //deleting in order
    deletedIDs.forEach(deletedID => {
        drawingList.splice(deletedID, 1);
        drawnItems.eachLayer(function(layer) {
            if(layer.id>deletedID){
                layer.id--;
                drawingList[layer.id].id=layer.id;
                layer.setTooltipContent("ID: "+layer.id);
            }
        })
    })
});
//DELETED EVENT ---------------------------------------------------------------

//EVENTS FOR drawControl-----------------------------------------------------
