//initializing the modules in order
import "./map.js"   //Creates and handles the variable for the map
import "./draw.js"  //Creates and handles events for drawing inside the map
import "./buttons.js"   //Makes buttons inside the HTML work using functions that may connect with other modules



//TESTING AREA FOR CODE NOT IMPLEMENTED YET
import {drawingList} from "./draw.js";
import {map} from "./map.js"
import {
    fetchMapData,
    fetchSoilComposition
} from "./sda.js";

//let soilLayer=null;
const SDA_URL = "https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest";


//BUTTON IN HTML LINKED TO THIS async FUNCTION
document.getElementById("getSoilData").addEventListener("click", async function(event) {
            event.preventDefault();

            if (drawingList.length === 0) {console.error("There are no drawings.");
                return;
            }

            const firstDrawing = drawingList[0];

            let userArea;

            if (firstDrawing.name === "Circle") {
                userArea = turf.circle(
                    firstDrawing.coordIndex,
                    firstDrawing.radius,
                    {
                        steps: 64,
                        units: "meters"
                    }
                );
            } else if (firstDrawing.name === "Rectangle" || firstDrawing.name === "Polygon") {
                userArea = turf.polygon(
                    firstDrawing.coordIndex
                );
            } else {
                console.error("Unknown drawing type:", firstDrawing.name);
                return;
            }

            const bbox = turf.bbox(userArea);

            console.log("Drawing:", firstDrawing);

            console.log("Bounding box:", bbox);

            try {
                const soilData = await fetchMapData(bbox);

                console.log("Soil regions:", soilData);

                const soilLayer = L.geoJSON(soilData, {
                            style: {
                                color: "red",
                                weight: 2,
                                fillColor: "orange",
                                fillOpacity: 0.4
                            },

                            onEachFeature: (feature, layer) => {
                                const properties = feature.properties;
                                layer.bindPopup(`
                                    <strong>MUKEY:</strong>${properties.mukey}<br>
                                    <strong>Symbol:</strong>${properties.musym}<br>
                                    <strong>Area:</strong>${properties.muareaacres} acres
                                `);
                            }
                });
                soilLayer.addTo(map);

                const mukeys = [
                    ...new Set(soilData.features.map(
                            feature => feature.properties.mukey
                    ))
                ];
                console.log("MUKEYs:", mukeys);

                const composition = await fetchSoilComposition(mukeys);

                console.log("Soil composition:", composition);

            } catch (error) {
                console.error("Soil data process failed:", error);
            }
});

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