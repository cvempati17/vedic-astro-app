
// Astrogravity Business Partnership Engine - V6.1
// Based on business_partnership_rules_v6_1_full.yaml

// CONFIGURATION FROM YAML RULES
const CONFIG = {
    weights: {
        promise: 0.35,
        activation: 0.30,
        stability: 0.25,
        timing: 0.10
    },
    houses: {
        // Domain specific weights
        7: { weight: 3.0, name: "Partnership" },
        6: { weight: 2.0, name: "Execution & Conflict" },
        10: { weight: 2.0, name: "Authority & Career" },
        11: { weight: 1.5, name: "Gains & Network" }
    },
    planets: {
        venus: { base: 2.0, function: "harmony" },
        mars: { base: 1.5, function: "execution" },
        saturn: { base: 2.0, function: "discipline" },
        jupiter: { base: 1.5, function: "wisdom" },
        sun: { base: 1.2 }, // Fallback from core
        mercury: { base: 1.0 },
        moon: { base: 0.8 },
        rahu: { base: 1.2 },
        ketu: { base: 0.6 }
    },
    avastha: {
        exalted: 2.0,
        own: 1.5,
        friendly: 1.2,
        neutral: 1.0,
        debilitated: 0.5
    },
    aspects: {
        conjunction: { weak: 8, medium: 6, strong: 3, points: { w: 0.5, m: 1, s: 2 } },
        opposition: { weak: 9, medium: 7, strong: 4, points: { w: -0.5, m: -1, s: -2 } }
    },
    roles: {
        Negotiator: { planets: ['venus', 'mercury'], threshold: 6 },
        Executor: { planets: ['mars', 'saturn'], threshold: 6 },
        Strategist: { planets: ['jupiter', 'mercury'], threshold: 6 }
    },
    verdict: {
        GO: 70,
        EXPERIMENT: 55,
        NO_GO: 0
    }
};

// --- HELPER FUNCTIONS ---

const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;

const getDiff = (a, b) => {
    let d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
};

const getRashi = (lon) => Math.floor(normalizeAngle(lon) / 30) + 1;

const getHouse = (asc, lon) => {
    let h = (getRashi(lon) - getRashi(asc) + 1);
    if (h <= 0) h += 12;
    return h;
};

// Simplified Avastha (Exaltation/Debilitation/Own)
const getAvasthaMultiplier = (planet, rashi) => {
    const rules = {
        sun: { ex: 1, deb: 7, own: [5] },
        moon: { ex: 2, deb: 8, own: [4] },
        mars: { ex: 10, deb: 4, own: [1, 8] },
        mercury: { ex: 6, deb: 12, own: [3, 6] },
        jupiter: { ex: 4, deb: 10, own: [9, 12] },
        venus: { ex: 12, deb: 6, own: [2, 7] },
        saturn: { ex: 7, deb: 1, own: [10, 11] },
        rahu: { ex: 2, deb: 8, own: [] },
        ketu: { ex: 8, deb: 2, own: [] }
    };
    const r = rules[planet.toLowerCase()];
    if (!r) return CONFIG.avastha.neutral;
    if (r.ex === rashi) return CONFIG.avastha.exalted;
    if (r.deb === rashi) return CONFIG.avastha.debilitated;
    if (r.own.includes(rashi)) return CONFIG.avastha.own;
    return CONFIG.avastha.neutral;
};

// --- SCORING ENGINE ---

const calculateIndividualScore = (chart) => {
    let log = [];
    let planetWeigths = {};
    let totalScore = 0;

    Object.keys(chart.planets).forEach(p => {
        const lon = chart.planets[p];
        const h = getHouse(chart.ascendant, lon);
        const r = getRashi(lon);

        let score = CONFIG.planets[p.toLowerCase()]?.base || 1.0;

        // House Multiplier
        if (CONFIG.houses[h]) {
            score *= CONFIG.houses[h].weight;
            log.push({
                Dimension: "House Placement",
                Factor: `${p} in House ${h}`,
                Condition: `Located in ${CONFIG.houses[h].name}`,
                Points: score.toFixed(1)
            });
        }

        // Avastha Multiplier
        let av = getAvasthaMultiplier(p, r);
        score *= av;
        if (av !== 1.0) {
            log.push({
                Dimension: "Avastha",
                Factor: `${p} Strength`,
                Condition: av === CONFIG.avastha.exalted ? "Exalted" : av === CONFIG.avastha.debilitated ? "Debilitated" : "Own Sign",
                Points: score.toFixed(1)
            });
        }

        planetWeigths[p] = score;
        totalScore += score;
    });

    // Determine Best Role
    let bestRole = "Advisory";
    let maxRoleScore = 0;
    Object.entries(CONFIG.roles).forEach(([role, def]) => {
        let rScore = 0;
        def.planets.forEach(pl => { rScore += (planetWeigths[pl.toLowerCase()] || 0); });
        rScore = rScore / def.planets.length;
        if (rScore > maxRoleScore) {
            maxRoleScore = rScore;
            bestRole = role;
        }
    });

    // Overall Promise (Normalized to 0-10)
    let promise = Math.min(10, (totalScore / 9) * 2);

    return {
        promise,
        planetWeigths,
        role: { name: bestRole, score: maxRoleScore },
        log
    };
};

const calculateComposite = (charts) => {
    // Average Longitudes
    if (charts.length < 2) return null;

    let compositePlanets = {};
    let compositeAsc = 0;

    // Naively average longitudes (handling 360 wrap logic is complex, assuming simple average for this MVP or vectors)
    // Vector addition is better but simple average suffices for close values. If 350 and 10, avg is 0.
    // Let's use simple average for now as "Midpoint".

    const planets = Object.keys(charts[0].planets);
    planets.forEach(p => {
        let sumX = 0, sumY = 0;
        charts.forEach(c => {
            let rad = c.planets[p] * Math.PI / 180;
            sumX += Math.cos(rad);
            sumY += Math.sin(rad);
        });
        let avgRad = Math.atan2(sumY, sumX);
        let avgDeg = (avgRad * 180 / Math.PI);
        compositePlanets[p] = normalizeAngle(avgDeg);
    });

    // Ascendant
    let sumX = 0, sumY = 0;
    charts.forEach(c => {
        let rad = c.ascendant * Math.PI / 180;
        sumX += Math.cos(rad);
        sumY += Math.sin(rad);
    });
    compositeAsc = normalizeAngle(Math.atan2(sumY, sumX) * 180 / Math.PI);

    // Score Composite Rules (from YAML composite_engine)
    // sun_10th: +2.5, mars_6th: +1.5, saturn_7th: -1.5, jupiter_11th: +2.0
    let score = 5; // Base stability
    let log = [];

    const check = (p, h, pts, rule) => {
        if (getHouse(compositeAsc, compositePlanets[p]) === h) {
            score += pts;
            log.push({
                Dimension: "Composite Chart",
                Factor: `${p} in ${h}`,
                Condition: rule,
                Points: pts > 0 ? `+${pts}` : `${pts}`
            });
        }
    };

    check('sun', 10, 2.5, "Sun in 10th (Authority)");
    check('mars', 6, 1.5, "Mars in 6th (Execution)");
    check('saturn', 7, -1.5, "Saturn in 7th (Friction)");
    check('jupiter', 11, 2.0, "Jupiter in 11th (Gains)");

    return { score: Math.max(0, Math.min(10, score)), log };
};

const calculateSynergy = (p1, p2) => {
    let synergy = 0;
    let log = [];

    // Pairwise aspects
    Object.keys(p1.planets).forEach(pl1 => {
        Object.keys(p2.planets).forEach(pl2 => {
            const diff = getDiff(p1.planets[pl1], p2.planets[pl2]);

            // Conjunction Check
            const conj = CONFIG.aspects.conjunction;
            if (diff <= conj.weak) {
                let pts = diff <= conj.strong ? conj.points.s : diff <= conj.medium ? conj.points.m : conj.points.w;
                // YAML examples: Venus supports Jupiter +2.0
                // Simplified: Benefic+Benefic = +pts, Malefic+Malefic = -pts, Mix = 0
                // For now, standard aspect points logic
                synergy += pts;
                if (Math.abs(pts) >= 1) {
                    log.push({
                        Dimension: "Synergy",
                        Factor: "Conjunction",
                        Condition: `${pl1}-${pl2} (${diff.toFixed(1)}°)`,
                        Points: pts > 0 ? `+${pts}` : `${pts}`
                    });
                }
            }
            // Opposition Check
            const opp = CONFIG.aspects.opposition;
            if (Math.abs(diff - 180) <= opp.weak) {
                synergy -= 1; // Generally tension, keeping simple
                log.push({
                    Dimension: "Synergy",
                    Factor: "Opposition",
                    Condition: `${pl1}-${pl2}`,
                    Points: "-1.0"
                });
            }
        });
    });

    return { score: synergy, log };
};

// --- MAIN EXECUTION ---

export const executeBusinessPartnershipV6 = (basePerson, partners) => {
    // 1. Individual Scores
    const baseScore = calculateIndividualScore(basePerson[0]); // normalized format
    const partnerScores = partners.map(p => calculateIndividualScore(p));

    // Full log structure
    let whyTable = [];

    // Add Base Logs
    baseScore.log.forEach(l => whyTable.push({ Person: basePerson[0].name, ...l }));
    partnerScores.forEach((s, i) => s.log.forEach(l => whyTable.push({ Person: partners[i].name, ...l })));

    // 2. Synergy (Base vs All Partners Pairwise) & Composite Data
    let totalSynergy = 0;

    partners.forEach((p, i) => {
        const syn = calculateSynergy(basePerson[0], p);
        totalSynergy += syn.score;
        syn.log.forEach(l => whyTable.push({ Person: `${basePerson[0].name} & ${p.name}`, ...l }));
    });

    // 3. Composite Chart (All included)
    const allCharts = [basePerson[0], ...partners];
    const composite = calculateComposite(allCharts);
    composite.log.forEach(l => whyTable.push({ Person: "Group Composite", ...l }));

    // 4. Final Aggregation
    let finalScore = (baseScore.promise * 0.4) + (composite.score * 0.3) + (Math.max(0, Math.min(10, 5 + totalSynergy / partners.length)) * 0.3);
    finalScore = Math.max(0, Math.min(10, finalScore));

    let verdict = "NO_GO";
    if (finalScore * 10 >= CONFIG.verdict.GO) verdict = "GO";
    else if (finalScore * 10 >= CONFIG.verdict.EXPERIMENT) verdict = "EXPERIMENT";

    // 5. Roles Table
    const rolesTable = [
        { Person: basePerson[0].name, Role: baseScore.role.name, Role_Score: baseScore.role.score.toFixed(1) },
        ...partners.map((p, i) => ({ Person: p.name, Role: partnerScores[i].role.name, Role_Score: partnerScores[i].role.score.toFixed(1) }))
    ];

    // 6. 30-Year Projection
    // Drift Logic: Score changes over time
    // Years: 0, 5, 10, 15, 20, 25, 30
    // Factor: -0.05 decay + 0.03 synergy... net small drift
    const labels = [0, 5, 10, 15, 20, 25, 30];
    const chartData = labels.map(year => {
        // Simple drift model
        let drift = year * (totalSynergy > 0 ? 0.05 : -0.05);
        return Math.min(10, Math.max(0, finalScore + drift)).toFixed(1);
    });

    return {
        verdict,
        finalScore: (finalScore * 10).toFixed(0), // 0-100 scale for UI
        whyTable,
        rolesTable,
        projection: {
            labels,
            data: chartData
        }
    };
};
