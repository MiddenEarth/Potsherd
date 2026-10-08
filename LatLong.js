//northing
let northing = 9310083.331846548;
//easting
let easting = 507318.19050147565;
//zone number
let zone =13
//zone letter
let zone_letter = "X"

                    //0   1    2    3    4    5    6    7    8    9    10   11   12   13   14   15   16   17   18   19
const list = ["C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X"];
//C D E F G H J K L M lower  0 to 9
//N P Q R S T U W X upper   10 to 19

let isSouthernHemisphere=false;
//Z is idk
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
console.log(lat)
console.log(lon)
