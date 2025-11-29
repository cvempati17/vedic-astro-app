const { calculatePlanetaryPositions } = require('./astroService');

try {
    console.log("Testing Planetary Calculation...");
    const date = "2000-01-01";
    const time = "12:00";
    const lat = 28.6139; // New Delhi
    const long = 77.2090;

    const positions = calculatePlanetaryPositions(date, time, lat, long);
    console.log("Positions:", JSON.stringify(positions, null, 2));
} catch (error) {
    console.error("Test Failed:", error);
}
