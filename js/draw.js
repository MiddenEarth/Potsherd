import {map} from "./map.js"

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
    // Constant of the shape drawn
    const layer = event.layer;
    // Add it to the map
    drawnItems.addLayer(layer);
});

//After a drawing has been edited:
//detects when user modifies a drawing
map.on(L.Draw.Event.EDITED, function(event) {
    //Nothing in function
});

//After a drawing has been deleted:
//detects when user deletes a drawing
map.on(L.Draw.Event.DELETED, function() {

});

