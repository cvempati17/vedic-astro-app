// Planetary Dignity and Strength Rules

const PLANET_RULES = {
    Sun: {
        exalted: 0, // Aries
        debilitated: 6, // Libra
        own: [4], // Leo
        friends: [1, 3, 8, 11], // Moon, Mars, Jupiter signs
        enemies: [9, 10], // Saturn signs
        digbala: 10 // 10th House
    },
    Moon: {
        exalted: 1, // Taurus
        debilitated: 7, // Scorpio
        own: [3], // Cancer
        friends: [0, 4, 2, 5, 8, 11], // Sun, Mercury signs
        enemies: [], // No enemies
        digbala: 4 // 4th House
    },
    Mars: {
        exalted: 9, // Capricorn
        debilitated: 3, // Cancer
        own: [0, 7], // Aries, Scorpio
        friends: [3, 4, 8, 11], // Sun, Moon, Jupiter signs
        enemies: [2, 5], // Mercury signs
        digbala: 10 // 10th House
    },
    Mercury: {
        exalted: 5, // Virgo
        debilitated: 11, // Pisces
        own: [2, 5], // Gemini, Virgo
        friends: [0, 6, 9, 10], // Sun, Venus signs
        enemies: [3], // Moon sign
        digbala: 1 // 1st House
    },
    Jupiter: {
        exalted: 3, // Cancer
        debilitated: 9, // Capricorn
        own: [8, 11], // Sagittarius, Pisces
        friends: [0, 7, 3], // Sun, Moon, Mars signs
        enemies: [2, 5, 6, 9, 10], // Mercury, Venus signs
        digbala: 1 // 1st House
    },
    Venus: {
        exalted: 11, // Pisces
        debilitated: 5, // Virgo
        own: [1, 6], // Taurus, Libra
        friends: [2, 5, 9, 10], // Mercury, Saturn signs
        enemies: [0, 3], // Sun, Moon signs
        digbala: 4 // 4th House
    },
    Saturn: {
        exalted: 6, // Libra
        debilitated: 0, // Aries
        own: [9, 10], // Capricorn, Aquarius
        friends: [2, 5, 1, 6], // Mercury, Venus signs
        enemies: [0, 3, 7], // Sun, Moon, Mars signs
        digbala: 7 // 7th House
    },
    Rahu: {
        exalted: 1, // Taurus (often considered)
        debilitated: 7, // Scorpio
        own: [10], // Aquarius (co-lord)
        friends: [2, 5, 6, 9, 10],
        enemies: [0, 3, 4],
        digbala: 10 // 10th House (varies)
    },
    Ketu: {
        exalted: 7, // Scorpio
        debilitated: 1, // Taurus
        own: [7], // Scorpio (co-lord)
        friends: [0, 3, 4],
        enemies: [9, 10, 1, 6],
        digbala: 12 // 12th House (varies)
    }
};

const getRasiNumber = (longitude) => Math.floor(longitude / 30);

export const calculateDignity = (planetName, longitude, ascendantLong) => {
    if (!PLANET_RULES[planetName]) return { status: 'Neutral', score: 50, color: '#94a3b8' };

    const rasi = getRasiNumber(longitude);
    const rules = PLANET_RULES[planetName];
    const ascRasi = getRasiNumber(ascendantLong);

    // Calculate House (1-12)
    const house = ((rasi - ascRasi + 12) % 12) + 1;

    let status = 'Neutral';
    let score = 50; // Base score
    let color = '#94a3b8'; // Grey
    let details = [];

    // 1. Check Exaltation/Debilitation
    if (rasi === rules.exalted) {
        status = 'Exalted (Ucha)';
        score = 100;
        color = '#22c55e'; // Green
        details.push('Highest Strength');
    } else if (rasi === rules.debilitated) {
        status = 'Debilitated (Neecha)';
        score = 0;
        color = '#ef4444'; // Red
        details.push('Weakest Position');
    } else if (rules.own.includes(rasi)) {
        status = 'Own Sign (Swakshetra)';
        score = 80;
        color = '#3b82f6'; // Blue
        details.push('In Own Home');
    } else if (rules.friends.includes(rasi)) {
        status = 'Friendly Sign (Mitra)';
        score = 65;
        color = '#8b5cf6'; // Purple
        details.push('Comfortable');
    } else if (rules.enemies.includes(rasi)) {
        status = 'Enemy Sign (Shatru)';
        score = 30;
        color = '#f59e0b'; // Orange
        details.push('Uncomfortable');
    }

    // 2. Check Directional Strength (Digbala)
    if (house === rules.digbala) {
        score += 20;
        details.push('Directional Strength (Digbala)');
    }

    // Cap score
    if (score > 100) score = 100;

    return {
        status,
        score,
        color,
        house,
        details: details.join(', ')
    };
};

export const getStrengthMeaning = (status) => {
    switch (status) {
        case 'Exalted (Ucha)': return "The planet is at its peak power. It can fully express its positive qualities and bring exceptional results in its domain.";
        case 'Own Sign (Swakshetra)': return "The planet is comfortable and strong, like being in its own home. It functions naturally and effectively.";
        case 'Friendly Sign (Mitra)': return "The planet is in a friend's house. It is happy and cooperative, producing good results.";
        case 'Neutral': return "The planet is neither helped nor hindered. It will give average results depending on other factors.";
        case 'Enemy Sign (Shatru)': return "The planet is in hostile territory. It feels restricted and may struggle to express itself.";
        case 'Debilitated (Neecha)': return "The planet is weak and uncomfortable. It may cause difficulties or require extra effort to manifest its qualities.";
        default: return "";
    }
};

export const getPlanetNature = (planetName, ascendantLong) => {
    const ascRasi = getRasiNumber(ascendantLong); // 0 = Aries, 1 = Taurus...

    // 1. Natural Nature
    const naturalBenefics = ['Jupiter', 'Venus', 'Moon', 'Mercury'];
    const naturalMalefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

    const isNaturalBenefic = naturalBenefics.includes(planetName);
    const naturalNature = isNaturalBenefic ? 'Natural Benefic' : 'Natural Malefic';

    // 2. Functional Nature (Based on Ascendant)
    // Simplified lookup for Functional Benefics (Yogakarakas and Trine Lords)
    // Others are considered Functional Malefics or Neutral for this simplified view

    const functionalBeneficsByAsc = {
        0: ['Sun', 'Mars', 'Jupiter'], // Aries
        1: ['Sun', 'Saturn', 'Mercury', 'Mars'], // Taurus
        2: ['Venus'], // Gemini
        3: ['Mars', 'Jupiter'], // Cancer
        4: ['Sun', 'Mars', 'Jupiter'], // Leo
        5: ['Venus'], // Virgo
        6: ['Saturn', 'Mercury', 'Venus'], // Libra
        7: ['Sun', 'Moon', 'Jupiter'], // Scorpio
        8: ['Sun', 'Mars'], // Sagittarius
        9: ['Venus', 'Mercury', 'Saturn'], // Capricorn
        10: ['Venus', 'Saturn'], // Aquarius
        11: ['Moon', 'Mars', 'Jupiter'] // Pisces
    };

    const benefics = functionalBeneficsByAsc[ascRasi] || [];
    const isFunctionalBenefic = benefics.includes(planetName);

    // Special handling for Rahu/Ketu (often mimic lord of sign or are malefic)
    if (planetName === 'Rahu' || planetName === 'Ketu') {
        return {
            natural: 'Natural Malefic',
            functional: 'Functional Malefic', // Simplified
            isBenefic: false
        };
    }

    return {
        natural: naturalNature,
        functional: isFunctionalBenefic ? 'Functional Benefic' : 'Functional Malefic',
        isBenefic: isFunctionalBenefic
    };
};

export const calculateAvastha = (longitude) => {
    const rasi = getRasiNumber(longitude);
    const degrees = longitude % 30;
    const isOddSign = [0, 2, 4, 6, 8, 10].includes(rasi); // Aries, Gemini, etc.

    let state = '';
    let meaning = '';

    if (isOddSign) {
        if (degrees < 6) { state = 'Bala (Infant)'; meaning = 'Growing strength (25%)'; }
        else if (degrees < 12) { state = 'Kumara (Youth)'; meaning = 'Good strength (50%)'; }
        else if (degrees < 18) { state = 'Yuva (Adult)'; meaning = 'Full strength (100%)'; }
        else if (degrees < 24) { state = 'Vriddha (Old)'; meaning = 'Diminishing strength'; }
        else { state = 'Mrita (Dead)'; meaning = 'Dormant strength'; }
    } else {
        // Even Signs (Reverse Order)
        if (degrees < 6) { state = 'Mrita (Dead)'; meaning = 'Dormant strength'; }
        else if (degrees < 12) { state = 'Vriddha (Old)'; meaning = 'Diminishing strength'; }
        else if (degrees < 18) { state = 'Yuva (Adult)'; meaning = 'Full strength (100%)'; }
        else if (degrees < 24) { state = 'Kumara (Youth)'; meaning = 'Good strength (50%)'; }
        else { state = 'Bala (Infant)'; meaning = 'Growing strength (25%)'; }
    }

    return { state, meaning };
};
