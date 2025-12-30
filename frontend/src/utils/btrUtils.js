// Birth Time Rectification Utilities
// Implements classical Vedic rectification methods

// Nakshatra names in order (27 nakshatras)
const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// Zodiac signs in order (12 signs)
const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function normalizeLowerCase(value) {
    if (typeof value !== 'string') return '';
    return value.toLowerCase();
}

/**
 * Convert time string (HH:MM) to minutes from midnight
 */
export function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Convert minutes to time string (HH:MM)
 */
export function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Convert candidate time to Ghati and Vighati
 * 1 Ghati = 24 minutes
 * 1 Ghati = 60 Vighatis
 */
export function convertToGhatiVighati(candidateTime, sunriseTime) {
    const candidateMinutes = timeToMinutes(candidateTime);
    const sunriseMinutes = timeToMinutes(sunriseTime);

    const minutesFromSunrise = candidateMinutes - sunriseMinutes;
    const ghatis = minutesFromSunrise / 24;
    const vighatis = ghatis * 60;

    return { ghatis, vighatis, minutesFromSunrise };
}

/**
 * Get Nakshatra name from remainder
 * Cycle starts at Ashwini (0), Magha (9), Moola (18)
 */
export function getNakshatraFromRemainder(remainder) {
    if (isNaN(remainder)) return NAKSHATRAS[0]; // Fallback to first
    const index = Math.floor(remainder) % 27;
    return NAKSHATRAS[index] || NAKSHATRAS[0];
}

/**
 * Get zodiac sign name from index
 */
export function getSignFromIndex(index) {
    if (isNaN(index)) return ZODIAC_SIGNS[0];
    return ZODIAC_SIGNS[index % 12] || ZODIAC_SIGNS[0];
}

/**
 * Parashara Method - Nakshatra Validation
 * Formula: value = (vighatis * 4) / 9
 * remainder = value % 9
 */
export function parasharaMethod(vighatis, knownNakshatra = null) {
    const value = (vighatis * 4) / 9;
    const remainder = value % 9;

    // Map remainder to nakshatra cycle
    const nakshatraIndex = Math.floor(remainder);
    const derivedNakshatra = getNakshatraFromRemainder(nakshatraIndex);

    let score = 0;
    let pass = true;

    if (knownNakshatra && derivedNakshatra) {
        if (normalizeLowerCase(derivedNakshatra) === normalizeLowerCase(knownNakshatra)) {
            score = 3;
            pass = true;
        } else {
            score = 0;
            pass = false;
        }
    } else {
        // No known nakshatra to compare, give neutral score
        score = 1;
    }

    return {
        pass,
        score,
        derivedValues: {
            nakshatra: derivedNakshatra,
            remainder,
            value
        }
    };
}

/**
 * Kalidasa Method - Gender Validation
 * Formula: remainder = vighatis % 225
 * Gender Mapping:
 * 1-15: Male, 16-45: Female, 46-90: Male, 91-150: Female, 151-225: Male
 */
export function kalidasaMethod(vighatis, gender = 'unknown') {
    const remainder = vighatis % 225;

    let derivedGender;
    if (remainder >= 1 && remainder <= 15) derivedGender = 'male';
    else if (remainder >= 16 && remainder <= 45) derivedGender = 'female';
    else if (remainder >= 46 && remainder <= 90) derivedGender = 'male';
    else if (remainder >= 91 && remainder <= 150) derivedGender = 'female';
    else derivedGender = 'male'; // 151-225

    let score = 0;
    let pass = true;

    if (!gender || gender === 'unknown') {
        score = 1;
    } else if (derivedGender && normalizeLowerCase(gender)) {
        if (derivedGender === normalizeLowerCase(gender)) {
            score = 2;
            pass = true;
        } else {
            score = 0;
            pass = false;
        }
    } else {
        score = 0;
        pass = false;
    }

    return {
        pass,
        score,
        derivedValues: {
            gender: derivedGender,
            remainder
        }
    };
}

/**
 * Sun Longitude Method - Ascendant Calculation
 * Formula: value = (ghatis * 6) + sun_longitude_deg
 * quotient = floor(value / 30)
 * ascendant_sign_index = (sun_sign_index + quotient + 1) % 12
 */
export function sunLongitudeMethod(ghatis, sunLongitudeDeg, sunSignIndex, expectedAscendant = null) {
    const value = (ghatis * 6) + sunLongitudeDeg;
    const quotient = Math.floor(value / 30);
    const ascendantSignIndex = (sunSignIndex + quotient + 1) % 12;
    const ascendantSign = getSignFromIndex(ascendantSignIndex);

    let score = 0;
    let pass = true;

    if (expectedAscendant && ascendantSign) {
        if (normalizeLowerCase(ascendantSign) === normalizeLowerCase(expectedAscendant)) {
            score = 3;
            pass = true;
        } else {
            // Check if it's adjacent sign (plausible)
            const expectedAscLower = normalizeLowerCase(expectedAscendant);
            const expectedIndex = ZODIAC_SIGNS.findIndex(s => normalizeLowerCase(s) === expectedAscLower);
            if (expectedIndex !== -1) {
                const diff = Math.abs(ascendantSignIndex - expectedIndex);
                if (diff === 1 || diff === 11) {
                    score = 1; // Adjacent sign, plausible
                } else {
                    score = 0; // Conflict
                    pass = false;
                }
            }
        }
    } else {
        // No expected ascendant, give neutral score
        score = 1;
    }

    return {
        pass,
        score,
        derivedValues: {
            ascendantSign,
            ascendantSignIndex,
            value,
            quotient
        }
    };
}

/**
 * Sodasamsa Method - Optional supportive validation
 * Simplified implementation for supportive scoring
 */
export function sodasamsaMethod(ascendantDegree) {
    // Simplified: just provide supportive score
    // In full implementation, would divide ascendant into 16 parts
    const score = 1; // Always supportive

    return {
        pass: true,
        score,
        derivedValues: {
            method: 'sodasamsa',
            note: 'Supportive validation'
        }
    };
}

/**
 * Calculate confidence level based on total score
 * 8-9: High, 5-7: Medium, <5: Low
 */
export function calculateConfidence(score) {
    if (score >= 8) return 'High';
    if (score >= 5) return 'Medium';
    return 'Low';
}

/**
 * Main Birth Time Rectification Algorithm
 * Iterates through time window and scores each candidate
 */
export function rectifyBirthTime(params) {
    const {
        dateOfBirth,
        placeOfBirth,
        timeWindowStart,
        timeWindowEnd,
        sunriseTime,
        sunLongitudeDeg,
        sunSignIndex,
        gender = 'unknown',
        knownNakshatra = null,
        expectedAscendant = null
    } = params;

    const startMinutes = timeToMinutes(timeWindowStart);
    const endMinutes = timeToMinutes(timeWindowEnd);

    if (!sunriseTime) {
        throw new Error('Sunrise time is required for calculation');
    }

    if (isNaN(startMinutes) || isNaN(endMinutes)) {
        throw new Error('Invalid time window specified');
    }

    if (endMinutes < startMinutes) {
        throw new Error('Time window end must be after start');
    }

    const candidates = [];

    // Iterate through time window in 1-minute steps
    for (let minutes = startMinutes; minutes <= endMinutes; minutes++) {
        const candidateTime = minutesToTime(minutes);

        // Calculate ghatis and vighatis
        const { ghatis, vighatis, minutesFromSunrise } = convertToGhatiVighati(candidateTime, sunriseTime);

        // Run all rectification methods
        const parasharaResult = parasharaMethod(vighatis, knownNakshatra);
        const kalidasaResult = kalidasaMethod(vighatis, gender);
        const sunLongResult = sunLongitudeMethod(ghatis, sunLongitudeDeg, sunSignIndex, expectedAscendant);
        const sodasamsaResult = sodasamsaMethod(0); // Simplified

        // Calculate total score
        const totalScore =
            parasharaResult.score +
            kalidasaResult.score +
            sunLongResult.score +
            sodasamsaResult.score;

        candidates.push({
            time: candidateTime,
            totalScore,
            confidence: calculateConfidence(totalScore),
            ghatis,
            vighatis,
            minutesFromSunrise,
            methods: {
                parashara: parasharaResult,
                kalidasa: kalidasaResult,
                sunLongitude: sunLongResult,
                sodasamsa: sodasamsaResult
            }
        });
    }

    // Sort by score (descending)
    candidates.sort((a, b) => b.totalScore - a.totalScore);

    // Get best candidate
    const best = candidates[0];

    if (!best) {
        throw new Error('No candidates found within the specified time window');
    }

    return {
        rectifiedTime: best.time,
        ascendantSign: best.methods.sunLongitude.derivedValues.ascendantSign,
        nakshatra: best.methods.parashara.derivedValues.nakshatra,
        totalScore: best.totalScore,
        confidence: best.confidence,
        topCandidates: candidates.slice(0, 5), // Top 5 candidates
        allCandidates: candidates
    };
}
