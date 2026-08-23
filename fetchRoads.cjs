const fs = require('fs');
const osmtogeojson = require('osmtogeojson');

const query = `[out:json][timeout:25];
(
  way["highway"~"trunk|primary|secondary|tertiary|motorway"](19.95,73.68,20.05,73.85);
  way["bridge"="yes"](19.95,73.68,20.05,73.85);
);
out body;
>;
out skel qt;`;

async function fetchRoads() {
  try {
    const res = await fetch('https://overpass.osm.ch/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'HydroPulse/1.0 (Contact: myemail@example.com)'
      },
      body: 'data=' + encodeURIComponent(query)
    });
    
    if (!res.ok) {
      console.error('HTTP Error', res.status);
      console.log(await res.text());
      return;
    }
    
    const osmJson = await res.json();
    const geoJson = osmtogeojson(osmJson);
    fs.writeFileSync('C:/Users/Soham Banerjee/Downloads/hydro-pulse/src/data/geostatial/gangapur/roads.geojson', JSON.stringify(geoJson, null, 2));
    console.log('Saved roads.geojson');
  } catch (err) {
    console.error(err);
  }
}

fetchRoads();
