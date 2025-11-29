const sweph = require('sweph');

// Configure Swiss Ephemeris
sweph.set_sid_mode(1, 0, 0); // Lahiri

const calculate = (date, time, lat, long, tzOffsetHours) => {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    // Time in decimal hours
    let timeDecimal = hour + minute / 60.0;

    // Convert to UTC
    // IST is UTC + 5:30, so UTC = IST - 5.5
    timeDecimal = timeDecimal - tzOffsetHours;

    // Handle date change if time goes negative or > 24
    let adjustDay = 0;
    if (timeDecimal < 0) {
        timeDecimal += 24;
        adjustDay = -1;
    } else if (timeDecimal >= 24) {
        timeDecimal -= 24;
        adjustDay = 1;
    }

    const finalDay = day + adjustDay;

    console.log(`Calculating for: ${year}-${month}-${finalDay} Time(UTC): ${timeDecimal.toFixed(2)}`);

    const jul_day_ut = sweph.julday(year, month, finalDay, timeDecimal, 1);

    // Calculate Ayanamsa
    const ayanamsa = sweph.get_ayanamsa_ut(jul_day_ut);
    console.log(`Ayanamsa: ${ayanamsa}°`);

    const houses = sweph.houses(jul_day_ut, lat, long, 'P');
    const ascTropical = houses.data.points[0];
    const ascSidereal = (ascTropical - ayanamsa + 360) % 360;

    console.log(`Ascendant (Tropical): ${ascTropical}°`);
    console.log(`Ascendant (Sidereal Manual): ${ascSidereal}°`);

    return ascSidereal;
};

const lat = 16.5131;
const long = 81.7287;
const date = "1972-07-17";
const time = "02:17";

console.log("\n--- With IST Adjustment (-5.5 hours) ---");
const asc2 = calculate(date, time, lat, long, 5.5);
