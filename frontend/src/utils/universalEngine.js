
import { UNIVERSAL_RULES } from './universalRules';

// --- Helper: Astronomy & Basic Calc ---
const PLANET_LORDS = {
    'Sun': [5],
    'Moon': [4],
    'Mars': [1, 8],
    'Mercury': [3, 6],
    'Jupiter': [9, 12],
    'Venus': [2, 7],
    'Saturn': [10, 11]
};

const EXALTATION = {
    'Sun': 1, 'Moon': 2, 'Mercury': 6, 'Venus': 12, 'Mars': 10, 'Jupiter': 4, 'Saturn': 7, 'Rahu': 2, 'Ketu': 8
};
const DEBILITATION = {
    'Sun': 7, 'Moon': 8, 'Mercury': 12, 'Venus': 6, 'Mars': 4, 'Jupiter': 10, 'Saturn': 1, 'Rahu': 8, 'Ketu': 2
};

const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;
const getRashiIndex = (longitude) => Math.floor(normalizeAngle(longitude) / 30) + 1; // 1-12
const getHouseNumber = (planetLon, ascendantLon) => {
    // Whole sign houses
    const ascSign = getRashiIndex(ascendantLon);
    const planetSign = getRashiIndex(planetLon);
    let house = planetSign - ascSign + 1;
    if (house <= 0) house += 12;
    return house;
};

const getLordOfHouse = (houseNum, ascendantLon) => {
    const ascSign = getRashiIndex(ascendantLon);
    let signInHouse = (ascSign + houseNum - 1 - 1) % 12 + 1;
    for (const [planet, signs] of Object.entries(PLANET_LORDS)) {
        if (signs.includes(signInHouse)) return planet;
    }
    return 'Saturn'; // Fallback (Aquarius/Capricorn covered, likely Rahu/Ketu issues if any)
};

const angleDiff = (a, b) => {
    let diff = Math.abs(a - b);
    if (diff > 180) diff = 360 - diff;
    return diff;
};

// --- Core Evaluator ---

const evaluateCondition = (conditionStr, chart, context) => {
    // Simple parser for conditions like "lord_7_in_10", "jupiter_aspects_9", etc.
    const lower = conditionStr.toLowerCase();

    // Split by ' or ' / ' and ' logic using primitive way
    if (lower.includes(' or ')) {
        const parts = lower.split(' or ');
        return parts.some(p => evaluateCondition(p, chart, context));
    }
    if (lower.includes(' and ')) {
        const parts = lower.split(' and ');
        return parts.every(p => evaluateCondition(p, chart, context));
    }

    const { planets, ascendant } = chart;
    const { houses, functionalMap } = context;

    // regex patterns
    // 1. lord_X_in_Y
    let match = lower.match(/lord_(\d+)_in_(\d+)/);
    if (match) {
        const houseX = parseInt(match[1]);
        const houseY = parseInt(match[2]);
        const lordName = getLordOfHouse(houseX, ascendant);
        const lordLon = planets[lordName.toLowerCase()];
        if (lordLon === undefined) return false;
        const currentHouse = getHouseNumber(lordLon, ascendant);
        return currentHouse === houseY;
    }

    // 2. planet_in_X
    match = lower.match(/(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)_in_(\d+)/i);
    if (match) {
        const planet = match[1];
        const house = parseInt(match[2]);
        const lon = planets[planet.toLowerCase()];
        if (lon === undefined) return false;
        return getHouseNumber(lon, ascendant) === house;
    }

    // 3. planet_aspects_X
    match = lower.match(/(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)_aspects_(\d+)/i);
    if (match) {
        // Approximate Aspect Logic (Rule 7, 5/9 for Jup, 3/10 Sat, 4/8 Mars)
        const planet = match[1];
        const targetHouse = parseInt(match[2]);
        const lon = planets[planet.toLowerCase()];
        if (lon === undefined) return false;
        const currentHouse = getHouseNumber(lon, ascendant);
        let aspects = [7]; // All aspect 7
        if (planet === 'Mars') aspects.push(4, 8);
        if (planet === 'Jupiter') aspects.push(5, 9);
        if (planet === 'Saturn') aspects.push(3, 10);

        // Target house absolute diff
        // If currentHouse is 1, it aspects 7 (1+6). 
        // Logic: (Target - Current + 12) % 12 
        // Wait, aspect offset is simple: If Mars is in 1, it aspects 4, 7, 8.
        // House 4 is relative 4th house.
        const relHouse = (targetHouse - currentHouse + 12) % 12;
        // relHouse 0 means same house. relHouse 3 means 4th house? (0,1,2,3 -> 1,2,3,4)
        // No, if I am in 1, House 4 is (4-1) = 3 houses away? No.
        // Count: 1, 2, 3, 4. So distance is 4.
        const distance = ((targetHouse - currentHouse + 12) % 12) + 1;
        return aspects.includes(distance);
    }

    // 4. planet_conjunct_planet
    match = lower.match(/(\w+)_conjunct_(\w+)/);
    if (match && !lower.includes('lord')) {
        const p1 = match[1];
        const p2 = match[2];
        const l1 = planets[p1.toLowerCase()];
        const l2 = planets[p2.toLowerCase()];
        if (l1 === undefined || l2 === undefined) return false;
        return angleDiff(l1, l2) < 10; // Orb 10
    }

    // 5. functional booleans
    if (lower.includes('_benefic')) {
        const p = lower.replace('_benefic', '');
        return functionalMap[p] === 'benefic';
    }
    if (lower.includes('exalted')) {
        // Check if subject is exalted.
        // Usually attached like "sun_in_10 exalted" -> this is parsed as "exalted" applied to context?
        // Our parser splits by space? No, simple strings.
        // The YAML says "sun_in_10 exalted". This is not standard AND logic.
        // But let's check basic exaltation check for any planet mentioned in string
        const planetMatch = lower.match(/(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)/i);
        if (planetMatch) {
            const p = planetMatch[1];
            const l = planets[p.toLowerCase()];
            const rashi = getRashiIndex(l);
            return rashi === EXALTATION[p];
        }
    }

    return false;
};

const calculatePlanetStrength = (planetName, lon, ascendant, rules) => {
    // 1. Base
    const pRules = rules.planets.find(p => p.name.toLowerCase() === planetName.toLowerCase());
    let score = pRules.base_function;

    const rashi = getRashiIndex(lon);

    // 2. Dignity
    if (rashi === EXALTATION[planetName]) score += 2; // Simple approx
    else if (rashi === DEBILITATION[planetName]) score -= 2;
    // Own sign logic (simplified)
    else if (PLANET_LORDS[planetName] && PLANET_LORDS[planetName].includes(rashi)) score += 1;

    // 3. House Position
    const house = getHouseNumber(lon, ascendant);
    const houseMatrix = rules.house_planet_interaction_matrix[house];
    if (houseMatrix && houseMatrix[planetName]) {
        score *= houseMatrix[planetName];
    }

    return Math.max(0, Math.min(10, score));
};

export const executeUniversalEngine = (domainKey, chart1, chart2 = null) => {
    const rules = UNIVERSAL_RULES;
    const domain = rules.domains[domainKey.toLowerCase().replace(/ /g, '_').replace(/&/g, '').replace(/_+/g, '_')]; // Normalize key

    if (!domain) return { error: "Domain not found in rules" };

    try {
        const p1 = chart1.planets;
        const p1Asc = chart1.ascendant;

        // 1. Context Build (Functional Benefics)
        const functionalMap = {};
        ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].forEach(p => {
            // simplified functional benefic logic based on trine lordships (1,5,9)
            // Real logic is in YAML functional.benefic_logic string "if_house_lord_in [1,5,9]..."
            // We will approximate: Lords of 1, 5, 9 are benefic. Lords of 6, 8, 12 malefic.
            const owned = PLANET_LORDS[p] || [];
            // Get houses these signs map to
            const ownedHouses = owned.map(sign => {
                const ascSign = getRashiIndex(p1Asc);
                let h = sign - ascSign + 1;
                if (h <= 0) h += 12;
                return h;
            });

            if (ownedHouses.some(h => [1, 5, 9].includes(h))) functionalMap[p.toLowerCase()] = 'benefic';
            else if (ownedHouses.some(h => [6, 8, 12].includes(h))) functionalMap[p.toLowerCase()] = 'malefic';
            else functionalMap[p.toLowerCase()] = 'neutral';
        });

        const context = { functionalMap };

        // 2. Calculate Promise
        let promiseScore = 5.0;
        const houseScores = {};

        // Calculate all house scores first
        for (let i = 1; i <= 12; i++) {
            // Simple: Sum of strengths of planets in house + Strength of Lord
            let hScore = 5;
            // Occupants
            Object.keys(p1).forEach(p => {
                const lon = p1[p];
                if (getHouseNumber(lon, p1Asc) === i) {
                    const str = calculatePlanetStrength(p, lon, p1Asc, rules);
                    if (functionalMap[p] === 'benefic') hScore += str * 0.2;
                    else if (functionalMap[p] === 'malefic') hScore -= str * 0.2;
                }
            });
            // Lord Strength
            const lord = getLordOfHouse(i, p1Asc);
            if (lord && p1[lord.toLowerCase()]) {
                const lordStr = calculatePlanetStrength(lord, p1[lord.toLowerCase()], p1Asc, rules);
                hScore += (lordStr - 5) * 0.5;
            }
            houseScores[i] = Math.max(0, Math.min(10, hScore));
        }

        // Weighted for Domain
        if (domain.house_relevances) {
            let weightedSum = 0;
            let totalWeight = 0;
            Object.entries(domain.house_relevances).forEach(([h, w]) => {
                if (h === 'all') {
                    // average all
                } else {
                    weightedSum += houseScores[h] * w;
                    totalWeight += w;
                }
            });
            if (totalWeight > 0) promiseScore = weightedSum / totalWeight; // Normalize to 0-10 base
        }

        // 3. Yogas
        const triggeredYogas = [];
        let yogaScoreMod = 0;
        if (domain.yogas) {
            domain.yogas.forEach(yoga => {
                if (evaluateCondition(yoga.condition, chart1, { ...context, houses: houseScores })) {
                    triggeredYogas.push(yoga);
                    yogaScoreMod += yoga.signal;
                }
            });
        }

        promiseScore = Math.max(0, Math.min(10, promiseScore + yogaScoreMod));

        // 4. Outcomes
        const scores = {
            promise: promiseScore.toFixed(1),
            activation: "6.5", // Placeholder: Need Dasha Logic
            timing: "7.0",    // Placeholder
            stability: "N/A",
            compatibility: "N/A"
        };

        if (chart2 && domainKey.includes("Partnership")) {
            // Pairwise logic placeholder
            scores.compatibility = "85%";
            scores.stability = "7.5";
        }

        // 5. Why
        const why = triggeredYogas.map(y => `Yoga Active: ${y.name} (${y.signal > 0 ? '+' : ''}${y.signal})`);
        if (why.length === 0) why.push("No major specific yogas triggered, result based on general house strengths.");

        // 6. Verdict
        let verdict = "EXPERIMENT";
        if (promiseScore > 7.5) verdict = "GO";
        else if (promiseScore < 4) verdict = "NO-GO";
        else verdict = "DELAY / CAUTION";

        return {
            verdict,
            scores,
            what_is: domain.what_is,
            why,
            when: domain.when,
            where_what: domain.where_what,
            notes: ["Confidence: Medium", "Beta Version 1.1"],
            projections: { "12_month": (promiseScore * 0.9).toFixed(1), "24_month": (promiseScore * 1.1).toFixed(1) },
            recommendations: ["Focus on " + (domain.key_planets ? domain.key_planets[0] : "planing")]
        };

    } catch (e) {
        console.error(e);
        return { error: e.message };
    }
};
