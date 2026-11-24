const WFS_URL =
    "https://sdmdataaccess.sc.egov.usda.gov/" +
    "Spatial2/service.ows";

const SDA_URL =
    "https://SDMDataAccess.sc.egov.usda.gov/" +
    "Tabular/post.rest";

export async function fetchMapData(bbox) {
    const [
        minLng,
        minLat,
        maxLng,
        maxLat
    ] = bbox;

    const url = new URL(WFS_URL);

    const params = {
        SERVICE: "WFS",
        VERSION: "2.0.0",
        REQUEST: "GetFeature",
        TYPENAME: "MapunitPoly",
        CRSNAME: "EPSG:4326",
        OUTPUTFORMAT: "GeoJSON",

        // USDA's EPSG:4326 axis order
        BBOX:
            `${minLat},${minLng},` +
            `${maxLat},${maxLng},EPSG:4326`
    };

    Object.entries(params).forEach(
        ([key, value]) => {
            url.searchParams.set(key, value);
        }
    );

    const response = await fetch(url);

    if (!response.ok) {
        const errorText =
            await response.text();

        throw new Error(
            `WFS request failed: ${response.status}\n` +
            errorText
        );
    }

    return await response.json();
}

export async function fetchSoilComposition(mukeys) {
    const validMukeys = [
        ...new Set(
            mukeys
                .map(mukey => Number(mukey))
                .filter(Number.isFinite)
        )
    ];

    if (validMukeys.length === 0) {
        return [];
    }

    const query = `
        SELECT
            mukey,
            cokey,
            compname,
            comppct_r
        FROM component
        WHERE mukey IN (${validMukeys.join(",")})
        ORDER BY mukey, comppct_r DESC
    `;

    const response = await fetch(SDA_URL, {
        method: "POST",

        headers: {
            "Content-Type":
                "application/x-www-form-urlencoded"
        },

        body: new URLSearchParams({
            query: query,
            format: "JSON"
        })
    });

    if (!response.ok) {
        const errorText =
            await response.text();

        throw new Error(
            `SDA request failed: ${response.status}\n` +
            errorText
        );
    }

    const result = await response.json();

    return tableToObjects(result.Table);
}

function tableToObjects(table) {
    if (!table || table.length === 0) {
        return [];
    }

    const headers = table[0];

    return table.slice(1).map(row => {
        const object = {};

        headers.forEach((header, index) => {
            object[header] = row[index];
        });

        return object;
    });
}