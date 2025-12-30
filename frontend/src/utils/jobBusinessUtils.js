import { calculateVimshottariDasha } from './dashaUtils';
import { getHouseLord } from './aspectLifeUtils';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const getHouseNum = (planetLong, ascLong) => {
    const planetRasi = Math.floor(planetLong / 30);
    const ascRasi = Math.floor(ascLong / 30);
    return ((planetRasi - ascRasi + 12) % 12) + 1;
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

const calculateConfidenceTimeline = (chartData, birthDate) => {
    const timeline = [];
    const dashaSchedule = calculateVimshottariDasha(chartData.Moon.longitude, new Date(birthDate));

    TIMELINE_BUCKETS.forEach(bucket => {
        const bucketStartYear = new Date(birthDate).getFullYear() + bucket.start;
        const bucketEndYear = new Date(birthDate).getFullYear() + bucket.end;
        const midYear = Math.floor((bucketStartYear + bucketEndYear) / 2);
        const date = new Date(midYear, 6, 1);

        let score = 50; // Neutral start

        if (dashaSchedule) {
            const dasha = dashaSchedule.dashas.find(d => date >= d.startDate && date <= d.endDate);
            if (dasha) {
                const lord = dasha.planet;
                // Simple logic:
                // Sun, Saturn, 6th lord, 10th lord -> Job (+Score)
                // Mercury, 7th lord, 3rd lord, Rahu -> Business (-Score or separate scale?)
                // Let's make Score 0 (Pure Job) to 100 (Pure Business) or vice versa?
                // The requirements say "Confidence Timeline" but usually that implies strength of prediction. 
                // Let's interpret Score as "Business Orientation Strength" (0 = Job, 100 = Business)?
                // Or just "Career Strength"?
                // The template shows "Career Orientation Confidence".
                // Let's say: 0-100 where 100 is high confidence in the *predicted* path?
                // Actually, standardized to: >50 Business, <50 Job?
                // Let's stick to "Strength of Business Potential" for visualization.

                const ascLong = chartData.Ascendant.longitude;
                const ascSign = SIGNS[Math.floor(ascLong / 30)] || "Aries";

                const lord6 = getHouseLordPlanet(6, ascSign);
                const lord7 = getHouseLordPlanet(7, ascSign);
                const lord10 = getHouseLordPlanet(10, ascSign);

                if ([lord7, 'Mercury', 'Rahu'].includes(lord)) score += 20; // Business
                if ([lord6, lord10, 'Sun', 'Saturn'].includes(lord)) score -= 20; // Job
            }
        }

        // Clamp 0-100
        score = Math.max(0, Math.min(100, score));

        timeline.push({
            age_range: bucket.label,
            score: score
        });
    });
    return timeline;
};

export const analyzeJobVsBusiness = (chartData, birthDetails) => {
    if (!chartData || !chartData.Ascendant) return { error: "Invalid Chart Data" };

    const ascLong = chartData.Ascendant.longitude;
    const ascSign = chartData.Ascendant.Sign ? chartData.Ascendant.Sign.label : SIGNS[Math.floor(ascLong / 30)];

    // --- Factors ---
    // Job: 6th House (Service), 10th House (Authority/Career), Saturn (Service), Sun (Authority)
    // Business: 7th House (Trade/Partnership), 3rd House (Self-effort), Mercury (Trade), Rahu (Ambition/Risk)

    const lord6 = getHouseLordPlanet(6, ascSign);
    const lord10 = getHouseLordPlanet(10, ascSign);
    const lord7 = getHouseLordPlanet(7, ascSign);
    const lord3 = getHouseLordPlanet(3, ascSign);

    const planetsIn6 = getPlanetsInHouse(chartData, 6, ascLong);
    const planetsIn10 = getPlanetsInHouse(chartData, 10, ascLong);
    const planetsIn7 = getPlanetsInHouse(chartData, 7, ascLong);
    const planetsIn3 = getPlanetsInHouse(chartData, 3, ascLong);

    let jobScore = 0;
    let businessScore = 0;
    let jobReasons = [];
    let businessReasons = [];

    // Job Analysis
    if (planetsIn6.length > 0) { jobScore += planetsIn6.length; jobReasons.push(`Planets in 6th (Service): ${planetsIn6.join(', ')}`); }
    if (planetsIn10.length > 0) { jobScore += planetsIn10.length; jobReasons.push(`Planets in 10th (Career/Authority): ${planetsIn10.join(', ')}`); }
    if (chartData.Saturn) {
        const satHouse = getHouseNum(chartData.Saturn.longitude, ascLong);
        if ([6, 10, 11].includes(satHouse)) { jobScore += 2; jobReasons.push("Strong Saturn (Service indicator)"); }
    }
    if (chartData.Sun) {
        const sunHouse = getHouseNum(chartData.Sun.longitude, ascLong);
        if ([10, 11, 1].includes(sunHouse)) { jobScore += 1; jobReasons.push("Sun in 10th/11th/1st (Authority)"); }
    }

    // Business Analysis
    if (planetsIn7.length > 0) { businessScore += planetsIn7.length; businessReasons.push(`Planets in 7th (Business): ${planetsIn7.join(', ')}`); }
    if (planetsIn3.length > 0) { businessScore += planetsIn3.length; businessReasons.push(`Planets in 3rd (Entropy/Effort): ${planetsIn3.join(', ')}`); }
    if (chartData.Mercury) {
        const merHouse = getHouseNum(chartData.Mercury.longitude, ascLong);
        if ([1, 2, 7, 10, 11].includes(merHouse)) { businessScore += 1; businessReasons.push("Prominent Mercury (Trade)"); }
    }
    if (chartData.Rahu) {
        const rahuHouse = getHouseNum(chartData.Rahu.longitude, ascLong);
        if ([3, 6, 10, 11].includes(rahuHouse)) { businessScore += 2; businessReasons.push("Rahu driving ambition (Risk taking)"); }
    }

    // --- Outcomes ---
    let careerPattern = "HYBRID_PATH";
    let finalRec = "";
    let careerTypeClass = "hybrid";

    if (jobScore > businessScore + 2) {
        careerPattern = "JOB_ORIENTED";
        careerTypeClass = "job";
        finalRec = "Strong inclination towards Service, Government roles, or Corporate leadership.";
    } else if (businessScore > jobScore + 2) {
        careerPattern = "BUSINESS_ORIENTED";
        careerTypeClass = "business";
        finalRec = "Strong inclination towards Entrepreneurship, Business, or Independent Practice.";
    } else {
        careerPattern = "HYBRID_PATH";
        careerTypeClass = "hybrid";
        finalRec = "A mix of Job and Business, or a career that allows independence within a structure (Intrapreneurship).";
    }

    // --- Sections ---

    // WHY
    let whyHTML = "<ul>";
    jobReasons.forEach(r => whyHTML += `<li>[Job] ${r}</li>`);
    businessReasons.forEach(r => whyHTML += `<li>[Business] ${r}</li>`);
    whyHTML += "</ul>";

    // WHEN
    // Simplified Timing logic using Dasha
    let whenHTML = "<p><strong>Key Timing Windows:</strong></p><ul>";
    const dashaSchedule = calculateVimshottariDasha(chartData.Moon.longitude, new Date(birthDetails.dateOfBirth));
    if (dashaSchedule) {
        const currentYear = new Date().getFullYear();
        dashaSchedule.dashas.forEach(d => {
            if (d.endDate.getFullYear() < currentYear) return; // Skip past
            if (d.endDate.getFullYear() > currentYear + 40) return; // Skip far future

            let orientation = "Neutral";
            if ([lord7, 'Mercury', 'Rahu'].includes(d.planet)) orientation = "Business Potential";
            if ([lord6, lord10, 'Saturn', 'Sun'].includes(d.planet)) orientation = "Job Stability/Growth";

            whenHTML += `<li><strong>${d.planet} Dasha (${d.startDate.getFullYear()} - ${d.endDate.getFullYear()}):</strong> ${orientation}</li>`;
        });
    }
    whenHTML += "</ul>";

    // HOW
    let howHTML = `<p>Based on your pattern (${careerPattern}), you thrive in environments that offer: </p>`;
    if (careerPattern === "JOB_ORIENTED") {
        howHTML += "<ul><li>Structured growth</li><li>Clear hierarchy</li><li>Low financial risk</li></ul>";
    } else if (careerPattern === "BUSINESS_ORIENTED") {
        howHTML += "<ul><li>Autonomy</li><li>Direct reward for effort</li><li>Scalability</li></ul>";
    } else {
        howHTML += "<ul><li>Flexibility</li><li>Consulting roles</li><li>Side ventures alongside stability</li></ul>";
    }

    return {
        profile: { ...birthDetails }, // For completeness if needed
        why_analysis: whyHTML,
        when_analysis: whenHTML,
        how_analysis: howHTML,
        career_pattern: careerPattern.replace('_', ' '),
        career_type_class: careerTypeClass,
        confidence_timeline: calculateConfidenceTimeline(chartData, birthDetails.dateOfBirth),
        final_recommendation: finalRec
    };
};
