const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Path to YAML Rules - STRICT SOURCE OF TRUTH
const MISSION_TEMPLATES_PATH = path.join(__dirname, '../../Family OS - V/02_Mission/06_mission_narrative_templates.yaml');

// Helper to Load YAML
const loadYaml = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at path: ${filePath}`);
        }
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return yaml.load(fileContents);
    } catch (e) {
        console.error(`Failed to load YAML at ${filePath}:`, e);
        throw new Error(`YAML_LOAD_ERROR: ${e.message} (Path: ${filePath})`);
    }
};

// --- ASTROLOGICAL HELPERS (Reused from Vision) ---

const getSign = (lon) => Math.floor(lon / 30) + 1;

const getHouse = (planetLon, ascLon) => {
    let diff = planetLon - ascLon;
    if (diff < 0) diff += 360;
    return Math.floor(diff / 30) + 1;
};

const getPlanets = (chart) => {
    const map = {};
    const names = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    names.forEach(n => {
        // Handle various input formats
        const p = chart[n] || chart.planets?.[n] || chart.planets?.[n.toLowerCase()];
        if (p) map[n] = p.longitude;
    });
    return map;
};

const isBenefic = (planetName) => ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(planetName);

const getStrength = (planetName, lon, asc) => {
    if (lon === undefined) return 0.5;
    let score = 0.5;
    const sign = getSign(lon);

    // Simple Dignity logic
    const exalted = { Sun: 1, Moon: 2, Mars: 10, Mercury: 6, Jupiter: 4, Venus: 12, Saturn: 7, Rahu: 2, Ketu: 8 };
    const debilitated = { Sun: 7, Moon: 8, Mars: 4, Mercury: 12, Jupiter: 10, Venus: 6, Saturn: 1, Rahu: 8, Ketu: 2 };
    const own = { Sun: [5], Moon: [4], Mars: [1, 8], Mercury: [3, 6], Jupiter: [9, 12], Venus: [2, 7], Saturn: [10, 11] };

    if (exalted[planetName] === sign) score = 0.9;
    else if (debilitated[planetName] === sign) score = 0.2;
    else if (own[planetName]?.includes(sign)) score = 0.8;

    // House placement
    const house = getHouse(lon, asc);
    if ([1, 4, 7, 10, 5, 9].includes(house)) score += 0.1;
    if ([6, 8, 12].includes(house)) score -= 0.1;

    return Math.min(Math.max(score, 0), 1);
};

const checkAspect = (actorName, targetLon, planets) => {
    const actorLon = planets[actorName];
    if (actorLon === undefined) return false;
    const houseDist = (Math.floor(targetLon / 30) - Math.floor(actorLon / 30) + 12) % 12 + 1;

    if (actorName === 'Mars') return [1, 4, 7, 8].includes(houseDist);
    if (actorName === 'Jupiter' || actorName === 'Rahu' || actorName === 'Ketu') return [1, 5, 7, 9].includes(houseDist);
    if (actorName === 'Saturn') return [1, 3, 7, 10].includes(houseDist);
    return houseDist === 7 || houseDist === 1; // Default
};

// --- MISSION ENGINE LOGIC ---

// Calculate standard strengths for a member
const evaluatePlanetaryStrengths = (chart, asc) => {
    const planets = getPlanets(chart);
    const strengths = {};
    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].forEach(p => {
        strengths[p] = getStrength(p, planets[p], asc);
    });
    return { planets, strengths };
};

// Determine Mission Mode based on Family Aggregate
const determineMissionMode = (members) => {
    let scores = { Preservation: 0, Expansion: 0, Reform: 0, Wisdom: 0 };

    // Aggregate strengths
    members.forEach(m => {
        const { strengths } = evaluatePlanetaryStrengths(m.chart_object, m.chart_object.ascendant || 0);
        scores.Preservation += strengths.Saturn;
        scores.Expansion += strengths.Mars;
        scores.Reform += strengths.Rahu;
        scores.Wisdom += strengths.Jupiter;
    });

    // Determine winner
    const maxScore = Math.max(scores.Preservation, scores.Expansion, scores.Reform, scores.Wisdom);
    if (scores.Preservation === maxScore) return 'preservation_mode';
    if (scores.Expansion === maxScore) return 'expansion_mode';
    if (scores.Reform === maxScore) return 'reform_mode';
    return 'wisdom_mode';
};

// Evaluate Member Mission Rules
const evaluateMemberMission = (member) => {
    const chart = member.chart_object;
    const asc = chart.ascendant || 0;
    const { planets, strengths } = evaluatePlanetaryStrengths(chart, asc);
    const rules = [];

    // Helper: Check rules
    // Sun
    const sunHouse = getHouse(planets.Sun, asc);
    if ([1, 10].includes(sunHouse)) rules.push({ planet: 'Sun', role: "Command Authority", desc: "Set direction and final intent" });
    if (sunHouse === 9) rules.push({ planet: 'Sun', role: "Ethical Commander", desc: "Align actions with dharma" });

    // Mars
    const marsHouse = getHouse(planets.Mars, asc);
    if ([1, 3, 10].includes(marsHouse)) rules.push({ planet: 'Mars', role: "Primary Executor", desc: "Direct and forceful execution" });
    if (marsHouse === 6) rules.push({ planet: 'Mars', role: "Conflict Handler", desc: "Problem-solving through struggle" });

    // Saturn
    const satHouse = getHouse(planets.Saturn, asc);
    if ([1, 2, 4].includes(satHouse)) rules.push({ planet: 'Saturn', role: "Load Bearer", desc: "Ensure continuity and stability" });
    if (satHouse === 10) rules.push({ planet: 'Saturn', role: "Accountability Head", desc: "Public responsibility and reputation" });

    // Mercury
    if (strengths.Mercury > 0.7) rules.push({ planet: 'Mercury', role: "Planner & Coordinator", desc: "Optimize processes and communication" });
    const merHouse = getHouse(planets.Mercury, asc);
    if ([3, 6, 11].includes(merHouse)) rules.push({ planet: 'Mercury', role: "Operational Strategist", desc: "Tactical planning" });

    // Jupiter
    if (strengths.Jupiter > 0.7) rules.push({ planet: 'Jupiter', role: "Advisor", desc: "Ensure ethical expansion" });

    // Venus
    if (strengths.Venus > 0.7) rules.push({ planet: 'Venus', role: "Harmony Keeper", desc: "Maintain relationships and morale" });

    // Nodes
    if (strengths.Rahu > 0.75) rules.push({ planet: 'Rahu', role: "Experiment Driver", desc: "Try new paths and technologies" });
    if (strengths.Ketu > 0.75) rules.push({ planet: 'Ketu', role: "Simplifier", desc: "Remove obsolete commitments" });

    // Pick Dominant Rule (Highest Strength Planet)
    let dominant = rules[0];
    let maxS = 0;
    rules.forEach(r => {
        if (strengths[r.planet] > maxS) {
            maxS = strengths[r.planet];
            dominant = r;
        }
    });

    return {
        dominantRule: dominant || { planet: 'General', role: 'Supporter', desc: 'Support family goals' },
        strengths
    };
};

// Render Template
const renderTemplate = (templates, pathArray) => {
    let current = templates;
    for (const key of pathArray) {
        if (current && current[key]) {
            current = current[key];
        } else {
            return `MISSING_TEMPLATE: ${key}`;
        }
    }
    if (current.template) return current.template.trim();
    if (current.message) return current.message.trim();
    if (typeof current === 'string') return current.trim();
    return "TEMPLATE_ERROR";
};


// --- ROUTE HANDLER ---

router.post('/mission', (req, res) => {
    try {
        const { members } = req.body; // Expects array of members with chart_object

        // LOAD TEMPLATES
        const templates = loadYaml(MISSION_TEMPLATES_PATH);
        if (!templates) throw new Error("Mission Templates Missing");

        // 1. Determine Family Mission Mode
        const missionModeKey = determineMissionMode(members);

        // 2. Calculate Alignment Score (Aggregate of supportive planets)
        let totalScore = 0;
        let memberCount = 0;
        const memberResults = [];

        members.forEach((m, idx) => {
            const { dominantRule, strengths } = evaluateMemberMission(m);
            const role = m.role || 'Member';

            // Score contribution
            let score = 50; // Base
            if (strengths.Saturn > 0.6) score += 10;
            if (strengths.Mars > 0.6) score += 10;
            if (strengths.Jupiter > 0.6) score += 10;
            // Dasha considerations could go here

            totalScore += score;
            memberCount++;

            memberResults.push({
                originalData: m,
                rule: dominantRule,
                strengths: strengths,
                score: score
            });
        });

        const avgScore = memberCount > 0 ? totalScore / memberCount : 50;

        // 3. Render Output
        let outputText = `1. 🚀 FAMILY MISSION STATEMENT\n`;
        outputText += `(Mission Mode: ${missionModeKey.replace('_mode', '').toUpperCase()})\n`;

        // Mandatory Rationales
        const modeRationales = {
            preservation_mode: "This phase emphasizes stabilization, role clarity, and sustainable coordination rather than expansion or risk-taking.",
            expansion_mode: "This phase emphasizes growth, resource acquisition, and aggressive execution.",
            reform_mode: "This phase emphasizes breaking old patterns and adopting new systems.",
            wisdom_mode: "This phase emphasizes mentoring, teaching, and consolidating legacy."
        };
        outputText += `Rationale: ${modeRationales[missionModeKey] || "Focus on alignment."}\n\n`;

        // Select Tier based on Score
        let tierKey = 'mixed_alignment';
        if (avgScore >= 75) tierKey = 'high_alignment';
        else if (avgScore >= 50) tierKey = 'mixed_alignment';
        else tierKey = 'low_alignment';

        const tierText = renderTemplate(templates, ['mission_narrative_templates', 'narrative_tiers', tierKey]);
        outputText += `${tierText}\n\n`;

        // 4. Member Roles
        outputText += `2. 👥 MISSION ROLES & RESPONSIBILITIES\n`;

        let childCounter = 0;
        const sorted = [...memberResults].sort((a, b) => {
            const order = { 'Father': 1, 'Mother': 2 };
            const ra = a.originalData.role;
            const rb = b.originalData.role;
            return (order[ra] || 99) - (order[rb] || 99);
        });

        sorted.forEach((res, idx) => {
            const m = res.originalData;
            let label = m.role;
            let emoji = "👤";
            let caution = "";

            if (m.role === 'Father') {
                emoji = "👨";
                caution = "Caution: Avoid decision bottlenecks or over-coordination.";
            } else if (m.role === 'Mother') {
                emoji = "👩";
                caution = "Caution: Avoid absorbing invisible emotional labor.";
            } else {
                // Child - ENFORCE SAFETY
                childCounter++;
                if (m.role.includes('Son')) emoji = "🧑";
                else if (m.role.includes('Daughter')) emoji = "👧";
                else emoji = "🧒";
                label = `Child ${childCounter} (${m.name || 'Unnamed'})`;

                // Override Rule for Child
                res.rule = {
                    role: "Future Carrier / Learner",
                    desc: "Focus on education and skill acquisition. No heavy execution duties."
                };
                caution = "Protection Rule: No emotional or responsibility burden.";
            }

            outputText += `${emoji} ${label} – Role: "${res.rule.role}"\n`;
            outputText += `   Responsibility: ${res.rule.desc}\n`;
            outputText += `   ⚠️ ${caution}\n\n`;
        });

        // 5. Risks
        outputText += `3. ⚠️ EXECUTION RISKS\n`;
        let riskPattern = 'authority_conflict';
        let mitigation = "Mitigation: Assign final decision authority per domain and review quarterly.";

        if (avgScore < 40) {
            riskPattern = 'burnout_risk';
            mitigation = "Mitigation: Enforce mandatory rest periods and simplify active projects.";
        } else if (missionModeKey === 'preservation_mode') {
            // Specific conflict mitigation for preservation
            mitigation = "Mitigation: Ensure clear boundaries between roles to prevent overlap.";
        }

        const riskMsg = renderTemplate(templates, ['mission_narrative_templates', 'execution_risk_warnings', riskPattern]);
        outputText += `${riskMsg}\n`;
        outputText += `🛡️ ${mitigation}\n\n`;


        // 6. Reinforcements
        outputText += `4. 💪 PLANETARY REINFORCEMENTS\n`;
        let reinforcementAdded = false;

        // Determine strongest planet family-wide
        let familySaturn = 0, familyJupiter = 0, familyMars = 0;
        memberResults.forEach(r => {
            familySaturn += r.strengths.Saturn;
            familyJupiter += r.strengths.Jupiter;
            familyMars += r.strengths.Mars;
        });

        if (familySaturn / memberCount > 0.6) {
            const msg = renderTemplate(templates, ['mission_narrative_templates', 'reinforcement_messages', 'saturn_supported']);
            outputText += `• Saturn: ${msg}\n\n`;
            reinforcementAdded = true;
        }
        if (familyJupiter / memberCount > 0.6) {
            const msg = renderTemplate(templates, ['mission_narrative_templates', 'reinforcement_messages', 'jupiter_supported']);
            outputText += `• Jupiter: ${msg}\n\n`;
            reinforcementAdded = true;
        }

        // Fallback or Addition if Mars is strong
        if (!reinforcementAdded && (familyMars / memberCount > 0.6)) {
            const msg = renderTemplate(templates, ['mission_narrative_templates', 'reinforcement_messages', 'mars_supported']);
            outputText += `• Mars: ${msg}\n\n`;
            reinforcementAdded = true;
        }

        if (!reinforcementAdded) {
            // General Fallback
            outputText += "• Planetary Focus: Rely on Mercury (Strategy) and conscious effort. Saturn provides the necessary container for discipline even if not naturally dominant.\n";
        }

        // --------------------------------------------------------
        // VALIDATION CHECK (Shared Engine: 99_mission_output_validator.yaml)
        // --------------------------------------------------------
        const validateOutput = require('../utils/outputValidator');
        const validatorPath = path.join(__dirname, '../../Family OS - V/02_Mission/99_mission_output_validator.yaml');
        const validationResult = validateOutput(outputText, validatorPath, 'session_family_id');

        if (validationResult.status === 'FAIL') {
            const timestamp = new Date().toISOString();
            console.error(`[${timestamp}] MISSION GENERATION VALIDATION FAILED`);
            console.error(`Violated Rules: ${JSON.stringify(validationResult.violated_rules)}`);
            console.error(`Errors: ${JSON.stringify(validationResult.errors)}`);
            console.error(`RAW OUTPUT DUMP:\n${outputText}`);

            // RETURN SAFE ERROR UI
            const safeErrorMsg = `
🚫 **Mission Output Temporarily Unavailable**

The system detected an internal consistency issue while preparing your family’s Mission analysis.
*Rules Violated: ${validationResult.violated_rules.join(', ') || 'Internal Consistency'}*

Please retry in a moment.
            `;

            res.json({ success: true, report: safeErrorMsg });
            return;
        }

        // Mission does not tolerate warnings -> If warnings exist they are ignored or tracked, but logic above only blocks on FAIL.
        res.json({ success: true, report: outputText });

    } catch (error) {
        console.error("Mission Generation Error:", error);
        res.status(500).json({ success: false, error: "Mission Failed: " + error.message });
    }
});

module.exports = router;
