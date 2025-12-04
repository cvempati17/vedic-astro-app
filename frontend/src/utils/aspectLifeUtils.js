import { calculateVimshottariDasha, calculateAntardashas, formatDate } from './dashaUtils';

const ASPECTS = {
    career: { label: 'Career', houses: [10], karaka: ['Saturn', 'Sun'] },
    marriage: { label: 'Marriage', houses: [7], karaka: ['Venus', 'Jupiter'] },
    health: { label: 'Health', houses: [1, 6], karaka: ['Sun'] },
    finances: { label: 'Finances', houses: [2, 11], karaka: ['Jupiter'] },
    kids: { label: 'Kids Growth', houses: [5], karaka: ['Jupiter'] },
    parents: { label: 'Parents Health & Finance', houses: [4, 9], karaka: ['Sun', 'Moon'] },
    siblings: { label: 'Siblings', houses: [3], karaka: ['Mars'] },
    business: { label: 'Business', houses: [7], karaka: ['Mercury'] },
    spiritual: { label: 'Spiritual Growth', houses: [9, 12], karaka: ['Ketu', 'Jupiter'] }
};

const PLANET_FRIENDS = {
    Sun: ['Moon', 'Mars', 'Jupiter'],
    Moon: ['Sun', 'Mercury'],
    Mars: ['Sun', 'Moon', 'Jupiter'],
    Mercury: ['Sun', 'Venus'],
    Jupiter: ['Sun', 'Moon', 'Mars'],
    Venus: ['Mercury', 'Saturn'],
    Saturn: ['Mercury', 'Venus'],
    Rahu: ['Mercury', 'Venus', 'Saturn'],
    Ketu: ['Mars', 'Jupiter']
};

const PLANET_ENEMIES = {
    Sun: ['Venus', 'Saturn'],
    Moon: [],
    Mars: ['Mercury'],
    Mercury: ['Moon'],
    Jupiter: ['Mercury', 'Venus'],
    Venus: ['Sun', 'Moon'],
    Saturn: ['Sun', 'Moon', 'Mars'],
    Rahu: ['Sun', 'Moon', 'Mars'],
    Ketu: ['Sun', 'Moon']
};

const getHouseLord = (houseNumber, ascendantSign) => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const lords = {
        'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
        'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
        'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
    };

    // Calculate sign in that house
    // Ascendant is House 1. 
    // If Asc is Aries (0), House 1 is Aries. House 2 is Taurus.
    // Index = (AscIndex + HouseNumber - 1) % 12
    const ascIndex = signs.indexOf(ascendantSign);
    if (ascIndex === -1) return null;

    const signIndex = (ascIndex + houseNumber - 1) % 12;
    const sign = signs[signIndex];
    return { sign, lord: lords[sign] };
};

const evaluatePlanetStrength = (planetName, chartData, aspectKey) => {
    let score = 0;
    let reasons = [];

    const planetData = chartData[planetName];
    if (!planetData) return { score, reasons };

    const aspect = ASPECTS[aspectKey];
    const ascendantSign = chartData.Ascendant?.Sign?.label || 'Aries'; // Fallback

    // 1. Is Karaka?
    if (aspect.karaka.includes(planetName)) {
        score += 1.5;
        reasons.push(`${planetName} is Karaka for ${aspect.label}`);
    }

    // 2. Is Lord of Relevant House?
    aspect.houses.forEach(h => {
        const hl = getHouseLord(h, ascendantSign);
        if (hl && hl.lord === planetName) {
            score += 2.0;
            reasons.push(`${planetName} is Lord of ${h}H (${hl.sign})`);
        }
    });

    // 3. Placed in Relevant House?
    // We need to know which house the planet is in.
    // chartData[Planet].House contains the house number (1-12)
    const planetHouse = planetData.House;
    if (aspect.houses.includes(planetHouse)) {
        score += 1.5;
        reasons.push(`${planetName} placed in ${planetHouse}H`);
    }

    // 4. Dignity (Exalted/Own Sign)
    // Assuming chartData has Dignity or we infer from Sign
    // Simple check based on common knowledge or if data has it
    // For now, let's look at the 'isRetrograde' or similar if available, but dignity is better.
    // If chartData[Planet].sign is Own Sign -> +1
    // Let's use a simplified generic strength if specific dignity data isn't easily parsed here without more utils.
    // Actually, let's rely on the fact that if it's a "Friend" of the Ascendant Lord, it's good.

    // 5. Dusthana Placement (6, 8, 12) - Generally bad, unless it's Health (6) or Spiritual (12)
    if ([6, 8, 12].includes(planetHouse)) {
        if (aspectKey === 'health' && planetHouse === 6) {
            score += 1.0; // Good for fighting disease? Or bad? Contextual. Let's say neutral/mixed.
            reasons.push(`${planetName} in 6H (Health focus)`);
        } else if (aspectKey === 'spiritual' && planetHouse === 12) {
            score += 2.0;
            reasons.push(`${planetName} in 12H (Moksha)`);
        } else {
            score -= 1.0;
            reasons.push(`${planetName} in Dusthana ${planetHouse}H`);
        }
    }

    // 6. Trikona/Kendra (1, 4, 5, 7, 9, 10) - Generally Good
    if ([1, 4, 5, 7, 9, 10].includes(planetHouse)) {
        score += 0.5;
    }

    return { score, reasons };
};

export const calculateAspectsOfLife = (chartData, birthDate) => {
    if (!chartData || !birthDate) return [];

    const moonLongitude = chartData.Moon?.longitude;
    if (!moonLongitude) return [];

    const dashaData = calculateVimshottariDasha(moonLongitude, birthDate);
    if (!dashaData) return [];

    const allPeriods = [];

    // Flatten Dasha/Antardasha
    dashaData.dashas.forEach(md => {
        const antardashas = calculateAntardashas(md.planet, md.startDate);
        antardashas.forEach(ad => {
            // Calculate Intensity for each Aspect for this period
            const periodData = {
                mahadasha: md.planet,
                bhukti: ad.planet,
                startDate: ad.startDate,
                endDate: ad.endDate,
                yearRange: `${ad.startDate.getFullYear()}-${ad.endDate.getFullYear()}`,
                aspects: {}
            };

            Object.keys(ASPECTS).forEach(key => {
                let totalScore = 5.0; // Base
                let periodReasons = [];

                // Mahadasha Influence (60% weight)
                const mdEval = evaluatePlanetStrength(md.planet, chartData, key);
                totalScore += mdEval.score;
                if (mdEval.reasons.length > 0) {
                    periodReasons.push(`MD ${md.planet}: ${mdEval.reasons.join(', ')}`);
                }

                // Antardasha Influence (40% weight)
                const adEval = evaluatePlanetStrength(ad.planet, chartData, key);
                totalScore += (adEval.score * 0.6); // Less weight
                if (adEval.reasons.length > 0) {
                    periodReasons.push(`AD ${ad.planet}: ${adEval.reasons.join(', ')}`);
                }

                // Relationship between MD and AD (Friendship)
                if (PLANET_FRIENDS[md.planet]?.includes(ad.planet)) {
                    totalScore += 1.0;
                    periodReasons.push('MD & AD are Friends');
                } else if (PLANET_ENEMIES[md.planet]?.includes(ad.planet)) {
                    totalScore -= 1.0;
                    periodReasons.push('MD & AD are Enemies');
                }

                // Clamp
                totalScore = Math.max(1, Math.min(10, totalScore));

                periodData.aspects[key] = {
                    score: parseFloat(totalScore.toFixed(1)),
                    reason: periodReasons.join('. ') || 'Neutral period.'
                };
            });

            allPeriods.push(periodData);
        });
    });

    return allPeriods;
};

export const getAspectLabel = (key) => ASPECTS[key]?.label || key;
