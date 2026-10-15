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
latitudeInput.value = 34.2454653;
longitudeInput.value =-118.5286373;
const submitButton = document.getElementById('submit-button');
const convertButton = document.getElementById('convert-button');

const output_easting = document.getElementById('easting');
const output_northing = document.getElementById('northing');
const output_zone = document.getElementById('zone');

const buffer_input = document.getElementById('buffer');
const make_circle = document.getElementById('circle-button');

const addButton = document.getElementById('add-list');
const makePolygonButton = document.getElementById('make-list');
const clearPolygonButton = document.getElementById('clear-list');
const copyToClipboardButton = document.getElementById('copy-list');

const importButton = document.getElementById('import-list');
const importInput = document.getElementById('import-input');


//circle maker
let circle = null;

//Polygon maker
let polygonList = [];
let markerList = [];
let polygon=null;

function addList() {
    const latitude = parseFloat(latitudeInput.value);
    const longitude = parseFloat(longitudeInput.value);
    if (check(latitude, longitude))
        return;

    let cord = [latitude, longitude];
    //adds cord to the PolygonList
    addToPolygonList(cord)
    //adds to markerList using the same coordinates
    addToMarkerList(cord)
    //adds to the HTML list that stores the coordinates
    addToHtmlList(cord)
}
function addToPolygonList(cord){
    polygonList.push(cord);

}
function addToMarkerList(cord){
    //cord[0] is latitude, cord[1] is longitude
    let marker = L.marker([cord[0],cord[1]]);
    marker.addTo(map);
    let number = (markerList.length+1).toString();
    marker.bindPopup('['+cord[0]+','+cord[1]+']'+number).openPopup();
    markerList.push(marker);
}
function addToHtmlList(cord){
    let number=(markerList.length).toString();
    //Adding into HTML List
    const ul = document.getElementById('theList');
    const li = document.createElement('li');
    li.textContent = '['+cord[0]+','+cord[1]+']';
    ul.appendChild(li);
    const button = document.createElement('button');
    button.innerHTML = number;
    button.value = number;
    button.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('theList').childNodes[e.target.value-1].remove();
        formatList(e.target.value-1)
    })
    li.appendChild(button);
}
function isLetter(str){
    return str.length ===1 && str.match(/[a-z]/i);
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
//Convert()
convertButton.addEventListener('click', convert);
//makeCircle()
make_circle.addEventListener('click', makeCircle);
//addList()
addButton.addEventListener('click', addList);
//makePolygon()
makePolygonButton.addEventListener('click', makePolygon);
//clearList()
clearPolygonButton.addEventListener('click',clearList);
//importCords()
importButton.addEventListener('click',importCords)
//copyToClipboard()
copyToClipboardButton.addEventListener('click',copyToClipboard)

function convert(){
    let latitude = parseFloat(latitudeInput.value);
    //Zone Letter check
    let list = ["C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X"];
    let calc = Math.floor(latitude/8)+10;
    let zone_letter = ""
    //if the calculation is less than 0 or more than 19 it's out of bounds
    // from -80 to 80, set zone_letter to "Z"
    if(calc <0 || calc > 19)
        zone_letter = "Z"
    else zone_letter = list[Math.floor(latitude/8)+10]
    //special case for X from 72 to 84
    if(latitude<=84 && latitude>=72)
        zone_letter = list[19]//list[19]="X"
    let longitude = parseFloat(longitudeInput.value);
    let south_hemisphere = false
    //if latitude is negative that means it's on south hemisphere
    //meaning you add 10,000,000 to the final northing
    if (latitude < 0)
        south_hemisphere = true
    const z = Math.floor((longitude+180)/6)+1;
    let central_meridian = 6 * z - 183;
    //convert to radians
    latitude = latitude * Math.PI / 180.0;
    longitude = longitude * Math.PI / 180.0;
    central_meridian = central_meridian * Math.PI / 180.0;
    //WGS84 values:
    let a = 6378137.0;
    let e_squared = 0.00669438;
    let N = a/(Math.sqrt(1.0-(e_squared*(Math.sin(latitude)*Math.sin(latitude)))));
    let T = Math.tan(latitude)*Math.tan(latitude);
    let e_primed_squared = e_squared / (1.0-e_squared);
    let C = e_primed_squared * (Math.cos(latitude)*Math.cos(latitude));
    let A = Math.cos(latitude)*(longitude-central_meridian);
    let A0 = 1 - (e_squared/4.0) - ((3.0*e_squared*e_squared)/64.0) - ((5.0*e_squared*e_squared*e_squared)/256.0);
    let A2 = ((3.0*e_squared)/8.0) + ((3.0*e_squared*e_squared)/32.0) + ((45.0*e_squared*e_squared*e_squared)/1024.0);
    let A4 = ((15.0*e_squared*e_squared)/256.0) + ((45.0*e_squared*e_squared*e_squared)/1024.0);
    let A6 = (35.0*e_squared*e_squared*e_squared)/3072.0;
    let Meridional_arc = a*((A0*latitude)-(A2*Math.sin(2.0*latitude))+(A4*Math.sin(4.0*latitude))-(A6*Math.sin(6.0*latitude)));
    let k0 = 0.9996
    let easting = 500000.0 + (k0*N*(A+(((1.0-T+C)*A*A*A)/6.0)+(((5.0-(18.0*T)+(T*T)+(72.0*C)-(58.0*e_primed_squared))*A*A*A*A*A)/120.0)));
    let northing = k0*(Meridional_arc+N*Math.tan(latitude)*(((A*A)/2.0)+(((5.0-T+(9.0*C)+(4.0*C*C))*A*A*A*A)/24.0)+(((61.0-(58.0*T)+(T*T)+(600.0*C)-(330.0*e_primed_squared))*A*A*A*A*A*A)/720.0)));
    if (south_hemisphere)
        northing = northing+10000000;
    output_easting.value = easting;
    output_northing.value = northing;
    output_zone.value = z+zone_letter;
}

// Function to move the map
function goToLocation() {

    const latitude = parseFloat(latitudeInput.value);
    const longitude = parseFloat(longitudeInput.value);

    if (check(latitude, longitude))
        return;

    // Move mapj
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

//Circle Maker
function makeCircle() {
    const latitude = parseFloat(latitudeInput.value);
    const longitude = parseFloat(longitudeInput.value);
    const buffer = parseFloat(buffer_input.value);
    if (isNaN(buffer))
        return;
    if (check(latitude, longitude)) {
        return;
    }
    if (circle!=null)
        circle.removeFrom(map);
    circle = L.circle([latitude, longitude], {radius : buffer});
    circle.addTo(map);
}
//Clears Map
function clearList() {
    if (polygon!=null) {
        polygon.removeFrom(map);
        polygon = null;
    }
    if (circle!=null){
        circle.removeFrom(map);
        circle = null;
    }

    polygonList = [];
    for (let i = 0; i < markerList.length; i++) {
        markerList[i].removeFrom(map);
    }
    markerList = [];
    //Removes the whole HTML list
    const ul = document.getElementById('theList');
    const numberOfChildren = ul.children.length;

    for (let i = 0; i < numberOfChildren; i++) {
        const lastItem = ul.lastElementChild;
        lastItem.remove();
    }
}
//makes polygon with polygonList, sets polygon
function makePolygon() {
    if(polygon!=null){
        polygon.removeFrom(map);
    }
    polygon = L.polygon(polygonList);
    polygon.addTo(map);
    map.fitBounds(polygon.getBounds());
}

//changes HTML list to the order of the new list (after removing an item inside the list)
function formatList(number){
    const ul = document.getElementById('theList');
    const numberOfChildren = ul.children.length;
    for (let i = number; i < numberOfChildren; i++) {
        ul.childNodes[i].lastChild.innerHTML = (i+1).toString();
        ul.childNodes[i].lastChild.value = (i+1).toString();
    }
    //number is 1
    markerList[number].removeFrom(map);
    for (let i = number; i < markerList.length; i++) {
        markerList[i].bindPopup(i.toString());
    }
    //remove from markerList
    markerList.splice(number,1);
    polygonList.splice(number,1);
}

//Checks latitude and longitude before doing operations
function check(latitude, longitude) {
    // Check if values are numbers
    if (isNaN(latitude) || isNaN(longitude)) {
        alert('Please enter both latitude and longitude.');
        return true;
    }
    // Check latitude
    if (latitude < -90 || latitude > 90) {
        alert('Latitude must be between -90 and 90.');
        return  true;
    }
    // Check longitude
    if (longitude < -180 || longitude > 180) {
        alert('Longitude must be between -180 and 180.');
        return true;
    }
    return false;
}
function copyToClipboard(){
    if (polygonList.length===0){
        alert("nothing to copy");
        return;
    }
    let message="";
    for (let i=0; i<polygonList.length; i++){
        message+="[";
        //latitude
        message+=(polygonList[i][0]).toString();
        message+=", ";
        //longitude
        message+=(polygonList[i][1]).toString();
        message+="]";
    }
    navigator.clipboard.writeText(message).then(()=>{
        alert("Copied!");
    } );
}
function importCords(){
    //whole string: [lat, long], [latitude, longitude]
    let whole = importInput.value

    let first =0.0;
    let second =0.0;

    let pointer=0;
    let list=[];
    //start and end cannot be true at the same time
    for (let i = 0; i < whole.length; i++) {
        if (whole[i] === '['){
            pointer = i+1;
            continue;
        }
        if(isLetter(whole[i])){
            alert('No Letters allowed.')
            return;
        }
        if(whole[i]===','){
            first = parseFloat(whole.slice(pointer, i));
            pointer = i +1;
            continue;
        }
        if (whole[i]===']'){
            second = parseFloat(whole.slice(pointer, i));
        }

        if (first!==0 && second!==0){
            let cord = [first,second];
            if(isNaN(first)||isNaN(second)){
                return;
            }
            list.push(cord);
            first = 0;
            second = 0;
        }
    }
    for (let i = 0; i < list.length; i++) {
        let cord = list[i];
        //adds cord to the PolygonList
        addToPolygonList(cord)
        //adds to markerList using the same coordinates
        addToMarkerList(cord)
        //adds to the HTML list that stores the coordinates
        addToHtmlList(cord)
    }
    makePolygon();
}