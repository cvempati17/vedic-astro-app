import { calculateProfiles } from './traitUtils';

// --- Compatibility Helpers ---
const SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const ELEMENTS = {
    Fire: [0, 4, 8],   // Aries, Leo, Sag
    Earth: [1, 5, 9],  // Taurus, Virgo, Cap
    Air: [2, 6, 10],   // Gemini, Libra, Aq
    Water: [3, 7, 11]  // Cancer, Scorpio, Pisces
};

const getElement = (signIndex) => {
    for (const [element, signs] of Object.entries(ELEMENTS)) {
        if (signs.includes(signIndex)) return element;
    }
    return null;
};

const getSignCompatibility = (sign1, sign2) => {
    const el1 = getElement(sign1);
    const el2 = getElement(sign2);

    if (el1 === el2) return { score: 10, label: 'Excellent (Same Element)' };

    // Compatible Pairs
    if ((el1 === 'Fire' && el2 === 'Air') || (el1 === 'Air' && el2 === 'Fire')) return { score: 8, label: 'Good (Fire-Air)' };
    if ((el1 === 'Earth' && el2 === 'Water') || (el1 === 'Water' && el2 === 'Earth')) return { score: 8, label: 'Good (Earth-Water)' };

    // Neutral
    if ((el1 === 'Fire' && el2 === 'Earth') || (el1 === 'Earth' && el2 === 'Fire')) return { score: 5, label: 'Average' };
    if ((el1 === 'Air' && el2 === 'Water') || (el1 === 'Water' && el2 === 'Air')) return { score: 5, label: 'Average' };

    // Incompatible (Square/Opposite elements usually clash, but keeping simple)
    return { score: 3, label: 'Challenging' };
};

const calculateCompatibility = (baseData, candidateData, perspective) => {
    if (!baseData || !candidateData) return { score: 0, details: [] };

    const baseAsc = Math.floor(baseData.Ascendant.longitude / 30);
    const candAsc = Math.floor(candidateData.Ascendant.longitude / 30);

    const baseMoon = Math.floor(baseData.Moon.longitude / 30);
    const candMoon = Math.floor(candidateData.Moon.longitude / 30);

    let totalScore = 0;
    let details = [];

    // 1. Moon Sign Compatibility (Emotional/Mental Sync) - High Weight
    const moonComp = getSignCompatibility(baseMoon, candMoon);
    totalScore += moonComp.score * 0.4;
    details.push(`Moon Compatibility: ${moonComp.label} (${moonComp.score}/10)`);

    // 2. Ascendant Compatibility (Personality/Outlook)
    const ascComp = getSignCompatibility(baseAsc, candAsc);
    totalScore += ascComp.score * 0.3;
    details.push(`Ascendant Compatibility: ${ascComp.label} (${ascComp.score}/10)`);

    // 3. Perspective Specific
    if (perspective.includes('business') || perspective.includes('employer')) {
        // Mercury (Communication) & Jupiter (Values)
        const baseMerc = Math.floor(baseData.Mercury.longitude / 30);
        const candMerc = Math.floor(candidateData.Mercury.longitude / 30);
        const mercComp = getSignCompatibility(baseMerc, candMerc);
        totalScore += mercComp.score * 0.3;
        details.push(`Intellectual Sync (Mercury): ${mercComp.label} (${mercComp.score}/10)`);
    } else {
        // Venus (Love) & Mars (Passion) for Relationships
        const baseVenus = Math.floor(baseData.Venus.longitude / 30);
        const candVenus = Math.floor(candidateData.Venus.longitude / 30);
        const venusComp = getSignCompatibility(baseVenus, candVenus);
        totalScore += venusComp.score * 0.3;
        details.push(`Romantic Sync (Venus): ${venusComp.label} (${venusComp.score}/10)`);
    }

    return { score: totalScore, details };
};

export const analyzeCandidates = (candidates, perspective, baseProfileData) => {
    // Map perspective to profile key in traitUtils
    const profileMap = {
        'girl_looking_boy': 'husband_potential',
        'boy_looking_girl': 'wife_potential',
        'employer_looking_employee': 'professional_profile',
        'employee_looking_employer': 'employer_potential',
        'business_partner': 'partnership_potential'
    };

    const profileKey = profileMap[perspective];
    if (!profileKey) return [];

    return candidates.map(candidate => {
        // 1. Individual Merit Score
        const profiles = calculateProfiles(candidate.data);
        const targetProfile = profiles[profileKey];

        let traitTotal = 0;
        let traitCount = 0;

        targetProfile.sections.forEach(section => {
            section.traits.forEach(trait => {
                traitTotal += parseFloat(trait.score);
                traitCount++;
            });
        });

        const individualScore = traitCount > 0 ? (traitTotal / traitCount) : 0;

        // 2. Compatibility Score (Synastry)
        let compatibility = { score: 0, details: [] };
        if (baseProfileData) {
            compatibility = calculateCompatibility(baseProfileData, candidate.data, perspective);
        }

        // 3. Final Weighted Score
        // If base profile exists: 60% Individual, 40% Compatibility
        // If no base profile: 100% Individual
        const finalScore = baseProfileData
            ? (individualScore * 0.6) + (compatibility.score * 0.4)
            : individualScore;

        // Business Role Suggestion
        let role = null;
        if (perspective === 'business_partner') {
            role = suggestRole(candidate.data);
        }

        return {
            id: candidate.id,
            name: candidate.name,
            score: finalScore.toFixed(1),
            individualScore: individualScore.toFixed(1),
            compatibilityScore: compatibility.score.toFixed(1),
            compatibilityDetails: compatibility.details,
            details: targetProfile,
            role: role
        };
    }).sort((a, b) => b.score - a.score);
};

const suggestRole = (data) => {
    const profiles = calculateProfiles(data);
    const prof = profiles.professional_profile; // Use professional traits for role
    const partner = profiles.partnership_potential;

    // Extract scores (helper)
    const getScore = (profile, traitId) => {
        for (const section of profile.sections) {
            const trait = section.traits.find(t => t.id === traitId);
            if (trait) return parseFloat(trait.score);
        }
        return 0;
    };

    const leadership = getScore(prof, 'leadership');
    const finance = getScore(partner, 'financial_responsibility');
    const tech = getScore(prof, 'technical_skills');
    const vision = getScore(partner, 'vision');
    const comms = getScore(prof, 'communication');
    const teamwork = getScore(prof, 'teamwork');

    // Logic
    if (leadership >= 8 && vision >= 8) return 'CEO (Chief Executive Officer)';
    if (finance >= 8 && leadership >= 6) return 'CFO (Chief Financial Officer)';
    if (tech >= 8 && vision >= 7) return 'CTO (Chief Technology Officer)';
    if (comms >= 8 && teamwork >= 8) return 'COO / Operations Manager';
    if (vision >= 8 && tech >= 7) return 'Chief Architect / Strategist';

    return 'Team Member / Specialist';
};
