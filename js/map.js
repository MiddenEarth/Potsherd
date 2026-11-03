//Starting Values
let lat = 34.2454653;
let lng = -118.5286373;
let zoomLevel = 13;

// 1. Initialize the map
const map = L.map('map').setView([lat, lng], zoomLevel);

// Add OpenStreetMap tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

/* WHOLE USDA SOIL MAP
L.tileLayer.wms(
    "https://sdmdataaccess.sc.egov.usda.gov/Spatial2/service.ows",
    {
        layers: "MapunitPoly",
        styles: "",
        format: "image/png",
        transparent: true,
        version: "1.3.0",
        attribution: "USDA NRCS Soil Data Access"
    }
).addTo(map);
*/

//Exporting files
export {map};