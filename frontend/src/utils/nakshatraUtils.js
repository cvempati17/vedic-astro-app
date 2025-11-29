// Nakshatra calculation utilities

/**
 * Calculate Nakshatra from longitude
 * @param {number} longitude - Planet longitude in degrees (0-360)
 * @returns {object} - Nakshatra details
 */
export const calculateNakshatra = (longitude) => {
    const nakshatras = [
        { name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras' },
        { name: 'Bharani', lord: 'Venus', deity: 'Yama' },
        { name: 'Krittika', lord: 'Sun', deity: 'Agni' },
        { name: 'Rohini', lord: 'Moon', deity: 'Brahma' },
        { name: 'Mrigashira', lord: 'Mars', deity: 'Soma' },
        { name: 'Ardra', lord: 'Rahu', deity: 'Rudra' },
        { name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi' },
        { name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati' },
        { name: 'Ashlesha', lord: 'Mercury', deity: 'Nagas' },
        { name: 'Magha', lord: 'Ketu', deity: 'Pitris' },
        { name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga' },
        { name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman' },
        { name: 'Hasta', lord: 'Moon', deity: 'Savitar' },
        { name: 'Chitra', lord: 'Mars', deity: 'Vishwakarma' },
        { name: 'Swati', lord: 'Rahu', deity: 'Vayu' },
        { name: 'Vishakha', lord: 'Jupiter', deity: 'Indra-Agni' },
        { name: 'Anuradha', lord: 'Saturn', deity: 'Mitra' },
        { name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra' },
        { name: 'Moola', lord: 'Ketu', deity: 'Nirriti' },
        { name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas' },
        { name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishvedevas' },
        { name: 'Shravana', lord: 'Moon', deity: 'Vishnu' },
        { name: 'Dhanishta', lord: 'Mars', deity: 'Vasus' },
        { name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna' },
        { name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada' },
        { name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahir Budhnya' },
        { name: 'Revati', lord: 'Mercury', deity: 'Pushan' }
    ];

    // Each nakshatra spans 13°20' (13.333...)
    const nakshatraLength = 360 / 27; // 13.333... degrees

    // Calculate which nakshatra (0-26)
    const nakshatraIndex = Math.floor(longitude / nakshatraLength);

    // Position within the nakshatra (0-13.33)
    const positionInNakshatra = longitude % nakshatraLength;

    // Each nakshatra is divided into 4 padas (quarters)
    const padaLength = nakshatraLength / 4; // 3.333... degrees
    const pada = Math.floor(positionInNakshatra / padaLength) + 1; // 1-4

    // Degrees within current pada
    const degreesInPada = positionInNakshatra % padaLength;

    return {
        index: nakshatraIndex,
        name: nakshatras[nakshatraIndex].name,
        lord: nakshatras[nakshatraIndex].lord,
        deity: nakshatras[nakshatraIndex].deity,
        pada: pada,
        degrees: positionInNakshatra.toFixed(2),
        degreesInPada: degreesInPada.toFixed(2)
    };
};

/**
 * Get nakshatra abbreviation
 * @param {string} nakshatraName - Full nakshatra name
 * @returns {string} - Abbreviated name
 */
export const getNakshatraAbbr = (nakshatraName) => {
    const abbreviations = {
        'Ashwini': 'Ash',
        'Bharani': 'Bha',
        'Krittika': 'Kri',
        'Rohini': 'Roh',
        'Mrigashira': 'Mri',
        'Ardra': 'Ard',
        'Punarvasu': 'Pun',
        'Pushya': 'Pus',
        'Ashlesha': 'Asl',
        'Magha': 'Mag',
        'Purva Phalguni': 'PPh',
        'Uttara Phalguni': 'UPh',
        'Hasta': 'Has',
        'Chitra': 'Chi',
        'Swati': 'Swa',
        'Vishakha': 'Vis',
        'Anuradha': 'Anu',
        'Jyeshtha': 'Jye',
        'Moola': 'Moo',
        'Purva Ashadha': 'PAs',
        'Uttara Ashadha': 'UAs',
        'Shravana': 'Shr',
        'Dhanishta': 'Dha',
        'Shatabhisha': 'Sha',
        'Purva Bhadrapada': 'PBh',
        'Uttara Bhadrapada': 'UBh',
        'Revati': 'Rev'
    };

    return abbreviations[nakshatraName] || nakshatraName.substring(0, 3);
};

/**
 * Calculate birth star (Moon's nakshatra)
 * @param {number} moonLongitude - Moon's longitude
 * @returns {object} - Birth star details
 */
export const calculateBirthStar = (moonLongitude) => {
    return calculateNakshatra(moonLongitude);
};
