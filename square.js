console.log("\n\nTRYING:");
let lat = 34.2454653;
let lng = -118.5286373;
function square(latitude, longitude) {

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
    return [easting,northing,z,zone_letter]
}
let mainPoint = square(lat, lng);
console.log(mainPoint)


function squareCoordinates(utm,width,height){
    let fourCords=[];
    let additionSubtraction=[height/2,-1*(height/2),-1*(height/2),height/2,  width/2,width/2,-(width/2),-1*(width/2)];
    for (let i=0; i<4; i++){
        //northing
        let northing = utm[1]+additionSubtraction[i];
        //easting
        let easting = utm[0]+additionSubtraction[i+4];
        //zone number
        let zone =utm[2];
        //zone letter
        let zone_letter = utm[3].toString();
        const list = ["C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X"];
        let isSouthernHemisphere=false;
        //Z
        if (list.includes(zone_letter)){
            if (list.indexOf(zone_letter) < 10){
                //lower hemisphere
                isSouthernHemisphere=true;
            }else if (list.indexOf(zone_letter) > 9){
                //upper hemisphere
                isSouthernHemisphere=false;
            }
        }
        //special case for Z, making it always false
        if (zone_letter === "Z"){
            isSouthernHemisphere=false;
        }
        //constants
        const a = 6378137.0;
        const f = 1 / 298.257223563;
        const b = a * (1 - f);
        const e = Math.sqrt(1 - (b * b) / (a * a));
        const ePrimeSq = (e * e) / (1 - e * e);
        const k0 = 0.9996;
        const E0 = 500000.0;
        const x = easting - E0;
        const y = isSouthernHemisphere ? northing - 10000000.0 : northing;
        const M = y / k0;
        const mu = M / (a * (1 - (e * e) / 4 - (3 * Math.pow(e, 4)) / 64 - (5 * Math.pow(e, 6)) / 256));
        const e1 = (1 - Math.sqrt(1 - e * e)) / (1 + Math.sqrt(1 - e * e));
        const J1 = (3 * e1 / 2) - (27 * Math.pow(e1, 3) / 32);
        const J2 = (21 * e1 * e1 / 16) - (55 * Math.pow(e1, 4) / 32);
        const J3 = (151 * Math.pow(e1, 3) / 96);
        const J4 = (1097 * Math.pow(e1, 4) / 512);
        const fpLat = mu + J1 * Math.sin(2 * mu) + J2 * Math.sin(4 * mu) + J3 * Math.sin(6 * mu) + J4 * Math.sin(8 * mu);
        const sinFp = Math.sin(fpLat);
        const cosFp = Math.cos(fpLat);
        const tanFp = Math.tan(fpLat);
        const N1 = a / Math.sqrt(1 - e * e * sinFp * sinFp);
        const R1 = a * (1 - e * e) / Math.pow(1 - e * e * sinFp * sinFp, 1.5);
        const T1 = tanFp * tanFp;
        const C1 = ePrimeSq * cosFp * cosFp;
        const D = x / (N1 * k0);
        const lon0 = (zone * 6) - 183;
        const lon0Rad = lon0 * Math.PI / 180;
        //end of constants
        let latRad = fpLat - (N1 * tanFp / R1) * (
            (D * D) / 2 -
            (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ePrimeSq) * Math.pow(D, 4) / 24 +
            (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ePrimeSq - 3 * C1 * C1) * Math.pow(D, 6) / 720
        );

        let lonRad = lon0Rad + (1 / cosFp) * (
            D -
            (1 + 2 * T1 + C1) * Math.pow(D, 3) / 6 +
            (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ePrimeSq + 24 * T1 * T1) * Math.pow(D, 5) / 120
        );
        let lat = latRad*180/Math.PI
        let lon =lonRad*180/Math.PI
        lat = Math.round(lat*100000000)
        lon = Math.round(lon*100000000)
        lat = lat/100000000
        lon = lon/100000000
        fourCords.push([lat,lon])
    }
    return fourCords;

}
//width height
let squareCords = squareCoordinates(mainPoint,5000,5000)
console.log(squareCords);
console.log("\n\n");
console.log(lat+"  "+lng);