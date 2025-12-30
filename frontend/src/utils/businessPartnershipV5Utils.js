
// Astrogravity Business Partnership Engine - V5.0
// Based on business_partnership_rules_v5.yaml

const CONFIG = {
    // Domain Module Overrides
    domain: "Business Partnership",
    version: 5.0,

    scoring_dimensions: {
        promise: { weight: 0.35 },
        activation: { weight: 0.30 },
        stability: { weight: 0.25 },
        timing: { weight: 0.10 }
    },

    houses: {
        // Core defaults (from v4)
        1: { name: "identity", weight: 0.05 },
        2: { name: "capital", weight: 0.10 },
        3: { name: "communication", weight: 0.03 },
        4: { name: "foundation", weight: 0.04 },
        5: { name: "creativity", weight: 0.05 },
        8: { name: "risk", weight: 0.06 },
        9: { name: "vision", weight: 0.05 },
        12: { name: "loss", weight: 0.02 },
        // Domain overrides
        7: { name: "Partnership", weight: 3.0 }, // v5 weight (absolute points vs relative?)
        6: { name: "Execution & Conflict", weight: 2.0 },
        10: { name: "Authority & Career", weight: 2.0 },
        11: { name: "Gains & Network", weight: 1.5 }
    },

    planets: {
        // Core defaults
        sun: { base: 1.2 },
        moon: { base: 0.8 },
        mercury: { base: 1.0 },
        rahu: { base: 1.2 },
        ketu: { base: 0.6 },
        // Domain overrides
        venus: { function: "harmony, contracts, value", base: 2.0 },
        mars: { function: "execution, aggression", base: 1.5 },
        saturn: { function: "discipline, delay, structure", base: 2.0 },
        jupiter: { function: "wisdom, ethics, expansion", base: 1.5 }
    },

    avastha: {
        exalted: 2.0,
        own: 1.5,
        friendly: 1.2,
        neutral: 1.0,
        debilitated: 0.5
    },

    aspects: {
        conjunction: {
            strong: { orb: 3, points: 2 },
            medium: { orb: 6, points: 1 },
            weak: { orb: 8, points: 0.5 }
        },
        opposition: {
            strong: { orb: 4, points: -2 },
            medium: { orb: 7, points: -1 },
            weak: { orb: 9, points: -0.5 }
        }
    },

    combustion: {
        venus: { orb: 10, penalty: -1.5 },
        mars: { orb: 8, penalty: -1.0 }
    },

    roles: {
        negotiator: { planets: ['venus', 'mercury'], threshold: 6 },
        executor: { planets: ['mars', 'saturn'], threshold: 6 },
        strategist: { planets: ['jupiter', 'mercury'], threshold: 6 }
    },

    verdict: {
        go: 70,       // >= 70
        experiment: 55, // 55-69
        no_go: 55     // < 55
    }
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const normalizeAngle = (angle) => {
    let a = angle % 360;
    return a < 0 ? a + 360 : a;
};

const angleDiff = (a1, a2) => {
    let diff = Math.abs(a1 - a2) % 360;
    return diff > 180 ? 360 - diff : diff;
};

const getHouseNumber = (ascendantLong, planetLong) => {
    const ascRashi = Math.floor(normalizeAngle(ascendantLong) / 30);
    const planetRashi = Math.floor(normalizeAngle(planetLong) / 30);
    let house = (planetRashi - ascRashi + 1);
    if (house <= 0) house += 12;
    return house;
};

const getRashiIndex = (long) => Math.floor(normalizeAngle(long) / 30) + 1; // 1-12

// =====================================================
// SCORING LOGIC
// =====================================================

// Check Avastha (Simplified for MVP, ideally should be full vedic logic)
const getAvasthaMultiplier = (planetName, rashiIdx) => {
    // Basic signs map
    const signs = {
        sun: { own: [5], ex: 1, deb: 7 },
        moon: { own: [4], ex: 2, deb: 8 },
        mars: { own: [1, 8], ex: 10, deb: 4 },
        mercury: { own: [3, 6], ex: 6, deb: 12 },
        jupiter: { own: [9, 12], ex: 4, deb: 10 },
        venus: { own: [2, 7], ex: 12, deb: 6 },
        saturn: { own: [10, 11], ex: 7, deb: 1 },
        rahu: { own: [], ex: 2, deb: 8 },
        ketu: { own: [], ex: 8, deb: 2 }
    };

    const p = signs[planetName.toLowerCase()];
    if (!p) return CONFIG.avastha.neutral;

    if (p.ex === rashiIdx) return CONFIG.avastha.exalted;
    if (p.deb === rashiIdx) return CONFIG.avastha.debilitated;
    if (p.own.includes(rashiIdx)) return CONFIG.avastha.own;

    // Friend/Neutral/Enemy table would improve this, but defaulting to Neutral/Friendly
    return CONFIG.avastha.neutral;
};

const calculatePlanetStrength = (planetName, longitude, ascendant) => {
    const pConfig = CONFIG.planets[planetName.toLowerCase()];
    if (!pConfig) return 0;

    let score = pConfig.base;
    const house = getHouseNumber(ascendant, longitude);
    const rashiIdx = getRashiIndex(longitude);

    // House Weight
    if (CONFIG.houses[house]) {
        // V5 overrides define absolute weights for 7,6,10,11 (e.g. 3.0), v4 used relative (0.05)
        // We need to handle this scale difference. 
        // If weight > 1, treat as multiplier or adder?
        // "weight: 3" vs "weight: 0.15". 
        // Let's treat > 1 as Base Value Multiplier.
        const w = CONFIG.houses[house].weight;
        score *= (w > 1 ? w : (1 + w));
    }

    // Avastha
    score *= getAvasthaMultiplier(planetName, rashiIdx);

    return score;
};

const calculatePersonScores = (chart) => {
    if (!chart || !chart.planets) return null;

    let totalStrength = 0;
    const planetScores = {};

    Object.keys(chart.planets).forEach(p => {
        const score = calculatePlanetStrength(p, chart.planets[p], chart.ascendant);
        planetScores[p] = score;
        totalStrength += score;
    });

    // Dimensions: 
    // Promise ~ Base Strength average
    // Activation ~ Rank of key domain planets (Mars, Ven, Jup, Sat)
    // Stability ~ Saturn/Moon strength + Avastha
    // Timing ~ Dasha (Not available), Transits (Not available). Default neutral.

    // Calculate Promise (0-10)
    let promise = (totalStrength / Object.keys(chart.planets).length) * 2;
    promise = Math.min(10, promise);

    // Calculate Activation (Strength of Mars + Jupiter)
    const mars = planetScores['mars'] || 0;
    const jup = planetScores['jupiter'] || 0;
    let activation = ((mars + jup) / 2) * 1.5;
    activation = Math.min(10, activation);

    // Calculate Stability (Saturn + Venus)
    const sat = planetScores['saturn'] || 0;
    const ven = planetScores['venus'] || 0;
    let stability = ((sat + ven) / 2) * 1.5;
    stability = Math.min(10, stability);

    // Role Scores based on Role Matrix
    const roles = {};
    for (const [roleName, def] of Object.entries(CONFIG.roles)) {
        let rs = 0;
        def.planets.forEach(p => { rs += (planetScores[p] || 0); });
        roles[roleName] = rs / def.planets.length;
    }

    return {
        promise: parseFloat(promise.toFixed(1)),
        activation: parseFloat(activation.toFixed(1)),
        stability: parseFloat(stability.toFixed(1)),
        timing: 5.0, // Default
        roles,
        planetScores
    };
};

const calculateSynastry = (chartA, chartB) => {
    let points = 0;
    const explain = [];

    const checkAspects = (p1, l1, p2, l2) => {
        const diff = angleDiff(l1, l2);

        // Conjunction
        const conj = CONFIG.aspects.conjunction;
        if (diff <= conj.weak.orb) {
            let pts = conj.weak.points;
            if (diff <= conj.strong.orb) pts = conj.strong.points;
            else if (diff <= conj.medium.orb) pts = conj.medium.points;

            // Apply combustion logic if Sun involved? handled separately.
            return { type: 'conjunction', points: pts };
        }

        // Opposition
        const opp = CONFIG.aspects.opposition;
        const oppDiff = Math.abs(diff - 180);
        if (oppDiff <= opp.weak.orb) {
            let pts = opp.weak.points;
            if (oppDiff <= opp.strong.orb) pts = opp.strong.points;
            else if (oppDiff <= opp.medium.orb) pts = opp.medium.points;
            return { type: 'opposition', points: pts };
        }

        return null;
    };

    // Cross-Aspects
    const planets = Object.keys(chartA.planets);
    planets.forEach(p1 => {
        const l1 = chartA.planets[p1];
        planets.forEach(p2 => {
            const l2 = chartB.planets[p2];
            const asp = checkAspects(p1, l1, p2, l2);
            if (asp) {
                // Weight aspect by planet importance in domain?
                // For now use raw points.
                points += asp.points;
                if (Math.abs(asp.points) >= 1) {
                    explain.push({
                        Factor: `${p1}-${p2}`,
                        Cause: asp.type,
                        Condition: `${p1} (A) ${asp.type} ${p2} (B)`,
                        Points: asp.points
                    });
                }
            }
        });
    });

    return { points, explain };
};

export const executeBusinessPartnershipV5 = (personA, personB) => {
    // 1. Individual Analysis
    const scoresA = calculatePersonScores(personA);
    const scoresB = calculatePersonScores(personB);

    if (!scoresA || !scoresB) return { error: "Invalid Charts" };

    // 2. Synastry / Compatibility
    const synastry = calculateSynastry(personA, personB);

    // Base Compatibility from Individual Synergy
    // Do high scores match?
    let baseComp = 50;

    // Add Synastry Points (scaled)
    baseComp += (synastry.points * 2);

    // Add Role Synergy (Complementary)
    const bestRoleA = Object.keys(scoresA.roles).reduce((a, b) => scoresA.roles[a] > scoresA.roles[b] ? a : b);
    const bestRoleB = Object.keys(scoresB.roles).reduce((a, b) => scoresB.roles[a] > scoresB.roles[b] ? a : b);

    if (bestRoleA !== bestRoleB) {
        baseComp += 10;
        synastry.explain.push({ Factor: "Role Synergy", Cause: "Complementary", Condition: `${bestRoleA} + ${bestRoleB}`, Points: 10 });
    }

    // Clamp
    let compatibility = Math.min(100, Math.max(0, baseComp));

    // 3. Verdict
    let verdict = "NO_GO";
    if (compatibility >= CONFIG.verdict.go) verdict = "GO";
    else if (compatibility >= CONFIG.verdict.experiment) verdict = "EXPERIMENT";

    // 4. Roles Output
    const rolesOutput = [
        { name: personA.name, role: bestRoleA, score: scoresA.roles[bestRoleA].toFixed(1) },
        { name: personB.name, role: bestRoleB, score: scoresB.roles[bestRoleB].toFixed(1) }
    ];

    // 5. Timeline (Simulated for V5 requirement "Time Series")
    // If not calculating transits, use static logic based on current Dasha/Transit hints if available
    // or just standard +/- drift.
    const timeline = [
        { label: "Now", score: compatibility.toFixed(0) },
        { label: "12 Months", score: Math.min(100, compatibility + 5).toFixed(0) }, // Optimistic drift
        { label: "24 Months", score: Math.min(100, compatibility - 2).toFixed(0) }  // Conservative drift
    ];

    return {
        verdict,
        scores: {
            promise: ((scoresA.promise + scoresB.promise) / 2).toFixed(1),
            activation: ((scoresA.activation + scoresB.activation) / 2).toFixed(1),
            stability: ((scoresA.stability + scoresB.stability) / 2).toFixed(1),
            compatibility: compatibility.toFixed(0)
        },
        explain: synastry.explain,
        timeline,
        roles: rolesOutput
    };
};
