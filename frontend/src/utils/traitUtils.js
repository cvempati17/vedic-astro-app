import { calculateDignity, getPlanetNature } from './strengthUtils';
import { TRAIT_RULES } from './traitRules';
import { calculateAspects, getAspectsOnSign } from './aspectUtils';

// --- Helpers ---
const getHouseNum = (planetLong, ascLong) => {
    const planetRasi = Math.floor(planetLong / 30);
    const ascRasi = Math.floor(ascLong / 30);
    return ((planetRasi - ascRasi + 12) % 12) + 1;
};

const SIGN_LORDS = [
    'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
    'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
];

const ELEMENTS = ['Fire', 'Earth', 'Air', 'Water'];
const DUAL_SIGNS = [2, 5, 8, 11];

const isKendra = (house) => [1, 4, 7, 10].includes(house);
const isTrikona = (house) => [1, 5, 9].includes(house);
const isDusthana = (house) => [6, 8, 12].includes(house);

const getPlanetHouse = (planetName, data, ascLong) => {
    const info = data[planetName];
    if (!info || info.longitude === undefined) return null;
    return getHouseNum(info.longitude, ascLong);
};

const getHouseLordInfo = (houseNum, data, ascLong) => {
    const ascRasi = Math.floor(ascLong / 30);
    const houseRasi = (ascRasi + houseNum - 1) % 12;
    const lordName = SIGN_LORDS[houseRasi];
    const lordInfo = data[lordName];
    if (!lordInfo || lordInfo.longitude === undefined) return null;

    const dignity = calculateDignity(lordName, lordInfo.longitude, ascLong);
    const lordHouse = getHouseNum(lordInfo.longitude, ascLong);

    return {
        lordName,
        dignity,
        house: lordHouse
    };
};

const bucketStrength = (dignityScore) => {
    if (dignityScore >= 90) return 'VERY_STRONG';
    if (dignityScore >= 70) return 'STRONG';
    if (dignityScore >= 50) return 'AVERAGE';
    if (dignityScore >= 30) return 'WEAK';
    return 'VERY_WEAK';
};

const isDebilitatedStatus = (status) => status === 'Debilitated (Neecha)';

const hasHeavyAffliction = (dignity, house) => {
    if (isDebilitatedStatus(dignity.status)) return true;
    if (isDusthana(house) && dignity.score <= 30) return true;
    if (dignity.score <= 20) return true;
    return false;
};

// --- Trait Definitions ---
const TRAIT_DEFS = {
    // Foundational
    honesty: {
        name: 'Trustworthiness & Honesty',
        description: 'Jupiter, Sun, 2nd House. Truthfulness and integrity.',
        factors: [
            { type: 'planet', name: 'Jupiter', weight: 0.4 },
            { type: 'planet', name: 'Sun', weight: 0.3 },
            { type: 'house', num: 2, weight: 0.3 }
        ]
    },
    respect: {
        name: 'Respectful Behavior',
        description: 'Jupiter, Venus, 7th House. Treating others with dignity.',
        factors: [
            { type: 'planet', name: 'Jupiter', weight: 0.4 },
            { type: 'planet', name: 'Venus', weight: 0.3 },
            { type: 'house', num: 7, weight: 0.3 }
        ]
    },
    loyalty: {
        name: 'Loyalty & Commitment',
        description: 'Saturn, 7th House, Earth Signs. Dedication to the relationship.',
        factors: [
            { type: 'planet', name: 'Saturn', weight: 0.3 },
            { type: 'house', num: 7, weight: 0.3 },
            { type: 'earth_influence', weight: 0.4 }
        ]
    },
    emotional_stability: {
        name: 'Emotional Maturity',
        description: 'Moon, 4th House. Managing emotions and conflict.',
        factors: [
            { type: 'planet', name: 'Moon', weight: 0.6 },
            { type: 'house', num: 4, weight: 0.4 }
        ]
    },
    kindness: {
        name: 'Kindness & Compassion',
        description: 'Moon, Jupiter, Venus. Empathy and caring nature.',
        factors: [
            { type: 'planet', name: 'Moon', weight: 0.4 },
            { type: 'planet', name: 'Jupiter', weight: 0.3 },
            { type: 'planet', name: 'Venus', weight: 0.3 }
        ]
    },

    // Relationship Skills
    communication: {
        name: 'Effective Communication',
        description: 'Mercury, 3rd House. Expressing feelings and listening.',
        factors: [
            { type: 'planet', name: 'Mercury', weight: 0.6 },
            { type: 'house', num: 3, weight: 0.4 }
        ]
    },
    supportiveness: {
        name: 'Supportiveness',
        description: 'Jupiter, 7th House. Encouraging partner\'s goals.',
        factors: [
            { type: 'planet', name: 'Jupiter', weight: 0.5 },
            { type: 'house', num: 7, weight: 0.5 }
        ]
    },
    problem_solving: {
        name: 'Problem-Solving',
        description: 'Mercury, Mars, 6th House. Tackling issues together.',
        factors: [
            { type: 'planet', name: 'Mercury', weight: 0.4 },
            { type: 'planet', name: 'Mars', weight: 0.3 },
            { type: 'house', num: 6, weight: 0.3 }
        ]
    },
    affection: {
        name: 'Affection & Intimacy',
        description: 'Venus, 7th House, 12th House. Physical and emotional closeness.',
        factors: [
            { type: 'planet', name: 'Venus', weight: 0.5 },
            { type: 'house', num: 7, weight: 0.25 },
            { type: 'house', num: 12, weight: 0.25 }
        ]
    },
    independence: {
        name: 'Independence / Self-Motivation',
        description: 'Sun, Mars, 1st House. Self-reliance and initiative.',
        factors: [
            { type: 'planet', name: 'Sun', weight: 0.4 },
            { type: 'planet', name: 'Mars', weight: 0.3 },
            { type: 'house', num: 1, weight: 0.3 }
        ]
    },

    // Life Skills
    responsibility: {
        name: 'Responsibility & Reliability',
        description: 'Saturn, 10th House. Dependability and goal-orientation.',
        factors: [
            { type: 'planet', name: 'Saturn', weight: 0.5 },
            { type: 'house', num: 10, weight: 0.5 }
        ]
    },
    shared_values: {
        name: 'Shared Values',
        description: 'Jupiter, 9th House. Moral compass and life goals.',
        factors: [
            { type: 'planet', name: 'Jupiter', weight: 0.5 },
            { type: 'house', num: 9, weight: 0.5 }
        ]
    },
    humor: {
        name: 'Sense of Humor',
        description: 'Mercury, Venus, 2nd House. Lightheartedness and joy.',
        factors: [
            { type: 'planet', name: 'Mercury', weight: 0.4 },
            { type: 'planet', name: 'Venus', weight: 0.3 },
            { type: 'house', num: 2, weight: 0.3 }
        ]
    },

    // Professional
    leadership: {
        name: 'Leadership',
        description: 'Sun, Mars, 10th House.',
        factors: [{ type: 'planet', name: 'Sun', weight: 0.5 }, { type: 'house', num: 10, weight: 0.5 }]
    },
    adaptability: {
        name: 'Adaptability & Flexibility',
        description: 'Mercury, Dual Signs. Willingness to learn and change.',
        factors: [{ type: 'planet', name: 'Mercury', weight: 0.5 }, { type: 'dual_sign_influence', weight: 0.5 }]
    },
    work_ethic: {
        name: 'Strong Work Ethic',
        description: 'Saturn, 6th House. Diligence and commitment.',
        factors: [{ type: 'planet', name: 'Saturn', weight: 0.5 }, { type: 'house', num: 6, weight: 0.5 }]
    },
    positive_attitude: {
        name: 'Positive Attitude',
        description: 'Sun, Jupiter, 1st House. Optimism and enthusiasm.',
        factors: [
            { type: 'planet', name: 'Jupiter', weight: 0.5 },
            { type: 'planet', name: 'Sun', weight: 0.3 },
            { type: 'house', num: 1, weight: 0.2 }
        ]
    },
    teamwork: {
        name: 'Teamwork & Collaboration',
        description: 'Venus, 11th House. Working well with others.',
        factors: [
            { type: 'planet', name: 'Venus', weight: 0.5 },
            { type: 'house', num: 11, weight: 0.5 }
        ]
    },
    learning_ability: {
        name: 'Willingness to Learn',
        description: 'Mercury, 5th House. Quick grasping power.',
        factors: [
            { type: 'planet', name: 'Mercury', weight: 0.5 },
            { type: 'house', num: 5, weight: 0.5 }
        ]
    },
    technical_skills: {
        name: 'Technical/Digital Literacy',
        description: 'Mercury, Rahu, 3rd House. Proficiency with tools and tech.',
        factors: [
            { type: 'planet', name: 'Mercury', weight: 0.4 },
            { type: 'planet', name: 'Rahu', weight: 0.3 },
            { type: 'house', num: 3, weight: 0.3 }
        ]
    },
    project_management: {
        name: 'Project Management',
        description: 'Mars, Saturn, 10th House. Planning and execution.',
        factors: [
            { type: 'planet', name: 'Mars', weight: 0.4 },
            { type: 'planet', name: 'Saturn', weight: 0.3 },
            { type: 'house', num: 10, weight: 0.3 }
        ]
    },
    data_analysis: {
        name: 'Data Analysis',
        description: 'Mercury, Ketu, 5th House. Extracting insights from information.',
        factors: [
            { type: 'planet', name: 'Mercury', weight: 0.4 },
            { type: 'planet', name: 'Ketu', weight: 0.3 },
            { type: 'house', num: 5, weight: 0.3 }
        ]
    },
    risk_taking: {
        name: 'Risk Taking Ability',
        description: 'Mars, Rahu, 3rd House. Boldness and initiative.',
        factors: [
            { type: 'planet', name: 'Mars', weight: 0.3 },
            { type: 'planet', name: 'Rahu', weight: 0.3 },
            { type: 'house', num: 3, weight: 0.4 }
        ]
    },

    // Employer Traits
    fairness: {
        name: 'Fairness & Justice',
        description: 'Saturn, Jupiter, 9th House. Impartiality and ethical treatment.',
        factors: [
            { type: 'planet', name: 'Saturn', weight: 0.4 },
            { type: 'planet', name: 'Jupiter', weight: 0.3 },
            { type: 'house', num: 9, weight: 0.3 }
        ]
    },
    generosity: {
        name: 'Generosity (Compensation)',
        description: 'Jupiter, 11th House, 2nd House. Willingness to reward fairly.',
        factors: [
            { type: 'planet', name: 'Jupiter', weight: 0.5 },
            { type: 'house', num: 11, weight: 0.3 },
            { type: 'house', num: 2, weight: 0.2 }
        ]
    },
    vision: {
        name: 'Vision & Direction',
        description: 'Sun, Jupiter, 10th House. Clear goals and purpose.',
        factors: [
            { type: 'planet', name: 'Sun', weight: 0.4 },
            { type: 'planet', name: 'Jupiter', weight: 0.3 },
            { type: 'house', num: 10, weight: 0.3 }
        ]
    },
    mentorship: {
        name: 'Mentorship & Growth',
        description: 'Jupiter, 9th House. Investing in employee development.',
        factors: [
            { type: 'planet', name: 'Jupiter', weight: 0.6 },
            { type: 'house', num: 9, weight: 0.4 }
        ]
    },
    empathy_wellbeing: {
        name: 'Focus on Well-being',
        description: 'Moon, 4th House. Caring for staff health and balance.',
        factors: [
            { type: 'planet', name: 'Moon', weight: 0.5 },
            { type: 'house', num: 4, weight: 0.5 }
        ]
    },

    // Business Partner Traits
    business_acumen: {
        name: 'Business Acumen',
        description: 'Mercury, 7th House, 11th House. Commercial skills and networking.',
        factors: [
            { type: 'planet', name: 'Mercury', weight: 0.4 },
            { type: 'house', num: 7, weight: 0.3 },
            { type: 'house', num: 11, weight: 0.3 }
        ]
    },
    financial_responsibility: {
        name: 'Financial Responsibility',
        description: 'Jupiter, Saturn, 2nd House. Fiscal prudence and management.',
        factors: [
            { type: 'planet', name: 'Saturn', weight: 0.4 },
            { type: 'planet', name: 'Jupiter', weight: 0.3 },
            { type: 'house', num: 2, weight: 0.3 }
        ]
    },

    // New Traits
    patient: {
        name: 'Patience & Tolerance',
        description: 'Saturn, 12th House. Ability to endure delays and problems calmly.',
        factors: [
            { type: 'planet', name: 'Saturn', weight: 0.6 },
            { type: 'house', num: 12, weight: 0.4 }
        ]
    },
    perfectionist: {
        name: 'Perfectionism & Detail',
        description: 'Mercury, Saturn, 6th House. High standards and thoroughness.',
        factors: [
            { type: 'planet', name: 'Mercury', weight: 0.4 },
            { type: 'planet', name: 'Saturn', weight: 0.4 },
            { type: 'house', num: 6, weight: 0.2 }
        ]
    },
    improvisor: {
        name: 'Improvisation & Adaptability',
        description: 'Mercury, Mars, 3rd House. Quick thinking and adjustment.',
        factors: [
            { type: 'planet', name: 'Mercury', weight: 0.4 },
            { type: 'planet', name: 'Mars', weight: 0.3 },
            { type: 'house', num: 3, weight: 0.3 }
        ]
    },
    curious: {
        name: 'Curiosity & Inquisitiveness',
        description: 'Mercury, Jupiter, 3rd House. Desire to learn and know.',
        factors: [
            { type: 'planet', name: 'Mercury', weight: 0.4 },
            { type: 'planet', name: 'Jupiter', weight: 0.3 },
            { type: 'house', num: 3, weight: 0.3 }
        ]
    },
    observant: {
        name: 'Observation & Awareness',
        description: 'Mercury, Moon. Quick to notice details.',
        factors: [
            { type: 'planet', name: 'Mercury', weight: 0.5 },
            { type: 'planet', name: 'Moon', weight: 0.5 }
        ]
    },
    neutral: {
        name: 'Neutrality & Objectivity',
        description: 'Saturn, Jupiter, 7th House. Impartiality and fairness.',
        factors: [
            { type: 'planet', name: 'Saturn', weight: 0.4 },
            { type: 'planet', name: 'Jupiter', weight: 0.3 },
            { type: 'house', num: 7, weight: 0.3 }
        ]
    },
    // Wealth & Health
    wealth_potential: {
        name: 'Wealth Potential',
        description: 'Jupiter, 2nd House, 11th House, 9th House. Overall financial prosperity.',
        factors: [
            { type: 'planet', name: 'Jupiter', weight: 0.4 },
            { type: 'house', num: 2, weight: 0.2 },
            { type: 'house', num: 11, weight: 0.2 },
            { type: 'house', num: 9, weight: 0.2 }
        ]
    },
    health_vitality: {
        name: 'Health & Vitality',
        description: 'Sun, Mars, 1st House, 6th House. Physical strength and immunity.',
        factors: [
            { type: 'planet', name: 'Sun', weight: 0.3 },
            { type: 'planet', name: 'Mars', weight: 0.3 },
            { type: 'house', num: 1, weight: 0.2 },
            { type: 'house', num: 6, weight: 0.2 }
        ]
    }
};

// --- Profile Definitions ---
const PROFILES = {
    husband_potential: {
        title: "Husband Potential (Wife's Perspective)",
        sections: [
            {
                title: "Foundational Character",
                traits: ['honesty', 'respect', 'loyalty', 'emotional_stability', 'kindness']
            },
            {
                title: "Relationship Skills",
                traits: ['communication', 'supportiveness', 'problem_solving', 'affection']
            },
            {
                title: "Life Skills & Outlook",
                traits: ['responsibility', 'shared_values', 'humor']
            }
        ]
    },
    wife_potential: {
        title: "Wife Potential (Husband's Perspective)",
        sections: [
            {
                title: "Foundational Character",
                traits: ['honesty', 'emotional_stability', 'kindness', 'respect']
            },
            {
                title: "Partnership & Support",
                traits: ['supportiveness', 'communication', 'problem_solving', 'independence']
            },
            {
                title: "Lifestyle & Connection",
                traits: ['affection', 'shared_values', 'humor', 'adaptability']
            }
        ]
    },
    professional_profile: {
        title: "Professional Profile (Employer's Perspective)",
        sections: [
            {
                title: "Core Personality & Work Ethic",
                traits: ['honesty', 'responsibility', 'work_ethic', 'positive_attitude', 'independence', 'risk_taking']
            },
            {
                title: "Soft Skills & Interpersonal",
                traits: ['communication', 'teamwork', 'adaptability', 'problem_solving', 'learning_ability', 'emotional_stability']
            },
            {
                title: "Essential Hard Skills",
                traits: ['technical_skills', 'project_management', 'data_analysis']
            }
        ]
    },
    employer_potential: {
        title: "Employer Potential (Employee's Perspective)",
        sections: [
            {
                title: "Fair & Respectful Treatment",
                traits: ['fairness', 'generosity', 'honesty', 'respect', 'neutral', 'patient']
            },
            {
                title: "Communication & Leadership",
                traits: ['communication', 'leadership', 'vision', 'supportiveness', 'observant']
            },
            {
                title: "Growth & Development",
                traits: ['mentorship', 'independence', 'curious']
            },
            {
                title: "Work Style & Standards",
                traits: ['perfectionist', 'improvisor']
            },
            {
                title: "Work-Life Balance & Well-being",
                traits: ['empathy_wellbeing', 'emotional_stability']
            }
        ]
    },
    partnership_potential: {
        title: "Business Partner Potential",
        sections: [
            {
                title: "Core Traits & Character",
                traits: ['honesty', 'work_ethic', 'responsibility', 'emotional_stability', 'neutral', 'patient']
            },
            {
                title: "Skills & Expertise",
                traits: ['business_acumen', 'financial_responsibility', 'problem_solving', 'technical_skills', 'perfectionist', 'observant']
            },
            {
                title: "Alignment & Vision",
                traits: ['vision', 'risk_taking', 'communication', 'shared_values', 'improvisor', 'curious']
            }
        ]
    }
};

// --- Evaluation Logic ---
const evaluateTrait = (traitId, data, ascLong, allAspects, t) => {
    const trait = TRAIT_DEFS[traitId];
    if (!trait) return null;

    let totalScore = 0;
    let reasons = [];
    let indicators = [];

    trait.factors.forEach(factor => {
        let score = 5; // Neutral base

        if (factor.type === 'planet') {
            const planetName = factor.name;
            const info = data[planetName];
            if (!info) return;

            const dignity = calculateDignity(planetName, info.longitude, ascLong);
            let planetScore = dignity.score / 10;

            const house = getHouseNum(info.longitude, ascLong);
            if ([1, 4, 7, 10, 5, 9].includes(house)) {
                planetScore += 1;
                indicators.push(t ? t('traitUtils.planetGoodHouse', { planet: planetName, house }) : `${planetName} in good house (${house}th)`);
            }
            if ([6, 8, 12].includes(house)) {
                planetScore -= 1.5;
                indicators.push(t ? t('traitUtils.planetBadHouse', { planet: planetName, house }) : `${planetName} in difficult house (${house}th)`);
            }

            // Aspects
            const rasiIndex = Math.floor(info.longitude / 30);
            const aspects = getAspectsOnSign(rasiIndex, allAspects).filter(a => a.planet !== planetName);
            aspects.forEach(a => {
                const nature = getPlanetNature(a.planet, ascLong);
                if (nature.isBenefic) { planetScore += 0.5; }
                else { planetScore -= 0.5; }
            });

            score = Math.max(1, Math.min(10, planetScore));
            reasons.push(t ? t('traitUtils.planetScore', { planet: planetName, score: score.toFixed(1), status: dignity.status }) : `${planetName}: ${score.toFixed(1)}/10 (${dignity.status})`);

        } else if (factor.type === 'house') {
            const houseNum = factor.num;
            const ascRasi = Math.floor(ascLong / 30);
            const houseRasi = (ascRasi + houseNum - 1) % 12;
            const lordName = SIGN_LORDS[houseRasi];
            const lordInfo = data[lordName];

            if (lordInfo) {
                const dignity = calculateDignity(lordName, lordInfo.longitude, ascLong);
                let houseScore = dignity.score / 10;

                const lordHouse = getHouseNum(lordInfo.longitude, ascLong);
                if ([6, 8, 12].includes(lordHouse)) {
                    houseScore -= 1.5;
                    indicators.push(t ? t('traitUtils.houseLordDusthana', { house: houseNum }) : `${houseNum}th Lord in Dusthana`);
                }
                else if ([1, 4, 7, 10, 5, 9].includes(lordHouse)) { houseScore += 1; }

                const planetsInHouse = Object.entries(data).filter(([p, info]) => {
                    return p !== 'Ascendant' && info.longitude !== undefined && getHouseNum(info.longitude, ascLong) === houseNum;
                });

                if (planetsInHouse.length > 0) {
                    planetsInHouse.forEach(([p]) => {
                        const nature = getPlanetNature(p, ascLong);
                        if (nature.isBenefic) {
                            houseScore += 1;
                            indicators.push(t ? t('traitUtils.beneficInHouse', { planet: p, house: houseNum }) : `Benefic ${p} in ${houseNum}th`);
                        }
                        else {
                            houseScore -= 1;
                            indicators.push(t ? t('traitUtils.maleficInHouse', { planet: p, house: houseNum }) : `Malefic ${p} in ${houseNum}th`);
                        }
                    });
                }

                score = Math.max(1, Math.min(10, houseScore));
                reasons.push(t ? t('traitUtils.houseScore', { house: houseNum, score: score.toFixed(1) }) : `${houseNum}th House: ${score.toFixed(1)}/10`);
            }
        } else if (factor.type === 'earth_influence') {
            let earthCount = 0;
            Object.entries(data).forEach(([p, info]) => {
                if (p !== 'Ascendant' && info.longitude !== undefined) {
                    const rasi = Math.floor(info.longitude / 30);
                    if (ELEMENTS[rasi % 4] === 'Earth') earthCount++;
                }
            });
            score = Math.min(10, 4 + earthCount);
            reasons.push(t ? t('traitUtils.earthSigns', { count: earthCount }) : `${earthCount} planets in Earth signs.`);
        } else if (factor.type === 'dual_sign_influence') {
            let dualCount = 0;
            Object.entries(data).forEach(([p, info]) => {
                if (p !== 'Ascendant' && info.longitude !== undefined) {
                    const rasi = Math.floor(info.longitude / 30);
                    if (DUAL_SIGNS.includes(rasi)) dualCount++;
                }
            });
            score = Math.min(10, 5 + dualCount);
            reasons.push(t ? t('traitUtils.dualSigns', { count: dualCount }) : `${dualCount} planets in Dual signs.`);
        }

        totalScore += score * factor.weight;
    });

    totalScore = Math.max(1, Math.min(10, totalScore));

    return {
        id: traitId,
        name: t ? t(`traits.${traitId}.name`, trait.name) : trait.name,
        description: t ? t(`traits.${traitId}.description`, trait.description) : trait.description,
        score: totalScore.toFixed(1),
        reasons,
        indicators: [...new Set(indicators)]
    };
};

export const calculateProfiles = (data, t) => {
    if (!data || !data.Ascendant) return null;

    const ascLong = data.Ascendant.longitude;
    const allAspects = calculateAspects(data);

    const results = {};

    Object.entries(PROFILES).forEach(([profileKey, profileDef]) => {
        results[profileKey] = {
            title: t ? t(`profiles.${profileKey}.title`, profileDef.title) : profileDef.title,
            sections: profileDef.sections.map(section => ({
                title: t ? t(`profiles.sections.${section.title.replace(/\s+/g, '_').replace(/[&]/g, '').replace(/_+/g, '_').toLowerCase()}`, section.title) : section.title,
                traits: section.traits.map(traitId => evaluateTrait(traitId, data, ascLong, allAspects, t)).filter(t => t)
            }))
        };
    });

    return results;
};

export const calculateAdvancedTraits = (data, t) => {
    if (!data || !data.Ascendant) return null;

    const ascLong = data.Ascendant.longitude;
    const allAspects = calculateAspects(data);

    const evalTrait = (id) => evaluateTrait(id, data, ascLong, allAspects, t);

    const makeTraitList = (ids) => ids
        .map(id => evalTrait(id))
        .filter(t => t);

    const categories = [
        {
            id: 'personal_character',
            title: t ? t('advancedTraits.personalCharacter', 'Personal Character & Ethics') : 'Personal Character & Ethics',
            traits: makeTraitList([
                'honesty',
                'respect',
                'loyalty',
                'responsibility',
                'fairness',
                'generosity',
                'neutral',
                'patient',
                'shared_values'
            ])
        },
        {
            id: 'emotional_relationship',
            title: t ? t('advancedTraits.emotionalRelationship', 'Emotional & Relationship Traits') : 'Emotional & Relationship Traits',
            traits: makeTraitList([
                'emotional_stability',
                'kindness',
                'communication',
                'supportiveness',
                'affection',
                'humor',
                'empathy_wellbeing'
            ])
        },
        {
            id: 'mental_growth',
            title: t ? t('advancedTraits.mentalGrowth', 'Mental Growth & Adaptability') : 'Mental Growth & Adaptability',
            traits: makeTraitList([
                'independence',
                'adaptability',
                'curious',
                'learning_ability',
                'observant',
                'problem_solving',
                'improvisor'
            ])
        },
        {
            id: 'work_collaboration',
            title: t ? t('advancedTraits.workCollaboration', 'Work & Collaboration Traits') : 'Work & Collaboration Traits',
            traits: makeTraitList([
                'work_ethic',
                'positive_attitude',
                'teamwork',
                'leadership',
                'vision',
                'project_management',
                'risk_taking'
            ])
        },
        {
            id: 'skills_professional',
            title: t ? t('advancedTraits.skillsProfessional', 'Skills & Professional Traits') : 'Skills & Professional Traits',
            traits: makeTraitList([
                'technical_skills',
                'data_analysis',
                'business_acumen',
                'financial_responsibility',
                'perfectionist',
                'wealth_potential',
                'health_vitality'
            ])
        }
    ];

    return { categories };
};



// Helper to determine Planet Strength Level (0=Best, 1=Good, 2=Weak, 3=Worst)
const getPlanetStrengthLevel = (planetName, data, ascLong, keyHouses = []) => {
    const info = data[planetName];
    if (!info) return 1; // Default to average if missing

    const dignity = calculateDignity(planetName, info.longitude, ascLong);
    const house = getHouseNum(info.longitude, ascLong);
    const strength = bucketStrength(dignity.score);

    // Check for heavy affliction
    if (hasHeavyAffliction(dignity, house)) return 3;

    // Check for very strong
    const isKeyHouse = keyHouses.includes(house);
    const isKendraTrikona = [1, 4, 7, 10, 5, 9].includes(house);
    if ((dignity.status === 'Exalted (Ucha)' || dignity.status === 'Own Sign (Swakshetra)') && (isKeyHouse || isKendraTrikona)) {
        return 0;
    }

    // Check for strong
    if (strength === 'STRONG' || strength === 'VERY_STRONG') return 1;

    // Check for weak
    if (strength === 'WEAK' || strength === 'VERY_WEAK' || [6, 8, 12].includes(house)) return 2;

    return 1; // Default average
};

// Helper to determine House Strength Level (0=Best, 1=Good, 2=Weak, 3=Worst)
const getHouseStrengthLevel = (houseNum, data, ascLong) => {
    const lordInfo = getHouseLordInfo(houseNum, data, ascLong);
    if (!lordInfo) return 1;

    const { dignity, house: lordHouse } = lordInfo;
    const strength = bucketStrength(dignity.score);

    // Check for heavy affliction
    if (hasHeavyAffliction(dignity, lordHouse)) return 3;

    // Check for very strong
    if ((dignity.status === 'Exalted (Ucha)' || dignity.status === 'Own Sign (Swakshetra)') && [1, 4, 7, 10, 5, 9].includes(lordHouse)) {
        return 0;
    }

    // Check for strong
    if (strength === 'STRONG' || strength === 'VERY_STRONG') return 1;

    // Check for weak
    if (strength === 'WEAK' || strength === 'VERY_WEAK' || [6, 8, 12].includes(lordHouse)) return 2;

    return 1; // Default average
};

export const calculateAdvancedTraitsCsv = (data, t) => {
    if (!data || !data.Ascendant) return null;

    const ascLong = data.Ascendant.longitude;
    const categories = {};

    Object.entries(TRAIT_RULES).forEach(([traitName, ruleDef]) => {
        const { category, keyHouses, factors } = ruleDef;

        // Map category to translation key
        let categoryKey = 'personalCharacter';
        if (category.includes('Emotional')) categoryKey = 'emotionalRelationship';
        else if (category.includes('Mental')) categoryKey = 'mentalGrowth';
        else if (category.includes('Work')) categoryKey = 'workCollaboration';
        else if (category.includes('Skills')) categoryKey = 'skillsProfessional';

        const translatedCategory = t ? t(`advancedTraits.${categoryKey}`) : category;
        const categoryId = category.replace(/\s+/g, '_').toLowerCase();

        if (!categories[category]) {
            categories[category] = {
                id: categoryId,
                title: translatedCategory,
                traits: []
            };
        }

        let totalPoints = 0;
        const breakdown = [];

        Object.values(factors).forEach(factor => {
            let ruleIndex = 0;
            let matchedRule = null;

            if (factor.type === 'base') {
                ruleIndex = 0;
            } else if (factor.type === 'planet') {
                ruleIndex = getPlanetStrengthLevel(factor.name, data, ascLong, keyHouses);
            } else if (factor.type === 'house') {
                // Parse house number from name "3rd house & lord" -> 3
                const houseNum = parseInt(factor.name);
                ruleIndex = getHouseStrengthLevel(houseNum, data, ascLong);
            } else if (factor.type === 'lagna') {
                // Simplified Lagna check
                const lagnaLordInfo = getHouseLordInfo(1, data, ascLong);
                if (lagnaLordInfo && bucketStrength(lagnaLordInfo.dignity.score) === 'VERY_STRONG') ruleIndex = 0;
                else ruleIndex = 1;
            }

            // Safety check for index
            if (ruleIndex >= factor.rules.length) ruleIndex = factor.rules.length - 1;

            matchedRule = factor.rules[ruleIndex];

            if (matchedRule) {
                totalPoints += matchedRule.points;
                breakdown.push({
                    factor: matchedRule.originalFactor,
                    status: matchedRule.status,
                    points: matchedRule.points,
                    allStatuses: factor.rules.map(r => r.status)
                });
            }
        });

        // Clamp score 1-10
        const finalScore = Math.max(1, Math.min(10, totalPoints));

        // Translate trait name if possible
        // We need to add keys for all traits, for now fallback to English
        // const traitKey = traitName.replace(/[&\s]+/g, '_').toLowerCase();
        // const translatedTraitName = t ? t(`advancedTraits.traits.${traitKey}`, traitName) : traitName;

        categories[category].traits.push({
            id: traitName.replace(/\s+/g, '_').toLowerCase(),
            name: traitName, // Keep English for now as we don't have all keys
            description: `Score: ${finalScore}/10`, // Simplified description
            score: finalScore,
            breakdown: breakdown
        });
    });

    return {
        categories: Object.values(categories)
    };
};



export const calculateHappinessIndex = (data) => {
    if (!data || !data.Ascendant) return 0;
    const ascLong = data.Ascendant.longitude;
    const allAspects = calculateAspects(data);

    // 1. Moon Strength (Emotional Peace)
    const moonTrait = evaluateTrait('emotional_stability', data, ascLong, allAspects);
    const moonScore = parseFloat(moonTrait?.score || 5);

    // 2. Jupiter Strength (Optimism)
    const jupiterTrait = evaluateTrait('positive_attitude', data, ascLong, allAspects);
    const jupiterScore = parseFloat(jupiterTrait?.score || 5);

    // 3. 4th House (Inner Happiness)
    const house4Trait = evaluateTrait('empathy_wellbeing', data, ascLong, allAspects);
    const house4Score = parseFloat(house4Trait?.score || 5);

    // Weighted Average
    const happiness = (moonScore * 0.4) + (jupiterScore * 0.3) + (house4Score * 0.3);
    return happiness.toFixed(1);
};

export const getHappinessDetails = (data) => {
    if (!data || !data.Ascendant) return "No data available";
    const ascLong = data.Ascendant.longitude;
    const allAspects = calculateAspects(data);

    const moonTrait = evaluateTrait('emotional_stability', data, ascLong, allAspects);
    const jupiterTrait = evaluateTrait('positive_attitude', data, ascLong, allAspects);
    const house4Trait = evaluateTrait('empathy_wellbeing', data, ascLong, allAspects);

    const moonScore = parseFloat(moonTrait?.score || 5);
    const jupiterScore = parseFloat(jupiterTrait?.score || 5);
    const house4Score = parseFloat(house4Trait?.score || 5);

    return `Moon (Emotion): ${moonScore}\nJupiter (Optimism): ${jupiterScore}\n4th House (Peace): ${house4Score}`;
};

export const calculateWealthIndex = (data) => {
    if (!data || !data.Ascendant) return 0;
    const ascLong = data.Ascendant.longitude;
    const allAspects = calculateAspects(data);
    const trait = evaluateTrait('wealth_potential', data, ascLong, allAspects);
    return parseFloat(trait?.score || 0).toFixed(1);
};

export const getWealthDetails = (data) => {
    if (!data || !data.Ascendant) return "No data available";
    const ascLong = data.Ascendant.longitude;
    const allAspects = calculateAspects(data);
    const trait = evaluateTrait('wealth_potential', data, ascLong, allAspects);
    return trait?.reasons?.join('\n') || "No details";
};

export const calculateHealthIndex = (data) => {
    if (!data || !data.Ascendant) return 0;
    const ascLong = data.Ascendant.longitude;
    const allAspects = calculateAspects(data);
    const trait = evaluateTrait('health_vitality', data, ascLong, allAspects);
    return parseFloat(trait?.score || 0).toFixed(1);
};

export const getHealthDetails = (data) => {
    if (!data || !data.Ascendant) return "No data available";
    const ascLong = data.Ascendant.longitude;
    const allAspects = calculateAspects(data);
    const trait = evaluateTrait('health_vitality', data, ascLong, allAspects);
    return trait?.reasons?.join('\n') || "No details";
};
