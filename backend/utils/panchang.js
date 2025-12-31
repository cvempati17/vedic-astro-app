const { calculatePlanetaryPositions } = require('../astroService');

const TITHIS = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti",
    "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
    "Trayodashi", "Chaturdashi", "Purnima", // Shukla 15
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti",
    "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
    "Trayodashi", "Chaturdashi", "Amavasya" // Krishna 30
];

const NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const YOGAS = [
    "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Sobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const KARANAS = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", // Chara (Moving)
    "Shakuni", "Chatushpada", "Naga", "Kimstughna" // Sthira (Fixed)
];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Calculates Panchang elements for a given date/time/location
 */
const calculatePanchang = (date, time, lat, long, timezone) => {
    // 1. Get Planetary Positions (Sun, Moon) using existing service
    const positions = calculatePlanetaryPositions(date, time, lat, long, timezone);

    // Safety check
    if (!positions || !positions.Sun || !positions.Moon) {
        throw new Error("Failed to calculate planetary positions for Panchang.");
    }

    const sunLong = positions.Sun.longitude;
    const moonLong = positions.Moon.longitude;

    // 2. Tithi Calculation
    // Difference between Moon and Sun / 12 degrees
    // Ensure positive difference
    let diff = moonLong - sunLong;
    if (diff < 0) diff += 360;

    const tithiIndex = Math.floor(diff / 12);
    // Determine Paksha (Shukla 0-14, Krishna 15-29)
    const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
    const tithiName = TITHIS[tithiIndex % 30]; // Handle potential overlap just in case

    // 3. Nakshatra Calculation (Moon)
    const nakshatraIndex = Math.floor(moonLong / 13.333333);
    const nakshatraName = NAKSHATRAS[nakshatraIndex % 27];

    // 4. Yoga Calculation
    // Sum of Sun + Moon / 13 deg 20 min
    const sum = (sunLong + moonLong) % 360;
    const yogaIndex = Math.floor(sum / 13.333333);
    const yogaName = YOGAS[yogaIndex % 27];

    // 5. Karana Calculation
    // Half-tithi (6 degrees)
    const karanaIndexVal = Math.floor(diff / 6);
    // Mapping Karana index to names requires logic as they cycle
    let karanaName = "";
    if (karanaIndexVal === 0) karanaName = "Kimstughna";
    else if (karanaIndexVal >= 57) karanaName = getFixedKarana(karanaIndexVal);
    else {
        // Cycle through 7 Chara Karanas: Bava(1) ... Vishti(7) ... Bava(8)
        const cycleIdx = (karanaIndexVal - 1) % 7;
        karanaName = KARANAS[cycleIdx];
    }

    // 6. Weekday
    const d = new Date(`${date}T${time}`); // Beware: browser/server local time parsing
    // Better to use explicit date constructor from helper or passed arguments if timezone sensitive
    // The date passed string "YYYY-MM-DD" is agnostic. 
    // Constructing date object for Day of Week should be done carefully. 
    // Assuming input date is the local date intended.
    const dayOfWeek = new Date(date).getDay();
    const weekdayName = WEEKDAYS[dayOfWeek];

    return {
        tithi: { index: tithiIndex + 1, name: tithiName, paksha },
        nakshatra: { index: nakshatraIndex + 1, name: nakshatraName },
        yoga: { index: yogaIndex + 1, name: yogaName },
        karana: { name: karanaName },
        weekday: weekdayName,
        positions // Return raw positions for Lagna etc.
    };
};

const getFixedKarana = (kIndex) => {
    // 57: Shakuni, 58: Chatushpada, 59: Naga, 60(0): Kimstughna logic is handled inside index 0 check
    if (kIndex === 57) return "Shakuni";
    if (kIndex === 58) return "Chatushpada";
    if (kIndex === 59) return "Naga";
    return "Kimstughna"; // Fallback
};

module.exports = {
    calculatePanchang,
    TITHIS,
    NAKSHATRAS,
    YOGAS,
    KARANAS,
    WEEKDAYS
};
