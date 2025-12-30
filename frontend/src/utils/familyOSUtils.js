
// Astrogravity Family OS Engine - V1.0
// Implements astro_signals_v1.yaml and family_os_engine_v1.yaml

// --- CONFIGURATION & RULES ---

const CONFIG = {
    // Simplified strength mapping for MVP
    dignity: {
        exalted: 'exalted',
        own: 'own',
        neutral: 'neutral',
        debilitated: 'debilitated'
    },
    strength: {
        strong: 'strong',
        medium: 'medium',
        weak: 'weak'
    },
    style: {
        emotional: 'emotional',
        practical: 'practical',
        advisory: 'advisory'
    },
    expression: {
        expressive: 'expressive',
        contained: 'contained'
    },
    risk: {
        high: 'high',
        low: 'low'
    }
};

// --- HELPER FUNCTIONS ---

const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;

const getRashi = (lon) => Math.floor(normalizeAngle(lon) / 30) + 1;

const getHouse = (asc, lon) => {
    let h = (getRashi(lon) - getRashi(asc) + 1);
    if (h <= 0) h += 12;
    return h;
};

const getDignity = (planet, rashi) => {
    // Simplified rule set
    const rules = {
        sun: { ex: 1, deb: 7, own: [5] },
        moon: { ex: 2, deb: 8, own: [4] },
        mars: { ex: 10, deb: 4, own: [1, 8] },
        mercury: { ex: 6, deb: 12, own: [3, 6] },
        jupiter: { ex: 4, deb: 10, own: [9, 12] },
        venus: { ex: 12, deb: 6, own: [2, 7] },
        saturn: { ex: 7, deb: 1, own: [10, 11] },
        rahu: { ex: 2, deb: 8, own: [] }, // Using Taurus/Scorpio axis approximation
        ketu: { ex: 8, deb: 2, own: [] }
    };

    const p = planet.toLowerCase();
    const r = rules[p];
    if (!r) return CONFIG.dignity.neutral;

    if (r.ex === rashi) return CONFIG.dignity.exalted;
    if (r.deb === rashi) return CONFIG.dignity.debilitated;
    if (r.own.includes(rashi)) return CONFIG.dignity.own;
    return CONFIG.dignity.neutral;
};

// Determine House Strength based on occupants and aspects (Simplified)
const calculateHouseStrength = (houseNum, chartData) => {
    let score = 0;
    const housePlanets = [];

    // Check occupants
    Object.keys(chartData.planets).forEach(p => {
        const h = getHouse(chartData.ascendant, chartData.planets[p]);
        if (h === houseNum) {
            housePlanets.push(p);
            const dignity = getDignity(p, getRashi(chartData.planets[p]));
            if (dignity === 'exalted' || dignity === 'own') score += 2;
            else if (dignity === 'debilitated') score -= 1;

            // Functional benefit (Benefics add strength generally for stability)
            if (['jupiter', 'venus', 'moon', 'mercury'].includes(p.toLowerCase())) score += 1;
            if (['saturn', 'mars', 'rahu', 'ketu'].includes(p.toLowerCase())) score -= 0.5; // Malefics strain the house
        }
    });

    if (score >= 2) return CONFIG.strength.strong;
    if (score <= -1) return CONFIG.strength.weak;
    return CONFIG.strength.medium;
};

// Determine Planetary Aspects (Vedic - Full Aspects only for MVP)
const getAspects = (planet, chartData) => {
    // Returns list of planets aspecting this planet
    // Vedic Aspects:
    // All planets aspect 7th from them.
    // Mars: 4, 7, 8
    // Jupiter: 5, 7, 9
    // Saturn: 3, 7, 10

    const pRashi = getRashi(chartData.planets[planet]);
    const aspectsReceived = [];

    Object.keys(chartData.planets).forEach(other => {
        if (other === planet) return;
        const oRashi = getRashi(chartData.planets[other]);

        // Count signs from Other to Planet
        let dist = pRashi - oRashi + 1;
        if (dist <= 0) dist += 12;

        let aspects = false;

        if (dist === 7) aspects = true; // All aspect 7th
        if (other.toLowerCase() === 'mars' && [4, 8].includes(dist)) aspects = true;
        if (other.toLowerCase() === 'jupiter' && [5, 9].includes(dist)) aspects = true;
        if (other.toLowerCase() === 'saturn' && [3, 10].includes(dist)) aspects = true;

        if (aspects) aspectsReceived.push(other);
    });

    return aspectsReceived;
};

// --- SIGNAL GENERATION ---

export const calculateAstroSignals = (chartData) => {
    if (!chartData || !chartData.planets || !chartData.ascendant) {
        throw new Error("Invalid Chart Data: Missing planets or ascendant.");
    }
    // 1. Pre-calculate Derived Data
    const lagnaSign = getRashi(chartData.ascendant);
    // Assuming simple mapping for Lagna Lord (Aries->Mars, etc)
    const rulerMap = { 1: 'mars', 2: 'venus', 3: 'mercury', 4: 'moon', 5: 'sun', 6: 'mercury', 7: 'venus', 8: 'mars', 9: 'jupiter', 10: 'saturn', 11: 'saturn', 12: 'jupiter' };
    const lagnaLord = rulerMap[lagnaSign];
    const lagnaLordDignity = getDignity(lagnaLord, getRashi(chartData.planets[lagnaLord]));

    const sunDignity = getDignity('sun', getRashi(chartData.planets['sun']));
    const saturnDignity = getDignity('saturn', getRashi(chartData.planets['saturn']));
    const venusDignity = getDignity('venus', getRashi(chartData.planets['venus']));
    const jupiterDignity = getDignity('jupiter', getRashi(chartData.planets['jupiter']));

    const moonSign = getRashi(chartData.planets['moon']);
    const moonAspects = getAspects('moon', chartData);

    const h1Strength = calculateHouseStrength(1, chartData);
    const h4Strength = calculateHouseStrength(4, chartData);
    const h6Strength = calculateHouseStrength(6, chartData);
    const h10Strength = calculateHouseStrength(10, chartData);
    const h12Strength = calculateHouseStrength(12, chartData);


    // 2. Compute Signals based on astro_signals_v1.yaml

    // SIGNAL: Authority Capacity
    let authority = 'medium';
    // Rule: High if Lagna Lord Own/Exalted AND 10th House Strong
    if (['own', 'exalted'].includes(lagnaLordDignity) && h10Strength === 'strong') authority = 'high';
    // Rule: Low if Lagna Lord Debilitated
    else if (lagnaLordDignity === 'debilitated') authority = 'low';

    // SIGNAL: Emotional Expression
    let emotion = 'balanced'; // default
    const waterSigns = [4, 8, 12];
    const earthSigns = [2, 6, 10];
    const beneficAspect = moonAspects.some(p => ['jupiter', 'venus', 'mercury'].includes(p.toLowerCase()));
    const maleficAspect = moonAspects.some(p => ['saturn', 'mars', 'rahu', 'ketu'].includes(p.toLowerCase()));

    if (waterSigns.includes(moonSign) && beneficAspect) emotion = 'expressive';
    if (earthSigns.includes(moonSign) && maleficAspect) emotion = 'contained';

    // SIGNAL: Responsibility Tolerance
    let responsibility = 'medium';
    // Using Saturn Dignity as proxy for Avastha if not available.
    // High if Saturn Exalted/Own AND 6th House Strong
    if (['own', 'exalted'].includes(saturnDignity) && h6Strength === 'strong') responsibility = 'high';
    if (saturnDignity === 'debilitated') responsibility = 'low';

    // SIGNAL: Support Style
    let support = 'practical';
    const moonJupiterAspect = moonAspects.includes('Jupiter') || moonAspects.includes('jupiter');
    if (h4Strength === 'strong' && moonJupiterAspect) support = 'emotional';
    else if (['own', 'exalted'].includes(jupiterDignity)) support = 'advisory';

    // SIGNAL: Dependency Risk
    let risk = 'medium';
    const moonAfflicted = moonAspects.some(p => ['rahu', 'ketu'].includes(p.toLowerCase()));
    if (moonAfflicted && h12Strength === 'strong') risk = 'high';
    if (['own', 'exalted'].includes(lagnaLordDignity)) risk = 'low';

    // SIGNAL: Stability Index (Formula: (lagna + saturn + moon + dasha) / 4)
    // Quantifying: Exalted=10, Own=8, Neutral=5, Debilitated=2
    // Strong=10, Medium=5, Weak=2
    const quant = (val) => {
        if (['exalted', 'strong', 'high', 'expressive'].includes(val)) return 10;
        if (['own', 'emotional'].includes(val)) return 8;
        if (['neutral', 'medium', 'practical', 'balanced'].includes(val)) return 5;
        return 2;
    };

    let stabilityScore = (quant(lagnaLordDignity) + quant(saturnDignity) + quant(emotion) + 5) / 4; // Assuming Dasha medium(5) for now
    stabilityScore = Math.min(10, Math.max(0, stabilityScore)); // Clamp

    return {
        authority_capacity: authority,
        emotional_expression: emotion,
        responsibility_tolerance: responsibility,
        support_style: support,
        dependency_risk: risk,
        stability_index: stabilityScore
    };
};

// --- FAMILY MATRIX GENERATION ---

const getSignalValue = (val) => {
    if (['exalted', 'strong', 'high', 'expressive'].includes(val)) return 3;
    if (['own', 'emotional'].includes(val)) return 2;
    if (['neutral', 'medium', 'practical', 'balanced', 'advisory'].includes(val)) return 1;
    return 0;
};

export const generateFamilyMatrix = (familyMembers) => {
    // familyMembers array of { name, relation, chartData, signals, _id }

    const Matrix = {
        Architect: [],
        Protector: [],
        Stabilizer: [],
        Connector: []
    };

    // Tracking metadata for resolution
    const AssignmentMeta = {
        Architect: null, // { name, reason, score }
        Protector: null,
        Stabilizer: null,
        Connector: null
    };

    // --- STEP 1: INITIAL ASSIGNMENT (family_os_engine_v1.yaml) ---
    familyMembers.forEach(person => {
        const s = person.signals;
        const rel = person.relation;

        // Architect
        if (s.authority_capacity === 'high' && s.responsibility_tolerance === 'high' && ['Husband', 'Wife'].includes(rel)) {
            Matrix.Architect.push(person.name);
            AssignmentMeta.Architect = { name: person.name, reason: "Astro Signals: High Authority & Responsibility", score: 100 };
        }

        // Protector
        if (s.support_style === 'emotional' && ['Wife', 'Husband'].includes(rel)) { // Updated to include Husband per resolution rules fallback
            // Strict rule says Wife/Mother/Grandmother in initial, but resolution allows Husband. keeping initial strict for now matching engine.
            if (['Wife', 'Mother', 'Grandmother'].includes(rel)) {
                Matrix.Protector.push(person.name);
                AssignmentMeta.Protector = { name: person.name, reason: "Astro Signals: Emotional Support Style", score: 100 };
            }
        }

        // Stabilizer
        if (s.stability_index >= 7 && s.dependency_risk === 'low') {
            Matrix.Stabilizer.push(person.name);
            AssignmentMeta.Stabilizer = { name: person.name, reason: "Astro Signals: High Stability Index", score: 100 };
        }

        // Connector
        if (s.emotional_expression === 'expressive' && ['Son', 'Daughter'].includes(rel)) {
            Matrix.Connector.push(person.name);
            AssignmentMeta.Connector = { name: person.name, reason: "Astro Signals: Expressive Emotion", score: 100 };
        }
    });

    // --- STEP 2: RESOLUTION LAYER (family_role_resolution_v1.yaml) ---

    // Helper to find best candidate
    const findBestCandidate = (candidates, scorer) => {
        let best = null;
        let maxScore = -1;
        candidates.forEach(p => {
            const score = scorer(p);
            if (score > maxScore) {
                maxScore = score;
                best = p;
            }
        });
        return { best, score: maxScore };
    };

    // 1. Architect Resolution
    if (Matrix.Architect.length === 0) {
        const candidates = familyMembers.filter(m => ['Husband', 'Wife'].includes(m.relation));
        const { best, score } = findBestCandidate(candidates, (p) => {
            return getSignalValue(p.signals.authority_capacity) + getSignalValue(p.signals.responsibility_tolerance);
        });

        if (best && score > 0) {
            Matrix.Architect.push(best.name);
            AssignmentMeta.Architect = { name: best.name, reason: "Resolution: Highest Authority Capacity", score };
        }
    }

    // 2. Protector Resolution
    if (Matrix.Protector.length === 0) {
        const candidates = familyMembers.filter(m => ['Wife', 'Husband'].includes(m.relation));
        const { best, score } = findBestCandidate(candidates, (p) => {
            // Priority: Emotional Support Style (2) > Advisory (1) > Practical (1)
            // Plus normalized moon/venus strength if we had access to raw elements here, but we rely on signals.
            let val = 0;
            if (p.signals.support_style === 'emotional') val += 5;
            if (p.signals.emotional_expression === 'expressive') val += 2;
            return val;
        });

        if (best && score > 0) {
            Matrix.Protector.push(best.name);
            AssignmentMeta.Protector = { name: best.name, reason: "Resolution: Highest Support Capacity", score };
        }
    }

    // 3. Stabilizer Resolution
    if (Matrix.Stabilizer.length === 0) {
        const candidates = familyMembers.filter(m => ['Husband', 'Wife', 'Son', 'Daughter'].includes(m.relation));
        const { best, score } = findBestCandidate(candidates, (p) => {
            return p.signals.stability_index;
        });

        if (best && score >= 5) { // Minimum threshold reasonable for 'Stabilizer' even if not 7
            Matrix.Stabilizer.push(best.name);
            AssignmentMeta.Stabilizer = { name: best.name, reason: "Resolution: Highest Relative Stability", score };
        }
    }

    // 4. Connector Resolution
    if (Matrix.Connector.length === 0) {
        const candidates = familyMembers.filter(m => ['Son', 'Daughter'].includes(m.relation));
        const { best, score } = findBestCandidate(candidates, (p) => {
            // Priority: Expressive
            return getSignalValue(p.signals.emotional_expression);
        });

        if (best && score > 0) {
            Matrix.Connector.push(best.name);
            AssignmentMeta.Connector = { name: best.name, reason: "Resolution: Highest Emotional Expression", score };
        }
    }

    return { Matrix, AssignmentMeta };
};

// --- CONTENT GENERATION ---
// Returns static content modulated by matrix findings

export const generateOSReport = (matrix, members) => {
    const philosophy = "The family operates on a principle of Alignment over Obligation. Each member's role is not enforced by tradition but discovered through their capacity.";

    const distribution = `
        Responsibility is distributed to the Architects (${matrix.Architect.join(', ') || 'None'}) for high-level direction, 
        while Stabilizers (${matrix.Stabilizer.join(', ') || 'None'}) handle continuity.
    `;

    const emotional = `
        Emotional flow is primarily channeled through the Connectors (${matrix.Connector.join(', ') || 'None'}), 
        who ensure information and feeling circulate, while Protectors (${matrix.Protector.join(', ') || 'None'}) absorb shock.
    `;

    const decision = `
        Strategic decisions rest with the Architects. Execution details should be vetted by Stabilizers. 
        Connectors should be consulted for "Buy-in" to ensure family unity.
    `;

    const money = `
        Work orientation and financial independence derived from 2nd, 6th, 10th houses. 
        Architects (${matrix.Architect.join(', ') || 'Lead'}) drive resource acquisition.
    `;

    const boundaries = `
        Dependency risk and autonomy thresholds defined astrologically. 
        Stabilizers (${matrix.Stabilizer.join(', ') || 'None'}) naturally enforce healthy limits to prevent system drain.
    `;

    const conflict = `
        Conflict absorption and repair capacity derived from Mars, Saturn, Moon. 
        Protectors (${matrix.Protector.join(', ') || 'None'}) act as buffers during high tension.
    `;

    const time = `
        Past: Karma Formation. Present: Stabilization. Future: Choice & Legacy.
    `;

    const legacy = `
        Patterns consciously continued or terminated. 
        Architects set the long-term vision for what is passed down.
    `;

    const care = `
        Later-life support without dependency.
        Roles shift as Stabilizers take lead in care-giving phases.
    `;

    const closure = "Role release without rupture. Allowing evolution of the system.";

    return {
        philosophy,
        distribution,
        emotional,
        decision,
        money,
        boundaries,
        conflict,
        time,
        legacy,
        care,
        closure
    };
};
