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
        return null;
    }
};

// Helper: Get House of Planet
const getHouse = (planetLon, ascLon) => {
    let diff = planetLon - ascLon;
    if (diff < 0) diff += 360;
    return Math.floor(diff / 30) + 1;
};

// Helper: Render Template Block
const renderTemplate = (templates, pathArray) => {
    let current = templates;
    for (const key of pathArray) {
        if (current && current[key]) {
            current = current[key];
        } else {
            return "CONTRACT_VIOLATION"; // Strict failure mode
        }
    }
    // Handle specific YAML structure from the user update
    // e.g. some nodes have 'text', some have 'paragraphs' list
    if (current.text) return current.text.trim();
    if (current.paragraphs && Array.isArray(current.paragraphs)) return current.paragraphs.join('\n\n').trim();

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

        const roleOutputs = [];
        let totalScore = 0;
        let memberCount = 0;

        // Process Each Member for Scoring
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

            // Map Roles strictly
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
                planet: domPlanet,
                strength: maxStrength
            });

            if (['Sun', 'Jupiter'].includes(domPlanet) && maxStrength > 30) totalScore += 30;
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
        if (unifiedText === "CONTRACT_VIOLATION") throw new Error("CONTRACT_VIOLATION: Missing Family Vision Template");
        outputText += `${unifiedText}\n\n`;

        // 2, 3, 4. Role Narratives
        const sortedRoles = [...roleOutputs].sort((a, b) => {
            const order = { 'Father': 1, 'Mother': 2, 'Son': 3, 'Daughter': 4 };
            return (order[a.role] || 99) - (order[b.role] || 99);
        });

        sortedRoles.forEach((r, idx) => {
            outputText += `${idx + 2}. ${r.emoji} ${r.role} – Vision Role: “${r.vision_role}”\n`;

            if (r.role === 'Father') {
                const desc = renderTemplate(templates, ['father_vision_role', 'role_description']);

                // Distortion Logic: alignment low -> severe, mod -> moderate, high -> mild (Simplified Mapping)
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

            } else { // Child
                const desc = renderTemplate(templates, ['child_vision_role', 'role_description']);

                // Mode Logic
                let modeKey = 'conflicted';
                if (alignmentInfo.key === 'clarity_high') modeKey = 'adaptive';
                if (alignmentInfo.key === 'clarity_low') modeKey = 'suppressed';
                const mode = renderTemplate(templates, ['child_vision_role', 'generational_modes', modeKey]);

                const evolution = renderTemplate(templates, ['child_vision_role', 'evolution_framing']);

                outputText += `${desc}\n\n`;
                outputText += `Generational Mode: ${mode}\n\n`;
                outputText += `Evolution Framing: ${evolution}\n\n`;
            }
        });

        // 5. Alignment Summary
        outputText += `5. 🧭 Family Vision Alignment Summary\n`;
        let alignKey = 'moderately_aligned';
        if (alignmentInfo.key === 'clarity_high') alignKey = 'aligned';
        if (alignmentInfo.key === 'clarity_low') alignKey = 'misaligned';
        const summaryText = renderTemplate(templates, ['family_vision_alignment_summary', alignKey]);
        if (summaryText === "CONTRACT_VIOLATION") throw new Error("CONTRACT_VIOLATION: Missing Alignment Summary");
        outputText += `${summaryText}\n\n`;

        // 6. Guiding Principle
        outputText += `6. 🌱 Guiding Vision Principle for the Family\n`;
        const principleText = renderTemplate(templates, ['family_guiding_vision_principle']);
        if (principleText === "CONTRACT_VIOLATION") throw new Error("CONTRACT_VIOLATION: Missing Guiding Principle");
        outputText += `“${principleText}”\n\n`;

        res.json({ success: true, report: outputText });

    } catch (error) {
        console.error("Vision Generation Error:", error);
        // If it's a contract violation, strict output
        if (error.message.includes("CONTRACT_VIOLATION")) {
            res.json({ success: true, report: error.message }); // Return as report content or strict error? 
            // "If any required template key is missing or invalid: Output exactly: CONTRACT_VIOLATION -> Stop execution"
            // I will return it as the report text to be visible.
        } else {
            res.status(500).json({ success: false, error: "Vision Generation Failed: " + error.message });
        }
    }
});

module.exports = router;
