// Sun Position Calculation Utilities
// Calculate Sun's longitude and zodiac sign for a given date

/**
 * Calculate the Sun's position (longitude and sign) for a given date
 * Uses simplified astronomical calculations
 */
export function calculateSunPosition(dateString) {
    const date = new Date(dateString);

    // Get day of year
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Calculate Sun's longitude using simplified formula
    // This is an approximation based on the tropical zodiac
    const n = dayOfYear;
    const L = (280.460 + 0.9856474 * n) % 360;

    // Determine zodiac sign (0-11) and longitude within sign (0-30)
    const signIndex = Math.floor(L / 30);
    const longitudeInSign = L % 30;

    return {
        signIndex: signIndex,
        longitudeInSign: parseFloat(longitudeInSign.toFixed(2)),
        totalLongitude: parseFloat(L.toFixed(2))
    };
}

/**
 * Get zodiac sign name from index
 */
export function getZodiacSignName(index) {
    const signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[index % 12];
}

/**
 * Calculate Sun position with more accuracy using date and time
 * This uses a more precise algorithm
 */
export function calculateSunPositionPrecise(dateString, timeString = '12:00') {
    const date = new Date(`${dateString}T${timeString}:00`);

    // Julian Day calculation
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours() + date.getMinutes() / 60;

    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;

    let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y +
        Math.floor(y / 4) - Math.floor(y / 100) +
        Math.floor(y / 400) - 32045;

    let jd = jdn + (hour - 12) / 24;

    // Days since J2000.0
    let n = jd - 2451545.0;

    // Mean longitude of the Sun
    let L = (280.460 + 0.9856474 * n) % 360;

    // Mean anomaly
    let g = (357.528 + 0.9856003 * n) % 360;
    let gRad = g * Math.PI / 180;

    // Ecliptic longitude
    let lambda = L + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad);
    lambda = lambda % 360;
    if (lambda < 0) lambda += 360;

    // Determine sign and longitude within sign
    const signIndex = Math.floor(lambda / 30);
    const longitudeInSign = lambda % 30;

    return {
        signIndex: signIndex,
        longitudeInSign: parseFloat(longitudeInSign.toFixed(2)),
        totalLongitude: parseFloat(lambda.toFixed(2))
    };
}
