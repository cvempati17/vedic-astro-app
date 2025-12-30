import { calculateVimshottariDasha, calculateSubDashas } from './dashaUtils';
import { getHouseLord } from './aspectLifeUtils';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const getHouseNum = (planetLong, ascLong) => {
    const planetRasi = Math.floor(planetLong / 30);
    const ascRasi = Math.floor(ascLong / 30);
    return ((planetRasi - ascRasi + 12) % 12) + 1;
};

const getSignFromLong = (longitude) => {
    return SIGNS[Math.floor(longitude / 30)];
};

const getPlanetsInHouse = (chartData, houseNum, ascLong) => {
    const planets = [];
    Object.entries(chartData).forEach(([planet, data]) => {
        if (planet === 'Ascendant' || planet === 'Uranus' || planet === 'Neptune' || planet === 'Pluto') return;
        if (getHouseNum(data.longitude, ascLong) === houseNum) {
            planets.push(planet);
        }
    });
    return planets;
};

const getHouseLordPlanet = (houseNum, ascSignLabel) => {
    const hl = getHouseLord(houseNum, ascSignLabel);
    return hl ? hl.lord : null;
};


const TIMELINE_BUCKETS = [
    { label: "0-8", start: 0, end: 8 },
    { label: "8-16", start: 8, end: 16 },
    { label: "16-24", start: 16, end: 24 },
    { label: "24-32", start: 24, end: 32 },
    { label: "32-40", start: 32, end: 40 },
    { label: "40-48", start: 40, end: 48 },
    { label: "48-56", start: 48, end: 56 },
    { label: "56-64", start: 56, end: 64 },
    { label: "64-72", start: 64, end: 72 },
    { label: "72-80", start: 72, end: 80 }
];

const getArchetype = (physicalScore, emotionalScore, activeLongDasha) => {
    if (physicalScore >= 2 && !activeLongDasha && emotionalScore >= 2) return "DUAL_ANCHOR"; // Strong ties both places
    if (physicalScore >= 2 && activeLongDasha && emotionalScore < 2) return "PERMANENT_SETTLER";
    if (physicalScore >= 2) return "LONG_STAY_RETURNER";
    if (physicalScore === 1) return "VISITOR";
    return "NON_MOVER";
};

const getPlanetaryTable = (chartData, ascSign) => {
    // Generate simple table data
    const rows = [];
    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].forEach(p => {
        const d = chartData[p];
        if (!d) return;
        const sign = d.Sign ? d.Sign.label : SIGNS[Math.floor(d.longitude / 30)] || '-';
        const house = getHouseNum(d.longitude, chartData.Ascendant.longitude);
        rows.push({
            planet: p,
            sign: sign,
            degree: (d.longitude % 30).toFixed(2),
            house: house,
            nakshatra: d.Nakshatra ? d.Nakshatra.name : '-',
            isRetro: d.speed < 0 ? 'Yes' : 'No'
        });
    });
    return rows;
};

const calculateConfidenceTimeline = (chartData, birthDate) => {
    const timeline = [];
    const dashaSchedule = calculateVimshottariDasha(chartData.Moon.longitude, new Date(birthDate));

    // We need to score each bucket
    TIMELINE_BUCKETS.forEach(bucket => {
        const bucketStartYear = new Date(birthDate).getFullYear() + bucket.start;
        const bucketEndYear = new Date(birthDate).getFullYear() + bucket.end;

        // Find dominant dasha in this period (simplification: check midpoint year)
        const midYear = Math.floor((bucketStartYear + bucketEndYear) / 2);
        const date = new Date(midYear, 6, 1);

        let score = 20; // Base score (Weak)

        if (dashaSchedule) {
            const dasha = dashaSchedule.dashas.find(d => date >= d.startDate && date <= d.endDate);
            if (dasha) {
                const lord = dasha.planet;
                const ascLong = chartData.Ascendant.longitude;
                const sign9 = SIGNS[(Math.floor(ascLong / 30) + 8) % 12];
                const sign12 = SIGNS[(Math.floor(ascLong / 30) + 11) % 12];
                const lords = { 'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon', 'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars', 'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter' };
                const lord9 = lords[sign9];
                const lord12 = lords[sign12];

                if (lord === lord9) score += 20;
                if (lord === lord12) score += 25;
                if (lord === 'Rahu') score += 30;
                if (lord === 'Saturn') score += 15;

                // Add house logic if planet is IN 9/12
                const pData = chartData[lord];
                if (pData) {
                    const h = getHouseNum(pData.longitude, ascLong);
                    if (h === 9 || h === 12) score += 10;
                }
            }
        }

        score = Math.min(100, score);
        timeline.push({
            age_range: bucket.label,
            year: midYear, // helpful for chart
            score: score
        });
    });

    return timeline;
};

export const analyzeForeignTravel = (chartData, birthDetails) => {
    if (!chartData) return { error: "Chart data is empty." };
    if (!chartData.Ascendant) return { error: "Ascendant data is missing from the chart." };

    const ascLong = chartData.Ascendant.longitude;
    let ascSign = chartData.Ascendant.Sign ? chartData.Ascendant.Sign.label : null;

    // Fallback: Calculate sign from longitude if missing
    if (!ascSign && ascLong !== undefined) {
        ascSign = SIGNS[Math.floor(ascLong / 30)];
    }

    if (!ascSign) return { error: "Ascendant Sign is missing or invalid." };

    const lagnaLord = getHouseLordPlanet(1, ascSign);
    const moonSign = chartData.Moon?.Sign?.label;

    // --- 1. Identify Key Indicators ---

    const planetsIn9 = getPlanetsInHouse(chartData, 9, ascLong);
    const planetsIn12 = getPlanetsInHouse(chartData, 12, ascLong);
    const planetsIn3 = getPlanetsInHouse(chartData, 3, ascLong);
    const planetsIn7 = getPlanetsInHouse(chartData, 7, ascLong);
    const planetsIn4 = getPlanetsInHouse(chartData, 4, ascLong);

    const lord4 = getHouseLordPlanet(4, ascSign);
    const lord9 = getHouseLordPlanet(9, ascSign);
    const lord12 = getHouseLordPlanet(12, ascSign);

    const lagnaLordData = lagnaLord ? chartData[lagnaLord] : null;
    const lagnaLordHouse = lagnaLordData ? getHouseNum(lagnaLordData.longitude, ascLong) : null;
    const rahuHouse = chartData.Rahu ? getHouseNum(chartData.Rahu.longitude, ascLong) : null;
    const saturnHouse = chartData.Saturn ? getHouseNum(chartData.Saturn.longitude, ascLong) : null;


    // --- 2. Determine WHY (Reason) ---
    let reasons = [];
    let whyText = "";

    if (planetsIn9.includes('Mercury') || lord9 === 'Mercury' || planetsIn12.includes('Mercury')) {
        reasons.push("Education or Skill Enhancement (Mercury)");
    }
    if (planetsIn9.includes('Jupiter') || lord9 === 'Jupiter') {
        reasons.push("Higher Education, Knowledge seeking, or Consulting (Jupiter)");
    }
    if (planetsIn9.includes('Venus') || planetsIn12.includes('Venus')) {
        reasons.push("Leisure, Arts, or Comfort (Venus)");
    }
    if (planetsIn7.length > 0 || planetsIn12.includes('Sun') || planetsIn12.includes('Mars')) {
        reasons.push("Career / Profession / Business Projects");
    }
    if (rahuHouse === 12 || rahuHouse === 9) {
        reasons.push("Destiny or sudden opportunities (Rahu)");
    }
    if (planetsIn3.length > 0) {
        reasons.push("Short term assignments or tourism");
    }

    if (reasons.length === 0) {
        whyText = "General exploration or family reasons.";
    } else {
        whyText = `Primary indications suggest movement for: <ul>${reasons.map(r => `<li>${r}</li>`).join('')}</ul>`;
    }

    // --- 3. Determine WHERE (Direction) ---
    const sign9 = SIGNS[(Math.floor(ascLong / 30) + 8) % 12];
    const sign12 = SIGNS[(Math.floor(ascLong / 30) + 11) % 12];

    const getDirection = (sign) => {
        if (['Aries', 'Leo', 'Sagittarius'].includes(sign)) return "East";
        if (['Taurus', 'Virgo', 'Capricorn'].includes(sign)) return "South";
        if (['Gemini', 'Libra', 'Aquarius'].includes(sign)) return "West";
        if (['Cancer', 'Scorpio', 'Pisces'].includes(sign)) return "North";
        return "North-West";
    };

    const direction9 = getDirection(sign9);
    const direction12 = getDirection(sign12);
    let whereText = `<p><strong>Directions:</strong> Focus towards <strong>${direction9}</strong> (9th House) and <strong>${direction12}</strong> (12th House).</p>`;

    // --- 4. Determine WHEN (Timing Windows) ---
    const keyPlanets = ['Rahu', 'Saturn', 'Jupiter', lord9, lord12].filter(p => p);
    let timingRows = [];
    const dashaSchedule = calculateVimshottariDasha(chartData.Moon.longitude, new Date(birthDetails.dateOfBirth));

    if (dashaSchedule && dashaSchedule.dashas) {
        dashaSchedule.dashas.forEach(md => {
            if (new Date(md.endDate) < new Date(birthDetails.dateOfBirth)) return;
            if (new Date(md.endDate).getFullYear() < new Date().getFullYear() - 5) return;

            if (keyPlanets.includes(md.planet)) {
                let probability = "Moderate";
                if (md.planet === 'Rahu') probability = "High (Irreversible)";
                if (md.planet === 'Saturn') probability = "High (Long Term)";
                timingRows.push(`
                    <div style="margin-bottom: 8px;">
                        <strong>${md.planet} MD (${md.startDate.getFullYear()} - ${md.endDate.getFullYear()}):</strong>
                        <span style="color: #60a5fa;">${probability}</span>.
                    </div>
                `);
            }
        });
    }
    let whenText = timingRows.length > 0 ? timingRows.join('') : "No major immediate indicators.";

    // --- Settlement Analysis V7 ---
    let physicalScore = 0;
    let physicalReasons = [];

    if (lagnaLordHouse === 12) { physicalScore++; physicalReasons.push("Lagna Lord in 12th House"); }
    if (rahuHouse === 1 || rahuHouse === 12) { physicalScore++; physicalReasons.push(`Rahu in ${rahuHouse}th House`); }

    const saturnAspecting12 = [12, 10, 3, 6].includes(saturnHouse);
    const saturnAspecting1 = [1, 11, 4, 7].includes(saturnHouse);
    if (saturnAspecting1 || saturnAspecting12) { physicalScore++; physicalReasons.push("Saturn persistence influence"); }

    const currentDasha = dashaSchedule.dashas.find(d => d.isCurrent);
    let activeLongDasha = false;
    if (currentDasha && (currentDasha.planet === 'Rahu' || currentDasha.planet === 'Saturn')) {
        activeLongDasha = true;
        physicalScore++;
        physicalReasons.push(`Active ${currentDasha.planet} Mahadasha`);
    }

    let emotionalScore = 0;
    const moonOwn = moonSign === 'Cancer';
    const moonExalted = moonSign === 'Taurus';
    if (moonOwn || moonExalted) emotionalScore++;

    const benefics = ['Jupiter', 'Venus', 'Moon', 'Mercury'];
    const beneficsIn4 = planetsIn4.filter(p => benefics.includes(p));
    if (beneficsIn4.length > 0) emotionalScore++;

    const lord4Data = lord4 ? chartData[lord4] : null;
    const lord4House = lord4Data ? getHouseNum(lord4Data.longitude, ascLong) : null;
    if (lord4House === 4 || lord4House === 1) emotionalScore++;

    const isPhysicallySettled = physicalScore >= 2;
    const physicalText = isPhysicallySettled ? "Yes (Strong)" : "No (Temporary)";
    let emotionalText = emotionalScore >= 2 ? "Strong" : (emotionalScore === 0 ? "Weak" : "Moderate");

    // Homeland defaults
    const homeland = birthDetails.country || "India";

    let settlementExplanation = `
        <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Physical Factors (${physicalScore}/4):</strong> ${physicalReasons.length > 0 ? physicalReasons.join(', ') : 'Few indicators'}.</li>
            <li><strong>Emotional Roots:</strong> ${emotionalText} attachment to Homeland (${homeland}).</li>
        </ul>
    `;

    // --- 3. Outputs V11 ---
    const archetype = getArchetype(physicalScore, emotionalScore, activeLongDasha);
    // V11 logic: ConfidenceTimeline (Age buckets)
    const confidenceTimeline = calculateConfidenceTimeline(chartData, birthDetails.dateOfBirth);
    const planetaryTable = getPlanetaryTable(chartData, ascSign);


    let finalSummary = `
        <p><strong>Migration Pattern:</strong></p>
        <p>Your chart indicates <strong>${isPhysicallySettled ? 'Permanent Settlement' : 'Long-term Stay with Return'}</strong>.</p>
        <p>${isPhysicallySettled
            ? 'You are likely to build a life abroad, taking on a new cultural identity.'
            : `You may travel extensively but are likely to return to your homeland (${homeland}) eventually.`}</p>
    `;

    return {
        why_analysis: whyText,
        when_analysis: whenText,
        where_analysis: whereText,
        physical_settlement: physicalText,
        emotional_roots: emotionalText,
        emotional_attachment: emotionalText, // Keep for backward compatibility if needed
        settlement_explanation: settlementExplanation,
        final_summary: finalSummary,
        archetype: archetype,
        confidence_timeline: confidenceTimeline,
        planetary_table: planetaryTable,
        homeland: homeland
    };
};
