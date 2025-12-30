import { calculateNakshatra } from './nakshatraUtils';

export const DASHA_PERIODS = [
    { planet: 'Ketu', years: 7 },
    { planet: 'Venus', years: 20 },
    { planet: 'Sun', years: 6 },
    { planet: 'Moon', years: 10 },
    { planet: 'Mars', years: 7 },
    { planet: 'Rahu', years: 18 },
    { planet: 'Jupiter', years: 16 },
    { planet: 'Saturn', years: 19 },
    { planet: 'Mercury', years: 17 }
];

export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Helper to add fractional years to date
const addYears = (date, years) => {
    const newDate = new Date(date);
    const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
    const newTime = newDate.getTime() + (years * msPerYear);
    return new Date(newTime);
};

// Helper to convert fractional years to YMD
const getDurationDetails = (years) => {
    const y = Math.floor(years);
    const rem1 = (years - y) * 12;
    const m = Math.floor(rem1);
    const rem2 = (rem1 - m) * 30;
    const d = Math.round(rem2);
    return { years: y, months: m, days: d };
};

export const calculateVimshottariDasha = (moonLongitude, birthDate) => {
    const nakshatraData = calculateNakshatra(moonLongitude);
    const birthStarLord = nakshatraData.lord;

    // Find starting index in Dasha sequence
    const startIndex = DASHA_PERIODS.findIndex(d => d.planet === birthStarLord);
    if (startIndex === -1) return null;

    const startDasha = DASHA_PERIODS[startIndex];
    const nakshatraLength = 360 / 27; // 13.3333...
    const positionInNakshatra = parseFloat(nakshatraData.degrees);
    const remainingDegrees = nakshatraLength - positionInNakshatra;

    // Calculate balance of first Dasha
    const balanceYears = (remainingDegrees / nakshatraLength) * startDasha.years;
    const balanceDetails = getDurationDetails(balanceYears);

    const dashas = [];
    let currentDate = new Date(birthDate);
    const now = new Date();

    // First Dasha (Partial)
    const firstEndDate = addYears(currentDate, balanceYears);

    dashas.push({
        planet: startDasha.planet,
        startDate: new Date(currentDate),
        endDate: new Date(firstEndDate),
        fullDuration: startDasha.years, // Used for Antardasha calc
        isCurrent: now >= currentDate && now <= firstEndDate,
        level: 1
    });

    currentDate = new Date(firstEndDate);

    // Generate for 120 years
    let currentIndex = (startIndex + 1) % 9;
    const maxDate = new Date(birthDate);
    maxDate.setFullYear(maxDate.getFullYear() + 120);

    while (currentDate < maxDate) {
        const dasha = DASHA_PERIODS[currentIndex];
        const endDate = addYears(currentDate, dasha.years);

        dashas.push({
            planet: dasha.planet,
            startDate: new Date(currentDate),
            endDate: new Date(endDate),
            fullDuration: dasha.years,
            isCurrent: now >= currentDate && now <= endDate,
            level: 1
        });

        currentDate = new Date(endDate);
        currentIndex = (currentIndex + 1) % 9;
    }

    return {
        balance: {
            planet: startDasha.planet,
            ...balanceDetails
        },
        dashas
    };
};

export const calculateSubDashas = (parentPlanet, startDate, parentDurationYears, level = 2) => {
    if (level > 6) return []; // Stop at 6 levels

    // Find the starting index. Sub-periods always start with the lord of the parent period
    const parentIndex = DASHA_PERIODS.findIndex(d => d.planet === parentPlanet);
    if (parentIndex === -1) return [];

    const subDashas = [];
    let currentDate = new Date(startDate);
    const now = new Date();

    for (let i = 0; i < 9; i++) {
        const currentIndex = (parentIndex + i) % 9;
        const subDashaPlanet = DASHA_PERIODS[currentIndex];

        // Formula: (Parent Duration * Sub Planet Years) / 120
        const durationYears = (parentDurationYears * subDashaPlanet.years) / 120;
        const endDate = addYears(currentDate, durationYears);

        subDashas.push({
            planet: subDashaPlanet.planet,
            startDate: new Date(currentDate),
            endDate: new Date(endDate),
            fullDuration: durationYears, // This sub-period becomes the parent duration for next level
            isCurrent: now >= currentDate && now <= endDate,
            level: level,
            parentPlanet: parentPlanet
        });

        currentDate = new Date(endDate);
    }

    return subDashas;
};

// Legacy method for backward compatibility if needed, but we should use calculateSubDashas now
export const calculateAntardashas = (mahadashaPlanet, startDate) => {
    // Find absolute duration from reference map
    const dasha = DASHA_PERIODS.find(d => d.planet === mahadashaPlanet);
    return calculateSubDashas(mahadashaPlanet, startDate, dasha ? dasha.years : 0, 2);
};
