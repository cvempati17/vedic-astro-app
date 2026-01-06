const path = require('path');
const { loadYamlOrThrow } = require('./utils/yamlHelper');

const BASE_PATH = path.join(__dirname, 'Family OS - V/05_Time_Engine');
const FILES = {
    FUNCTIONAL_NATURE: '05_01_functional_nature_by_lagna.yaml',
    YOGAKARAKA_MULTIPLIER: '05_02_yogakaraka_axis_multiplier.yaml',
    TRANSIT_MAPPING: '05_03_transit_axis_mapping.yaml',
    NATAL_DEFINITIONS: '05_04_natal_axis_definitions.yaml'
};

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
    if (lordLong !== undefined) {
        strength += getPlanetStrength(lord, lordLong, chart);
    }

    PLANETS.forEach(p => {
        if (chart[p] !== undefined) {
            const h = getHouseNumber(ascendant, chart[p]);
            if (h === houseNum) {
                planetsInHouse++;
                totalPlanetStrength += getPlanetStrength(p, chart[p], chart);
            }
        }
    });

    if (planetsInHouse > 0) {
        strength = (strength + (totalPlanetStrength / planetsInHouse)) / 2;
    }

    return Math.min(100, strength);
};

const calculateLordStrength = (houseNum, chart, ascendant) => {
    const houseSignIdx = (getSignIndex(ascendant) + (houseNum - 1)) % 12;
    const houseSign = SIGNS[houseSignIdx];
    const lord = LORDS[houseSign];
    if (chart[lord] === undefined) return 0;
    return getPlanetStrength(lord, chart[lord], chart);
};

const detectYogas = (chart, ascendant) => {
    // Mock simplified
    return [];
};

async function runDebug() {
    try {
        const members = [
            {
                id: 'Chandra',
                chart_object: {
                    planets: {
                        Ascendant: 43.53,
                        Sun: 90.9,
                        Moon: 164.7,
                        Mars: 108.03,
                        Mercury: 116.31,
                        Jupiter: 247.3,
                        Venus: 55.8,
                        Saturn: 52.23,
                        Rahu: 272.55,
                        Ketu: 92.55
                    }
                }
            }
        ];

        console.log("Loading YAMLs from:", BASE_PATH);
        const natalDefinitions = loadYamlOrThrow(path.join(BASE_PATH, FILES.NATAL_DEFINITIONS));
        const functionalNature = loadYamlOrThrow(path.join(BASE_PATH, FILES.FUNCTIONAL_NATURE));
        const yogakarakaMult = loadYamlOrThrow(path.join(BASE_PATH, FILES.YOGAKARAKA_MULTIPLIER));

        const memberData = members.map(m => {
            let rawChart = m.chart_object.planets || m.chart_object;
            const chart = {};
            if (rawChart) {
                Object.keys(rawChart).forEach(k => {
                    const key = k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
                    const val = rawChart[k];
                    chart[key] = (val && typeof val === 'object' && val.longitude !== undefined) ? Number(val.longitude) : Number(val);
                });
            }
            const asc = chart.Ascendant || 0;
            console.log("Chart Loaded:", Object.keys(chart));
            console.log("Ascendant:", asc, getSignName(asc));

            // CAREER ONLY DEBUG
            const axesKeys = ['career'];
            const globalWeights = natalDefinitions.global_weights;

            axesKeys.forEach(axis => {
                const def = natalDefinitions.axes[axis];
                if (!def) {
                    console.log("Axis definition not found for:", axis);
                    return;
                }

                // House Strength
                let hStr = 0;
                def.houses.primary.forEach(h => {
                    const val = calculateHouseStrength(h, chart, asc);
                    console.log(`Primary House ${h} Strength: ${val}`);
                    hStr += val * (def.house_contribution.primary_house_weight || 1);
                });

                // Lord Strength
                let lStr = 0;
                const pLords = Array.isArray(def.lords.primary_lord) ? def.lords.primary_lord : [def.lords.primary_lord];
                pLords.forEach(l => {
                    const val = calculateLordStrength(l, chart, asc);
                    console.log(`Primary Lord of House ${l} Strength: ${val}`);
                    lStr += val;
                });

                let base = (hStr * globalWeights.house_strength_weight) +
                    (lStr * globalWeights.lord_strength_weight);

                console.log(`[DEBUG] Final Base for Career: ${base}`);
            });
        });

    } catch (e) {
        console.error(e);
    }
}

runDebug();
