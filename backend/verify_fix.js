const { calculatePlanetaryPositions } = require('./astroService');

console.log("Verifying Fix for User Case...");
const date = "1972-07-17";
const time = "02:17";
const lat = 16.5131;
const long = 81.7287;
const timezone = 5.5; // IST

const positions = calculatePlanetaryPositions(date, time, lat, long, timezone);

console.log("Calculated Ascendant:", positions.Ascendant.longitude);

// Convert decimal to DMS for easy comparison
const toDMS = (deg) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.floor(((deg - d) * 60 - m) * 60);
    return `${d}° ${m}' ${s}"`;
};

console.log("Calculated Ascendant (DMS):", toDMS(positions.Ascendant.longitude));
console.log("Expected Ascendant (User): ~043° 18′ 39″");
