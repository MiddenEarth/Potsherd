import "./map.js"

import "./draw.js"

import "./buttons.js"

import {drawingList} from "./draw.js";
import {fetchMapData} from "./sda.js";
import {map} from "./map.js"

document.getElementById("getSoilData").addEventListener("click", async function (e) {
    e.preventDefault();
    const firstDrawing = drawingList[0];

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
});


/*
import { fetchMapData } from "./sda.js";
import {map} from "./map.js"
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
map.fitBounds(L.geoJSON(userCircle).getBounds());*/