const express = require('express');
const router = express.Router();
const path = require('path');
const { loadYamlOrThrow } = require('../utils/yamlHelper');
const { loadInterpretationPack } = require('../utils/interpretationLoader');

// --- CONSTANTS ---
const BASE_PATH = path.join(__dirname, '../Family OS - V/05_Time_Engine');
const FILES = {
    FUNCTIONAL_NATURE: '05_01_functional_nature_by_lagna.yaml',
    YOGAKARAKA_MULTIPLIER: '05_02_yogakaraka_axis_multiplier.yaml',
    TRANSIT_MAPPING: '05_03_transit_axis_mapping.yaml',
    NATAL_DEFINITIONS: '05_04_natal_axis_definitions.yaml'
};

// --- ASTROLOGY UTILS ---
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
    const ascSignStart = Math.floor(ascendantLong / 30) * 30; // Equal House / Whole Sign simplified
    const diff = normalizeAngle(planetLong - ascSignStart);
    return Math.floor(diff / 30) + 1;
};

const getSignLord = (signName) => LORDS[signName];

const getPlanetStrength = (planetName, planetLong, chart) => {
    // Basic Dignity Logic (Simplified for Determinism)
    // 0-100 Score based on sign placement
    // Exaltation/Debilitation/Own Sign logic
    const sign = getSignName(planetLong);
    const rules = {
        Sun: { exalt: "Aries", debil: "Libra", own: "Leo" },
        Moon: { exalt: "Taurus", debil: "Scorpio", own: "Cancer" },
        Mars: { exalt: "Capricorn", debil: "Cancer", own: ["Aries", "Scorpio"] },
        Mercury: { exalt: "Virgo", debil: "Pisces", own: ["Gemini", "Virgo"] },
        Jupiter: { exalt: "Cancer", debil: "Capricorn", own: ["Sagittarius", "Pisces"] },
        Venus: { exalt: "Pisces", debil: "Virgo", own: ["Taurus", "Libra"] },
        Saturn: { exalt: "Libra", debil: "Aries", own: ["Capricorn", "Aquarius"] },
        Rahu: { exalt: "Taurus", debil: "Scorpio", own: "Aquarius" }, // Approximate
        Ketu: { exalt: "Scorpio", debil: "Taurus", own: "Scorpio" }   // Approximate
    };

    const r = rules[planetName];
    if (!r) return 50;

    if (r.exalt === sign) return 95;
    if (r.debil === sign) return 10;
    if (Array.isArray(r.own) ? r.own.includes(sign) : r.own === sign) return 80;

    // Friend/Enemy/Neutral simplified (Placeholder for creating basic 0-100 variance)
    return 60; // Neutral baseline
};

const calculateHouseStrength = (houseNum, chart, ascendant) => {
    // Strength = Occupancy + Lord Strength
    // Find planets in this house
    let strength = 0;
    let planetsInHouse = 0;
    let totalPlanetStrength = 0;

    // Determine Sign of this House
    const houseSignIdx = (getSignIndex(ascendant) + (houseNum - 1)) % 12;
    const houseSign = SIGNS[houseSignIdx];
    const lord = LORDS[houseSign];

    // Lord Strength
    const lordLong = chart[lord];
    if (lordLong !== undefined) {
        strength += getPlanetStrength(lord, lordLong, chart);
    }

    // Occupancy
    PLANETS.forEach(p => {
        if (chart[p]) {
            const h = getHouseNumber(ascendant, chart[p]);
            if (h === houseNum) {
                planetsInHouse++;
                totalPlanetStrength += getPlanetStrength(p, chart[p], chart);
            }
        }
    });

    // Weighted Average
    if (planetsInHouse > 0) {
        strength = (strength + (totalPlanetStrength / planetsInHouse)) / 2;
    }

    return Math.min(100, strength);
};

const calculateLordStrength = (houseNum, chart, ascendant) => {
    const houseSignIdx = (getSignIndex(ascendant) + (houseNum - 1)) % 12;
    const houseSign = SIGNS[houseSignIdx];
    const lord = LORDS[houseSign];
    if (!chart[lord]) return 0;
    return getPlanetStrength(lord, chart[lord], chart);
};

// --- YOGA DETECTOR ---
const detectYogas = (chart, ascendant) => {
    const yogas = [];
    // Basic Logic for requested Yogas in YAML
    // Raja Yoga: Conjunction/Aspect of Kendra (1,4,7,10) and Trikona (1,5,9) Lords
    // Dhana Yoga: 2, 11 Lords relationship
    // Dharma-Karma: 9, 10 Lords

    const getLordOf = (h) => LORDS[SIGNS[(getSignIndex(ascendant) + (h - 1)) % 12]];
    const checkRelation = (p1, p2) => {
        // Conjunction
        const h1 = getHouseNumber(ascendant, chart[p1]);
        const h2 = getHouseNumber(ascendant, chart[p2]);
        return h1 === h2;
    };

    // Dharma Karma Adhipati (9 + 10)
    if (checkRelation(getLordOf(9), getLordOf(10))) yogas.push('dharma_karma_adhipati');

    // Dhana Yoga (2 + 11 connection)
    if (checkRelation(getLordOf(2), getLordOf(11))) yogas.push('dhana_yoga');
    if (checkRelation(getLordOf(2), getLordOf(5))) yogas.push('dhana_yoga');
    if (checkRelation(getLordOf(2), getLordOf(9))) yogas.push('dhana_yoga');

    // Raja Yoga (Kendra + Trikona)
    const kendras = [1, 4, 7, 10];
    const trikonas = [1, 5, 9];
    let hasRaja = false;
    kendras.forEach(k => {
        trikonas.forEach(t => {
            if (checkRelation(getLordOf(k), getLordOf(t))) hasRaja = true;
        });
    });
    if (hasRaja) yogas.push('raja_yoga');

    // Amala Yoga (Benefic in 10th from Asc/Moon) - Simplified to 10th from Asc
    const pIn10 = PLANETS.filter(p => getHouseNumber(ascendant, chart[p]) === 10);
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    if (pIn10.some(p => benefics.includes(p))) yogas.push('amala_yoga');

    // Vipareeta Raja Yoga (6/8/12 lords in 6/8/12)
    const dusthanas = [6, 8, 12];
    let isVipareeta = true;
    dusthanas.forEach(h => {
        const lord = getLordOf(h);
        const placedIn = getHouseNumber(ascendant, chart[lord]);
        if (!dusthanas.includes(placedIn)) isVipareeta = false;
    });
    if (isVipareeta) yogas.push('vipareeta_raja_yoga');

    return yogas;
};


// --- ROUTE ---
router.post('/calculate', async (req, res) => {
    try {
        const { members, familyId, startDate, endDate } = req.body; // Expecting startDate 'YYYY-MM'
        if (!members || !members.length) throw new Error("Members required");

        // LOAD CONTRACTS (Logic)
        const functionalNature = loadYamlOrThrow(path.join(BASE_PATH, FILES.FUNCTIONAL_NATURE));
        const yogakarakaMult = loadYamlOrThrow(path.join(BASE_PATH, FILES.YOGAKARAKA_MULTIPLIER));
        const transitMapping = loadYamlOrThrow(path.join(BASE_PATH, FILES.TRANSIT_MAPPING));
        const natalDefinitions = loadYamlOrThrow(path.join(BASE_PATH, FILES.NATAL_DEFINITIONS));

        // LOAD GOVERNANCE (New Authentic Sources)
        const phaseThresholds = loadYamlOrThrow(path.join(BASE_PATH, 'interpretation/governance/55_01_time_phase_thresholds.yaml'));
        const riskThresholds = loadYamlOrThrow(path.join(BASE_PATH, 'interpretation/governance/55_03_emotional_risk_thresholds.yaml'));

        const start = new Date(startDate || new Date());
        const end = new Date(endDate || new Date(start.getFullYear() + 10, start.getMonth(), 1));

        // --- STEP 1: NATAL LAYER (Compute Base Strength per Axis) ---
        const natalLayer = { members: {} };
        const memberData = members.map(m => {
            // Normalize Chart Keys & Find Planets (Recursive)
            const findPlanets = (obj, depth = 0) => {
                if (!obj || typeof obj !== 'object' || depth > 3) return null;
                const keys = Object.keys(obj);
                const hasSun = keys.some(k => /^sun$/i.test(k));
                const hasMoon = keys.some(k => /^moon$/i.test(k));
                if (hasSun && hasMoon) return obj;
                for (let k of keys) {
                    const found = findPlanets(obj[k], depth + 1);
                    if (found) return found;
                }
                return null;
            };
            let rawChart = findPlanets(m.chart_object) || m.chart_object;
            const chart = {};
            if (rawChart) {
                Object.keys(rawChart).forEach(k => {
                    const key = k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
                    const val = rawChart[k];
                    chart[key] = (val && typeof val === 'object' && val.longitude !== undefined) ? Number(val.longitude) : Number(val);
                });
            }
            const asc = chart.Ascendant || 0;

            // Calc Base Strengths
            const axisStrengths = {};
            const axesKeys = Object.keys(natalDefinitions.axes);
            const globalWeights = natalDefinitions.global_weights;

            const detectedYogas = detectYogas(chart, asc);

            axesKeys.forEach(axis => {
                const def = natalDefinitions.axes[axis];

                // House Strength
                let hStr = 0;
                def.houses.primary.forEach(h => hStr += calculateHouseStrength(h, chart, asc) * (def.house_contribution.primary_house_weight || 1));
                if (def.houses.secondary) {
                    def.houses.secondary.forEach(h => hStr += calculateHouseStrength(h, chart, asc) * (def.house_contribution.secondary_house_weight || 0));
                }

                // Lord Strength
                let lStr = 0;
                const pLords = Array.isArray(def.lords.primary_lord) ? def.lords.primary_lord : [def.lords.primary_lord];
                pLords.forEach(l => lStr += calculateLordStrength(l, chart, asc));

                // Yoga Bonus
                let yBonus = 0;
                if (def.supporting_yogas) {
                    if (def.supporting_yogas.strong && def.supporting_yogas.strong.some(y => detectedYogas.includes(y))) yBonus += 100;
                    if (def.supporting_yogas.moderate && def.supporting_yogas.moderate.some(y => detectedYogas.includes(y))) yBonus += 50;
                }

                // Formula: H*w + L*w + Y*w
                let base = (hStr * globalWeights.house_strength_weight) +
                    (lStr * globalWeights.lord_strength_weight) +
                    (yBonus * globalWeights.yoga_weight);

                // No Yoga Cap
                if (yBonus === 0 && base > natalDefinitions.caps.no_yoga_cap) {
                    base = natalDefinitions.caps.no_yoga_cap;
                }

                axisStrengths[axis] = Math.min(100, Math.floor(base));
            });

            natalLayer.members[m.id] = { ...axisStrengths, _debug_chart_keys: Object.keys(chart) };
            return { ...m, axisStrengths, ascendant: asc, chart };
        });

        // --- STEP 2: INDIVIDUAL DASHA ENGINE ---
        const timeline = [];
        let curr = new Date(start);
        while (curr <= end) {
            timeline.push(curr.toISOString().slice(0, 7)); // YYYY-MM
            curr.setMonth(curr.getMonth() + 1);
        }

        const individualDashaLayer = {}; // m.id -> axis -> [{time, intensity}]

        memberData.forEach(m => {
            let lagnaSign = getSignName(m.ascendant);
            if (!lagnaSign) lagnaSign = "Aries";
            const funcNature = functionalNature.lagnas[lagnaSign] || functionalNature.lagnas["Aries"];
            const yogakarakas = funcNature.yogakaraka || [];

            individualDashaLayer[m.id] = {};
            const runningDasha = { md: 'Saturn', ad: 'Venus' }; // Mock Dasha

            Object.keys(m.axisStrengths).forEach(axis => {
                const base = m.axisStrengths[axis];
                const curve = timeline.map(t => {
                    let mult = 1.0;
                    if (yogakarakas.includes(runningDasha.md)) mult *= (yogakarakaMult.axes[axis]?.mahadasha || 1.25);
                    if (funcNature.functional_malefic.includes(runningDasha.md)) mult *= 0.8;
                    if (funcNature.functional_benefic.includes(runningDasha.md)) mult *= 1.1;

                    let intensity = Math.min(100, base * mult);
                    return { time: t, intensity: Math.floor(intensity) };
                });
                individualDashaLayer[m.id][axis] = curve;
            });
        });

        // --- STEP 3: FAMILY ORGANISM MERGE ---
        const familyLayer = { axes: {}, dominant_axis: [] };
        const axesList = Object.keys(natalDefinitions.axes);

        timeline.forEach((t, tIdx) => {
            const tScores = {};
            let maxScore = -1;
            let dom = null;

            axesList.forEach(axis => {
                let numer = 0;
                let denom = 0;
                memberData.forEach(m => {
                    const iVal = individualDashaLayer[m.id][axis][tIdx].intensity;
                    numer += iVal;
                    denom += 100;
                });
                const famInt = denom === 0 ? 0 : (numer / denom) * 100;
                tScores[axis] = Math.floor(famInt);
                if (famInt > maxScore) { maxScore = famInt; dom = axis; }
                if (!familyLayer.axes[axis]) familyLayer.axes[axis] = [];
                familyLayer.axes[axis].push({ time: t, family_intensity: tScores[axis] });
            });
            familyLayer.dominant_axis.push({ time: t, axis: dom });
        });

        // --- STEP 4 & 5: TRANSIT & TRACE ENGINE ---
        const transitLayer = { axes: {} };
        const effectiveLayer = { axes: {} };
        const guidanceLayer = { axes: {} };
        const traceLayer = { axes: {} }; // New Trace Layer

        // Initial Transits (Mock - Jan 2026)
        const initialTransits = { Saturn: 345, Jupiter: 75, Rahu: 315, Ketu: 135 };
        const TRANSIT_SPEEDS = { Saturn: 1.0, Jupiter: 2.5, Rahu: -1.5, Ketu: -1.5 };
        const refAsc = memberData[0].ascendant;

        // Trace Helper
        const evaluateGateAndTrace = (axis, t, tIdx, transits, currentEmotionalLoad) => {
            const steps = [];
            let gate = "HOLD"; // Default from Governance
            let multiplier = 0.95; // Default HOLD multiplier

            // 1. DETERMINE EMOTIONAL RISK
            // Thresholds from 55_03
            const riskConfig = riskThresholds.thresholds; // { low: { max: 40 }, moderate: { max: 70 } ... }
            let riskLevel = "LOW";
            if (currentEmotionalLoad >= riskConfig.high.min) riskLevel = "HIGH";
            else if (currentEmotionalLoad >= riskConfig.moderate.min) riskLevel = "MODERATE";

            steps.push({
                step: 1,
                rule: "EMOTIONAL_RISK_CHECK",
                risk_level: riskLevel,
                load_intensity: currentEmotionalLoad,
                outcome: riskLevel
            });

            // 2. CHECK BLOCK (Priority 1)
            // Rules from 55_01
            const transitDef = transitMapping.axes[axis];
            if (!transitDef) return { gate, multiplier, steps };

            const satPos = transits.Saturn;
            const satHouse = getHouseNumber(refAsc, satPos);
            const isBlocked = transitDef.houses.includes(satHouse);

            if (isBlocked) {
                gate = "BLOCK";
                multiplier = 0.65; // Should ideally come from Governance yaml constant
                steps.push({
                    step: 2,
                    rule: "SATURN_BLOCK_CHECK",
                    planet: "Saturn",
                    house_hit: satHouse,
                    outcome: "BLOCK_FOUND"
                });
                // Block stops further expansion logic
                steps.push({ step: 3, rule: "PHASE_RESOLUTION", final: "BLOCK" });
                return { gate, multiplier, steps };
            } else {
                steps.push({
                    step: 2,
                    rule: "SATURN_BLOCK_CHECK",
                    outcome: "CLEAR"
                });
            }

            // 3. CHECK OPEN (Priority 2)
            const jupPos = transits.Jupiter;
            const jupHouse = getHouseNumber(refAsc, jupPos);
            const isOpen = transitDef.houses.includes(jupHouse);

            if (isOpen) {
                // 4. APPLY EMOTIONAL RISK MODIFIERS (Governance 55_03)
                // "High Emotional Risk suppresses OPEN"
                if (riskLevel === "HIGH") {
                    gate = "HOLD"; // Suppressed
                    multiplier = 0.85; // Suppressed Multiplier
                    steps.push({
                        step: 3,
                        rule: "JUPITER_OPEN_CHECK",
                        outcome: "OPEN_FOUND_BUT_SUPPRESSED",
                        suppression_reason: "HIGH_EMOTIONAL_RISK"
                    });
                } else {
                    gate = "OPEN";
                    multiplier = 1.25;
                    steps.push({
                        step: 3,
                        rule: "JUPITER_OPEN_CHECK",
                        outcome: "OPEN_CONFIRMED"
                    });
                }
            } else {
                gate = "HOLD";
                steps.push({
                    step: 3,
                    rule: "JUPITER_OPEN_CHECK",
                    outcome: "NO_EXPANSION"
                });
            }

            steps.push({ step: 4, rule: "PHASE_RESOLUTION", final: gate });
            return { gate, multiplier, steps };
        };

        timeline.forEach((t, tIdx) => {
            // Simulate Movement
            const transits = {
                Saturn: normalizeAngle(initialTransits.Saturn + (TRANSIT_SPEEDS.Saturn * tIdx)),
                Jupiter: normalizeAngle(initialTransits.Jupiter + (TRANSIT_SPEEDS.Jupiter * tIdx)),
                Rahu: normalizeAngle(initialTransits.Rahu + (TRANSIT_SPEEDS.Rahu * tIdx)),
                Ketu: normalizeAngle(initialTransits.Ketu + (TRANSIT_SPEEDS.Ketu * tIdx))
            };

            // Get Emotional Load for this month
            // Note: 'emotional_load' axis key might fail if lowercase handling differs. 
            // The logic above uses keys from 'natalDefinitions', usually 'emotional_load'.
            const emotionalLoadInt = familyLayer.axes['emotional_load']?.[tIdx]?.family_intensity || 0;

            axesList.forEach(axis => {
                const { gate, multiplier, steps } = evaluateGateAndTrace(axis, t, tIdx, transits, emotionalLoadInt);

                const fInt = familyLayer.axes[axis][tIdx].family_intensity;
                const effInt = Math.min(135, Math.floor(fInt * multiplier));

                // Populate Layers
                if (!transitLayer.axes[axis]) transitLayer.axes[axis] = [];
                transitLayer.axes[axis].push({ time: t, gate, multiplier, dominant_planet: gate === "BLOCK" ? "Saturn" : (gate === "OPEN" ? "Jupiter" : "Neutral") });

                if (!effectiveLayer.axes[axis]) effectiveLayer.axes[axis] = [];
                effectiveLayer.axes[axis].push({
                    time: t,
                    family_intensity: fInt,
                    transit_multiplier: multiplier,
                    effective_intensity: effInt
                });

                if (!guidanceLayer.axes[axis]) guidanceLayer.axes[axis] = [];
                guidanceLayer.axes[axis].push({ time: t, guidance_key: `current.${gate}.medium` }); // Simplified for now

                // Trace
                if (!traceLayer.axes[axis]) traceLayer.axes[axis] = [];
                traceLayer.axes[axis].push({
                    time: t,
                    phase_resolution: gate,
                    evaluation_steps: steps
                });
            });
        });

        // OUTPUT
        const output = {
            metadata: { system: "astrogravity", version: "1.1.0", family_id: familyId, trace_enabled: true },
            natal_layer: natalLayer,
            individual_dasha_layer: individualDashaLayer,
            family_mahadasha_layer: familyLayer,
            transit_layer: transitLayer,
            effective_intensity_layer: effectiveLayer,
            guidance_layer: guidanceLayer,
            trace_layer: traceLayer
        };

        res.json({ success: true, data: output });

    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message });
    }
});

router.get('/interpretations', (req, res) => {
    try {
        const lang = req.query.lang || 'en';
        const pack = loadInterpretationPack(lang);
        res.json({ success: true, data: pack });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
