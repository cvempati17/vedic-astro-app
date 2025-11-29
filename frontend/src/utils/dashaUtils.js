import { calculateNakshatra } from './nakshatraUtils';

// Dasha periods in years
const DASHA_YEARS = {
    'Ketu': 7,
    'Venus': 20,
    'Sun': 6,
    'Moon': 10,
    'Mars': 7,
    'Rahu': 18,
    'Jupiter': 16,
    'Saturn': 19,
    'Mercury': 17
};

// Order of Dashas
const DASHA_ORDER = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

/**
 * Calculate Vimshottari Dasha details
 * @param {number} moonLongitude - Moon's longitude in degrees
 * @param {string} birthDateStr - Birth date string (YYYY-MM-DD)
 * @returns {object} - Dasha calculations
 */
export const calculateVimshottariDasha = (moonLongitude, birthDateStr) => {
    if (!moonLongitude || !birthDateStr) return null;

    const birthDate = new Date(birthDateStr);

    // 1. Get Birth Nakshatra info
    const nakshatra = calculateNakshatra(moonLongitude);
    const lord = nakshatra.lord;

    // 2. Calculate Balance of Dasha
    // How much of the nakshatra is remaining?
    // Each nakshatra is 13°20' = 13.3333 degrees
    // Position in nakshatra is returned by calculateNakshatra as 'degrees' (string)
    const degreesTraversed = parseFloat(nakshatra.degrees);
    const totalNakshatraLength = 13.333333;
    const degreesRemaining = totalNakshatraLength - degreesTraversed;

    // Fraction remaining
    const fractionRemaining = degreesRemaining / totalNakshatraLength;

    // Total years for the birth lord
    const totalYears = DASHA_YEARS[lord];

    // Years remaining at birth
    const balanceYears = totalYears * fractionRemaining;

    // 3. Generate Dasha Timeline
    const dashas = [];
    let currentYear = birthDate.getFullYear();
    let currentMonth = birthDate.getMonth();
    let currentDay = birthDate.getDate();

    // Add balance years to birth date to get end of first dasha
    // Convert balance years to milliseconds for more precision or just add roughly
    // Let's do precise date addition
    let endDate = addYearsToDate(birthDate, balanceYears);

    // Start index in the cycle
    let startIndex = DASHA_ORDER.indexOf(lord);

    // Generate current and future dashas (covering 120 years of life)
    for (let i = 0; i < 9; i++) {
        const dashaIndex = (startIndex + i) % 9;
        const planet = DASHA_ORDER[dashaIndex];
        const duration = DASHA_YEARS[planet];

        // For the first dasha, duration is the balance
        const actualDuration = (i === 0) ? balanceYears : duration;

        // Start date is previous end date (or birth date for first)
        const startDate = (i === 0) ? birthDate : dashas[i - 1].endDate;

        // Calculate end date
        // If it's the first one, we already calculated endDate based on balance
        const currentEndDate = (i === 0) ? endDate : addYearsToDate(startDate, duration);

        dashas.push({
            planet,
            startDate: startDate,
            endDate: currentEndDate,
            duration: actualDuration,
            fullDuration: duration,
            isCurrent: isDateInRange(new Date(), startDate, currentEndDate)
        });
    }

    return {
        birthNakshatra: nakshatra,
        balance: {
            planet: lord,
            years: Math.floor(balanceYears),
            months: Math.floor((balanceYears % 1) * 12),
            days: Math.floor(((balanceYears % 1) * 12 % 1) * 30)
        },
        dashas
    };
};

/**
 * Calculate Antardashas (Sub-periods) for a Mahadasha
 * @param {string} mahadashaLord - Planet ruling the Mahadasha
 * @param {Date} startDate - Start date of the Mahadasha
 * @returns {Array} - List of Antardashas
 */
export const calculateAntardashas = (mahadashaLord, startDate) => {
    const antardashas = [];
    const mahaDuration = DASHA_YEARS[mahadashaLord];

    let startIndex = DASHA_ORDER.indexOf(mahadashaLord);
    let currentStartDate = new Date(startDate);

    for (let i = 0; i < 9; i++) {
        const dashaIndex = (startIndex + i) % 9;
        const planet = DASHA_ORDER[dashaIndex];
        const subDuration = DASHA_YEARS[planet];

        // Formula: (Maha Years * Antara Years) / 120 = Years of Antardasha
        const durationYears = (mahaDuration * subDuration) / 120;

        const endDate = addYearsToDate(currentStartDate, durationYears);

        antardashas.push({
            planet,
            startDate: new Date(currentStartDate),
            endDate: new Date(endDate),
            isCurrent: isDateInRange(new Date(), currentStartDate, endDate)
        });

        currentStartDate = endDate;
    }

    return antardashas;
};

// Helper: Add years (float) to date
const addYearsToDate = (date, years) => {
    const result = new Date(date);
    const wholeYears = Math.floor(years);
    const fraction = years - wholeYears;

    result.setFullYear(result.getFullYear() + wholeYears);

    // Add remaining fraction as milliseconds
    const msInYear = 365.25 * 24 * 60 * 60 * 1000;
    const remainingMs = fraction * msInYear;

    return new Date(result.getTime() + remainingMs);
};

// Helper: Check if date is in range
const isDateInRange = (checkDate, start, end) => {
    return checkDate >= start && checkDate <= end;
};

// Helper: Format date
export const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};
