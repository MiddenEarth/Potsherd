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

//Exporting files
export {map};