//latitude
let latitude = 83.838321212121212122112;
//longitude
let longitude = -104.389292;

//Zone Letter check
const list = ["C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X"];
let calc = Math.floor(latitude/8)+10;
let zone_letter = "";
//if the calculation is less than 0 or more than 19 it's out of bounds
//from -80 to 80, set zone_letter to "Z"
if(calc <0 || calc > 19)
    zone_letter = "Z";
else zone_letter = list[calc];
//special case for X from 72 to 84
if(latitude<=84 && latitude>=72)
    zone_letter = list[19]//list[19]="X"


let south_hemisphere = false
//if latitude is negative that means it's on south hemisphere
//meaning you add 10,000,000 to the final northing
if (latitude < 0)
    south_hemisphere = true

const z = Math.floor((longitude+180)/6)+1;
const central_meridian = (6 * z - 183)*Math.PI / 180.0;

//convert to radians
latitude = latitude * Math.PI / 180.0;
longitude = longitude * Math.PI / 180.0;

//WGS84 values:
const a = 6378137.0;
const e_squared = 0.00669438;
const N = a/(Math.sqrt(1.0-(e_squared*(Math.sin(latitude)*Math.sin(latitude)))));
const T = Math.tan(latitude)*Math.tan(latitude);
const e_primed_squared = e_squared / (1.0-e_squared);
const C = e_primed_squared * (Math.cos(latitude)*Math.cos(latitude));
const A = Math.cos(latitude)*(longitude-central_meridian);
const A0 = 1 - (e_squared/4.0) - ((3.0*e_squared*e_squared)/64.0) - ((5.0*e_squared*e_squared*e_squared)/256.0);
const A2 = ((3.0*e_squared)/8.0) + ((3.0*e_squared*e_squared)/32.0) + ((45.0*e_squared*e_squared*e_squared)/1024.0);
const A4 = ((15.0*e_squared*e_squared)/256.0) + ((45.0*e_squared*e_squared*e_squared)/1024.0);
const A6 = (35.0*e_squared*e_squared*e_squared)/3072.0;
const Meridional_arc = a*((A0*latitude)-(A2*Math.sin(2.0*latitude))+(A4*Math.sin(4.0*latitude))-(A6*Math.sin(6.0*latitude)));
const k0 = 0.9996

let easting = 500000.0 + (k0*N*(A+(((1.0-T+C)*A*A*A)/6.0)+(((5.0-(18.0*T)+(T*T)+(72.0*C)-(58.0*e_primed_squared))*A*A*A*A*A)/120.0)));
let northing = k0*(Meridional_arc+N*Math.tan(latitude)*(((A*A)/2.0)+(((5.0-T+(9.0*C)+(4.0*C*C))*A*A*A*A)/24.0)+(((61.0-(58.0*T)+(T*T)+(600.0*C)-(330.0*e_primed_squared))*A*A*A*A*A*A)/720.0)));
if (south_hemisphere)
    northing = northing+10000000;
console.log("easting is "+easting);
console.log("northing is "+northing);
console.log("zone in "+z+zone_letter);

