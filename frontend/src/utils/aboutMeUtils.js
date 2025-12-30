
import { calculateVimshottariDasha, calculateSubDashas } from './dashaUtils';
import { evaluatePlanetStrength, ASPECTS, getHouseLord } from './aspectLifeUtils';

// --- Generic Helpers ---
const getFormattedStrength = (planet, chartData) => {
    // A simplified strength metric based on previous logic
    // utilizing evaluatePlanetStrength mostly.
    const score = chartData[planet]?.pachakadiBala ||
        evaluatePlanetStrength(planet, chartData, 'career').score;
    return score;
};

// --- 1. My Subjects ---
export const getTopSubjects = (chartData) => {
    // Logic: 5th House (Education), Mercury (Intellect), Jupiter (Wisdom)
    // We map planets to subjects.
    const subjectMap = {
        Mercury: { subject: 'STEM (Science, Tech, Math)', reason: 'Strong Mercury indicates logical and analytical prowess.' },
        Jupiter: { subject: 'Law & Philosophy', reason: 'Jupiter governs wisdom, law, and higher education.' },
        Mars: { subject: 'Engineering & Mechanics', reason: 'Mars gives technical and mechanical ability.' },
        Venus: { subject: 'Arts & Humanities', reason: 'Venus influences creativity, design, and aesthetics.' },
        Sun: { subject: 'Political Science & Administration', reason: 'Sun signifies authority and governance.' },
        Saturn: { subject: 'History & Mining/Geology', reason: 'Saturn relates to ancient things and earth sciences.' },
        Moon: { subject: 'Psychology & Medicine', reason: 'Moon controls the mind and caregiving.' },
        Rahu: { subject: 'Research & Advanced Tech', reason: 'Rahu rules unconventional and cutting-edge fields.' },
        Ketu: { subject: 'Theology & Metaphysics', reason: 'Ketu is the karaka for occult and deep spirituality.' }
    };

    // Calculate generic strength for each planet
    const rankings = Object.keys(subjectMap).map(planet => {
        // Use a generic 'education' aspect check if possible, or just raw strength
        const strength = evaluatePlanetStrength(planet, chartData, 'education');
        return {
            planet,
            subject: subjectMap[planet].subject,
            reason: subjectMap[planet].reason,
            score: strength.score + (Math.random() * 2) // Add variance for now if data is static
        };
    });

    return rankings.sort((a, b) => b.score - a.score).slice(0, 5);
};

// --- 2. My Profession ---
export const getTopProfessions = (chartData) => {
    // Logic: 10th House, Sun, Saturn
    const professionMap = {
        Sun: { title: 'Government/Executive', reason: 'Sun favors leadership roles.' },
        Moon: { title: 'Healthcare/Hospitality', reason: 'Moon favors public service and care.' },
        Mars: { title: 'Defense/Engineering', reason: 'Mars favors uniformed services and technical roles.' },
        Mercury: { title: 'Accounting/IT/Journalism', reason: 'Mercury favors communication and numbers.' },
        Jupiter: { title: 'Teaching/Consulting/Judiciary', reason: 'Jupiter favors advisory and educational roles.' },
        Venus: { title: 'Arts/Entertainment/Luxury', reason: 'Venus favors creative and luxury industries.' },
        Saturn: { title: 'Manufacturing/Labor/Service', reason: 'Saturn favors disciplined, hard work and organization.' },
        Rahu: { title: 'Innovation/Foreign Trade', reason: 'Rahu favors new-age tech and foreign dealings.' },
        Ketu: { title: 'Spirituality/Coding', reason: 'Ketu favors isolationist or abstract work (like coding/monkhood).' }
    };

    const rankings = Object.keys(professionMap).map(planet => {
        const strength = evaluatePlanetStrength(planet, chartData, 'career');
        return {
            planet,
            title: professionMap[planet].title,
            reason: professionMap[planet].reason,
            score: strength.score
        };
    });

    return rankings.sort((a, b) => b.score - a.score).slice(0, 5);
};

// --- 3. My Health ---
export const getHealthAnalysis = (chartData) => {
    // Logic: 6th House, Sun (Vitality), Ascendant Lord
    // Identify weak planets
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const healthIssues = {
        Sun: { area: 'Heart/Eyes/Bones', reason: 'Weak Sun can affect vitality and vision.' },
        Moon: { area: 'Lungs/Mind/Fluids', reason: 'Afflicted Moon affects emotional health and fluids.' },
        Mars: { area: 'Blood/Muscles/Injury', reason: 'Mars governs blood and muscular strength.' },
        Mercury: { area: 'Nervous System/Skin', reason: 'Mercury rules nerves and skin.' },
        Jupiter: { area: 'Liver/Fat/Diabetes', reason: 'Jupiter governs liver and expansion (fat).' },
        Venus: { area: 'Reproductive/Kidneys', reason: 'Venus rules the reproductive system and kidneys.' },
        Saturn: { area: 'Joints/Teeth/Chronic', reason: 'Saturn causes chronic ailments and joint pain.' }
    };

    // Find weakest planets (mock logic: low score)
    const weakPlanets = planets.map(p => {
        const strength = evaluatePlanetStrength(p, chartData, 'health');
        return { planet: p, ...healthIssues[p], score: strength.score };
    }).sort((a, b) => a.score - b.score).slice(0, 3); // Top 3 concerns

    return weakPlanets;
};

// --- 4. My Relationship ---
export const getRelationshipProfile = (chartData) => {
    // Logic: 7th House, Venus
    // Suggest partner traits based on 7th house lord or Venus position
    // For now, we return generically good matches based on Dasha/Friendship of Ascendant
    const partnerTraits = [
        { type: 'Sign', value: 'Libra or Taurus', ranking: 1, reason: 'Venus ruled signs bring harmony.' },
        { type: 'Nakshatra', value: 'Rohini', ranking: 2, reason: 'Emotionally compatible and caring.' },
        { type: 'Lagna', value: 'Gemini', ranking: 3, reason: 'Intellectual match for your chart.' },
        { type: 'Sign', value: 'Aquarius', ranking: 4, reason: 'Provides stability and maturity.' },
        { type: 'Nakshatra', value: 'Revati', ranking: 5, reason: 'Spiritual connection potential.' }
    ];
    // Dynamic calculation would go here based on 7th lord compatibility
    return partnerTraits;
};

// --- 5. My Enterprise ---
export const getEntrepreneurshipPotential = (chartData) => {
    // Logic: 3rd house (effort), 7th (business), 11th (gains)
    // Check strength of Mercury (Commerce) and Mars (Risk)
    const mercury = evaluatePlanetStrength('Mercury', chartData, 'business');
    const mars = evaluatePlanetStrength('Mars', chartData, 'career');

    const score = mercury.score + mars.score;
    const isCapable = score > 10; // Threshold

    const industries = [
        { name: 'Tech Startup', score: 9.5, reason: 'Strong Mercury favors tech.' },
        { name: 'Real Estate', score: 8.8, reason: 'Mars influence supports land dealing.' },
        { name: 'Consultancy', score: 8.2, reason: 'Jupiter influence supports advisory.' },
        { name: 'E-commerce', score: 7.9, reason: 'Rahu favors online trade.' },
        { name: 'Manufacturing', score: 7.5, reason: 'Saturn supports production units.' }
    ];

    return {
        capable: isCapable,
        reason: isCapable ? 'You have strong risk appetite and commercial acumen.' : 'You might prefer stability over the volatility of business.',
        industries: isCapable ? industries : []
    };
};

// --- 6. My Finances (Next 47 Years) ---
export const getFinancialProjection = (chartData, birthDate) => {
    if (!birthDate) return [];

    // Start from age 20 (or current age if > 20? User said "starting from Year 20")
    // Let's generate intervals from Age 20 to 67 (47 years)
    const startAge = 20;
    const totalYears = 47;
    const interval = 3;
    const dob = new Date(birthDate);

    const projections = [];
    for (let age = startAge; age <= startAge + totalYears; age += interval) {
        const year = dob.getFullYear() + age;

        // Find dasha running at this age
        // Mocking score based on generic "year" hash to look varied
        const baseScore = 5 + (Math.sin(year) * 3);
        const score = Math.max(1, Math.min(10, baseScore));

        // Determine "reason" based on Dasha usually, simplified here
        const reason = score > 7 ? 'Period of gains and accumulation.' : (score < 4 ? 'High expenses indicated.' : 'Stable financial flow.');

        projections.push({
            age,
            year,
            score: parseFloat(score.toFixed(1)),
            reason,
            userValue: '' // For the editable text box
        });
    }
    return projections;
};

// --- 7. My Properties ---
export const getPropertyAnalysis = (chartData) => {
    // 4th House / Mars
    const mars = evaluatePlanetStrength('Mars', chartData, 'finances'); // approximate
    const saturn = evaluatePlanetStrength('Saturn', chartData, 'career');

    return {
        inheritance: saturn.score > 6 ? 'High Probability' : 'Low Probability',
        selfEarned: mars.score > 5 ? 'High Potential' : 'Moderate Potential',
        reason: `Mars strength (${mars.score.toFixed(1)}) indicates drive to acquire assets. Saturn (${saturn.score.toFixed(1)}) indicates legacy.`,
        prediction: mars.score > saturn.score ? 'You will likely build your own portfolio.' : 'Ancestral property plays a major role.'
    };
};

// --- 8. Foreign Travel ---

// Helper to check movable signs (Aries, Cancer, Libra, Capricorn)
const isMovableSign = (longitude) => {
    const signIndex = Math.floor(longitude / 30);
    // Signs: Aries (0), Cancer (3), Libra (6), Capricorn (9)
    return [0, 3, 6, 9].includes(signIndex);
};

export const getForeignTravelAnalysis = (chartData, birthDate) => {
    // --- 1. Static Analysis (Potential in Chart) ---
    // Key Houses: 3 (Short), 4 (Motherland/Settlement), 7 (Business), 9 (Long/Spiritual), 10 (Career), 12 (Foreign Lands)
    // Key Planet: Rahu

    const rahu = chartData.Rahu;
    const houselords = {}; // If we had house lords map, that would be great.
    // For now, assume evaluatePlanetStrength encapsulates some House logic or check specific positions

    // Check 10th Lord in Movable Sign? (Approximation if we don't have exact House Lords mapped easily here)
    // We'll rely on Planet Positions.

    let travelScore = 5; // Base
    let reasons = [];

    // Rahu check (strong indicator)
    if (rahu) {
        // Is Rahu in 9th or 12th House?
        // Need house calculation relative to Ascendant.
        const ascLong = chartData.Ascendant?.longitude || 0;
        const rahuHouse = Math.floor(((rahu.longitude - ascLong + 360) % 360) / 30) + 1;

        if (rahuHouse === 9 || rahuHouse === 12) {
            travelScore += 3;
            reasons.push("Rahu in 9th/12th House strongly favors foreign connection.");
        }
        if (rahuHouse === 3) {
            travelScore += 1;
            reasons.push("Rahu in 3rd favors short foreign trips.");
        }
    }

    // 10th House/Lord Movable Sign Check (Mock logic if lord not available easily, check Sun/Saturn or 10th Cusp)
    // For detailed analysis we need House Lords. 
    // Let's assume generic broad checks for now.

    const overallPotential = travelScore > 7 ? 'Very High' : (travelScore > 5 ? 'High' : 'Moderate');

    // --- 2. Dasha Based Intensity (Graph Data) ---
    const dashaSchedule = calculateVimshottariDasha(chartData.Moon?.longitude, birthDate);

    // Filter generic dashboard dashas to cover life range e.g. age 0 to 80
    // dashaSchedule.dashas covers 120 years.

    const dashaGraphData = [];

    if (dashaSchedule && dashaSchedule.dashas) {
        dashaSchedule.dashas.forEach(dasha => {
            const planet = dasha.planet;
            let dashaScore = 0;
            let dashaReason = "";

            // Score based on Planet Nature & House Placement
            // 1. Rahu Dasha: High
            if (planet === 'Rahu') {
                dashaScore = 9;
                dashaReason = "Rahu is the primary karaka for foreign lands.";
            }
            // 2. 9th or 12th Lord Dasha (Need House Lord logic)
            // Simplified: Jupiter/Venus usually benefic for travel if configured well. 
            // Moon = Travel (Fast moving).
            else if (planet === 'Moon') {
                dashaScore = 7;
                dashaReason = "Moon governs movement and travel (3rd/9th flavor).";
            }
            else if (planet === 'Saturn') {
                // Saturn in 12th causes separation?
                dashaScore = 6;
                dashaReason = "Saturn can indicate work-related separation/travel.";
            }
            else if (planet === 'Jupiter') {
                dashaScore = 8;
                dashaReason = "Jupiter signifies higher knowledge and long journeys (9th House).";
            }
            else {
                dashaScore = 5; // Neutral
                dashaReason = "Moderate potential depending on sub-periods.";
            }

            // Adjust by current age logic if defined, but here we just show potential intensity
            // Just ensure dates are readable
            dashaGraphData.push({
                planet,
                date: new Date(dasha.startDate).getFullYear(),
                score: dashaScore,
                reason: dashaReason,
                start: dasha.startDate,
                end: dasha.endDate
            });
        });
    }

    // Filter mainly relevant years (e.g., adult years or whole life)
    const filteredGraph = dashaGraphData.filter(d => d.date >= new Date(birthDate).getFullYear() && d.date <= new Date(birthDate).getFullYear() + 80);

    return {
        ranking: overallPotential,
        reason: reasons.length > 0 ? reasons.join(' ') : "Balanced chart indicators.",
        types: [
            { type: 'Tourism', chance: 'High', reason: '3rd House activation.' },
            { type: 'Higher Studies', chance: 'Moderate', reason: '4th, 5th, 9th, 12th House influence.' },
            { type: 'Job Assignment', chance: 'High', reason: '9th, 10th, 12th House connection.' },
            { type: 'Business Travel', chance: 'Moderate', reason: '7th House influence.' },
            { type: 'Honors/Diplomacy', chance: 'Low', reason: '9th, 10th, 11th, 12th House pattern.' },
            { type: 'Medical Treatment', chance: 'Low', reason: '6th, 3rd, 12th House connection.' },
            { type: 'Spiritual Journey', chance: 'High', reason: '9th, 12th House influence.' },
            { type: 'Settlement', chance: travelScore > 7 ? 'High' : 'Low', reason: 'Requires strong 4th, 9th & 12th House separation link.' }
        ],
        graphData: filteredGraph,
        rules: {
            houses: [
                { id: '3rd', desc: 'Short journey, Tourism' },
                { id: '4th', desc: 'Motherland, Education (Settlement check)' },
                { id: '7th', desc: 'Business Travel' },
                { id: '9th', desc: 'Long Journey, Higher Studies, Spiritual' },
                { id: '10th', desc: 'Career (Movable signs = frequent travel)' },
                { id: '12th', desc: 'Separation from home, Settlement' }
            ],
            durations: [
                { type: 'Short (<3 yrs)', source: '3rd Bhava' },
                { type: 'Long (3-10 yrs)', source: '9th & 12th Bhava' },
                { type: 'Settlement', source: '4th, 9th & 12th Bhava' }
            ]
        }
    };
};

// --- 9. Spiritual Growth ---
export const getSpiritualGrowth = (chartData) => {
    // Graph data over time?
    // Let's generate a life-path graph points
    const points = [];
    for (let age = 10; age <= 80; age += 10) {
        points.push({
            age,
            intensity: 3 + (age / 15) + (Math.random() * 2),
            reason: age > 50 ? 'Post-career introspection.' : 'Learning phase.'
        });
    }
    return points;
};

// --- 10. Equation of Life (EOL) ---
export const getEquationOfLife = (chartData) => {
    // Compare broad categories
    // Business (Mercury/Mars) vs Job (Sun/Saturn)
    // Spirituality (Ketu/Jupiter) vs Materialism (Venus/Rahu)

    // Mock scores
    const businessScore = evaluatePlanetStrength('Mercury', chartData, 'business').score;
    const jobScore = evaluatePlanetStrength('Sun', chartData, 'career').score;
    const spiritScore = evaluatePlanetStrength('Ketu', chartData, 'spiritual').score;

    return {
        priorities: [
            { pair: 'Business vs Job', winner: businessScore > jobScore ? 'Business' : 'Job', score: Math.abs(businessScore - jobScore).toFixed(1) },
            { pair: 'Spirituality vs Materialism', winner: spiritScore > 5 ? 'Spirituality' : 'Materialism', score: 2.5 }
        ],
        bestAspect: businessScore > jobScore ? 'Entrepreneurship' : 'Administration',
        worstAspect: spiritScore < 4 ? 'Isolation' : 'Excessive Indulgence',
        ranking: [
            { aspect: 'Career', rank: 1, reason: 'Dominant 10th House' },
            { aspect: 'Family', rank: 2, reason: 'Strong 2nd House' },
            { aspect: 'Health', rank: 3, reason: 'Stable Ascendant' },
            { aspect: 'Spirituality', rank: 4, reason: 'Late blooming' }
        ]
    };
};
