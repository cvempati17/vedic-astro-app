import { calculateProfiles } from './traitUtils';
import { computeAshtakootaScore } from './ashtakootaUtils';

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

const getSignCompatibility = (sign1, sign2, t) => {
    const el1 = getElement(sign1);
    const el2 = getElement(sign2);

    if (el1 === el2) return { score: 10, label: t('matchUtils.excellentSameElement') };

    // Compatible Pairs
    if ((el1 === 'Fire' && el2 === 'Air') || (el1 === 'Air' && el2 === 'Fire')) return { score: 8, label: t('matchUtils.goodFireAir') };
    if ((el1 === 'Earth' && el2 === 'Water') || (el1 === 'Water' && el2 === 'Earth')) return { score: 8, label: t('matchUtils.goodEarthWater') };

    // Neutral
    if ((el1 === 'Fire' && el2 === 'Earth') || (el1 === 'Earth' && el2 === 'Fire')) return { score: 5, label: t('matchUtils.average') };
    if ((el1 === 'Air' && el2 === 'Water') || (el1 === 'Water' && el2 === 'Air')) return { score: 5, label: t('matchUtils.average') };

    // Incompatible (Square/Opposite elements usually clash, but keeping simple)
    return { score: 3, label: t('matchUtils.challenging') };
};

const calculateCompatibility = (baseData, candidateData, perspective, t) => {
    if (!baseData || !candidateData) return { score: 0, details: [], components: null };

    const baseAsc = Math.floor(baseData.Ascendant.longitude / 30);
    const candAsc = Math.floor(candidateData.Ascendant.longitude / 30);

    const baseMoon = Math.floor(baseData.Moon.longitude / 30);
    const candMoon = Math.floor(candidateData.Moon.longitude / 30);

    let totalScore = 0;
    let details = [];

    const components = {};

    // 1. Moon Sign Compatibility (Emotional/Mental Sync) - High Weight
    const moonComp = getSignCompatibility(baseMoon, candMoon, t);
    totalScore += moonComp.score * 0.4;
    details.push(t('matchUtils.moonCompatibility', { label: moonComp.label, score: moonComp.score }));
    components.moon = { rawScore: moonComp.score, weight: 0.4 };

    // 2. Ascendant Compatibility (Personality/Outlook)
    const ascComp = getSignCompatibility(baseAsc, candAsc, t);
    totalScore += ascComp.score * 0.3;
    details.push(t('matchUtils.ascendantCompatibility', { label: ascComp.label, score: ascComp.score }));
    components.asc = { rawScore: ascComp.score, weight: 0.3 };

    // 3. Perspective Specific
    if (perspective.includes('business') || perspective.includes('employer')) {
        // Mercury (Communication) & Jupiter (Values)
        const baseMerc = Math.floor(baseData.Mercury.longitude / 30);
        const candMerc = Math.floor(candidateData.Mercury.longitude / 30);
        const mercComp = getSignCompatibility(baseMerc, candMerc, t);
        totalScore += mercComp.score * 0.3;
        details.push(t('matchUtils.intellectualSync', { label: mercComp.label, score: mercComp.score }));
        components.relation = { rawScore: mercComp.score, weight: 0.3, label: 'Intellectual Sync (Mercury)' };
    } else {
        // Venus (Love) & Mars (Passion) for Relationships
        const baseVenus = Math.floor(baseData.Venus.longitude / 30);
        const candVenus = Math.floor(candidateData.Venus.longitude / 30);
        const venusComp = getSignCompatibility(baseVenus, candVenus, t);
        totalScore += venusComp.score * 0.3;
        details.push(t('matchUtils.romanticSync', { label: venusComp.label, score: venusComp.score }));
        components.relation = { rawScore: venusComp.score, weight: 0.3, label: 'Romantic Sync (Venus)' };
    }

    return { score: totalScore, details, components };
};

export const analyzeCandidates = (candidates, perspective, baseProfileData, traditionalMode = false, t) => {
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
        const profiles = calculateProfiles(candidate.data, t);
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
        let compatibility = { score: 0, details: [], components: null };
        if (baseProfileData) {
            compatibility = calculateCompatibility(baseProfileData, candidate.data, perspective, t);
        }

        // 3. Final Weighted Score
        // If traditionalMode is enabled (relationship perspectives only), use
        // full Ashtakoota 36-point scoring based on Moon sign & nakshatra.
        // Otherwise, keep existing 60/40 blended score.

        const isRelationshipPerspective =
            perspective === 'girl_looking_boy' ||
            perspective === 'boy_looking_girl';

        let traditional = null;
        let finalScore;

        if (traditionalMode && baseProfileData && isRelationshipPerspective) {
            const ashta = computeAshtakootaScore(baseProfileData, candidate.data);
            traditional = {
                total: ashta.total,
                parts: ashta.kootas
            };

            finalScore = traditional.total; // use 0–36 for ranking
        } else {
            // Existing blended logic: If base profile exists: 60% Individual, 40% Compatibility
            // If no base profile: 100% Individual
            finalScore = baseProfileData
                ? (individualScore * 0.6) + (compatibility.score * 0.4)
                : individualScore;
        }

        // Business Role Suggestion
        let role = null;
        if (perspective === 'business_partner') {
            role = suggestRole(candidate.data, t);
        }

        return {
            id: candidate.id,
            name: candidate.name,
            score: finalScore.toFixed(1),
            individualScore: individualScore.toFixed(1),
            compatibilityScore: compatibility.score.toFixed(1),
            compatibilityDetails: compatibility.details,
            details: targetProfile,
            role: role,
            traditional
        };
    }).sort((a, b) => b.score - a.score);
};

const suggestRole = (data, t) => {
    const profiles = calculateProfiles(data, t);
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
    if (leadership >= 8 && vision >= 8) return t('matchUtils.ceo');
    if (finance >= 8 && leadership >= 6) return t('matchUtils.cfo');
    if (tech >= 8 && vision >= 7) return t('matchUtils.cto');
    if (comms >= 8 && teamwork >= 8) return t('matchUtils.coo');
    if (vision >= 8 && tech >= 7) return t('matchUtils.chiefArchitect');

    return t('matchUtils.teamMember');
};
