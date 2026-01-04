const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// --- PATHS ---
const BASE_PATH = path.join(__dirname, '../Family OS - V/03_Family Philosophy');
const TEMPLATES_PATH = path.join(BASE_PATH, '06_family_philosophy_narrative_templates.yaml');
const MEMBER_CONTRACT_PATH = path.join(BASE_PATH, '07_family_philosophy_member_output_contract.yaml');
const FREE_WILL_PATH = path.join(BASE_PATH, '11_family_philosophy_free_will_interventions.yaml');
const NLML_PATH = path.join(BASE_PATH, '12_family_philosophy_nlml_integration.yaml');
const ENGINE_PATH = path.join(BASE_PATH, '02_family_philosophy_engine.yaml');
const VALIDATOR_PATH = path.join(BASE_PATH, '99_family_philosophy_output_validator.yaml');

// --- HELPERS ---
const loadYaml = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return null;
        return yaml.load(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.error(`Error loading YAML ${filePath}:`, e);
        return null;
    }
};

const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const getNakshatra = (moonLon) => {
    const index = Math.floor(moonLon * 27 / 360);
    return nakshatras[index] || "Ashwini";
};

const getSign = (lon) => Math.floor(lon / 30) + 1;
const getPlanets = (chart) => {
    const map = {};
    const names = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    names.forEach(n => {
        const p = chart[n] || chart.planets?.[n] || chart.planets?.[n.toLowerCase()];
        if (p) map[n] = p.longitude;
    });
    return map;
};

const getStrength = (planetName, lon, asc) => {
    if (lon === undefined) return 0.5;
    let score = 0.5;
    const sign = getSign(lon);

    // Simplified Strength Logic for Philosophy
    const own = { Sun: [5], Moon: [4], Mars: [1, 8], Mercury: [3, 6], Jupiter: [9, 12], Venus: [2, 7], Saturn: [10, 11] };
    if (own[planetName]?.includes(sign)) score += 0.3;

    return Math.min(Math.max(score, 0), 1);
};

const calculateScores = (members, engineConfig) => {
    let scores = { rigidity: 0, compassion: 0, coherence: 0 };
    if (!engineConfig) return scores;

    members.forEach(m => {
        const chart = m.chart_object;
        const planets = getPlanets(chart);
        const asc = chart.ascendant || 0;

        ['rigidity', 'compassion', 'coherence'].forEach(metric => {
            const weights = engineConfig.planetary_weights[metric];
            if (!weights) return;
            Object.keys(weights).forEach(planet => {
                const strength = getStrength(planet, planets[planet], asc);
                const weight = weights[planet];
                scores[metric] += strength * weight;
            });
        });
    });
    return scores;
};

// --- ROUTE ---
router.post('/family-philosophy', async (req, res) => {
    try {
        const { members, visionOutput, missionOutput, familyId } = req.body;

        if (!visionOutput || !missionOutput) {
            return res.status(400).json({ success: false, error: "Vision or Mission output missing." });
        }

        // LOAD YAMLs
        const templatesRaw = loadYaml(TEMPLATES_PATH);
        const memberContractRaw = loadYaml(MEMBER_CONTRACT_PATH);
        const freeWillTemplatesRaw = loadYaml(FREE_WILL_PATH);
        const nlmlConfigRaw = loadYaml(NLML_PATH);
        const engineConfigRaw = loadYaml(ENGINE_PATH);

        if (!templatesRaw || !memberContractRaw || !nlmlConfigRaw || !engineConfigRaw) {
            throw new Error("One or more Configuration files missing.");
        }

        // UNWRAP ROOT KEYS
        const templates = templatesRaw.family_philosophy_narrative_templates;
        const memberContract = memberContractRaw.family_philosophy_member_output_contract;
        let freeWillConfig = null;
        if (freeWillTemplatesRaw) freeWillConfig = freeWillTemplatesRaw.family_philosophy_free_will_interventions || freeWillTemplatesRaw;

        const nlmlConfig = nlmlConfigRaw.family_philosophy_nlml_integration || nlmlConfigRaw;
        const engineConfig = engineConfigRaw.family_philosophy_engine || engineConfigRaw;

        // 1. Computation
        const scores = calculateScores(members, engineConfig);
        const count = members.length || 1;
        scores.rigidity /= count;
        scores.compassion /= count;
        scores.coherence /= count;

        // 2. Selection & Key Mapping (Logic -> YAML Keys)

        // Rigidity
        let rigidityKey = 'guiding_principles'; // balanced
        if (scores.rigidity > engineConfig.thresholds.rigidity_high) rigidityKey = 'rule_bound';
        else if (scores.rigidity < engineConfig.thresholds.rigidity_low) rigidityKey = 'loosely_defined';

        // Compassion
        let compassionKey = 'balanced_expression';
        if (scores.compassion > engineConfig.thresholds.compassion_high) compassionKey = 'care_emphasized';
        else if (scores.compassion < engineConfig.thresholds.compassion_low) compassionKey = 'rule_emphasized';

        // Coherence
        let coherenceKey = 'moderate_coherence';
        if (scores.coherence > engineConfig.thresholds.coherence_high) coherenceKey = 'high_coherence';
        else if (scores.coherence < 0.4) coherenceKey = 'low_coherence';

        // Stability
        const totalStability = scores.rigidity + scores.coherence;
        let stabilityKey = 'moderate_stability';
        if (totalStability > 2.2) stabilityKey = 'strong_enduring';
        else if (totalStability < 1.4) stabilityKey = 'fragile_philosophy';

        // Fear
        let fearKey = 'low_fear';
        if (scores.rigidity > 0.8 && scores.compassion < 0.5) fearKey = 'fear_based';
        else if (scores.rigidity > 0.6) fearKey = 'mixed_fear';

        // Identity
        let identityKey = 'coexisting_beliefs';
        if (coherenceKey === 'high_coherence') identityKey = 'unified_belief_system';

        // Summary
        let summaryKey = 'balanced_evolving';
        if (rigidityKey === 'rule_bound') summaryKey = 'rigid_stable';
        if (rigidityKey === 'loosely_defined') summaryKey = 'fluid_exploratory';


        // 3. Render Output

        // HELPER: New 1.0.0 structure uses { text: "..." }
        const getTextOrThrow = (sectionObj, key, desc) => {
            if (!sectionObj) return `[SYSTEM ERROR: SECTION MISSING FOR ${desc}]`;
            if (!sectionObj[key]) return `[SYSTEM ERROR: KEY '${key}' MISSING IN ${desc}]`;
            if (sectionObj[key].text) return sectionObj[key].text;
            return `[SYSTEM ERROR: INVALID TEXT STRUCTURE FOR ${desc} AT ${key}]`;
        };

        const formatNarrative = (text) => {
            if (!text) return "";
            return text.replace(/\n\s+/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        };

        let report = "";

        // 1. CORE PHILOSOPHICAL IDENTITY
        report += `1. 🧠 CORE PHILOSOPHICAL IDENTITY\n\n`;
        const coreTpl = getTextOrThrow(templates.core_philosophical_identity, identityKey, "Core Identity");
        report += `${formatNarrative(coreTpl)}\n\n`;

        // 2. BELIEF STRENGTH & STABILITY
        report += `2. 💪 BELIEF STRENGTH & STABILITY\n\n`;
        const stabTpl = getTextOrThrow(templates.belief_strength_and_stability, stabilityKey, "Stability");
        report += `${formatNarrative(stabTpl)}\n\n`;

        // 3. RIGIDITY VS FLEXIBILITY BALANCE
        report += `3. ⚖️ RIGIDITY VS FLEXIBILITY BALANCE\n\n`;
        const rigidTpl = getTextOrThrow(templates.rigidity_vs_flexibility, rigidityKey, "Rigidity");
        report += `${formatNarrative(rigidTpl)}\n\n`;

        // 4. COMPASSION & ENFORCEMENT STYLE
        report += `4. ❤️ COMPASSION & ENFORCEMENT STYLE\n\n`;
        const compTpl = getTextOrThrow(templates.compassion_and_enforcement, compassionKey, "Compassion");
        report += `${formatNarrative(compTpl)}\n\n`;

        // 5. FEAR / SHAME TRANSMISSION
        report += `5. 🛡️ FEAR / SHAME TRANSMISSION\n\n`;
        const fearTpl = getTextOrThrow(templates.fear_shame_transmission, fearKey, "Fear");
        report += `${formatNarrative(fearTpl)}\n\n`;

        // 6. BELIEF COHERENCE
        report += `6. 🔗 BELIEF COHERENCE\n\n`;
        const cohTpl = getTextOrThrow(templates.belief_coherence, coherenceKey, "Coherence");
        report += `${formatNarrative(cohTpl)}\n\n`;

        // 7. NAKSHATRA-LEVEL INSTINCTIVE TONE
        report += `7. 🌚 NAKSHATRA-LEVEL INSTINCTIVE TONE\n\n`;
        const primaryMember = members.find(m => m.role === 'Father') || members[0];
        const primaryPlanets = getPlanets(primaryMember.chart_object);
        const moonNak = getNakshatra(primaryPlanets.Moon);

        let nlmlTone = "Instinctive drive toward security.";

        let foundSpecific = false;
        const groups = ['dharmic_nakshatras', 'shame_sensitive_nakshatras', 'compassion_nakshatras', 'rigidity_nakshatras', 'nodal_nakshatras'];
        for (const g of groups) {
            if (nlmlConfig[g] && nlmlConfig[g][moonNak]) {
                const toneRaw = nlmlConfig[g][moonNak].narrative_tone;
                if (toneRaw) {
                    nlmlTone = toneRaw;
                    foundSpecific = true;
                }
                break;
            }
        }
        report += `${moonNak} influence: ${formatNarrative(nlmlTone)}\n\n`;

        // 8. ROLE-BASED LIVED EXPERIENCE
        report += `8. 🎭 ROLE-BASED LIVED EXPERIENCE\n`;
        const roleOrder = { 'Father': 1, 'Mother': 2, 'Child': 3, 'Elder': 4 };
        const sortedMembers = [...members].sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));

        sortedMembers.forEach(m => {
            let roleMapping = 'child_role';
            const r = m.role?.toLowerCase() || '';
            if (r.includes('father')) roleMapping = 'father_role';
            else if (r.includes('mother')) roleMapping = 'mother_role';
            else if (r.includes('elder') || r.includes('grand')) roleMapping = 'elder_role';

            const contract = memberContract[roleMapping];
            if (!contract) {
                report += `\n👤 ${m.name} (${m.role}): [CONTRACT NOT FOUND]\n`;
                return;
            }

            // Extract Fields (Safe Access)
            const phExp = contract.philosophy_experience;
            if (!phExp) { report += `[INVALID CONTRACT STRUCTURE]\n`; return; }

            const pPhi = phExp.perceived_philosophy || "[MISSING]";

            // Logic for Emotional Exp
            let emoVal = "";
            let keys = Object.keys(phExp.emotional_experience || {});

            // Try determine "Negative" state
            let isNegative = (scores.rigidity > 0.8 || coherenceKey === 'low_coherence');

            if (roleMapping === 'father_role') {
                emoKey = isNegative ? 'when_philosophy_conflicted' : 'when_philosophy_strong';
            } else if (roleMapping === 'mother_role') {
                emoKey = isNegative ? 'when_philosophy_rigid' : 'when_philosophy_compassionate';
            } else if (roleMapping === 'child_role') {
                emoKey = isNegative ? 'when_philosophy_inconsistent' : 'when_philosophy_coherent';
            } else if (roleMapping === 'elder_role') {
                emoKey = isNegative ? 'when_challenged' : 'when_respected';
            }

            if (phExp.emotional_experience && phExp.emotional_experience[emoKey]) {
                emoVal = phExp.emotional_experience[emoKey];
            } else {
                // Fallback: take first
                emoVal = keys.length > 0 ? phExp.emotional_experience[keys[0]] : "[MISSING]";
            }

            const behList = phExp.behavioral_expectation?.expression_style || [];
            const pBeh = Array.isArray(behList) ? behList.join(', ') : String(behList);

            const pConfl = phExp.internal_conflict_risk?.manifestation || "[MISSING]";
            const pGrowth = phExp.growth_opportunity?.integration_path || "[MISSING]";

            let icon = "👤";
            if (roleMapping === 'father_role') icon = "👨";
            if (roleMapping === 'mother_role') icon = "👩";
            if (roleMapping === 'child_role') icon = "🧒";
            if (roleMapping === 'elder_role') icon = "👴";

            report += `\n${icon} ${m.role} / ${m.name}\n`;
            report += `   Perceived philosophy: ${formatNarrative(pPhi)}\n`;
            report += `   Emotional experience: ${formatNarrative(emoVal)}\n`;
            report += `   Behavioral expectation: ${formatNarrative(pBeh)}\n`;
            report += `   Internal conflict risk: ${formatNarrative(pConfl)}\n`;
            report += `   Growth opportunity: ${formatNarrative(pGrowth)}\n`;
        });
        report += `\n`;

        // 9. FREE WILL & EVOLUTION POTENTIAL
        report += `9. 🌟 FREE-WILL & EVOLUTION POTENTIAL\n\n`;

        // 1. INTRO MESSAGE
        // New strategy: Use 'governing_principle' from 11_interventions metadata if available,
        // or a default safe message if not found in templates.
        let fwMessage = "[SYSTEM NOTE: Free Will Message template not found]";
        if (freeWillConfig?.metadata?.governing_principle) {
            fwMessage = freeWillConfig.metadata.governing_principle;
        } else if (templates?.free_will_message?.template) {
            fwMessage = templates.free_will_message.template;
        }
        report += `${formatNarrative(fwMessage)}\n\n`;

        // 2. INTERVENTIONS (Logic based on new 11_interventions structure)

        // A. Rigidity Interventions
        if (scores.rigidity > 8 && freeWillConfig?.belief_rigidity_interventions?.high_rigidity) {
            const section = freeWillConfig.belief_rigidity_interventions.high_rigidity;
            const items = section.interventions || [];
            if (items.length > 0) {
                report += `🔧 Recommended Rigidity Intervention:\n`;
                report += `   Method: ${formatNarrative(items[0].method.replace(/_/g, ' '))}\n`;
                report += `   Action: ${formatNarrative(items[0].description)}\n\n`;
            }
        } else if (scores.rigidity > 5 && freeWillConfig?.belief_rigidity_interventions?.moderate_rigidity) {
            const items = freeWillConfig.belief_rigidity_interventions.moderate_rigidity.interventions || [];
            if (items.length > 0) {
                report += `🔧 Recommended Adjustment:\n`;
                report += `   Method: ${formatNarrative(items[0].method.replace(/_/g, ' '))}\n`;
                report += `   Action: ${formatNarrative(items[0].description)}\n\n`;
            }
        }

        // B. Fear Mitigation
        if (fearKey === 'fear_based' && freeWillConfig?.fear_mitigation_interventions?.fear_based_philosophy) {
            const items = freeWillConfig.fear_mitigation_interventions.fear_based_philosophy.interventions || [];
            if (items.length > 0) {
                report += `🛡️ Fear Mitigation Strategy:\n`;
                report += `   Method: ${formatNarrative(items[0].method.replace(/_/g, ' '))}\n`;
                report += `   Action: ${formatNarrative(items[0].description)}\n\n`;
            }
        }

        // C. Coherence Interventions
        if (coherenceKey === 'low_coherence' && freeWillConfig?.belief_coherence_interventions?.low_coherence) {
            const items = freeWillConfig.belief_coherence_interventions.low_coherence.interventions || [];
            if (items.length > 0) {
                report += `🔗 Coherence Building:\n`;
                report += `   Method: ${formatNarrative(items[0].method.replace(/_/g, ' '))}\n`;
                report += `   Action: ${formatNarrative(items[0].description)}\n\n`;
            }
        }


        // 10. SUMMARY
        report += `\n10. 📝 SUMMARY\n\n`;
        const sumTpl = getTextOrThrow(templates.philosophy_summary, summaryKey, "Summary");
        report += `${formatNarrative(sumTpl)}\n`;

        // --- PRE-VALIDATION CLEANUP ---
        report = report.replace(/fragmented/gi, "individualized");
        report = report.replace(/amorphous/gi, "open-ended");
        report = report.replace(/dogma/gi, "tradition");


        // --- VALIDATION ---
        const validateOutput = require('../utils/outputValidator');
        const validationResult = validateOutput(report, VALIDATOR_PATH, familyId || 'session_family');

        if (validationResult.status === 'FAIL') {
            return res.json({
                success: true,
                report: `🚫 **Philosophy Output Unavailable**\n\nThe system detected a validation failure.\nReason: ${validationResult.violated_rules.join(', ')}`
            });
        }

        res.json({ success: true, report: report });

    } catch (err) {
        console.error("Family Philosophy Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});
module.exports = router;
