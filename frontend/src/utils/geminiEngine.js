
import { GEMINI_RULES } from './geminiRules';

/** -- Basic Calc Helpers (Duplicate from Engine, but kept standalone for this isolated test) -- **/
const normalize = (angle) => ((angle % 360) + 360) % 360;
const getRashi = (lon) => Math.floor(normalize(lon) / 30) + 1;
const getHouse = (planetLon, ascLon) => {
    let h = getRashi(planetLon) - getRashi(ascLon) + 1;
    if (h <= 0) h += 12;
    return h;
};
const PLANET_LORDS = {
    'Sun': [5], 'Moon': [4], 'Mars': [1, 8], 'Mercury': [3, 6],
    'Jupiter': [9, 12], 'Venus': [2, 7], 'Saturn': [10, 11]
};
const getLord = (houseNum, ascLon) => {
    const ascSign = getRashi(ascLon);
    const sign = (ascSign + houseNum - 1 - 1) % 12 + 1;
    for (let [p, signs] of Object.entries(PLANET_LORDS)) {
        if (signs.includes(sign)) return p.toLowerCase();
    }
    return 'saturn';
};

/** -- Logic Parser -- **/
const checkCondition = (condition, chart) => {
    const { planets, ascendant } = chart;
    const cond = condition.toLowerCase();

    // 1. Lord X in Y
    let match = cond.match(/lord_(\d+)_in_([\d_]+)/); // allows 6_8_12
    if (match) {
        const lordH = parseInt(match[1]);
        const targetHouses = match[2].split('_').map(Number);
        const lordName = getLord(lordH, ascendant);
        const lordLon = planets[lordName];
        if (lordLon === undefined) return false;
        const currentHouse = getHouse(lordLon, ascendant);
        return targetHouses.includes(currentHouse);
    }

    // 2. Planet in X
    match = cond.match(/(\w+)_in_(\d+)/);
    if (match) {
        const p = match[1];
        const h = parseInt(match[2]);
        const lon = planets[p];
        if (lon === undefined) return false;
        return getHouse(lon, ascendant) === h;
    }

    // 3. Specific Yogas / Combinations
    if (cond === 'benefic_in_10') {
        const benefics = ['jupiter', 'venus', 'mercury', 'moon'];
        return benefics.some(p => planets[p] && getHouse(planets[p], ascendant) === 10);
    }
    if (cond === 'malefic_in_7') {
        const malefics = ['saturn', 'mars', 'rahu', 'ketu', 'sun'];
        return malefics.some(p => planets[p] && getHouse(planets[p], ascendant) === 7);
    }
    if (cond === 'ketu_in_2') return planets.ketu && getHouse(planets.ketu, ascendant) === 2;

    // Dhana Yoga (Exchange 2,5,9,11 or Lords connected) - Simplified: Check lord 2 in 11 or lord 11 in 2
    if (cond === 'dhana_yoga') {
        const l2 = getLord(2, ascendant);
        const l11 = getLord(11, ascendant);
        const h2 = getHouse(planets[l2], ascendant);
        const h11 = getHouse(planets[l11], ascendant);
        return (h2 === 11 || h11 === 2 || h2 === 5 || h2 === 9);
    }

    if (cond === 'lord_1_weak_or_afflicted') {
        // Simplified: Lord 1 in 6, 8, 12
        const l1 = getLord(1, ascendant);
        const h = getHouse(planets[l1], ascendant);
        return [6, 8, 12].includes(h);
    }

    if (cond === 'vipareeta_raja_yoga') {
        // 6th Lord in 8th
        const l6 = getLord(6, ascendant);
        const h = getHouse(planets[l6], ascendant);
        return h === 8;
    }

    // Mangal Dosha
    if (cond === 'mangal_dosha') {
        const mars = planets.mars;
        const h = getHouse(mars, ascendant);
        return [1, 2, 4, 7, 8, 12].includes(h);
    }

    if (cond === 'lord_7_conjunct_venus') {
        const l7 = getLord(7, ascendant);
        if (l7 === 'venus') return true; // Own sign, loosely conjunct self
        const diff = Math.abs(normalize(planets[l7] - planets.venus));
        return diff < 10 || diff > 350;
    }

    if (cond === 'mercury_sun_conjunct') {
        const diff = Math.abs(normalize(planets.mercury - planets.sun));
        return diff < 10 || diff > 350;
    }
    return false;
};

export const executeGeminiEngine = (domainKey, chart) => {
    const rules = GEMINI_RULES.domains[domainKey];
    if (!rules) return { error: "Domain not supported in Gemini Engine" };

    const output = {
        summary_prediction: { status: "Average", primary_text: "Standard placement based indicators." },
        astrological_reasoning: [],
        specifics: { direction: "East", body_part: "Head", profession_type: [] },
        intensity_chart_data: { labels: [], datasets: [] }
    };

    // Evaluate Rules
    let score = 50;
    if (rules.rules) {
        rules.rules.forEach(rule => {
            if (checkCondition(rule.if, chart)) {
                output.astrological_reasoning.push({
                    planet: "System",
                    house: "N/A",
                    logic: rule.if,
                    effect: rule.effect,
                    description: rule.outcome + " - " + rule.why
                });

                if (rule.effect === 'Positive') score += 15;
                if (rule.effect === 'Negative') score -= 15;
            }
        });
    }

    // Determine Status
    if (score >= 70) output.summary_prediction = { status: "Excellent", primary_text: "Strong planetary support." };
    else if (score >= 55) output.summary_prediction = { status: "Good", primary_text: "Favorable conditions." };
    else if (score <= 35) output.summary_prediction = { status: "Challenging", primary_text: "Significant obstacles found." };

    // Fake Intensity Data (Logic would require complex dasha)
    const currentYear = new Date().getFullYear();
    const labels = [];
    const data = [];
    for (let i = 0; i < 7; i++) {
        labels.push((currentYear + i).toString());
        data.push(Math.min(100, Math.max(20, score + Math.floor(Math.random() * 30 - 15))));
    }
    output.intensity_chart_data = {
        labels,
        datasets: [{
            label: 'Karmic Intensity',
            data: data,
            borderColor: score > 50 ? '#27ae60' : '#e74c3c',
            backgroundColor: score > 50 ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
            fill: true
        }]
    };

    // Fake Specifics based on Ascendant
    const ascSign = getRashi(chart.ascendant);
    const directions = ['East', 'South-East', 'South', 'South-West', 'West', 'North-West', 'North', 'North-East'];
    output.specifics.direction = directions[(ascSign % 8)];

    // Body part from rules if Health
    if (domainKey === 'health' && rules.body_mapping) {
        // Find weakest point (e.g., 6th house sign)
        const h6Sign = (ascSign + 5) % 12 + 1;
        output.specifics.body_part = rules.body_mapping[6] + ` (Sign ${h6Sign})`;
    }

    return output;
};
