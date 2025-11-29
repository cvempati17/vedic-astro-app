// Vedic Astrology Aspect Rules

const ASPECT_RULES = {
    'Mars': [4, 7, 8],
    'Jupiter': [5, 7, 9],
    'Saturn': [3, 7, 10],
    'Rahu': [5, 7, 9], // Common variation
    'Ketu': [5, 7, 9], // Common variation
    // All others aspect only 7th
    'default': [7]
};

const RASI_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

/**
 * Calculate planetary aspects
 * @param {object} planetaryPositions - Object with planet names and longitudes
 * @returns {object} - Map of planets and the signs they aspect
 */
export const calculateAspects = (planetaryPositions) => {
    const aspects = {};
    const planetRasis = {};

    // 1. Determine Rasi for each planet
    Object.entries(planetaryPositions).forEach(([planet, info]) => {
        if (planet !== 'Ascendant' && info.longitude !== undefined) {
            planetRasis[planet] = Math.floor(info.longitude / 30);
        }
    });

    // 2. Calculate aspects for each planet
    Object.entries(planetRasis).forEach(([planet, rasiIndex]) => {
        const rules = ASPECT_RULES[planet] || ASPECT_RULES['default'];

        aspects[planet] = rules.map(houseDist => {
            // House distance is inclusive (1st house is the planet's position)
            // So 7th aspect is +6 signs away
            const targetRasiIndex = (rasiIndex + (houseDist - 1)) % 12;
            return {
                houseDistance: houseDist,
                targetRasi: RASI_NAMES[targetRasiIndex],
                targetRasiIndex: targetRasiIndex
            };
        });
    });

    return aspects;
};

/**
 * Calculate conjunctions (planets in same sign)
 * @param {object} planetaryPositions 
 * @returns {object} - Map of signs and planets in them
 */
export const calculateConjunctions = (planetaryPositions) => {
    const conjunctions = {}; // Key: Rasi Index, Value: Array of planets

    Object.entries(planetaryPositions).forEach(([planet, info]) => {
        if (planet !== 'Ascendant' && info.longitude !== undefined) {
            const rasiIndex = Math.floor(info.longitude / 30);
            if (!conjunctions[rasiIndex]) {
                conjunctions[rasiIndex] = [];
            }
            conjunctions[rasiIndex].push(planet);
        }
    });

    // Filter out signs with only 1 planet (no conjunction)
    const result = {};
    Object.entries(conjunctions).forEach(([rasiIndex, planets]) => {
        if (planets.length > 1) {
            result[RASI_NAMES[rasiIndex]] = planets;
        }
    });

    return result;
};

/**
 * Get planets aspecting a specific sign
 * @param {number} targetRasiIndex - Index of the sign (0-11)
 * @param {object} allAspects - Result from calculateAspects
 * @returns {Array} - List of planets aspecting this sign
 */
export const getAspectsOnSign = (targetRasiIndex, allAspects) => {
    const aspectingPlanets = [];

    Object.entries(allAspects).forEach(([planet, aspects]) => {
        const hits = aspects.find(a => a.targetRasiIndex === targetRasiIndex);
        if (hits) {
            aspectingPlanets.push({
                planet,
                type: `${hits.houseDistance}th Aspect`
            });
        }
    });

    return aspectingPlanets;
};
