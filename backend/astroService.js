const sweph = require('sweph');
const path = require('path');

// Configure Swiss Ephemeris path
// sweph.set_ephe_path(path.join(__dirname, 'ephemeris'));

// Set Sidereal Mode to Lahiri (Ayansmsha)
// SE_SIDM_LAHIRI = 1
sweph.set_sid_mode(1, 0, 0);

const calculatePlanetaryPositions = (date, time, lat, long, timezone = 5.5) => {
    // Parse date and time
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    // Convert time to decimal hours
    let timeDecimal = hour + minute / 60.0;

    // Convert to UTC
    timeDecimal = timeDecimal - timezone;

    // Handle day rollover for Julian Day calculation
    // sweph.julday handles large hours, but let's be explicit if needed.
    // Actually, sweph.julday(year, month, day, hour, ...) handles hour overflow/underflow.
    // So we can just pass the modified timeDecimal directly.

    // Calculate Julian Day (UT)
    const jul_day_ut = sweph.julday(year, month, day, timeDecimal, 1);

    const {
        SE_SUN, SE_MOON, SE_MARS, SE_MERCURY, SE_JUPITER, SE_VENUS, SE_SATURN, SE_MEAN_NODE,
        SEFLG_SWIEPH, SEFLG_SIDEREAL, SEFLG_SPEED
    } = sweph.constants;

    const planets = {
        Sun: SE_SUN,
        Moon: SE_MOON,
        Mars: SE_MARS,
        Mercury: SE_MERCURY,
        Jupiter: SE_JUPITER,
        Venus: SE_VENUS,
        Saturn: SE_SATURN,
        Rahu: SE_MEAN_NODE,
        Ketu: null
    };

    const results = {};

    for (const [name, planetId] of Object.entries(planets)) {
        if (planetId !== null) {
            const iflag = SEFLG_SWIEPH | SEFLG_SIDEREAL | SEFLG_SPEED;
            const result = sweph.calc_ut(jul_day_ut, planetId, iflag);

            // result.data = [longitude, latitude, distance, speed, ...]
            if (result.data) {
                results[name] = {
                    longitude: result.data[0],
                    speed: result.data[3],
                    house: null
                };
            } else {
                // Fallback or error handling
                results[name] = { longitude: 0, speed: 0, error: "No data" };
            }
        }
    }

    // Calculate Ketu
    if (results.Rahu) {
        let ketuLong = (results.Rahu.longitude + 180) % 360;
        results.Ketu = {
            longitude: ketuLong,
            speed: results.Rahu.speed
        };
    }

    // Calculate Ascendant (Lagna)
    // sweph.houses returns Tropical positions. We must subtract Ayanamsa for Sidereal.
    const ayanamsa = sweph.get_ayanamsa_ut(jul_day_ut);
    const houses = sweph.houses(jul_day_ut, lat, long, 'P');

    // houses.data.points[0] is Ascendant
    const ascTropical = houses.data.points[0];
    const ascSidereal = (ascTropical - ayanamsa + 360) % 360;

    results.Ascendant = {
        longitude: ascSidereal
    };

    return results;
};

module.exports = { calculatePlanetaryPositions };
