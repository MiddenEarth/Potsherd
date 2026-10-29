let lat = 34.2454653;
let lng = -118.5286373;
let zoomLevel = 13;

// Create the map
const map = L.map('map').setView([lat, lng], zoomLevel);

// Add OpenStreetMap tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


L.tileLayer.wms(
    "https://sdmdataaccess.sc.egov.usda.gov/Spatial2/service.ows",
    {
        layers: "MapunitPoly",
        format: "image/png",
        transparent: true,
        version: "1.3.0",
        attribution: "USDA NRCS Soil Data Access"
    }
).addTo(map);


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
//circle state tracks if there is a circle created
let circle = null;  //Only null when there isn't a circle

//Polygon maker
//cord list are made of 2 numbers [latitude,longitude]
let polygonList = [];   //Handles all the cord lists to form a polygon
//saves the markers created so we can edit/delete them later
//oldest are first, newest are last in the list
let markerList = [];    //Handler all the created markers
//polygon state just tracks if there is a polygon created
let polygon=null;   //Only null when there isn't a polygon

//AddList function for the addButton event listener
//Handles adding a new pair of coordinates to markerList, polygonList and HTML list
function addList() {
    const latitude = parseFloat(latitudeInput.value);   //constant for latitude
    const longitude = parseFloat(longitudeInput.value); //constant for longitude
    if (check(latitude, longitude))     //Checking if lat and lon are in correct format
        return;                         //True=not in correct format so returns

    //cord is a list of 2 numbers, the first is latitude and the second is longitude.
    let cord = [latitude, longitude];   //Setting up the value to add on the lists
    //adds cord to the PolygonList
    addToPolygonList(cord)
    //adds to markerList using the same coordinates
    addToMarkerList(cord)
    //adds to the HTML list that stores the coordinates
    addToHtmlList(cord)
}
//Specialized function to add to the polygon list
function addToPolygonList(cord){
    polygonList.push(cord); //cord is [latitude,longitude]->[number, number]
}
//Function to add a marker to the markerList using a cord list
function addToMarkerList(cord){
    //cord[0] is latitude, cord[1] is longitude
    let marker = L.marker([cord[0],cord[1]]);   //Sets marker with the given latitude and longitude
    marker.addTo(map);  //Adds created marker to the map
    //number is how many markers are inside the list of markerList
    let number = (markerList.length+1).toString();  //Creates a string of the length of markerList
    marker.bindPopup('['+cord[0]+','+cord[1]+']'+number).openPopup();   //Displays on the map e.g:[lat,lon] 1
    markerList.push(marker);    //Adds the marker to the markerList
}
//Function to add Item to list in HTML using a cord list
//cord[0] is the latitude and cord[1] is the longitude
function addToHtmlList(cord){
    let number=(markerList.length).toString();  //length of the current markerList
    //Adding into HTML List
    const ul = document.getElementById('theList');  //constant for the list
    //creating an item for the list
    const li = document.createElement('li');        //constant of created item
    li.textContent = '['+cord[0]+','+cord[1]+']';   //Setting the item's textContent to [latitude,longitude] format
    ul.appendChild(li);                             //adding the item to the list
    //creating a button
    const button = document.createElement('button');    //constant of created button
    button.innerHTML = number;  //Setting button's innerHTML to how many markers are inside markerList
    button.value = number;      //Setting button's value
    //Event Listener for each button
    button.addEventListener('click', function(e) {
        e.preventDefault(); //Prevents from reloading page on use
        //Points at its own value and removes that number item
        document.getElementById('theList').childNodes[e.target.value-1].remove();
        formatList(e.target.value-1)    //After removed format the list based on what was removed
    })//At the end of this function the list will show everything but the removed item
    li.appendChild(button); //This links the button to the item instead of the list
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

    const latitude = parseFloat(latitudeInput.value);   //constant for latitude
    const longitude = parseFloat(longitudeInput.value); //constant for longitude

    if (check(latitude, longitude))     //Checking if lat and lon are in correct format
        return;                         //True=not in correct format so returns

    // Move map
    map.setView([latitude, longitude], 15); //Sets map view of the coordinates

    // Move marker
    marker.setLatLng([latitude, longitude]);    //Creates a marker in the coordinates

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
    const latitude = parseFloat(latitudeInput.value);   //constant for latitude
    const longitude = parseFloat(longitudeInput.value); //constant for longitude
    const buffer = parseFloat(buffer_input.value);      //constant for the buffer
    if (isNaN(buffer))      //If buffer is not a number return
        return;
    if (check(latitude, longitude)) {   //Checking if lat and lon are in correct format
        return;                         //True=not in correct format so returns
    }
    if (circle!=null)   //If circle exists already
        circle.removeFrom(map); //removes circle object from map

    circle = L.circle([latitude, longitude], {radius : buffer});
    //Creates a circle with coordinate(latitude,longitude) and radius of buffer
    circle.addTo(map);  //Adds the circle object to map
}

//Clears Map
function clearList() {
    if (polygon!=null) {            //If polygon  exists
        polygon.removeFrom(map);    //Remove polygon object from the map
        polygon = null;             //Set polygon object to null(non-existent)
    }
    if (circle!=null){              //If circle exists
        circle.removeFrom(map);     //Remove circle object from the map
        circle = null;              //Set circle object to null(non-existent)
    }

    polygonList = [];               //Sets polygonList to starting value [](nothing in the list)
    for (let i = 0; i < markerList.length; i++) {   //For every item inside markerList
        markerList[i].removeFrom(map);  //Removes that object from the map
    }
    markerList = [];        //Sets markerList to starting value [](nothing in the list)
    //Removing the whole list inside the HTML
    const ul = document.getElementById('theList');  //Constant for the list
    const numberOfChildren = ul.children.length;    //How many coordinates inside the list

    for (let i = 0; i < numberOfChildren; i++) {    //For every item in the HTML list
        const lastItem = ul.lastElementChild;       //constant of the lastChild
        lastItem.remove();                                  //Removes it from HTML
    }   //At the end of for loop there will be no items in the list
}

//makes polygon with polygonList, sets polygon
function makePolygon() {
    if(polygon!=null){                  //If polygon already exists
        polygon.removeFrom(map);        //we remove it from the map to add a new one
    }
    polygon = L.polygon(polygonList);   //creates a polygon with coordinates(polygonList)
    polygon.addTo(map);                 //Displays polygon object on the map
    map.fitBounds(polygon.getBounds()); //Sets the map to view the polygon object
}

//changes HTML list to the order of the new list (after removing an item inside the list)
function formatList(number){
    //number is the position of the changed item in theList
    const ul = document.getElementById('theList');  //constant of theList element
    const numberOfChildren = ul.children.length;    //constant of how many children theList element has
    for (let i = number; i < numberOfChildren; i++) {   //repeat for each children in theList starting at number
        ul.childNodes[i].lastChild.innerHTML = (i+1).toString();    //change innerHTML to correct one
        ul.childNodes[i].lastChild.value = (i+1).toString();    //also change the value to the correct one
    }
    //number is the one deleted from theList
    markerList[number].removeFrom(map); //removes it from the map
    for (let i = number; i < markerList.length; i++) {//for each marker in the markerList starting at number
        markerList[i].bindPopup(i.toString());  //changes the popup to the correct one
    }
    //remove from markerList
    markerList.splice(number,1);    //removes deleted item from markerList
    polygonList.splice(number,1);   //removes deleted item from polygonList
}

//Checks latitude and longitude before doing operations
//Function return true if it failed the checks
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
//Function connected to copyToClipboardButton
//Used to put the created list into your clipboard
//format:[x1,y1],[x2,y2],[x3,y3]
function copyToClipboard(){
    if (polygonList.length===0){    //In case of no list
        alert("nothing to copy");   //states that there is nothing to copy then returns
        return;
    }
    let message=""; //the message that will be in the clipboard
    for (let i=0; i<polygonList.length; i++){
        //for every item inside polygonList adds the following to the message
        message+="[";
        //latitude
        message+=(polygonList[i][0]).toString();
        message+=", ";
        //longitude
        message+=(polygonList[i][1]).toString();
        message+="]";
    }//At the end of the for loop the message will be completed
    //function to copy to clipboard with the message
    navigator.clipboard.writeText(message).then(()=>{
        alert("Copied!");
    } );
}

//Special function to see if a string is a letter
function isLetter(str){ //input of a single character
    return str.length ===1 && str.match(/[a-z]/i);  //returns true if a letter
}

//Function to read a string that has a list of coordinates
//used to add markers and coordinates to theList(to create a polygon on map)
//format:[x1,y1],[x2,y2],[x3,y3]
function importCords(){
    //whole string: [lat, long], [latitude, longitude]
    let whole = importInput.value

    let first =0.0; //first used to store the x1,x2,x3
    let second =0.0;//second used to store the y1,y2,y3

    let pointer=0;  //Set pointer to 0
    let list=[];    //Creates an empty list so we can add the coordinates in

    for (let i = 0; i < whole.length; i++) {//repeat for the whole string
        if(isLetter(whole[i])){     //if character is a letter then
            alert('No Letters allowed.')    //Alert the user that there can't be letters and returns
            return;
        }
        if (whole[i] === '['){  //in case the character is '['
            pointer = i+1;      //sets the pointer to the next character
            continue;           //skips the rest
        }
        if(whole[i]===','){     //in case the character is ','
            first = parseFloat(whole.slice(pointer, i));    //It gets the first number (x)
            pointer = i +1;     //sets the new point after the character
            continue;           //skips the rest
        }
        if (whole[i]===']'){    //in case the character is ']'
            second = parseFloat(whole.slice(pointer, i));   //It gets the second number (y)
        }

        //If both numbers are stored then
        if (first!==0 && second!==0){
            let cord = [first,second];  //creates cord list [first,second]
            if(isNaN(first)||isNaN(second)){     //in case either number is NaN(not a number) it returns
                return;
            }
            list.push(cord);    //adds the cord list to the list
            first = 0;          //sets first to 0
            second = 0;         //sets second to 0
        }
    }//At the end of for loop each found pair in the string will be in the list
    for (let i = 0; i < list.length; i++) {     //for each item inside the list
        let cord = list[i];
        //adds cord to the PolygonList
        addToPolygonList(cord)
        //adds to markerList using the same coordinates
        addToMarkerList(cord)
        //adds to the HTML list that stores the coordinates
        addToHtmlList(cord)
    }
}//End of function all the imported list will appear at the HTML list