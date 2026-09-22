let lat = 34.2454653;
let lng = -118.5286373;
let zoomLevel = 13;

// Create the map
const map = L.map('map').setView([lat, lng], zoomLevel);

// Add OpenStreetMap tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Create marker
let marker = L.marker([lat, lng]).addTo(map);

marker.bindPopup('Current location').openPopup();

// Get HTML elements
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const submitButton = document.getElementById('submit-button');

// Function to move the map
function goToLocation() {

    const latitude = parseFloat(latitudeInput.value);
    const longitude = parseFloat(longitudeInput.value);

    // Check if values are numbers
    if (isNaN(latitude) || isNaN(longitude)) {
        alert('Please enter both latitude and longitude.');
        return;
    }

    // Check latitude
    if (latitude < -90 || latitude > 90) {
        alert('Latitude must be between -90 and 90.');
        return;
    }

    // Check longitude
    if (longitude < -180 || longitude > 180) {
        alert('Longitude must be between -180 and 180.');
        return;
    }

    // Move map
    map.setView([latitude, longitude], 15);

    // Move marker
    marker.setLatLng([latitude, longitude]);

    // Update popup
    marker
        .setPopupContent(
            'Latitude: ' + latitude +
            '<br>Longitude: ' + longitude
        )
        .openPopup();
}

// Submit button
submitButton.addEventListener('click', goToLocation);

// Press Enter in latitude input
latitudeInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        goToLocation();
    }
});

// Press Enter in longitude input
longitudeInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        goToLocation();
    }
});