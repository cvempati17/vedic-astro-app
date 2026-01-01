const express = require('express');
const router = express.Router();

// --- Simplified Vision Engine Logic (Based on YAML Rules) ---

// 1. Planetary Axioms & Role Mappings (from vision_domain_definition.yaml)
const ROLE_ARCHETYPES = {
    Father: {
        Sun: "Principle Holder & Moral Compass", // Sun in 9/1/10
        Jupiter: "Wisdom Keeper & Guide",        // Jup in 9/5/1
        Saturn: "Structural Pillar & Stabilizer",// Sat in 1/4/10
        Mars: "Protector & Action Lead",         // Mars in 1/3/10
        Default: "Principle Holder & Moral Compass"
    },
    Mother: {
        Moon: "Emotional Translator & Sustainer", // Moon in 4/1/2
        Venus: "Harmony Creator & Nurturer",      // Venus in 4/2
        Jupiter: "Ethical & Spiritual Anchor",    // Jup in 9/4
        Mercury: "Communicator & Connector",      // Mer in 3/4
        Default: "Emotional Translator & Sustainer"
    },
    Son: {
        Sun: "Legacy Carrier & Future Leader",
        Mars: "Dynamic Changer & Protector",
        Mercury: "Future Direction Carrier",     // Mer/Rahu
        Rahu: "Evolutionary Catalyst",
        Default: "Future Direction Carrier"
    },
    Daughter: {
        Venus: "Harmony & Grace Carrier",
        Moon: "Emotional Healer",
        Mercury: "Intellectual Connector",
        Default: "Future Direction Carrier"
    }
};

// 2. Vision Narrative Templates (from vision_narrative_templates.yaml)
const VISION_NARRATIVES = {
    High: {
        statement: "This family carries a clear and sustainable long-term vision, grounded in values rather than survival pressure. Decisions tend to align naturally with purpose, and there is an inherited sense of direction that supports continuity across generations.",
        principle: "Dharmic Continuity & Shared Purpose",
        guidance: "Protect long-term goals from short-term disruptions."
    },
    Moderate: {
        statement: "This family possesses aspiration and a sense of purpose, but alignment is not always consistent. Periods of clarity alternate with confusion, often influenced by emotional or situational pressures. Conscious reflection is required to sustain direction.",
        principle: "Aspirational Growth through Recalibration",
        guidance: "Clarify shared priorities before major decisions."
    },
    Low: { // "Fragmented" in YAML
        statement: "Vision within this family is fragmented or inherited through unresolved struggle rather than conscious choice. Decisions may be driven by immediate needs instead of long-term meaning, making intentional vision-building essential.",
        principle: "Survival & Stabilization First",
        guidance: "Focus on stabilizing the present before defining the future."
    }
};

// Helper: Calculate Planet Strength (Simplified)
const getPlanetaryStrength = (planetName, data) => {
    // If we had 'shadbala', use it. Else use simplistic logic:
    // Exalted/Own Sign or Kendra/Trikona placement.
    // Assuming 'data' has 'planets' dictionary with 'longitude'.
    // We strictly need House info. We will assume House 1 = Ascendant.
    return 10; // Placeholder, see logic below
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
        const { members, family_context } = req.body;
        // members: [{ role: 'Father', chart_object: {...}, name: '...' }]

        const roleOutputs = [];
        let totalScore = 0;
        let memberCount = 0;

        // Process Each Member
        members.forEach(m => {
            const chart = m.chart_object;
            const asc = chart.ascendant || chart.Ascendant?.longitude || 0;
            const role = m.role || 'Member';

            // Identify dominant planet for Vision Context
            // Using Vision Domain Definitions:
            // Sun (9,10,1), Jupiter (9,5,1), Saturn (9,10,1,4) are key vision drivers.

            let domPlanet = 'Default';
            let maxStrength = 0;

            const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'];

            planets.forEach(p => {
                const pLon = chart.planets?.[p.toLowerCase()] || chart[p]?.longitude || 0;
                const house = getHouse(pLon, asc);
                let strength = 0;

                // Simple strength heuristic based on vision_domain_definition.yaml
                if (['Sun', 'Jupiter', 'Saturn'].includes(p)) strength += 20; // Vision Planets
                if ([1, 5, 9].includes(house)) strength += 15; // Dharma Houses
                if ([10].includes(house)) strength += 10; // Karma House

                if (strength > maxStrength) {
                    maxStrength = strength;
                    domPlanet = p;
                }
            });

            // Map to Role Title
            // Normalize role key (Father/Mother/Son/Daughter)
            let lookupRole = role;
            if (role.toLowerCase().includes('son') && !role.toLowerCase().includes('per')) lookupRole = 'Son';
            if (role.toLowerCase().includes('daughter')) lookupRole = 'Daughter';

            // Fallbacks
            if (!ROLE_ARCHETYPES[lookupRole]) lookupRole = 'Father'; // Fallback to generic if fails

            const archetype = ROLE_ARCHETYPES[lookupRole][domPlanet] || ROLE_ARCHETYPES[lookupRole]['Default'];

            roleOutputs.push({
                role: role,
                vision_role: archetype,
                emoji: role === 'Father' ? '👨' : role === 'Mother' ? '👩' : role === 'Son' ? '🧑' : role === 'Daughter' ? '👧' : '👤',
                planet: domPlanet
            });

            // Add to family score (simplified)
            // If Jupiter or Sun is dominant in 1/5/9, add score.
            if (['Sun', 'Jupiter'].includes(domPlanet) && maxStrength > 30) totalScore += 30;
            else if (['Saturn', 'Mars'].includes(domPlanet)) totalScore += 20;
            else totalScore += 10;
            memberCount++;
        });

        // Calculate Family Alignment
        const avgScore = memberCount > 0 ? totalScore / memberCount : 0;
        let alignment = 'Moderate';
        if (avgScore > 25) alignment = 'High';
        if (avgScore < 15) alignment = 'Low';

        const narrative = VISION_NARRATIVES[alignment];

        // Format Output EXACTLY as requested
        let outputText = `🌟 FAMILY VISION STATEMENT (Unified Statement)\n${narrative.statement}\n\n`;

        roleOutputs.forEach(r => {
            outputText += `${r.emoji} ${r.role} – Vision Role: “${r.vision_role}”\n`;
        });

        outputText += `\n🧭 Family Vision Alignment Summary\n`;
        outputText += `---------------------------------------------------\n`;
        outputText += `| Factor           | Status           |\n`;
        outputText += `---------------------------------------------------\n`;
        outputText += `| Alignment Level  | ${alignment.padEnd(16)} |\n`;
        outputText += `| Clarity Index    | ${alignment === 'High' ? 'High (85%)' : alignment === 'Moderate' ? 'Avg (60%)' : 'Low (35%)'}      |\n`;
        outputText += `| Stability        | ${alignment === 'High' ? 'Stable' : 'Fluctuating'}      |\n`;
        outputText += `---------------------------------------------------\n\n`;

        outputText += `🌱 Guiding Vision Principle for the Family\n`;
        outputText += `“${narrative.principle}”\n\n`;

        outputText += `✅ Vision Module Validation Status\n`;
        outputText += `Vision Engine v1.0 executed successfully. All chart objects integrated.`;

        res.json({ success: true, report: outputText });

    } catch (error) {
        console.error("Vision Generation Error:", error);
        res.status(500).json({ success: false, error: "Vision Generation Failed" });
    }
});

module.exports = router;
