//Module used to communicate with usda for soil surveys

//Function that is used to get a GeoJSON of an area using bbox (bounded box)
export async function fetchMapData(bbox) {

    // Get the map boundaries
    const [minLng, minLat, maxLng, maxLat] = bbox;

    // USDA WFS request
    const url = new URL(
        "https://sdmdataaccess.sc.egov.usda.gov/Spatial2/service.ows"
    );

    const params = {
        SERVICE: "WFS",
        VERSION: "2.0.0",
        REQUEST: "GetFeature",
        TYPENAME: "MapunitPoly",
        CRSNAME: "EPSG:4326",
        OUTPUTFORMAT: "GeoJSON",

        // EPSG:4326 uses latitude, longitude axis order here
        BBOX: `${minLat},${minLng},${maxLat},${maxLng},EPSG:4326`
    };

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        console.log("Received soil polygons:", data);

        return data;

    } catch (error) {
        console.error("Failed to fetch soil polygons:", error);
    }
}//END OF FUNCTION FOR GeoJSON

//SQL query using fetch to obtain information like the components, major component etc
//input is a unique mukey (Map Unit Key)
export async function fetchSoilComposition(mukeys) {

    // Remove duplicate MUKEYs
    const uniqueKeys = [...new Set(mukeys)];

    // Build SQL query
    const query = `
        SELECT
            mu.mukey AS MUKEY,
            mu.musym AS MapUnitSymbol,
            mu.muname AS MapUnitName,
            c.cokey AS COKEY,
            c.compname AS ComponentName,
            c.comppct_r AS ComponentPercent,
            c.majcompflag AS MajorComponent
        FROM mapunit AS mu
        INNER JOIN component AS c
            ON mu.mukey = c.mukey
        WHERE mu.mukey IN (${uniqueKeys.join(",")})
        ORDER BY mu.mukey, c.comppct_r DESC
    `;

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

    if (!response.ok) {
        throw new Error(`SDA request failed: ${response.status}`);
    }

    return await response.json();
}//END of information fetch query