//given latitude and longitude

let latitude = 84;
//Zone Letter check
let list = ["C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X"];
let calc = Math.floor(latitude/8)+10;
let zone_letter = ""
//if the calculation is less than 0 or more than 19 it's out of bounds
//from -80 to 80, set zone_letter to "Z"
if(calc <0 || calc > 19)
    zone_letter = "Z"
else zone_letter = list[Math.floor(latitude/8)+10]
//special case for X from 72 to 84
if(latitude<=84 && latitude>=72)
    zone_letter = list[19]//list[19]="X"

let longitude = -105.0;

let south_hemisphere = false
//if latitude is negative that means it's on south hemisphere
//meaning you add 10,000,000 to the final northing
if (latitude < 0)
    south_hemisphere = true

z = Math.floor((longitude+180)/6)+1;
console.log("z is "+z);
central_meridian = 6 * z - 183;
console.log("central_meridian is "+central_meridian);

//convert to radians
latitude = latitude * Math.PI / 180.0;
longitude = longitude * Math.PI / 180.0;
central_meridian = central_meridian * Math.PI / 180.0;
console.log("\n in radians:");
console.log("latitude is "+latitude);
console.log("longitude is "+longitude);
console.log("central_meridian is "+central_meridian);

//WGS84 values:
let a = 6378137.0;
let e_squared = 0.00669438;

let N = a/(Math.sqrt(1.0-(e_squared*(Math.sin(latitude)*Math.sin(latitude)))));
console.log("N is "+N);

let T = Math.tan(latitude)*Math.tan(latitude);
console.log("T is "+T);

let e_primed_squared = e_squared / (1.0-e_squared);
console.log("e_primed_squared is "+e_primed_squared);

let C = e_primed_squared * (Math.cos(latitude)*Math.cos(latitude));
console.log("C is "+C);

let A = Math.cos(latitude)*(longitude-central_meridian);
console.log("A is "+A);

let A0 = 1 - (e_squared/4.0) - ((3.0*e_squared*e_squared)/64.0) - ((5.0*e_squared*e_squared*e_squared)/256.0);
let A2 = ((3.0*e_squared)/8.0) + ((3.0*e_squared*e_squared)/32.0) + ((45.0*e_squared*e_squared*e_squared)/1024.0);
let A4 = ((15.0*e_squared*e_squared)/256.0) + ((45.0*e_squared*e_squared*e_squared)/1024.0);
let A6 = (35.0*e_squared*e_squared*e_squared)/3072.0;

let Meridional_arc = a*((A0*latitude)-(A2*Math.sin(2.0*latitude))+(A4*Math.sin(4.0*latitude))-(A6*Math.sin(6.0*latitude)));
console.log("Meridional_arc is "+Meridional_arc);

let k0 = 0.9996
let easting = 500000.0 + (k0*N*(A+(((1.0-T+C)*A*A*A)/6.0)+(((5.0-(18.0*T)+(T*T)+(72.0*C)-(58.0*e_primed_squared))*A*A*A*A*A)/120.0)));
let northing = k0*(Meridional_arc+N*Math.tan(latitude)*(((A*A)/2.0)+(((5.0-T+(9.0*C)+(4.0*C*C))*A*A*A*A)/24.0)+(((61.0-(58.0*T)+(T*T)+(600.0*C)-(330.0*e_primed_squared))*A*A*A*A*A*A)/720.0)));
if (south_hemisphere)
    northing = northing+10000000;
console.log("easting is "+easting);
console.log("northing is "+northing);
console.log("zone in "+z+zone_letter);
