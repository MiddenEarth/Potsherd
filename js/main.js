//initializing the modules in order
import "./map.js"   //Creates and handles the variable for the map
import "./draw.js"  //Creates and handles events for drawing inside the map
import "./buttons.js"   //Makes buttons inside the HTML work using functions that may connect with other modules



//TESTING AREA FOR CODE NOT IMPLEMENTED YET
import {drawingList} from "./draw.js";
import {fetchMapData} from "./sda.js";
import {map} from "./map.js"

//let soilLayer=null;
const SDA_URL = "https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest";


//BUTTON IN HTML LINKED TO THIS async FUNCTION
document.getElementById("getSoilData").addEventListener("click", async function (e) {
    e.preventDefault();
    const firstDrawing = drawingList[0];
    const q = querySoilByMukey("456029")
    console.log("?READING?",q);

    const result = await querySDA(
        SDA_URL,
        `SELECT ptotal_l, ptotal_r, ptotal_h
     FROM chorizon
     WHERE cokey = ?`,
        28668157
    );

    console.log(result);
    /*

        for (let i=0; i<drawingList.length; i++) {
            bindSoilWmsToCircle(drawingList[i]);
        }*/
    let userArea;

    if (firstDrawing.isCircle) {

        userArea = turf.circle(
            firstDrawing.coordinates,
            firstDrawing.radius,
            {
                steps: 64,
                units: "meters"
            }
        );

    } else {
        userArea = turf.polygon(
            firstDrawing.coordinates
        );

    }

    console.log(userArea);
    const bbox = turf.bbox(userArea);

    const soilData = await fetchMapData(bbox);
    console.log(bbox);
    const soilLayer = L.geoJSON(soilData, {
        style: {
            color: "red",
            weight: 2,
            fillColor: "orange",
            fillOpacity: 0.4
        },

        onEachFeature: (feature, layer) => {
            layer.bindPopup(`
            <b>MUKEY:</b> ${feature.properties.mukey}<br>
            <b>Symbol:</b> ${feature.properties.musym}<br>
            <b>Area:</b> ${feature.properties.muareaacres} acres
        `);
        }
    });

    soilLayer.addTo(map);
    const mapUnitInfo = soilData.features.map(feature => ({
        mukey: feature.properties.mukey,
        musym: feature.properties.musym,
        areasymbol: feature.properties.areasymbol,
        nationalmusym: feature.properties.nationalmusym,
        mupolygonkey: feature.properties.mupolygonkey,
        muareaacres: feature.properties.muareaacres
    }));

    console.log(mapUnitInfo);
    const mukeys = [
        ...new Set(soilData.features.map(
            feature => feature.properties.mukey
        ))
    ];

    const query = `
        SELECT mukey, musym, muname
        FROM mapunit
        WHERE mukey IN (${mukeys.join(",")})
    `;

    // Send request to SDA
    const response = await fetch(
        "https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                query: query,
                format: "JSON"
            })
        }
    );

    const mapUnitNames = await response.json();

    console.log("Map unit names:", mapUnitNames);
});//END OF async FUNCTION FOR BUTTON



function bindSoilWmsToCircle(object) {
    let turfPolygon;
    if(object.isCircle){
        // Turf uses [longitude, latitude].
        // Leaflet uses [latitude, longitude].
        turfPolygon = turf.circle(
            object.coordinates,
            object.radius,
            {
                units: "meters",
                steps: 128
            }
        );
    }else{
        console.log("ON NOT CIRCLE")
        turfPolygon = turf.polygon(object.coordinates);
    }


    // Convert Turf coordinates to Leaflet coordinates
    const boundary = turfPolygon.geometry.coordinates[0].map(
        ([longitude, latitude]) => [latitude, longitude]
    );

    // Create the clipped SSURGO WMS
    const soilLayer = L.tileLayer.wms.clipped(
        "https://sdmdataaccess.sc.egov.usda.gov/Spatial2/service.ows",
        {
            layers: "MapunitPoly",
            styles: "",
            format: "image/png",
            transparent: true,
            version: "1.3.0",
            attribution: "USDA NRCS Soil Data Access"
        },
        boundary
    ).addTo(map);

    soilLayer.on("tileerror", function (event) {
        console.error("USDA soil tile error:", event);
    });

    // Display the generated GeoJSON in the browser console
    console.log("SSURGO WMS boundary GeoJSON:", turfPolygon);
}


async function querySDA(url, query, mukey) {
    const sql = query.replaceAll("?", Number(mukey));
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            query: sql,
            format: "JSON+COLUMNNAME"
        })
    });
    if (!response.ok) {
        throw new Error(`SDA request failed: ${response.status}`);
    }

    return await response.json();
}
async function querySoilByMukey(mukey) {

    const sql = `
        SELECT
            c.mukey,
            c.cokey,
            c.compname,
            c.comppct_r,
            h.hzdept_r,
            h.hzdepb_r,
            h.om_r,
            h.ph1to1h2o_r,
            h.sandtotal_r,
            h.silttotal_r,
            h.claytotal_r
        FROM component AS c
        JOIN chorizon AS h
            ON c.cokey = h.cokey
        WHERE c.mukey = ${Number(mukey)}
        ORDER BY c.comppct_r DESC, h.hzdept_r;
    `;

    const response = await fetch(SDA_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            query: sql,
            format: "JSON+COLUMNNAME"
        })
    });

    if (!response.ok) {
        throw new Error(`SDA request failed: ${response.status}`);
    }
    return await response.json();

}







// Pass Leaflet's current visible map bounds
const soilData = await fetchMapData(map.getBounds());

// Convert the GeoJSON into a Leaflet layer
const soilLayer = L.geoJSON(soilData, {
    style: {
        color: "blue",
        weight: 2,
        fillOpacity: 0.1
    }
});

// Display it
soilLayer.addTo(map);


console.log(soilData);
console.log("\n\n");
console.log(soilData.features);
console.log("\n\nlength");
console.log(soilData.features[0]);


// Circle center: [longitude, latitude]
const center = [-118.5286373, 34.2454653];

// Create a 200-meter circle
const userCircle = turf.circle(center, 200, {
    steps: 64,
    units: "meters"
});

// Find USDA polygons intersecting the circle
const filteredFeatures = soilData.features.filter(feature => {
    return turf.booleanIntersects(feature, userCircle);
});

// Create a new GeoJSON FeatureCollection
const filteredSoil = {
    type: "FeatureCollection",
    features: filteredFeatures
};

console.log("Intersecting polygons:", filteredFeatures.length);

// Display results on Leaflet
L.geoJSON(filteredSoil, {
    style: {
        color: "red",
        weight: 2,
        fillOpacity: 0.2
    }
}).addTo(map);

// Display the test circle
L.geoJSON(userCircle, {
    style: {
        color: "blue",
        fillOpacity: 0.1
    }
}).addTo(map);

// First polygon's coordinates
console.log(soilData.features[0].geometry);

// First polygon's additional information
console.log(soilData.features[0].properties);


import { fetchSoilComposition } from "./sda.js";

// Extract MUKEYs from intersecting polygons
const mukeys = filteredFeatures.map(
    feature => Number(feature.properties.mukey)
);

// Fetch their soil composition
const composition = await fetchSoilComposition(mukeys);

console.log("Soil composition:", composition);

// Display intersecting soil polygons
const compositionLayer = L.geoJSON(filteredSoil, {
    style: {
        color: "red",
        weight: 2,
        fillColor: "orange",
        fillOpacity: 0.4
    },

    // Show information when clicking a polygon
    onEachFeature: function(feature, layer) {
        const properties = feature.properties;

        layer.bindPopup(`
            <b>Map Unit:</b> ${properties.musym}<br>
            <b>MUKEY:</b> ${properties.mukey}<br>
            <b>Area:</b> ${properties.muareaacres} acres
        `);
    }
});

compositionLayer.addTo(map);

// Display the 200-meter circle
L.geoJSON(userCircle, {
    style: {
        color: "blue",
        weight: 2,
        fillOpacity: 0
    }
}).addTo(map);

// Zoom to the circle
map.fitBounds(L.geoJSON(userCircle).getBounds());