const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Path to YAML Rules - STRICT SOURCE OF TRUTH
const VISION_TEMPLATES_PATH = path.join(__dirname, '../../Family OS - V/Vision/vision_narrative_templates.yaml');

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

// --- ASTROLOGICAL HELPERS ---

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

const checkConnection = (p1Name, p2Name, planets) => {
    const l1 = planets[p1Name];
    const l2 = planets[p2Name];
    if (l1 === undefined || l2 === undefined) return false;
    return getSign(l1) === getSign(l2); // Conjunction
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

// --- CHILD EVALUATION ENGINE ---

const evaluateChildAxes = (chart, asc) => {
    const planets = getPlanets(chart);

    // 1. Caregiving Orientation
    const moonStr = getStrength('Moon', planets.Moon, asc);
    let fourthHouseBenefics = 0;
    let fourthHouseMalefics = 0;
    Object.keys(planets).forEach(p => {
        if (getHouse(planets[p], asc) === 4) {
            if (isBenefic(p)) fourthHouseBenefics++;
            else fourthHouseMalefics++;
        }
    });

    let caregiving = 'moderate';
    if (moonStr >= 0.7 || fourthHouseBenefics >= 2 || checkConnection('Venus', 'Jupiter', planets)) {
        caregiving = 'high';
    } else if (moonStr < 0.4 || fourthHouseMalefics > 0 || (getHouse(planets.Ketu, asc) === 4)) {
        caregiving = 'low';
    }

    // 2. Conflict Expression
    const marsStr = getStrength('Mars', planets.Mars, asc);
    let conflict = 'defensive';
    if (marsStr >= 0.7 || checkConnection('Rahu', 'Mars', planets)) {
        conflict = 'confrontational';
    } else if (marsStr < 0.4 || (getStrength('Jupiter', planets.Jupiter, asc) > marsStr && checkConnection('Jupiter', 'Mars', planets))) {
        conflict = 'avoidant';
    }

    // 3. Karmic Load
    let karmic = 'moderate';
    if (checkConnection('Saturn', 'Ketu', planets)) {
        karmic = 'heavy';
    } else {
        let dusthanaCount = 0;
        Object.keys(planets).forEach(p => {
            const h = getHouse(planets[p], asc);
            if (['Saturn', 'Rahu', 'Ketu', 'Mars'].includes(p) && (h === 8 || h === 12)) dusthanaCount++;
        });
        if (dusthanaCount >= 2) karmic = 'heavy';
    }

    if (karmic !== 'heavy') {
        let lagnaBenefics = 0;
        Object.keys(planets).forEach(p => {
            if (getHouse(planets[p], asc) === 1 && isBenefic(p)) lagnaBenefics++;
        });
        if (lagnaBenefics >= 1) karmic = 'light';
    }

    // 4. Resilience Index
    let resilience = 'sensitive';
    const lagnaStr = 0.5 + (checkAspect('Jupiter', asc, planets) ? 0.2 : 0);
    if (lagnaStr >= 0.6 && moonStr >= 0.6) {
        resilience = 'stable';
    }
    if (checkConnection('Moon', 'Saturn', planets) || checkAspect('Saturn', planets.Moon, planets)) {
        resilience = 'requires_attention';
    }

    // 5. Legacy Expression
    let legacy = 'bridge_builder';
    const satStr = getStrength('Saturn', planets.Saturn, asc);
    const sunStr = getStrength('Sun', planets.Sun, asc);
    const rahuStr = getStrength('Rahu', planets.Rahu, asc);

    if (satStr >= 0.7 && sunStr >= 0.6) legacy = 'preserver';
    else if (rahuStr >= 0.7) legacy = 'reformer';

    return { caregiving, conflict, karmic, resilience, legacy };
};


// Helper: Render Template Block
const renderTemplate = (templates, pathArray) => {
    let current = templates;
    for (const key of pathArray) {
        if (current && current[key]) {
            current = current[key];
        } else {
            return `CONTRACT_VIOLATION: Missing key '${key}'`;
        }
    }
    // Handle attributes
    if (current.text) return current.text.trim();
    if (current.paragraphs && Array.isArray(current.paragraphs)) return current.paragraphs.join('\n\n').trim();
    if (typeof current === 'string') return current.trim();

    return "CONTRACT_VIOLATION";
};


// Main Generation Function
router.post('/vision', (req, res) => {
    try {
        const { members } = req.body;

        // LOAD TEMPLATES STRICTLY
        const templates = loadYaml(VISION_TEMPLATES_PATH);
        if (!templates) {
            throw new Error("CONTRACT_VIOLATION: vision_narrative_templates.yaml missing");
        }

        // Relaxed Version Check - Allow >=2.0
        if (!templates.version || templates.version < 2.0) {
            console.warn(`WARNING: Template version ${templates.version} might be outdated.`);
        }

        const roleOutputs = [];
        let totalScore = 0;
        let memberCount = 0;

        let childCount = 0;

        // Process Each Member based on role
        members.forEach(m => {
            const chart = m.chart_object;
            const asc = chart.ascendant || chart.Ascendant?.longitude || 0;
            const role = m.role || 'Member';

            // Basic roles
            let visionRole = "Future Direction Carrier";
            let emoji = "👤";
            let roleLabel = role;

            if (role === 'Father') {
                visionRole = "Principle Holder & Moral Compass";
                emoji = "👨";
                roleLabel = "Father";
            } else if (role === 'Mother') {
                visionRole = "Emotional Translator & Sustainer";
                emoji = "👩";
                roleLabel = "Mother";
            } else {
                // Treat as Child (Son/Daughter)
                childCount++;
                visionRole = "Future Direction Carrier";

                // Use gendered emoji if known, otherwise neutral
                if (role.includes('Son')) emoji = "🧑";
                else if (role.includes('Daughter')) emoji = "👧";
                else emoji = "🧒";

                // STRICT: Label must be "Child N (Name)"
                roleLabel = `Child ${childCount} (${m.name || 'Unnamed'})`;
            }

            // Calculate 'strength' for legacy alignment score
            const planets = getPlanets(chart);
            let maxStrength = 0;
            let domPlanet = 'Sun';
            ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].forEach(p => {
                const s = getStrength(p, planets[p], asc) * 100;
                if (s > maxStrength) { maxStrength = s; domPlanet = p; }
            });

            roleOutputs.push({
                role: roleLabel, // This now contains "Child 1 (Name)"
                originalRole: role, // Keep track if needed for sorting, but 'role' above is used for display
                vision_role: visionRole,
                emoji: emoji,
                planet: domPlanet,
                strength: maxStrength,
                chart: chart, // Keep for detailed eval
                asc: asc
            });

            // Alignment Score Contribution
            if (['Sun', 'Jupiter'].includes(domPlanet) && maxStrength > 60) totalScore += 30;
            else if (['Saturn', 'Mars'].includes(domPlanet)) totalScore += 20;
            else totalScore += 10;
            memberCount++;
        });

        // Determine Alignment Level
        const avgScore = memberCount > 0 ? totalScore / memberCount : 20;
        let alignmentInfo = { key: 'clarity_moderate', label: 'Moderate' };
        if (avgScore > 25) alignmentInfo = { key: 'clarity_high', label: 'High' };
        if (avgScore < 15) alignmentInfo = { key: 'clarity_low', label: 'Low' };

        // ----------------------------------------------------------------
        // RENDER OUTPUT (STRICT TEMPLATE EMISSION)
        // ----------------------------------------------------------------
        let outputText = `1. 🌟 FAMILY VISION STATEMENT (Unified Statement)\n`;

        // 1. Unified Statement
        const unifiedText = renderTemplate(templates, ['family_vision_unified', alignmentInfo.key]);
        outputText += `${unifiedText}\n\n`;

        // Member Narratives
        const sortedRoles = [...roleOutputs].sort((a, b) => {
            const order = { 'Father': 1, 'Mother': 2, 'Son': 3, 'Daughter': 4 };
            return (order[a.role] || 99) - (order[b.role] || 99);
        });

        sortedRoles.forEach((r, idx) => {
            outputText += `${idx + 2}. ${r.emoji} ${r.role} – Vision Role: “${r.vision_role}”\n`;

            if (r.role === 'Father') {
                const desc = renderTemplate(templates, ['father_vision_role', 'role_description']);

                let distKey = 'moderate';
                if (alignmentInfo.key === 'clarity_high') distKey = 'mild';
                if (alignmentInfo.key === 'clarity_low') distKey = 'severe';
                const dist = renderTemplate(templates, ['father_vision_role', 'distortion_patterns', distKey]);
                const healthy = renderTemplate(templates, ['father_vision_role', 'healthy_expression']);

                outputText += `${desc}\n\n`;
                outputText += `Distortion Pattern: ${dist}\n\n`;
                outputText += `Healthy Expression: ${healthy}\n\n`;

            } else if (r.role === 'Mother') {
                const desc = renderTemplate(templates, ['mother_vision_role', 'role_description']);

                let distKey = 'moderate';
                if (alignmentInfo.key === 'clarity_high') distKey = 'mild';
                if (alignmentInfo.key === 'clarity_low') distKey = 'severe';
                const dist = renderTemplate(templates, ['mother_vision_role', 'distortion_patterns', distKey]);
                const healthy = renderTemplate(templates, ['mother_vision_role', 'healthy_expression']);

                outputText += `${desc}\n\n`;
                outputText += `Distortion Pattern: ${dist}\n\n`;
                outputText += `Healthy Expression: ${healthy}\n\n`;

            } else { // CHILD LOGIC (UPDATED)
                // 1. Role Description
                const desc = renderTemplate(templates, ['child_vision_role', 'role_description']);
                outputText += `${desc}\n\n`;

                // 2. Evaluate Axes
                const axes = evaluateChildAxes(r.chart, r.asc);

                // 3. Render Axes
                const caregivingText = renderTemplate(templates, ['child_vision_role', 'caregiving_orientation', axes.caregiving]);
                const conflictText = renderTemplate(templates, ['child_vision_role', 'conflict_expression', axes.conflict]);
                const karmicText = renderTemplate(templates, ['child_vision_role', 'karmic_load', axes.karmic]);
                const resilienceText = renderTemplate(templates, ['child_vision_role', 'resilience_index', axes.resilience]);
                const legacyText = renderTemplate(templates, ['child_vision_role', 'legacy_expression', axes.legacy]);

                outputText += `• Caregiving Orientation: ${caregivingText}\n\n`;
                outputText += `• Conflict Expression: ${conflictText}\n\n`;
                outputText += `• Karmic Load Sensitivity: ${karmicText}\n\n`;
                outputText += `• Resilience Index: ${resilienceText}\n\n`;
                outputText += `• Legacy Expression: ${legacyText}\n\n`;

                // 4. Evolution Framing
                const evolution = renderTemplate(templates, ['child_vision_role', 'evolution_framing']);
                outputText += `Evolution Framing: ${evolution}\n\n`;
            }
        });

        // 5. Alignment Summary
        outputText += `5. 🧭 Family Vision Alignment Summary\n`;
        let alignKey = 'moderately_aligned';
        if (alignmentInfo.key === 'clarity_high') alignKey = 'aligned';
        if (alignmentInfo.key === 'clarity_low') alignKey = 'misaligned';
        const summaryText = renderTemplate(templates, ['family_vision_alignment_summary', alignKey]);
        outputText += `${summaryText}\n\n`;

        // 6. Guiding Principle
        outputText += `6. 🌱 Guiding Vision Principle for the Family\n`;
        const principleText = renderTemplate(templates, ['family_guiding_vision_principle']);
        outputText += `“${principleText}”\n\n`;

        res.json({ success: true, report: outputText });

    } catch (error) {
        console.error("Vision Generation Error:", error);
        res.status(500).json({ success: false, error: "Vision Generation Failed: " + error.message });
    }
});

module.exports = router;
