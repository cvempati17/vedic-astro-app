import { calculateVimshottariDasha, calculateAntardashas, formatDate } from './dashaUtils';

export const ASPECTS = {
    career: { label: 'Career', houses: [10], karaka: ['Saturn', 'Sun'] },
    marriage: { label: 'Relationship', houses: [7], karaka: ['Venus', 'Jupiter'] },
    health: { label: 'Health', houses: [1, 6], karaka: ['Sun'] },
    finances: { label: 'Finance', houses: [2, 11], karaka: ['Jupiter'] },
    kids: { label: 'Kids', houses: [5], karaka: ['Jupiter'] },
    parents: { label: 'Family', houses: [2, 4], karaka: ['Sun', 'Moon'] }, // Updated specific labels/logic if needed to match request "Family" usually house 2/4
    siblings: { label: 'Siblings', houses: [3], karaka: ['Mars'] },
    education: { label: 'Education', houses: [4, 5, 9], karaka: ['Mercury', 'Jupiter'] },
    business: { label: 'Business', houses: [7], karaka: ['Mercury'] },
    spiritual: { label: 'Spiritual Growth', houses: [9, 12], karaka: ['Ketu', 'Jupiter'] }
};

export const PLANET_FRIENDS = {
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

export const PLANET_ENEMIES = {
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

export const getHouseLord = (houseNumber, ascendantSign) => {
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

export const evaluatePlanetStrength = (planetName, chartData, aspectKey) => {
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

    const dob = new Date(birthDate);
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

            // Calculate person's age at the start of this sub-period
            const ageAtStart = (ad.startDate - dob) / (1000 * 60 * 60 * 24 * 365.25);

            Object.keys(ASPECTS).forEach(key => {
                // Age Filtering Logic
                if (key === 'health' || key === 'siblings') {
                    if (ageAtStart < 1) return; // Skip if < 1
                } else if (key === 'education') {
                    if (ageAtStart < 5) return; // Skip if < 5
                } else {
                    // All other aspects (Career, Marriage, etc.)
                    if (ageAtStart < 20) return; // Skip if < 20
                }

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

            // Only add period if it has at least one aspect (e.g. if age < 1 and no health/siblings, skip row?)
            // Or keep row but empty aspects?
            // "remaining take them off" implies valid rows only or valid cells.
            // If we filter keys, the UI row will just show blanks for those columns if we render purely on keys.
            // But if we want to not show the ROW at all if nothing is relevant:
            if (Object.keys(periodData.aspects).length > 0) {
                allPeriods.push(periodData);
            }
        });
    });

    return allPeriods;
};

export const getAspectLabel = (key) => ASPECTS[key]?.label || key;
