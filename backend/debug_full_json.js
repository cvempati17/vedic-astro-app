const path = require('path');
const { loadYamlOrThrow } = require('./utils/yamlHelper');

const BASE_PATH = path.join(__dirname, 'Family OS - V/05_Time_Engine');
const FILES = {
    FUNCTIONAL_NATURE: '05_01_functional_nature_by_lagna.yaml',
    YOGAKARAKA_MULTIPLIER: '05_02_yogakaraka_axis_multiplier.yaml',
    TRANSIT_MAPPING: '05_03_transit_axis_mapping.yaml',
    NATAL_DEFINITIONS: '05_04_natal_axis_definitions.yaml'
};

// Utils
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const LORDS = { "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon", "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars", "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter" };
const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

const normalizeAngle = (angle) => {
    let a = angle % 360;
    return a < 0 ? a + 360 : a;
};

const getSignName = (long) => SIGNS[Math.floor(normalizeAngle(long) / 30)];
const getSignIndex = (long) => Math.floor(normalizeAngle(long) / 30);
const getHouseNumber = (ascendantLong, planetLong) => {
    const ascSignStart = Math.floor(ascendantLong / 30) * 30;
    const diff = normalizeAngle(planetLong - ascSignStart);
    return Math.floor(diff / 30) + 1;
};

const getPlanetStrength = (planetName, planetLong, chart) => {
    const sign = getSignName(planetLong);
    const rules = {
        Sun: { exalt: "Aries", debil: "Libra", own: "Leo" },
        Moon: { exalt: "Taurus", debil: "Scorpio", own: "Cancer" },
        Mars: { exalt: "Capricorn", debil: "Cancer", own: ["Aries", "Scorpio"] },
        Mercury: { exalt: "Virgo", debil: "Pisces", own: ["Gemini", "Virgo"] },
        Jupiter: { exalt: "Cancer", debil: "Capricorn", own: ["Sagittarius", "Pisces"] },
        Venus: { exalt: "Pisces", debil: "Virgo", own: ["Taurus", "Libra"] },
        Saturn: { exalt: "Libra", debil: "Aries", own: ["Capricorn", "Aquarius"] },
        Rahu: { exalt: "Taurus", debil: "Scorpio", own: "Aquarius" },
        Ketu: { exalt: "Scorpio", debil: "Taurus", own: "Scorpio" }
    };
    const r = rules[planetName];
    if (!r) return 50;
    if (r.exalt === sign) return 95;
    if (r.debil === sign) return 10;
    if (Array.isArray(r.own) ? r.own.includes(sign) : r.own === sign) return 80;
    return 60;
};

const calculateHouseStrength = (houseNum, chart, ascendant) => {
    let strength = 0;
    let planetsInHouse = 0;
    let totalPlanetStrength = 0;
    const houseSignIdx = (getSignIndex(ascendant) + (houseNum - 1)) % 12;
    const houseSign = SIGNS[houseSignIdx];
    const lord = LORDS[houseSign];
    const lordLong = chart[lord];
    if (lordLong !== undefined) strength += getPlanetStrength(lord, lordLong, chart);
    PLANETS.forEach(p => {
        if (chart[p] !== undefined) {
            const h = getHouseNumber(ascendant, chart[p]);
            if (h === houseNum) {
                planetsInHouse++;
                totalPlanetStrength += getPlanetStrength(p, chart[p], chart);
            }
        }
    });
    if (planetsInHouse > 0) strength = (strength + (totalPlanetStrength / planetsInHouse)) / 2;
    return Math.min(100, strength);
};

const calculateLordStrength = (houseNum, chart, ascendant) => {
    const houseSignIdx = (getSignIndex(ascendant) + (houseNum - 1)) % 12;
    const houseSign = SIGNS[houseSignIdx];
    const lord = LORDS[houseSign];
    if (chart[lord] === undefined) return 0;
    return getPlanetStrength(lord, chart[lord], chart);
};

// Simplified Yoga Detector (Real code has logic, I'll assume bonus applies for Saturn Raja Yoga)
// To verify "Real Output", I will copy the detectYogas logic too.
const getLordOf = (h, asc) => LORDS[SIGNS[(getSignIndex(asc) + (h - 1)) % 12]];
const detectYogas = (chart, asc) => {
    const yogas = [];
    // Saturn (10/Lord) and 9th Lord Connection?
    // 9th Lord of Taurus is Saturn. 10th Lord is Saturn.
    // 9 and 10 Lords are Same -> Raja Yoga.
    // Logic: checkRelation(9, 10).
    const l9 = getLordOf(9, asc);
    const l10 = getLordOf(10, asc);
    // Logic logic:
    const h1 = getHouseNumber(asc, chart[l9]);
    const h2 = getHouseNumber(asc, chart[l10]);
    if (h1 === h2) yogas.push('raja_yoga');
    return yogas;
};

async function run() {
    // 1. Members
    const members = [{
        id: 'Chandra',
        chart_object: {
            planets: {
                Ascendant: 43.53, Sun: 90.9, Moon: 164.7, Mars: 108.03, Mercury: 116.31,
                Jupiter: 247.3, Venus: 55.8, Saturn: 52.23, Rahu: 272.55, Ketu: 92.55
            }
        }
    }];

    // 2. Load YAML
    const functionalNature = loadYamlOrThrow(path.join(BASE_PATH, FILES.FUNCTIONAL_NATURE));
    const yogakarakaMult = loadYamlOrThrow(path.join(BASE_PATH, FILES.YOGAKARAKA_MULTIPLIER));
    const transitMapping = loadYamlOrThrow(path.join(BASE_PATH, FILES.TRANSIT_MAPPING));
    const natalDefinitions = loadYamlOrThrow(path.join(BASE_PATH, FILES.NATAL_DEFINITIONS));

    // 3. Step 1: Natal
    const memberData = members.map(m => {
        let rawChart = m.chart_object.planets || m.chart_object;
        const chart = {};
        Object.keys(rawChart).forEach(k => {
            const key = k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
            chart[key] = (typeof rawChart[k] === 'object' && rawChart[k].longitude) ? rawChart[k].longitude : Number(rawChart[k]);
        });
        const asc = chart.Ascendant || 0;

        const axesKeys = Object.keys(natalDefinitions.axes);
        const axisStrengths = {};
        const detectedYogas = detectYogas(chart, asc);

        axesKeys.forEach(axis => {
            const def = natalDefinitions.axes[axis];
            let hStr = 0;
            def.houses.primary.forEach(h => hStr += calculateHouseStrength(h, chart, asc) * (def.house_contribution.primary_house_weight || 1));
            let lStr = 0;
            const pLords = Array.isArray(def.lords.primary_lord) ? def.lords.primary_lord : [def.lords.primary_lord];
            pLords.forEach(l => lStr += calculateLordStrength(l, chart, asc));

            let yBonus = 0;
            if (def.supporting_yogas && def.supporting_yogas.strong && def.supporting_yogas.strong.some(y => detectedYogas.includes(y))) yBonus = 100;

            let base = (hStr * natalDefinitions.global_weights.house_strength_weight) +
                (lStr * natalDefinitions.global_weights.lord_strength_weight) +
                (yBonus * natalDefinitions.global_weights.yoga_weight);

            axisStrengths[axis] = Math.min(100, Math.floor(base));
        });
        return { ...m, axisStrengths, ascendant: asc };
    });

    // 4. Timeline
    const timeline = [];
    const start = new Date(); // now
    for (let i = 0; i < 12; i++) { // Generate 12 months for sample
        const d = new Date(start); d.setMonth(d.getMonth() + i);
        timeline.push(d.toISOString().slice(0, 7));
    }

    // 5. Dasha
    const individualDashaLayer = {};
    memberData.forEach(m => {
        const lagnaSign = getSignName(m.ascendant);
        const funcNature = functionalNature.lagnas[lagnaSign];
        const yogakarakas = funcNature.yogakaraka || [];
        const runningDasha = { md: 'Saturn', ad: 'Venus' };

        individualDashaLayer[m.id] = {};
        Object.keys(m.axisStrengths).forEach(axis => {
            const base = m.axisStrengths[axis];
            const curve = timeline.map(t => {
                let mult = 1.0;
                if (yogakarakas.includes(runningDasha.md)) mult *= (yogakarakaMult.axes[axis]?.mahadasha || 1.25);
                let intensity = Math.min(100, base * mult);
                return { time: t, intensity: Math.floor(intensity) };
            });
            individualDashaLayer[m.id][axis] = curve;
        });
    });

    // 6. Transit (Dynamic)
    const initialTransits = { Saturn: 345, Jupiter: 75, Rahu: 315, Ketu: 135 };
    const SPEED = { Saturn: 1.0, Jupiter: 2.5 };
    const transitLayer = { axes: {} };
    const effectiveLayer = { axes: {} };
    const refAsc = memberData[0].ascendant;

    timeline.forEach((t, tIdx) => {
        const transits = {
            Saturn: normalizeAngle(initialTransits.Saturn + (SPEED.Saturn * tIdx)),
            Jupiter: normalizeAngle(initialTransits.Jupiter + (SPEED.Jupiter * tIdx))
        };
        const axesList = Object.keys(natalDefinitions.axes);
        axesList.forEach(axis => {
            // simplified checkGate
            const def = transitMapping.axes[axis];
            let gate = "HOLD";
            let mult = 0.95;
            if (def.houses.includes(getHouseNumber(refAsc, transits.Saturn))) { gate = "BLOCK"; mult = 0.65; }
            if (gate !== "BLOCK" && def.houses.includes(getHouseNumber(refAsc, transits.Jupiter))) { gate = "OPEN"; mult = 1.25; }

            const fInt = individualDashaLayer['Chandra'][axis][tIdx].intensity; // approx
            const effInt = Math.floor(fInt * mult);

            if (!effectiveLayer.axes[axis]) effectiveLayer.axes[axis] = [];
            effectiveLayer.axes[axis].push({ time: t, effective_intensity: effInt, gate });
        });
    });

    // OUTPUT
    console.log(JSON.stringify(effectiveLayer.axes['career'], null, 2));
}

run();
