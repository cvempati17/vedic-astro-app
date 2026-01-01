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

        // Narrative Generation (Strict Template Adherence)
        const narrativeTemplate = VISION_NARRATIVES[alignment];

        // Format Output EXACTLY as requested
        let outputText = `1. 🌟 FAMILY VISION STATEMENT (Unified Statement)\n`;
        outputText += `${narrativeTemplate.statement}\n\n`;
        // Append second paragraph based on domain definition "Vision Definition"
        if (alignment === 'High') {
            outputText += "The family operates as a cohesive unit where individual aspirations naturally reinforce the collective direction. There is a strong sense of 'dharmic continuity,' meaning that the values established by the parents are largely accepted and evolved by the next generation without significant friction. The vision here is not just about survival or material gain, but about preserving a lineage of character and purpose.\n\n";
        } else if (alignment === 'Moderate') {
            outputText += "While the desire for unity is present, the family often navigates between established traditions and emerging individual needs. This tension suggests that the vision is still 'in formation,' requiring active dialogue to prevent fragmentation. The path forward involves consciously bridging the gap between the stabilization provided by the parents and the evolutionary pressure introduced by the child.\n\n";
        } else {
            outputText += "The family dynamic suggests a dispersion of energy, where each member may be pulling in a different direction driven by immediate necessities or unresolved systemic stress. The 'vision' is currently fragmented, acting less as a guiding star and more as a series of reactive adjustments. Establishing a shared baseline of emotional safety and simplified goals is the first step toward a unified future.\n\n";
        }

        roleOutputs.forEach(r => {
            const roleKey = r.role === 'Father' ? 'Father' : r.role === 'Mother' ? 'Mother' : 'Child'; // Map to YAML keys
            // Role Narratives (Simulated from member_overrides in vision_narrative_templates.yaml)
            let roleNarrative = "";
            let distortion = "";
            let healthy = "";

            if (r.role === 'Father') {
                roleNarrative = "As the primary anchor of authority and structure, the Father serves to contextualize the family's journey within a broader moral or societal framework. He is responsible for defining boundaries not as limitations, but as the safe container within which the family's vision can mature.";
                distortion = "Distortion Pattern: If disconnected, this role may manifest as rigidity or emotional distance, attempting to enforce vision through control rather than inspiration.";
                healthy = "Healthy Expression: Leading by example, where his actions consistently reflect the values he wishes to instill, creating a natural gravitational pull toward the shared vision.";
            } else if (r.role === 'Mother') {
                roleNarrative = "The Mother acts as the emotional loom, weaving individual threads of experience into a coherent fabric of belonging. Her role ensures that the family's vision is not just an abstract idea, but a felt reality that nurtures the emotional well-being of every member.";
                distortion = "Distortion Pattern: Over-functioning to compensate for lack of alignment elsewhere, potentially leading to burnout or the absorption of systemic stress.";
                healthy = "Healthy Expression: Providing the 'emotional fuel' that sustains the vision, ensuring that the pursuit of goals never comes at the cost of connection.";
            } else { // Son/Daughter
                roleNarrative = "The Child represents the evolutionary edge of the family vision—the point where tradition meets the future. Their role is not simply to replicate the past, but to metabolize the family's values and adapt them to a new era.";
                distortion = "evolution framing: If the burden of unfulfilled parental dreams is too heavy, the child may either rebel against the vision or carry it as a crushing weight.";
                healthy = "Instead, they act as the carrier of the 'living flame,' taking the essence of the family's wisdom and applying it in ways the previous generation could not have imagined.";
            }

            outputText += `2. ${r.emoji} ${r.role} – Vision Role: “${r.vision_role}”\n`; // Numbering auto-increment logic needed if strict map
            // Note: User asked for 2. Father, 3. Mother, 4. Son. I will hardcode the index loop or just append.
            // Since loop order is not guaranteed helpful, I will rebuild specific blocks below.
        });

        // Re-construct section blocks for explicit ordering correctness
        const getRoleBlock = (targetRole) => {
            const r = roleOutputs.find(item => item.role === targetRole);
            if (!r) return "";

            let text = "";
            if (r.role === 'Father') {
                text += `2. ${r.emoji} Father – Vision Role: “${r.vision_role}”\n`;
                text += "As the primary anchor of authority and structure, the Father serves to contextualize the family's journey within a broader moral or societal framework. He is responsible for defining boundaries not as limitations, but as the safe container within which the family's vision can mature.\n\n";
                text += "Distortion Pattern: If disconnected, this role may manifest as rigidity or emotional distance, attempting to enforce vision through control rather than inspiration.\n\n";
                text += "Healthy Expression: Leading by example, where his actions consistently reflect the values he wishes to instill, creating a natural gravitational pull toward the shared vision.\n\n";
            } else if (r.role === 'Mother') {
                text += `3. ${r.emoji} Mother – Vision Role: “${r.vision_role}”\n`;
                text += "The Mother acts as the emotional loom, weaving individual threads of experience into a coherent fabric of belonging. Her role ensures that the family's vision is not just an abstract idea, but a felt reality that nurtures the emotional well-being of every member.\n\n";
                text += "Distortion Pattern: Over-functioning to compensate for lack of alignment elsewhere, potentially leading to burnout or the absorption of systemic stress.\n\n";
                text += "Healthy Expression: Providing the 'emotional fuel' that sustains the vision, ensuring that the pursuit of goals never comes at the cost of connection.\n\n";
            } else if (r.role === 'Son') {
                text += `4. ${r.emoji} Son – Vision Role: “${r.vision_role}”\n`;
                text += "The Son represents the evolutionary edge of the family vision—the point where tradition meets the future. His role is not simply to replicate the past, but to metabolize the family's values and adapt them to a new era.\n\n";
                text += "Generational Role: He carries the 'living flame' of the lineage, entrusted with the task of preserving the core essence while shedding outdated forms.\n\n";
                text += "Evolution Framing: Success is defined not by how well he mimics the father, but by how courageously he integrates the family's wisdom into his own unique path.\n\n";
            } else if (r.role === 'Daughter') {
                text += `4. ${r.emoji} Daughter – Vision Role: “${r.vision_role}”\n`;
                text += "The Daughter embodies the creative expansion of the family vision, bridging the inner world of home with the outer world of possibility. Her influence often brings a necessary adaptability to the family's long-term direction.\n\n";
                text += "Generational Role: She acts as a vital connector, ensuring that the family's legacy remains relevant and life-affirming in changing times.\n\n";
                text += "Evolution Framing: Her journey involves harmonizing the need for belonging with the drive for individual expression, enriching the collective vision with new perspectives.\n\n";
            }
            return text;
        };

        // Clear outputText to strictly follow sections
        outputText = `1. 🌟 FAMILY VISION STATEMENT (Unified Statement)\n`;
        outputText += `${narrativeTemplate.statement}\n\n`;
        if (alignment === 'High') {
            outputText += "The family operates as a cohesive unit where individual aspirations naturally reinforce the collective direction. There is a strong sense of 'dharmic continuity,' meaning that the values established by the parents are largely accepted and evolved by the next generation without significant friction. The vision here is not just about survival or material gain, but about preserving a lineage of character and purpose.\n\n";
        } else if (alignment === 'Moderate') {
            outputText += "While the desire for unity is present, the family often navigates between established traditions and emerging individual needs. This tension suggests that the vision is still 'in formation,' requiring active dialogue to prevent fragmentation. The path forward involves consciously bridging the gap between the stabilization provided by the parents and the evolutionary pressure introduced by the child.\n\n";
        } else {
            outputText += "The family dynamic suggests a dispersion of energy, where each member may be pulling in a different direction driven by immediate necessities or unresolved systemic stress. The 'vision' is currently fragmented, acting less as a guiding star and more as a series of reactive adjustments. Establishing a shared baseline of emotional safety and simplified goals is the first step toward a unified future.\n\n";
        }

        const fatherBlock = getRoleBlock('Father');
        if (fatherBlock) outputText += fatherBlock;

        const motherBlock = getRoleBlock('Mother');
        if (motherBlock) outputText += motherBlock;

        let childBlock = getRoleBlock('Son');
        if (!childBlock) childBlock = getRoleBlock('Daughter'); // simplified single child logic
        if (childBlock) outputText += childBlock;

        outputText += `5. 🧭 Family Vision Alignment Summary\n`;
        outputText += `The family currently exhibits a ${alignment} level of alignment. This indicates that while the core components for a unified vision are present, their integration relies heavily on ${alignment === 'High' ? 'maintaining the current momentum' : alignment === 'Moderate' ? 'conscious recalibration of values' : 'immediate stabilization of emotional foundations'}. The friction between continuity (parents) and evolution (child) is ${alignment === 'High' ? 'constructive and propelling' : 'a source of necessary tension that requires attention'}.\n\n`;

        outputText += `6. 🌱 Guiding Vision Principle for the Family\n`;
        outputText += `“${narrativeTemplate.principle}”\n\n`; // From template

        outputText += `7. ✅ Vision Module Validation Status\n`;
        outputText += `Vision Narrative Rendering Module executed successfully. Narrative Rendering Mode Active.`;

        res.json({ success: true, report: outputText });

    } catch (error) {
        console.error("Vision Generation Error:", error);
        res.status(500).json({ success: false, error: "Vision Generation Failed" });
    }
});

module.exports = router;
