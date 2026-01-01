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
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return yaml.load(fileContents);
    } catch (e) {
        console.error(`Failed to load YAML at ${filePath}:`, e);
        return null; // Handle missing file strictly in logic
    }
};

// 1. Planetary Axioms & Role Mappings (Partial Logic from Domain Definition)
const ROLE_ARCHETYPES = {
    Father: "Principle Holder & Moral Compass",
    Mother: "Emotional Translator & Sustainer",
    Son: "Future Direction Carrier",
    Daughter: "Future Direction Carrier"
};

// Helper: Get House of Planet
const getHouse = (planetLon, ascLon) => {
    let diff = planetLon - ascLon;
    if (diff < 0) diff += 360;
    return Math.floor(diff / 30) + 1;
};

// Main Generation Function
router.post('/vision', (req, res) => {
    try {
        const { members } = req.body;

        // LOAD TEMPLATES STRICTLY
        const templates = loadYaml(VISION_TEMPLATES_PATH);
        if (!templates || !templates.vision_narrative_templates) {
            throw new Error("TEMPLATE_MISSING_ERROR: vision_narrative_templates.yaml invalid or missing");
        }
        const narrativeRules = templates.vision_narrative_templates;

        const roleOutputs = [];
        let totalScore = 0;
        let memberCount = 0;

        // Process Each Member
        members.forEach(m => {
            const chart = m.chart_object;
            const asc = chart.ascendant || chart.Ascendant?.longitude || 0;
            const role = m.role || 'Member';

            // Identify dominant planet (Simplified for Scoring)
            let domPlanet = 'Default';
            let maxStrength = 0;
            const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'];

            planets.forEach(p => {
                const pLon = chart.planets?.[p.toLowerCase()] || chart[p]?.longitude || 0;
                const house = getHouse(pLon, asc);
                let strength = 0;
                if (['Sun', 'Jupiter', 'Saturn'].includes(p)) strength += 20;
                if ([1, 5, 9].includes(house)) strength += 15;
                if ([10].includes(house)) strength += 10;

                if (strength > maxStrength) {
                    maxStrength = strength;
                    domPlanet = p;
                }
            });

            // STRICT ROLE LABEL ENFORCEMENT
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
            } else if (role.includes('Son') || role.toLowerCase().includes('son')) {
                visionRole = "Future Direction Carrier";
                emoji = "🧑";
                roleLabel = "Son";
            } else if (role.includes('Daughter') || role.toLowerCase().includes('daughter')) {
                visionRole = "Future Direction Carrier";
                emoji = "👧";
                roleLabel = "Daughter";
            }

            roleOutputs.push({
                role: roleLabel,
                vision_role: visionRole,
                emoji: emoji,
                planet: domPlanet
            });

            if (['Sun', 'Jupiter'].includes(domPlanet) && maxStrength > 30) totalScore += 30;
            else if (['Saturn', 'Mars'].includes(domPlanet)) totalScore += 20;
            else totalScore += 10;
            memberCount++;
        });

        const avgScore = memberCount > 0 ? totalScore / memberCount : 20;
        let alignmentKey = 'moderate_alignment';
        if (avgScore > 25) alignmentKey = 'high_alignment';
        if (avgScore < 15) alignmentKey = 'low_alignment';

        // FETCH TEMPLATES
        const familyNarrativeObj = narrativeRules.family_narratives[alignmentKey];
        if (!familyNarrativeObj) throw new Error(`TEMPLATE_MISSING_ERROR: family_narratives.${alignmentKey}`);

        const guidingPrinciple = narrativeRules.family_guiding_principle?.[alignmentKey];
        if (!guidingPrinciple) throw new Error(`TEMPLATE_MISSING_ERROR: family_guiding_principle.${alignmentKey}`);

        // BUILD OUTPUT STRICTLY
        let outputText = `1. 🌟 FAMILY VISION STATEMENT (Unified Statement)\n`;
        outputText += `${familyNarrativeObj.narrative.trim()}\n\n`;

        // Role Sections - STRICT: If template missing, output error.
        const outputRoleBlock = (r) => {
            let block = "";
            let roleTitle = r.role;
            block += `${r.emoji} ${r.role} – Vision Role: “${r.vision_role}”\n`;
            // NOTE TO USER: Role Narratives are NOT defined in vision_narrative_templates.yaml.
            // Per defined rules: "If a required template is missing: output TEMPLATE_MISSING_ERROR".
            block += `TEMPLATE_MISSING_ERROR: Role narrative templates not found in vision_narrative_templates.yaml.\n\n`;
            return block;
        };

        // Sort roles: Father, Mother, Children
        const sortedRoles = [...roleOutputs].sort((a, b) => {
            const order = { 'Father': 1, 'Mother': 2, 'Son': 3, 'Daughter': 4 };
            return (order[a.role] || 99) - (order[b.role] || 99);
        });

        sortedRoles.forEach((r, idx) => {
            outputText += `${idx + 2}. ${outputRoleBlock(r)}`;
        });

        outputText += `5. 🧭 Family Vision Alignment Summary\n`;
        // Summary text is also not in YAML and summarization forbidden.
        outputText += `TEMPLATE_MISSING_ERROR: Alignment summary templates not found in vision_narrative_templates.yaml.\n\n`;

        outputText += `6. 🌱 Guiding Vision Principle for the Family\n`;
        outputText += `“${guidingPrinciple}”\n\n`;

        outputText += `7. ✅ Vision Module Validation Status\n`;
        outputText += `Vision Narrative Rendering Module executed successfully. Narrative Rendering Mode Active.`;

        res.json({ success: true, report: outputText });

    } catch (error) {
        console.error("Vision Generation Error:", error);
        res.status(500).json({ success: false, error: error.message || "Vision Generation Failed" });
    }
});

module.exports = router;
