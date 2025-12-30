
// Astrogravity Business Partnership Engine
// Based on astrogravity_rules_v4.yaml (Single Source of Truth)

// =====================================================
// CONFIGURATION (From YAML)
// =====================================================

const CONFIG = {
    engine: {
        name: "astrogravity_business_engine",
        version: 3.1,
        philosophy: {
            astrology_role: "scoring_signal",
            prediction: false,
            explainable: true,
            ai_ready: true,
            learning_enabled: true
        }
    },
    score_scale: {
        min: 0,
        max: 10
    },
    weights: {
        promise: 0.40,
        activation: 0.20,
        timing: 0.20,
        partnership: 0.15,
        learning_adjustment: 0.05
    },
    houses: {
        1: { name: "identity", weight: 0.05 },
        2: { name: "capital", weight: 0.10 },
        3: { name: "communication", weight: 0.03 },
        4: { name: "foundation", weight: 0.04 },
        5: { name: "creativity", weight: 0.05 },
        6: { name: "operations", weight: 0.12 },
        7: { name: "partnership", weight: 0.15 },
        8: { name: "risk", weight: 0.06 },
        9: { name: "vision", weight: 0.05 },
        10: { name: "authority", weight: 0.20 },
        11: { name: "scale", weight: 0.18 },
        12: { name: "loss", weight: 0.02 }
    },
    rashis: {
        aries: { execution: +1.0, volatility: +0.5 },
        taurus: { stability: +1.5 },
        gemini: { intellect: +1.2, volatility: +0.5 },
        cancer: { emotional_bias: +0.6 },
        leo: { authority: +1.5, ego_risk: +0.5 },
        virgo: { execution: +1.5 },
        libra: { partnership: +1.5 },
        scorpio: { risk: +1.0 },
        sagittarius: { vision: +1.2 },
        capricorn: { stability: +2.0 },
        aquarius: { innovation: +1.5, volatility: +1.0 },
        pisces: { diffusion: -1.0 }
    },
    planets: {
        sun: { function: "authority", base: 1.2 },
        moon: { function: "stability", base: 0.8 },
        mars: { function: "execution", base: 1.1 },
        mercury: { function: "intellect", base: 1.0 },
        jupiter: { function: "expansion", base: 1.3 },
        venus: { function: "harmony", base: 0.9 },
        saturn: { function: "discipline", base: 1.4 },
        rahu: { function: "ambition", base: 1.2 },
        ketu: { function: "detachment", base: 0.6 }
    },
    avastha: {
        exalted: 1.5,
        own: 1.3,
        friendly: 1.1,
        neutral: 1.0,
        debilitated: 0.6
    },
    combustion: {
        orbs: {
            mercury: 14,
            venus: 10,
            mars: 17,
            jupiter: 11,
            saturn: 15
        },
        penalty: -1.0,
        mitigation: {
            exalted: +0.3,
            own_sign: +0.2,
            jupiter_aspect: +0.4
        }
    },
    aspects: {
        conjunction: { max_orb: 8, weight: 1.0 },
        opposition: { max_orb: 8, weight: -0.8 },
        trine: { max_orb: 7, weight: 0.8 },
        square: { max_orb: 6, weight: -0.7 },
        sextile: { max_orb: 5, weight: 0.6 }
    },
    planetary_phases: {
        waxing: { multiplier: 1.1 },
        waning: { multiplier: 0.9 },
        retrograde: { multiplier: 0.7, flag: "review_mode" }
    },
    house_planet_matrix: {
        sun: { 10: +2.0, 7: +1.0, 6: -0.5 },
        mars: { 6: +1.5, 10: +1.0, 7: -1.0 },
        mercury: { 2: +1.0, 11: +1.5 },
        saturn: { 10: +2.0, 6: +1.0, 7: -1.2 }
    },
    role_axes: {
        vision: ["sun", "jupiter", "rahu"],
        execution: ["mars", "saturn"],
        integration: ["venus", "moon"],
        intellect: ["mercury"],
        risk: ["mars", "rahu", "saturn"]
    },
    roles: {
        strategic_founder: { min_scores: { vision: 7, authority: 6 } },
        operating_partner: { min_scores: { execution: 7, discipline: 6 } },
        idea_partner: { min_scores: { intellect: 7, vision: 6 } },
        advisory: { max_execution: 4 }
    },
    partnership: {
        synergy_rules: {
            complementary_roles: +2.0,
            shared_growth_axis: +1.5
        },
        friction_rules: {
            authority_overlap: -1.5,
            mars_saturn_conflict: -1.2
        },
        dependency_penalty: -2.0,
        weights: {
            synergy: 0.5,
            role_fit: 0.3,
            friction: 0.2
        }
    },
    composite_engine: {
        method: "midpoint",
        planets_included: ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"],
        scoring_rules: {
            sun_10th: +2.5,
            mars_6th: +1.5,
            saturn_7th: -1.5,
            jupiter_11th: +2.0
        }
    },
    time_series: {
        granularity: "monthly",
        horizon_months: 24,
        drift: {
            activation_decay: -0.05,
            synergy_growth: +0.03,
            friction_growth: -0.04
        }
    },
    learning_engine: {
        enabled: true,
        inputs: ["revenue_growth", "execution_consistency", "conflict_events"],
        adjustment: {
            success: { condition: "revenue_growth > threshold AND conflict_events low", weight_shift: { partnership: +0.03 } },
            failure: { condition: "conflict_events high", weight_shift: { partnership: -0.03 } }
        }
    },
    gates: {
        min_promise: 4.0,
        min_compatibility: 50
    }
};

// =====================================================
// HELPER FUNCTIONS (Deterministic)
// =====================================================

// Helper: Normalize Angle (0-360)
const normalizeAngle = (angle) => {
    let a = angle % 360;
    return a < 0 ? a + 360 : a;
};

// Helper: Get Rashi from Longitude
const getRashi = (longitude) => {
    const rashiNames = [
        "aries", "taurus", "gemini", "cancer", "leo", "virgo",
        "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
    ];
    const index = Math.floor(normalizeAngle(longitude) / 30);
    return rashiNames[index];
};

// Helper: Calculate difference between two angles (shortest path)
const angleDiff = (a1, a2) => {
    let diff = Math.abs(a1 - a2) % 360;
    return diff > 180 ? 360 - diff : diff;
};

// Helper: Get House Number (1-12) given Ascendant and Planet Longitude
const getHouseNumber = (ascendantLong, planetLong) => {
    // Whole Sign House System (Standard for Vedic)
    // Or Bhav Chalit? prompt implies "Astrogravity" which uses simple weights.
    // Let's use Whole Sign for determinism and simplicity unless specified.
    // Rule says "House-Planet Matrix: sun 10: +2.0". This implies Rashi chart positions usually.
    // Let's use Whole Sign logic based on Ascendant Rashi.
    const ascRashi = Math.floor(normalizeAngle(ascendantLong) / 30);
    const planetRashi = Math.floor(normalizeAngle(planetLong) / 30);
    let house = (planetRashi - ascRashi + 1);
    if (house <= 0) house += 12;
    return house;
};

// =====================================================
// ENGINE LOGIC
// =====================================================

/**
 * Calculates the Individual Score (Promise, Activation, etc.) for a single chart.
 * @param {Object} chart - { planets: { sun: long, ... }, ascendant: long }
 */
const calculateIndividualScore = (chart) => {
    // 1. Base Potential (Promise)
    let promiseScore = 0;
    let totalPlanets = 0;

    if (!chart || !chart.planets) {
        console.warn("Invalid chart provided to engine:", chart);
        return {
            promise: 0,
            activation: 0,
            timing: 0,
            role_scores: {
                vision: 0, execution: 0, integration: 0, intellect: 0, risk: 0, authority: 0, discipline: 0
            }
        };
    }

    // Iterate planets to calc strength
    for (const [planetName, planetLong] of Object.entries(chart.planets)) {
        if (!CONFIG.planets[planetName]) continue;

        let planetScore = CONFIG.planets[planetName].base;
        const house = getHouseNumber(chart.ascendant, planetLong);
        const rashi = getRashi(planetLong);

        // Apply House Weight
        if (CONFIG.houses[house]) {
            planetScore *= (1 + CONFIG.houses[house].weight);
        }

        // Apply Rashi Modifiers (Simplified from YAML keys)
        if (CONFIG.rashis[rashi]) {
            // Just take the first valid modifier found or average them? 
            // YAML says "aries: { execution: +1.0 }". 
            // This maps to "role" scores likely, but for general promise?
            // "min_promise: 4.0" is a gate.
            // Let's sum modifiers.
            const modifiers = Object.values(CONFIG.rashis[rashi]).reduce((a, b) => a + b, 0);
            planetScore += (modifiers * 0.1); // Scaling factor assumption to not blow up score
        }

        // Apply Avastha (Exalted/Debilitated)
        // Hardcoded simplifications for standard vedic positions
        // Exaltation points: Sun-10(Aries), Moon-33(Taurus), Mars-298(Cap), Merc-165(Virgo), Jup-95(Cancer), Ven-357(Pisces), Sat-200(Libra)
        // Simplified Rashi check for "Own" / "Exalted"
        // TODO: Implement full avastha logic if needed. For now, defaulting to Neutral (1.0).
        // Using simplified "Own Sign" check
        // Sun: Leo(5); Moon: Cancer(4); Mars: Aries(1), Scorpio(8); Merc: Gem(3), Vir(6); Jup: Sag(9), Pis(12); Ven: Tau(2), Lib(7); Sat: Cap(10), Aqu(11)
        // Exalted: Sun(Ar), Moon(Ta), Mars(Cp), Merc(Vi), Jup(Cn), Ven(Pi), Sat(Li)
        // Debilitated: Sun(Li), Moon(Sc), Mars(Cn), Merc(Pi), Jup(Cp), Ven(Vi), Sat(Ar)

        const rashiIdx = Math.floor(normalizeAngle(planetLong) / 30) + 1; // 1-12
        let avasthaMult = CONFIG.avastha.neutral;

        // Basic Own/Exalt/Debil logic
        const signs = {
            sun: { own: [5], ex: 1, deb: 7 },
            moon: { own: [4], ex: 2, deb: 8 },
            mars: { own: [1, 8], ex: 10, deb: 4 },
            mercury: { own: [3, 6], ex: 6, deb: 12 }, // Merc ex in Virgo (6)
            jupiter: { own: [9, 12], ex: 4, deb: 10 },
            venus: { own: [2, 7], ex: 12, deb: 6 },
            saturn: { own: [10, 11], ex: 7, deb: 1 },
            rahu: { own: [], ex: 2, deb: 8 }, // approximate
            ketu: { own: [], ex: 8, deb: 2 }  // approximate
        };

        const pSign = signs[planetName];
        if (pSign) {
            if (pSign.own.includes(rashiIdx)) avasthaMult = CONFIG.avastha.own;
            else if (pSign.ex === rashiIdx) avasthaMult = CONFIG.avastha.exalted;
            else if (pSign.deb === rashiIdx) avasthaMult = CONFIG.avastha.debilitated;
        }
        planetScore *= avasthaMult;

        // Apply House-Planet Matrix
        if (CONFIG.house_planet_matrix[planetName] && CONFIG.house_planet_matrix[planetName][house]) {
            planetScore += CONFIG.house_planet_matrix[planetName][house];
        }

        promiseScore += planetScore;
        totalPlanets++;
    }

    // Normalize Promise Score to 0-10 scale
    // Avg planet score ~ 1.5. 9 planets -> 13.5. 
    // We want output max 10.
    promiseScore = (promiseScore / totalPlanets) * 5; // Adjustment to map to roughly 0-10
    promiseScore = Math.min(10, Math.max(0, promiseScore));

    return {
        promise: promiseScore,
        activation: promiseScore * 0.8, // Simplified: Activation correlated to promise initially
        timing: 5.0, // Neutral start
        role_scores: calculateRoleScores(chart) // Helper needed
    };
};

/**
 * Calculates Role Scores based on Role Axes
 */
const calculateRoleScores = (chart) => {
    let scores = {
        vision: 0,
        execution: 0,
        integration: 0,
        intellect: 0,
        risk: 0,
        authority: 0,
        discipline: 0
    };

    // Calculate raw planetary strengths first (simplified reuse of logic above or new calc)
    // For simplicity, we assign strength 1-10 per planet based on Avastha/House
    const planetStrengths = {};
    for (const [planetName, planetLong] of Object.entries(chart.planets)) {
        let strength = 5; // base
        const house = getHouseNumber(chart.ascendant, planetLong);
        // House bonuses
        if ([1, 10, 11, 9, 5].includes(house)) strength += 2;
        if ([6, 8, 12].includes(house)) strength -= 1;
        planetStrengths[planetName] = strength;
    }

    // Map to Role Axes
    for (const [axis, planets] of Object.entries(CONFIG.role_axes)) {
        let axisScore = 0;
        planets.forEach(p => {
            if (planetStrengths[p]) axisScore += planetStrengths[p];
        });
        scores[axis] = axisScore / planets.length; // Average
    }

    // Specific functional scores (mapping planets directly)
    scores.authority = planetStrengths['sun'] || 0;
    scores.discipline = planetStrengths['saturn'] || 0;

    return scores;
};

/**
 * Calculates Compatibility between two charts
 */
const calculateCompatibility = (chartA, chartB) => {
    const scoresA = calculateIndividualScore(chartA);
    const scoresB = calculateIndividualScore(chartB);

    // 1. Synergy (Complementary Roles)
    // Rule: complementary_roles: +2.0
    // Check if max role of A is different from max role of B? 
    // Or if A covers B's weaknesses?
    // Let's assume complementarity if Top Role is different.
    const getTopRole = (s) => Object.entries(s.role_scores).sort((a, b) => b[1] - a[1])[0][0];
    const roleA = getTopRole(scoresA);
    const roleB = getTopRole(scoresB);

    let synergyScore = 5.0; // Base
    if (roleA !== roleB) synergyScore += CONFIG.partnership.synergy_rules.complementary_roles;

    // Shared Growth Axis
    // If both have high Vision or Scale (11th house)? 
    // Simplified: Check Jupiter/11th house strength.

    // 2. Friction
    // authority_overlap: -1.5 (Both high Sun/Leo/10th)
    let frictionScore = 0;
    if (scoresA.role_scores.authority > 7 && scoresB.role_scores.authority > 7) {
        frictionScore += Math.abs(CONFIG.partnership.friction_rules.authority_overlap);
    }

    // Mars-Saturn Conflict (Mars in A conj/opp Saturn in B)
    // Check Synastry
    for (const p1 of ['mars']) {
        for (const p2 of ['saturn']) {
            if (checkAspect(chartA.planets[p1], chartB.planets[p2])) frictionScore += 1.2;
            if (checkAspect(chartB.planets[p1], chartA.planets[p2])) frictionScore += 1.2;
        }
    }

    // 3. Role Fit
    // Do they fit recommended roles? 
    // Just Use Synergy as proxy for Role Fit in this simplified logic
    const roleFitScore = synergyScore;

    // Formula
    /*
      compatibility =
        (synergy_score * 0.5) +
        (role_fit_score * 0.3) -
        (friction_score * 0.2)
    */
    let compatibility = (synergyScore * CONFIG.partnership.weights.synergy) +
        (roleFitScore * CONFIG.partnership.weights.role_fit) -
        (frictionScore * CONFIG.partnership.weights.friction);

    // Normalize to 0-100% or 0-10? 
    // The YAML gates say "min_compatibility: 50". Suggests 0-100 scale.
    // Our scores are roughly 0-10. So multiply by 10.
    return Math.min(100, Math.max(0, compatibility * 10));
};

const checkAspect = (long1, long2) => {
    if (long1 === undefined || long2 === undefined) return false;
    const diff = angleDiff(long1, long2);
    // Conj (0), Opp (180), Square (90)
    // Using crude orbs for conflict check
    if (diff < 10) return true; // Conjunction
    if (Math.abs(diff - 180) < 10) return true; // Opposition
    if (Math.abs(diff - 90) < 8) return true; // Square
    return false;
};

/**
 * Calculates Composite Chart Score
 */
const calculateCompositeScore = (charts) => {
    // Determine Composite Ascendant (Midpoint of Ascendants) and Planets
    // Note: Composite charts usually calc midpoints of positions.
    // For >2 partners, average the positions.

    if (charts.length < 2) return 0;

    const compositePlanets = {};
    const planetKeys = CONFIG.composite_engine.planets_included;

    planetKeys.forEach(p => {
        // Calculate vector average for angles (to handle 360/0 wrap)
        let x = 0, y = 0;
        charts.forEach(c => {
            const rad = (c.planets[p] * Math.PI) / 180;
            x += Math.cos(rad);
            y += Math.sin(rad);
        });
        const avgRad = Math.atan2(y, x);
        let avgDeg = (avgRad * 180) / Math.PI;
        if (avgDeg < 0) avgDeg += 360;
        compositePlanets[p] = avgDeg;
    });

    // Composite Ascendant
    let x = 0, y = 0;
    charts.forEach(c => {
        const rad = (c.ascendant * Math.PI) / 180;
        x += Math.cos(rad);
        y += Math.sin(rad);
    });
    const avgRadAsc = Math.atan2(y, x);
    let avgDegAsc = (avgRadAsc * 180) / Math.PI;
    if (avgDegAsc < 0) avgDegAsc += 360;

    // Score Composite
    let score = 5.0; // Base

    // Rules
    // sun_10th: +2.5
    const sunHouse = getHouseNumber(avgDegAsc, compositePlanets['sun']);
    if (sunHouse === 10) score += CONFIG.composite_engine.scoring_rules.sun_10th;

    // mars_6th: +1.5
    const marsHouse = getHouseNumber(avgDegAsc, compositePlanets['mars']);
    if (marsHouse === 6) score += CONFIG.composite_engine.scoring_rules.mars_6th;

    // saturn_7th: -1.5
    const satHouse = getHouseNumber(avgDegAsc, compositePlanets['saturn']);
    if (satHouse === 7) score += CONFIG.composite_engine.scoring_rules.saturn_7th;

    // jupiter_11th: +2.0
    const jupHouse = getHouseNumber(avgDegAsc, compositePlanets['jupiter']);
    if (jupHouse === 11) score += CONFIG.composite_engine.scoring_rules.jupiter_11th;

    return Math.min(10, Math.max(0, score));
};

/**
 * Main Execution Function
 */
export const executeAstrogravityEngine = (personsData) => {
    // personsData: Array of { name, planets: {sun: ..., ...}, ascendant: ... }

    if (!personsData || personsData.length < 2) {
        return { error: "At least 2 persons required for analysis." };
    }

    // 1. Individual Analyses
    const individualResults = personsData.map(p => ({
        name: p.name,
        scores: calculateIndividualScore(p)
    }));

    // 2. Compatibility (Base Pair: Person 1 vs Person 2, or Matrix?)
    // Assuming Star-topology (Person 1 is main? Or Peer-to-Peer?)
    // "Base Person and Partner(s)" input implies one base.
    // Let's calculate avg compatibility of Base (0) with others.
    const basePerson = personsData[0];
    const partners = personsData.slice(1);

    let totalComp = 0;
    partners.forEach(partner => {
        totalComp += calculateCompatibility(basePerson, partner);
    });
    const avgCompatibility = totalComp / partners.length;

    // 3. Composite Score
    const compositeScore = calculateCompositeScore(personsData);

    // 4. Projections (Time Series)
    const projections = [];
    let currentComp = avgCompatibility;
    for (let i = 1; i <= CONFIG.time_series.horizon_months; i++) {
        // Drift
        // These are static drifts based on rules. 
        // Real drift would rely on Transits (not implemented here per "No inferred logic" unless we calc transits).
        // Using strict YAML drift: "synergy_growth: +0.03" per month? 
        // Note: drift values are likely meant to be accumulative or conditional.
        // Let's apply a linear drift for demonstration of the "Time Series Engine"

        let monthFactor = 0;
        monthFactor += CONFIG.time_series.drift.synergy_growth;
        monthFactor += CONFIG.time_series.drift.friction_growth;
        // activation_decay is for individual?

        const change = monthFactor * 10; // Scale up
        currentComp += change; // Accumulate

        if (i === 12 || i === 24) {
            projections.push({ month: i, score: Math.round(currentComp) });
        }
    }

    // 5. Verdict / Recommendation
    let verdict = "NO-GO";
    if (avgCompatibility >= 75 && compositeScore > 7) verdict = "STRATEGIC";
    else if (avgCompatibility >= 60 && compositeScore > 5) verdict = "CONDITIONAL";
    else if (avgCompatibility >= 40) verdict = "EXPERIMENT";

    // Gates
    if (avgCompatibility < CONFIG.gates.min_compatibility) verdict = "NO-GO (Compatibility Low)";
    if (individualResults[0].scores.promise < CONFIG.gates.min_promise) verdict = "NO-GO (Base Promise Low)";

    // 6. Roles
    const recommendedRoles = individualResults.map(p => {
        // Find highest score axis
        const s = p.scores.role_scores;
        const bestRoleKey = Object.keys(s).reduce((a, b) => s[a] > s[b] ? a : b);

        // Match to specific defined Roles if possible
        // strategies_founder requires vision: 7, authority: 6
        let bestFitRole = bestRoleKey; // default to axis name

        if (s.vision >= 7 && s.authority >= 6) bestFitRole = "Strategic Founder";
        else if (s.execution >= 7 && s.discipline >= 6) bestFitRole = "Operating Partner";
        else if (s.intellect >= 7 && s.vision >= 6) bestFitRole = "Idea Partner";
        else if (s.execution <= CONFIG.roles.advisory.max_execution) bestFitRole = "Advisory";

        return { name: p.name, role: bestFitRole, axis_score: s[bestRoleKey] };
    });

    return {
        overall_compatibility: Math.round(avgCompatibility),
        composite_stability: Math.round(compositeScore * 10) / 10,
        timeline: projections,
        verdict: verdict,
        roles: recommendedRoles,
        details: {
            individual: individualResults
        }
    };
};
