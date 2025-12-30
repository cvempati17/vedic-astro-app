import { calculateAvastha, getPlanetNature } from './strengthUtils';

// Consolidated Planet Rules for internal reference if needed, 
// though strengthUtils might have them. We'll use inputs mostly.

export const PLANET_NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

// Standard Combustion Degrees (approximate standard values)
const COMBUSTION_DEGREES = {
    See: 17, // Mars (standard is ~17)
    Mercury: 14, // (12 if retrograde) - taking simplified 14
    Jupiter: 11,
    Venus: 10, // (8 if retrograde) - taking simplified 10
    Saturn: 15,
    Moon: 12
};

export const getPlanetShortName = (name) => {
    const abbrs = {
        'Sun': 'Sun',
        'Moon': 'Mon',
        'Mars': 'Mar',
        'Mercury': 'Mer',
        'Jupiter': 'Jup',
        'Venus': 'Ven',
        'Saturn': 'Sat',
        'Rahu': 'Rah',
        'Ketu': 'Ket',
        'Ascendant': 'ASC'
    };
    return abbrs[name] || name.substring(0, 3);
};

export const calculateCombustion = (planetName, planetLong, sunLong) => {
    if (planetName === 'Sun' || planetName === 'Rahu' || planetName === 'Ketu') return false;

    // Calculate shortest distance on the circle
    let diff = Math.abs(planetLong - sunLong);
    if (diff > 180) diff = 360 - diff;

    const limit = COMBUSTION_DEGREES[planetName] || 10; // Default 10 if unknown
    return diff <= limit;
};

// Returns short code for Avastha: B, K, Y, V, M
export const getAvasthaCode = (longitude) => {
    const { state } = calculateAvastha(longitude);
    // state is like "Bala (Infant)"
    if (state.startsWith('Bala')) return 'B';
    if (state.startsWith('Kumara')) return 'K';
    if (state.startsWith('Yuva')) return 'Y';
    if (state.startsWith('Vriddha')) return 'V';
    if (state.startsWith('Mrita')) return 'M';
    return '?';
};

// Returns Functional Nature Code: (B)enefic, (M)alefic, (N)eutral
export const getFunctionalNatureCode = (planetName, ascendantLong) => {
    const nature = getPlanetNature(planetName, ascendantLong);
    // nature.functional is 'Functional Benefic' or 'Functional Malefic'
    if (nature.functional === 'Functional Benefic') return 'B';
    if (nature.functional === 'Functional Malefic') return 'M';
    return 'N'; // Should not happen often with current utils but fall safe
};

// Natural Nature Code: (B)enefic, (M)alefic
// Note: User asked for "Functional Benefic vs Malefic, Naisargika nature"
// Naisargika = Natural. 
export const getNaturalNatureCode = (planetName) => {
    const naturalBenefics = ['Jupiter', 'Venus', 'Moon', 'Mercury'];
    if (naturalBenefics.includes(planetName)) return 'B';
    return 'M';
};

export const formatPlanetLine = (planetName, planetData, ascendantLong, sunLong) => {
    if (!planetData) return '';

    // Format: "Moon (9:40) (Y) (M)"  <-- User requested this format in prompt text: "Moon (9:40 ) (Y) (M)"
    // But also mentioned "Functional Benefic vs Malefic, Naisargika nature and Cobust propeties"
    // The image shows: "Moon (9:40 ) (Y) (M)" and "Jupiter (0:46 ) (I) (B)"
    // Wait, (I) might be Avastha? B for Bala? Infant?
    // User text says: "Moon (9:40) (Y) (M)"
    // Let's interpret the codes requested:
    // 1. Avastha (Y = Yuva?)
    // 2. Nature? (M = Malefic?)
    // 3. Combustion?

    const longitude = planetData.longitude;
    const deg = Math.floor(longitude % 30);
    const min = Math.floor((longitude % 1) * 60);
    const degStr = `${deg}:${min.toString().padStart(2, '0')}`;

    const avastha = getAvasthaCode(longitude); // B, K, Y, V, M

    const funcNature = getFunctionalNatureCode(planetName, ascendantLong); // B or M
    // const natNature = getNaturalNatureCode(planetName); // B or M - Maybe user wants both? 
    // The prompt example "Moon (9:40 ) (Y) (M)" has 2 codes in parens.
    // "Jupiter (0:46 ) (I) (B)" -> I might be Infant (Bala)? B might be Benefic?

    // Let's stick to the prompt description: "Avasthas, Functional Benefic vs Malefic, Naisargika nature and Cobust propeties"
    // That's 4 things. The example only shows 2 codes.
    // I will try to fit them or maybe combine them.
    // Let's provide: (Avastha) (FunctionalNature)
    // And maybe mark Red/Cross for Combustion? Or add (C)?

    const isCombust = calculateCombustion(planetName, longitude, sunLong);
    const combustStr = isCombust ? '(C)' : '';


    const shortName = getPlanetShortName(planetName);

    // Let's try to match the single letter codes.
    return {
        name: shortName,
        fullName: planetName,
        degStr,
        avastha,
        nature: funcNature,
        isCombust,
        fullText: `${shortName} (${degStr}) (${avastha}) (${funcNature}) ${combustStr}`
    };
};

export const getSignData = (signIndex) => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const rulers = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
    const tatvas = ['Fire', 'Earth', 'Air', 'Water', 'Fire', 'Earth', 'Air', 'Water', 'Fire', 'Earth', 'Air', 'Water'];
    // Purushartha loops: Dharma, Artha, Kama, Moksha
    const goals = ['Dharma', 'Artha', 'Kama', 'Moksha', 'Dharma', 'Artha', 'Kama', 'Moksha', 'Dharma', 'Artha', 'Kama', 'Moksha'];

    return {
        name: signs[signIndex],
        ruler: rulers[signIndex],
        tatva: tatvas[signIndex],
        goal: goals[signIndex]
    };
};

// Calculate which planets aspect a given sign
export const getAspectingPlanets = (targetSignIndex, allPlanets) => {
    // Basic Vedic Aspects:
    // All planets aspect 7th from them.
    // Mars: 4, 7, 8
    // Jupiter: 5, 7, 9
    // Saturn: 3, 7, 10
    // Rahu/Ketu: 5, 7, 9 (often considered)

    const aspects = [];

    Object.entries(allPlanets).forEach(([planet, data]) => {
        if (!data || !data.longitude) return;

        const pSign = Math.floor(data.longitude / 30);

        // Calculate forward distance from planet to target
        // If Planet is in 0 (Aries) and Target is 6 (Libra), Dist = 6-0+1 = 7.
        let dist = (targetSignIndex - pSign + 12) % 12 + 1;

        let hits = false;

        if (dist === 7) hits = true;
        else if (planet === 'Mars' && (dist === 4 || dist === 8)) hits = true;
        else if (planet === 'Jupiter' && (dist === 5 || dist === 9)) hits = true;
        else if (planet === 'Saturn' && (dist === 3 || dist === 10)) hits = true;
        else if ((planet === 'Rahu' || planet === 'Ketu') && (dist === 5 || dist === 9)) hits = true;

        if (hits) {
            aspects.push(planet);
        }
    });

    return aspects;
};
