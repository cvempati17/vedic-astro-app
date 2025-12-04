import { calculateDignity } from './strengthUtils';

// Helper to get house number of a planet
const getHouseOfPlanet = (planetName, chartData) => {
    if (!chartData || !chartData[planetName]) return 0;
    return chartData[planetName].house || 0;
};

// Helper to check if a planet is in a specific house
const isPlanetInHouse = (planetName, houseNum, chartData) => {
    return getHouseOfPlanet(planetName, chartData) === houseNum;
};

// Helper to get planet strength score (approximate from dignity)
const getPlanetStrengthScore = (planetName, chartData) => {
    if (!chartData || !chartData[planetName]) return 50; // Default average
    const dignity = calculateDignity(planetName, chartData[planetName].longitude, chartData.Ascendant?.longitude || 0);
    return dignity.score || 50;
};

export const calculateVariousBalas = (chartData) => {
    try {
        // Approximation logic for Shadbala components
        // Since we don't have full astronomical data for exact Shadbala, we approximate based on available factors.

        const getSthanaBala = () => {
            // Positional Strength: High for Exalted, Own Sign, Friendly Sign, Kendra (1, 4, 7, 10)
            let score = 0;
            ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].forEach(p => {
                score += getPlanetStrengthScore(p, chartData);
            });
            return Math.round(score / 7); // Average strength
        };

        const getDigBala = () => {
            // Directional Strength:
            // Sun/Mars in 10th, Moon/Venus in 4th, Saturn in 7th, Jupiter/Mercury in 1st
            let score = 0;
            if (isPlanetInHouse('Sun', 10, chartData)) score += 20;
            if (isPlanetInHouse('Mars', 10, chartData)) score += 20;
            if (isPlanetInHouse('Moon', 4, chartData)) score += 20;
            if (isPlanetInHouse('Venus', 4, chartData)) score += 20;
            if (isPlanetInHouse('Saturn', 7, chartData)) score += 20;
            if (isPlanetInHouse('Jupiter', 1, chartData)) score += 20;
            if (isPlanetInHouse('Mercury', 1, chartData)) score += 20;
            return Math.min(100, 50 + score); // Base 50 + bonus
        };

        const getKalaBala = () => {
            // Time Strength: Day/Night birth (approximated by Sun position)
            // Sun in 7-12 houses = Day, 1-6 = Night (Roughly)
            const sunHouse = getHouseOfPlanet('Sun', chartData);
            const isDay = sunHouse >= 7 && sunHouse <= 12;

            // Day strong: Sun, Jupiter, Venus
            // Night strong: Moon, Mars, Saturn
            // Mercury always strong
            let score = 60; // Base
            if (isDay) score += 10; // Bonus for day planets if day birth
            return score;
        };

        return [
            { name: 'Sthana Bala', description: 'Positional Strength', value: getSthanaBala(), max: 100 },
            { name: 'Dig Bala', description: 'Directional Strength', value: getDigBala(), max: 100 },
            { name: 'Kala Bala', description: 'Temporal Strength', value: getKalaBala(), max: 100 },
            { name: 'Cheshta Bala', description: 'Motional Strength', value: 70, max: 100 }, // Hard to calc without speed
            { name: 'Naisargika Bala', description: 'Natural Strength', value: 60, max: 100 }, // Fixed hierarchy
            { name: 'Drik Bala', description: 'Aspectual Strength', value: 65, max: 100 }, // Complex aspects
            { name: 'Avastha Bala', description: 'State of Planet', value: 75, max: 100 },
            { name: 'Ishta vs Kashtha', description: 'Good vs Bad Results', value: 80, max: 100 },
            { name: 'Uchcha/Neecha', description: 'Exaltation Strength', value: getSthanaBala(), max: 100 },
            { name: 'Vimshopaka', description: '20-Point Strength', value: 15, max: 20 },
            { name: 'Shad Varga', description: 'Divisional Strength', value: 70, max: 100 }
        ];
    } catch (error) {
        console.error("Error in calculateVariousBalas:", error);
        return [];
    }
};

export const calculateLifeAspects = (chartData) => {
    try {
        // Helper to analyze an aspect based on key planets and houses
        const analyzeAspect = (aspectName, keyPlanets, keyHouses) => {
            let totalScore = 0;
            let count = 0;

            // Planet Strength
            keyPlanets.forEach(p => {
                totalScore += getPlanetStrengthScore(p, chartData);
                count++;
            });

            // House Lord Strength (Approximation: check if house has benefics or key planets)
            // For simplicity, we'll add a baseline and modify by planet presence
            keyHouses.forEach(h => {
                totalScore += 50; // Base score for house
                count++;
                // Bonus if Jupiter or Venus is in the house
                if (isPlanetInHouse('Jupiter', h, chartData)) totalScore += 20;
                if (isPlanetInHouse('Venus', h, chartData)) totalScore += 15;
                // Penalty if Saturn or Mars (unless they are key planets for that aspect)
                if (isPlanetInHouse('Saturn', h, chartData) && !keyPlanets.includes('Saturn')) totalScore -= 10;
                if (isPlanetInHouse('Mars', h, chartData) && !keyPlanets.includes('Mars')) totalScore -= 10;
            });

            const average = count > 0 ? totalScore / count : 50;

            let status = 'Moderate';
            if (average > 75) status = 'Excellent';
            else if (average > 60) status = 'Good';
            else if (average < 40) status = 'Challenging';

            return { score: Math.round(average), status };
        };

        return [
            {
                area: 'Career',
                ...analyzeAspect('Career', ['Sun', 'Saturn', 'Mercury', 'Mars'], [10, 1, 6]),
                description: 'Influenced by Sun (Authority), Saturn (Work), Mercury (Business).'
            },
            {
                area: 'Marriage',
                ...analyzeAspect('Marriage', ['Venus', 'Jupiter'], [7, 2, 4]),
                description: 'Influenced by Venus (Love), Jupiter (Wisdom/Husband), 7th House.'
            },
            {
                area: 'Health',
                ...analyzeAspect('Health', ['Sun', 'Mars', 'Saturn'], [1, 6, 8]),
                description: 'Influenced by Sun (Vitality), Mars (Strength), 1st House.'
            },
            {
                area: 'Finances',
                ...analyzeAspect('Finances', ['Jupiter', 'Venus', 'Mercury'], [2, 11, 9]),
                description: 'Influenced by Jupiter (Wealth), Venus (Luxury), 2nd/11th Houses.'
            },
            {
                area: 'Kids Growth',
                ...analyzeAspect('Kids', ['Jupiter'], [5, 9]),
                description: 'Influenced by Jupiter (Progeny) and 5th House.'
            },
            {
                area: 'Parents Health & Finance',
                ...analyzeAspect('Parents', ['Sun', 'Moon'], [4, 9, 10]),
                description: 'Sun (Father), Moon (Mother), 4th/9th/10th Houses.'
            },
            {
                area: 'Siblings',
                ...analyzeAspect('Siblings', ['Mars', 'Mercury'], [3, 11]),
                description: 'Influenced by Mars (Siblings) and 3rd House.'
            },
            {
                area: 'Business',
                ...analyzeAspect('Business', ['Mercury', 'Saturn', 'Sun'], [7, 10, 11]),
                description: 'Influenced by Mercury (Trade), Saturn (Structure), 7th/10th Houses.'
            },
            {
                area: 'Spiritual Growth',
                ...analyzeAspect('Spiritual', ['Jupiter', 'Ketu', 'Saturn'], [9, 12, 4, 8]),
                description: 'Influenced by Jupiter (Dharma), Ketu (Moksha), 9th/12th Houses.'
            }
        ];
    } catch (error) {
        console.error("Error in calculateLifeAspects:", error);
        return [];
    }
};

export const getPersonalSignature = (chartData) => {
    try {
        // Determine strongest planet
        let strongestPlanet = 'Sun';
        let maxScore = 0;
        ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].forEach(p => {
            const score = getPlanetStrengthScore(p, chartData);
            if (score > maxScore) {
                maxScore = score;
                strongestPlanet = p;
            }
        });

        const signatures = {
            Sun: { title: 'Solar Power', quote: '“Radiating authority and vitality.”', desc: 'You lead with confidence and purpose.' },
            Moon: { title: 'Lunar Intuition', quote: '“Guided by emotional intelligence.”', desc: 'You connect deeply and nurture others.' },
            Mars: { title: 'Martian Warrior', quote: '“Action and courage define you.”', desc: 'You face challenges head-on with strength.' },
            Mercury: { title: 'Mercurial Wit', quote: '“Intellect and adaptability.”', desc: 'You navigate life through communication and skill.' },
            Jupiter: { title: 'Jovian Wisdom', quote: '“Expansion and higher knowledge.”', desc: 'You grow through learning and teaching.' },
            Venus: { title: 'Venusian Charm', quote: '“Harmony and beauty.”', desc: 'You create peace and value relationships.' },
            Saturn: { title: 'Saturnian Discipline', quote: '“Endurance and structure.”', desc: 'You build lasting success through patience.' },
            Rahu: { title: 'Rahuvian Ambition', quote: '“Breaking boundaries.”', desc: 'You seek the unconventional path.' },
            Ketu: { title: 'Ketuvian Depth', quote: '“Spiritual detachment.”', desc: 'You seek inner truth over outer glory.' }
        };

        return signatures[strongestPlanet] || signatures['Sun'];
    } catch (error) {
        console.error("Error in getPersonalSignature:", error);
        return { title: 'Unknown', quote: '', desc: '' };
    }
};

export const getPlanetaryAnalysis = (chartData) => {
    try {
        const planets = ['Moon', 'Mars', 'Saturn', 'Jupiter', 'Venus', 'Mercury', 'Sun'];

        return planets.map((planet, index) => {
            const dignity = calculateDignity(planet, chartData[planet]?.longitude || 0, chartData.Ascendant?.longitude || 0);
            const house = getHouseOfPlanet(planet, chartData);

            return {
                id: index + 1,
                name: planet,
                icon: getPlanetIcon(planet),
                title: `${dignity.status} in House ${house}`,
                strengthReason: `Strength Score: ${Math.round(dignity.score)}%`,
                themes: [`Governs House ${house} matters`, `Nature: ${dignity.natural || 'Neutral'}`],
                gifts: dignity.score > 60 ? ['Strong positive influence', 'Brings stability'] : ['Requires effort to unlock'],
                challenges: dignity.score < 40 ? ['Needs strengthening', 'May cause delays'] : [],
                advice: `Focus on ${planet} related activities to boost this energy.`,
                color: dignity.color
            };
        });
    } catch (error) {
        console.error("Error in getPlanetaryAnalysis:", error);
        return [];
    }
};

const getPlanetIcon = (name) => {
    const icons = {
        Sun: '☀️', Moon: '🌙', Mars: '🔥', Mercury: '🟢',
        Jupiter: '🟡', Venus: '🎨', Saturn: '🪨', Rahu: '🐲', Ketu: '🐉'
    };
    return icons[name] || '🪐';
};
