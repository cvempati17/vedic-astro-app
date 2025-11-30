import { calculateNakshatra } from './nakshatraUtils';

const DASHA_PERIODS = [
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
    const fullYears = Math.floor(years);
    const remaining = years - fullYears;
    const days = Math.round(remaining * 365.25);

    newDate.setFullYear(newDate.getFullYear() + fullYears);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
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
        isCurrent: now >= currentDate && now <= firstEndDate
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
            isCurrent: now >= currentDate && now <= endDate
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

export const calculateAntardashas = (mahadashaPlanet, startDate) => {
    const mdIndex = DASHA_PERIODS.findIndex(d => d.planet === mahadashaPlanet);
    if (mdIndex === -1) return [];

    const mdDuration = DASHA_PERIODS[mdIndex].years;
    const antardashas = [];
    let currentDate = new Date(startDate);
    const now = new Date();

    // Antardasha sequence starts from the Mahadasha lord itself
    for (let i = 0; i < 9; i++) {
        const currentIndex = (mdIndex + i) % 9;
        const adPlanet = DASHA_PERIODS[currentIndex];

        // Formula: (MD Years * AD Years) / 120 = Years duration
        const adDurationYears = (mdDuration * adPlanet.years) / 120;
        const endDate = addYears(currentDate, adDurationYears);

        antardashas.push({
            planet: adPlanet.planet,
            startDate: new Date(currentDate),
            endDate: new Date(endDate),
            isCurrent: now >= currentDate && now <= endDate
        });

        currentDate = new Date(endDate);
    }

    return antardashas;
};
