import { calculateDignity } from './strengthUtils';

// Helper to calculate approximate Sunrise/Sunset based on date and location
// This is a simplified algorithm. For high precision, a library like suncalc is needed.
const getSunTimes = (date, lat, lng) => {
    // Default to 6 AM / 6 PM if lat/lng missing
    if (!lat || !lng) {
        return {
            sunrise: new Date(date.setHours(6, 0, 0, 0)),
            sunset: new Date(date.setHours(18, 0, 0, 0))
        };
    }

    // Simple approximation (not astronomical precision)
    // For Indian latitudes, follow user's guidance: ~05:45 / 18:45
    const sunrise = new Date(date);
    const sunset = new Date(date);

    const isIndiaLatLng = lat >= 7 && lat <= 37 && lng >= 68 && lng <= 98;
    if (isIndiaLatLng) {
        sunrise.setHours(5, 45, 0, 0);
        sunset.setHours(18, 45, 0, 0);
    } else {
        sunrise.setHours(6, 0, 0, 0);
        sunset.setHours(18, 0, 0, 0);
    }

    return { sunrise, sunset };
};

const buildLifePhases = (house, sign, birthYear) => {
    const baseFocusByHouse = {
        1: 'self, body, identity, physical vitality and confidence',
        2: 'finances, family stability, speech and values',
        3: 'courage, efforts, siblings, communication and short travels',
        4: 'home, mother, emotional security, real-estate and inner peace',
        5: 'children, education, creativity and romantic expression',
        6: 'work environment, service, health and daily routines',
        7: 'marriage, partnerships, agreements and public image',
        8: 'deep transformation, longevity, inheritances and hidden fears',
        9: 'dharma, higher learning, father/mentors, luck and long journeys',
        10: 'career, status, authority and long-term responsibilities',
        11: 'income, networks, elder siblings and long-term gains',
        12: 'sleep, losses, foreign lands, retreat and spiritualization'
    };

    const signToneBySign = {
        Aries: 'direct, impulsive, action-oriented and sometimes confrontational expression',
        Taurus: 'steady, security-seeking, comfort-oriented and stubborn expression',
        Gemini: 'restless, mental, communicative and dual expression',
        Cancer: 'emotional, protective, family-centred and sensitive expression',
        Leo: 'proud, dramatic, heart-centred and recognition-seeking expression',
        Virgo: 'practical, analytical, health-conscious and perfection-seeking expression',
        Libra: 'relationship-focused, diplomatic, balanced but approval-seeking expression',
        Scorpio: 'intense, secretive, transformative and research-oriented expression',
        Sagittarius: 'optimistic, philosophical, expansion-seeking expression',
        Capricorn: 'disciplined, realistic, work-focused and duty-bound expression',
        Aquarius: 'unconventional, humanitarian, future-oriented and detached expression',
        Pisces: 'sensitive, imaginative, sacrificial and spiritual expression'
    };

    const focus = baseFocusByHouse[house] || 'life areas where Mandi sits';
    const tone = signToneBySign[sign] || 'karmic tone in that area';

    const phases = [];

    // 0–12: childhood imprint
    phases.push({
        label: '0–12 years: Childhood Imprint',
        years: `${birthYear}–${birthYear + 12}`,
        description:
            `Early life brings a subtle weight around ${focus}. Situations in family/home and environment ` +
            `create a background fear or over-sensitivity here. With ${sign} tone (${tone}), the child may ` +
            `try to overcompensate by behaving strongly in this domain, even while feeling internally heavy.`
    });

    // 13–24: adolescence & early youth
    phases.push({
        label: '13–24 years: Adolescent Testing',
        years: `${birthYear + 13}–${birthYear + 24}`,
        description:
            `Teenage and early youth activate strong karmic testing in ${focus}. Conflicts, comparisons or ` +
            `setbacks highlight insecurities. This is when fear-patterns around this area become conscious, ` +
            `and Mandi pushes the native to work harder than others to feel normal here.`
    });

    // 25–36: consolidation + heavy karmic load
    phases.push({
        label: '25–36 years: Heavy Consolidation Phase',
        years: `${birthYear + 25}–${birthYear + 36}`,
        description:
            `This is the peak karmic load of Mandi in ${sign} in the ${house}th house. Responsibilities and ` +
            `delays around ${focus} can feel suffocating, yet this hard work builds the foundation for later ` +
            `stability. Saturn–Mandi themes around discipline, detachment and maturity are strongly felt now.`
    });

    // 37–48: relief and restructuring
    phases.push({
        label: '37–48 years: Gradual Relief & Restructuring',
        years: `${birthYear + 37}–${birthYear + 48}`,
        description:
            `From late thirties and forties, the heaviest intensity of Mandi begins to reduce. Lessons ` +
            `connected to ${focus} have been learned the hard way. Practical solutions appear, and external ` +
            `support or inner wisdom helps the native stabilize this area. Many natives report that life ` +
            `becomes noticeably lighter after this period.`
    });

    // 49+ : wisdom & neutralisation
    phases.push({
        label: '49+ years: Wisdom & Neutralisation',
        years: `${birthYear + 49}+`,
        description:
            `After late forties and fifties, Mandi becomes more of a spiritual teacher than a pure affliction. ` +
            `The same ${focus} that once felt blocked can now become a zone of maturity, guidance and service ` +
            `to others. If remedies and conscious effort are applied, much of the earlier karma is digested, ` +
            `and the native can feel more detached and peaceful in this domain.`
    });

    return phases;
};

export const calculateMandi = (chartData, birthDetails) => {
    try {
        if (!birthDetails || !birthDetails.date || !birthDetails.time) return null;

        const birthDate = new Date(`${birthDetails.date}T${birthDetails.time}`);
        const { lat, lng } = birthDetails; // Assuming these are passed if available

        // 1. Calculate Sunrise/Sunset
        // Note: Real implementation needs astronomical algo. 
        // We will use the user's example logic structure.
        const { sunrise, sunset } = getSunTimes(new Date(birthDetails.date), lat, lng);

        // 2. Determine Day or Night Birth
        // If birthTime is between Sunrise and Sunset -> Day Birth
        // Else -> Night Birth
        // We need to handle time comparison carefully
        const birthTimeVal = birthDate.getTime();
        const sunriseVal = sunrise.getTime();
        const sunsetVal = sunset.getTime();

        let isDayBirth = birthTimeVal >= sunriseVal && birthTimeVal < sunsetVal;

        // 3. Calculate Duration and Segments
        let duration; // in milliseconds
        let startTime;

        if (isDayBirth) {
            duration = sunsetVal - sunriseVal;
            startTime = sunriseVal;
        } else {
            // Night duration: Sunset to Next Sunrise
            // Approx next sunrise is sunrise + 24h
            const nextSunriseVal = sunriseVal + (24 * 60 * 60 * 1000);

            // If birth is after sunset (e.g. 8 PM), it's in the first part of night
            // If birth is before sunrise (e.g. 2 AM), it's in the second part of night (technically next day date-wise but same night)

            // Adjust logic for night calculation
            if (birthTimeVal >= sunsetVal) {
                // Born after sunset, before midnight
                duration = nextSunriseVal - sunsetVal;
                startTime = sunsetVal;
            } else {
                // Born after midnight, before sunrise
                // Start time was yesterday's sunset
                const prevSunsetVal = sunsetVal - (24 * 60 * 60 * 1000);
                duration = sunriseVal - prevSunsetVal;
                startTime = prevSunsetVal;
            }
        }

        const segmentDuration = duration / 8;

        // 4. Determine Saturn's Segment using fixed day/night order
        // Day Order (Sunrise to Sunset): Sun → Moon → Mars → Mercury → Jupiter → Venus → Saturn → Rahu
        // Night Order (Sunset to Sunrise): Mercury → Moon → Saturn → Jupiter → Mars → Sun → Venus → Rahu
        // Mandi is always the segment ruled by Saturn.

        const dayOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'];
        const nightOrder = ['Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Rahu'];
        const order = isDayBirth ? dayOrder : nightOrder;

        // Saturn's segment index (1-based)
        const saturnIndex = order.indexOf('Saturn');
        const segmentIndex = saturnIndex >= 0 ? saturnIndex + 1 : 3; // Fallback to 3rd if not found

        // 5. Calculate Mandi Time
        // Mandi rises at the *beginning* of Saturn's segment (or middle/end depending on tradition, but usually start for position)
        // User says: "Saturn segment = ~21:30 to 22:53... Mandi in Leo"
        // This implies Mandi is located *within* that time.
        // We will take the mid-point of the segment to be safe, or the start.
        // Usually, the Ascendant at that specific time is the Mandi position.

        const mandiStartTime = startTime + ((segmentIndex - 1) * segmentDuration);
        const mandiEndTime = mandiStartTime + segmentDuration;
        const mandiTime = new Date(mandiStartTime + (segmentDuration / 2)); // Mid-point

        // 6. Calculate Mandi's Sign and House
        // We need the Ascendant at `mandiTime`.
        // Since we don't have an ephemeris engine here, we must approximate.
        // Ascendant moves ~1 sign (30 deg) every 2 hours.
        // We know the Birth Ascendant and Birth Time.
        // We can extrapolate.

        const birthAscLong = chartData.Ascendant?.longitude || 0;

        // Instead of extrapolating directly from birth time (which may be after the Saturn segment),
        // anchor at the sunrise that begins this day-night cycle, then move forward with ~15°/hr.
        // This better reflects the user's step-wise method using sunrise/sunset and night segments.

        // Determine the sunrise that starts the relevant day-night cycle (same as "day" used for sunset).
        let sunriseBaseVal;
        if (isDayBirth) {
            // Day birth: base sunrise is the same sunrise we already used
            sunriseBaseVal = sunriseVal;
        } else {
            // Night birth: the night belongs to the previous Vedic day, whose sunrise is one day earlier
            sunriseBaseVal = sunriseVal - (24 * 60 * 60 * 1000);
        }

        const msPerHour = 1000 * 60 * 60;
        const hoursFromBaseToBirth = (birthTimeVal - sunriseBaseVal) / msPerHour;
        const hoursFromBaseToMandi = (mandiTime.getTime() - sunriseBaseVal) / msPerHour;

        // Ascendant at base sunrise (unknown) solved from birth asc and linear motion
        // birthAsc = asc0 + 15° * hoursFromBaseToBirth  =>  asc0 = birthAsc - 15° * hoursFromBaseToBirth
        const asc0 = (birthAscLong - (15 * hoursFromBaseToBirth)) % 360;

        // Now move from base sunrise to Mandi time
        let mandiLong = (asc0 + (15 * hoursFromBaseToMandi)) % 360;
        if (mandiLong < 0) mandiLong += 360;

        const mandiRasi = Math.floor(mandiLong / 30);
        const birthAscRasi = Math.floor(birthAscLong / 30);

        // House (1-12)
        const house = ((mandiRasi - birthAscRasi + 12) % 12) + 1;

        const rasiNames = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ];

        return {
            sign: rasiNames[mandiRasi],
            house: house,
            time: mandiTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isDay: isDayBirth,
            segment: segmentIndex,
            interpretation: getMandiInterpretation(house, rasiNames[mandiRasi]),
            remedies: getMandiRemedies(house)
        };

    } catch (error) {
        console.error("Error calculating Mandi:", error);
        return null;
    }
};

const getMandiInterpretation = (house, sign) => {
    const interpretations = {
        1: "Health issues, heavy responsibilities, but strong resilience.",
        2: "Financial fluctuations, harsh speech, family disputes.",
        3: "Courage through struggle, conflicts with siblings.",
        4: "Emotional stress, property delays, mother's health concerns.",
        5: "Worries about children or education, creative blocks.",
        6: "Victory over enemies, but health needs care.",
        7: "Relationship challenges, delayed marriage or partner issues.",
        8: "Chronic health issues, sudden obstacles, spiritual depth.",
        9: "Struggles with father/gurus, unconventional spirituality.",
        10: "Career ups and downs, hard work with delayed recognition.",
        11: "Gains come with effort, few but loyal friends.",
        12: "Expenses, isolation, spiritual awakening through loss."
    };
    return interpretations[house] || "Karmic lessons and delays in this area.";
};

const getMandiRemedies = (house) => {
    return [
        "Feed crows on Saturdays (Saturn appeasement).",
        "Light a sesame oil lamp for Shani Dev on Saturdays.",
        "Donate black cloth or footwear to the needy.",
        "Recite Maha Mrityunjaya Mantra.",
        "Maintain peaceful relations with family."
    ];
};

// Saturn Transit Lookup (Approximate)
const saturnTransits = [
    { sign: 'Aquarius', start: 2023, end: 2025 },
    { sign: 'Pisces', start: 2025, end: 2028 },
    { sign: 'Aries', start: 2028, end: 2030 },
    { sign: 'Taurus', start: 2030, end: 2032 },
    { sign: 'Gemini', start: 2032, end: 2034 },
    { sign: 'Cancer', start: 2034, end: 2036 },
    { sign: 'Leo', start: 2036, end: 2039 },
    { sign: 'Virgo', start: 2039, end: 2041 },
    { sign: 'Libra', start: 2041, end: 2044 },
    { sign: 'Scorpio', start: 2044, end: 2046 },
    { sign: 'Sagittarius', start: 2046, end: 2049 },
    { sign: 'Capricorn', start: 2049, end: 2052 }
];

const rasiNames = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const calculateMandiTransits = (mandiSign, ascendantSign, startYear = 2025) => {
    const report = [];
    const mandiIndex = rasiNames.indexOf(mandiSign);
    const ascIndex = rasiNames.indexOf(ascendantSign);

    for (let year = startYear; year <= startYear + 7; year++) {
        const transit = saturnTransits.find(t => year >= t.start && year < t.end) || saturnTransits[saturnTransits.length - 1];
        const saturnSignIndex = rasiNames.indexOf(transit.sign);

        // House of Saturn from Ascendant
        const houseFromAsc = ((saturnSignIndex - ascIndex + 12) % 12) + 1;

        // Relation to Mandi
        // 1 = Conjunction, 4/10 = Square, 7 = Opposition, 5/9 = Trine
        const relationIndex = ((saturnSignIndex - mandiIndex + 12) % 12) + 1;

        let theme = "";
        let outcome = "";

        if (houseFromAsc === 11) {
            theme = "High-growth year";
            outcome = "Rise in financial stability, social prestige, investments yield results.";
        } else if (houseFromAsc === 12) {
            theme = "Health + Emotional Self-Care";
            outcome = "Sleep issues, feeling isolated, overseas expenses. Good for spirituality.";
        } else if (houseFromAsc === 1) {
            theme = "New Beginnings & Responsibility";
            outcome = "Personal growth, heavy duties, redefining self-identity.";
        } else if (houseFromAsc === 2) {
            theme = "Financial Restructuring";
            outcome = "Focus on savings, family responsibilities, speech needs caution.";
        } else if (houseFromAsc === 4) {
            theme = "Home & Stability";
            outcome = "Property matters, mother's health, finding inner peace.";
        } else {
            theme = `Saturn in ${transit.sign} (${houseFromAsc}th House)`;
            outcome = "Karmic lessons in this area of life.";
        }

        // Mandi Activation
        if (relationIndex === 1) {
            theme += " - Mandi Activation (Conjunction)";
            outcome += " Intense karmic pressure, emotional stress, but deep cleansing.";
        } else if (relationIndex === 4 || relationIndex === 10) {
            theme += " - Mandi Square";
            outcome += " Challenges forcing growth, obstacles to overcome.";
        } else if (relationIndex === 7) {
            theme += " - Mandi Opposition";
            outcome += " Relationship/External pressures triggering internal change.";
        } else if (relationIndex === 5 || relationIndex === 9) {
            theme += " - Mandi Trine (Favorable)";
            outcome += " Karmic rewards, support from elders/gurus, spiritual progress.";
        }

        report.push({
            year,
            sign: transit.sign,
            house: houseFromAsc,
            theme,
            outcome
        });
    }
    return report;
};

export const calculateMandiTriggerYears = (mandiSign, birthYear) => {
    const triggers = [];
    const mandiIndex = rasiNames.indexOf(mandiSign);

    // Saturn cycle is approx 29.5 years.
    // Key triggers: Conjunction (0), Square (7), Opposition (14), Square (21), Return (29.5)
    // We can approximate these ages.

    const ages = [
        { age: 7, type: "First Square", impact: "Early emotional wound / separation feeling" },
        { age: 14, type: "Opposition", impact: "Adolescent challenges / rebellion" },
        { age: 22, type: "Second Square", impact: "Career/Life path confusion" },
        { age: 29, type: "Saturn Return", impact: "Major life restructuring / Maturity" },
        { age: 37, type: "Square", impact: "Release phase begins / Financial improvement" },
        { age: 44, type: "Opposition", impact: "Karmic payoff window / Stability" },
        { age: 51, type: "Square", impact: "Spiritual shift / Inner clarity" },
        { age: 59, type: "Second Return", impact: "Mandi becomes neutralized / Legacy" }
    ];

    ages.forEach(item => {
        triggers.push({
            year: `${birthYear + item.age - 1}–${birthYear + item.age}`,
            impact: item.impact
        });
    });

    return triggers;
};

export const buildMandiReport = (basicMandi, ascendantSign, birthYear) => {
    if (!basicMandi || !basicMandi.sign || !basicMandi.house) return null;

    const lifePhases = buildLifePhases(basicMandi.house, basicMandi.sign, birthYear);
    const transits = calculateMandiTransits(basicMandi.sign, ascendantSign, 2025);
    const triggerYears = calculateMandiTriggerYears(basicMandi.sign, birthYear);
 
    const houseFocus = {
        1: 'self, body, health, identity and how you meet life',
        2: 'wealth, family, food, speech and core values',
        3: 'courage, siblings, efforts, communication and skills',
        4: 'home, mother, emotional security, real-estate and inner peace',
        5: 'children, education, romance and creative intelligence',
        6: 'workload, service, health, enemies and debts',
        7: 'marriage, partnerships, agreements and public dealings',
        8: 'longevity, sexuality, secrets, emergencies and deep transformation',
        9: 'dharma, blessings, father/mentors, higher learning and long journeys',
        10: 'career, karma, authority and visible status',
        11: 'income, gains, friends, networks and fulfilment of desires',
        12: 'sleep, isolation, losses, foreign lands and moksha tendencies'
    };

    const signStyle = {
        Aries: 'direct, fiery, impatient and action-driven',
        Taurus: 'steady, comfort-seeking, security-oriented and stubborn',
        Gemini: 'mental, scattered, curious and talkative',
        Cancer: 'emotional, protective, family-oriented and sensitive',
        Leo: 'royal, proud, expressive and recognition-seeking',
        Virgo: 'analytical, detail-focused, health-conscious and service-oriented',
        Libra: 'relationship-focused, diplomatic, harmony-seeking and image-conscious',
        Scorpio: 'intense, secretive, probing and transformative',
        Sagittarius: 'idealistic, philosophical, adventurous and blunt',
        Capricorn: 'disciplined, ambitious, practical and duty-bound',
        Aquarius: 'unconventional, humanitarian, futuristic and detached',
        Pisces: 'sensitive, mystical, imaginative and sacrificial'
    };

    const hFocus = houseFocus[basicMandi.house] || 'the life area where Mandi is placed';
    const sStyle = signStyle[basicMandi.sign] || 'the sign style through which this karma is expressed';

    const coreTheme = `Mandi in ${basicMandi.sign} in the ${basicMandi.house}th house creates a long-term karmic ` +
        `pressure around ${hFocus}, expressed in a ${sStyle} way. This makes the native unusually sensitive ` +
        `and cautious about this area, but also capable of great maturity here over time.`;

    const placementDetails = `Because Mandi sits in the ${basicMandi.house}th house (${hFocus}), situations here ` +
        `may initially feel heavy, delayed or unfair. With ${basicMandi.sign} energy, the native responds in a ` +
        `${sStyle} manner, which can sometimes exaggerate the stress but also becomes the exact tool through ` +
        `which they eventually master this domain.`;

    const strengthSummary = `Overall, this placement indicates moderate-to-strong karmic weight on ${hFocus}. ` +
        `When supported by benefic aspects or a strong house lord in the horoscope, much of the harshness is ` +
        `mitigated and the native can slowly convert suffering into responsibility and stability.`;

    const hiddenGifts = `The hidden gift of this Mandi is deep competence and empathy in matters of ${hFocus}. ` +
        `After repeatedly facing tests here, the native can become a guide for others in similar situations, ` +
        `and may gain lasting results where others give up.`;

    const spiritualMeaning = `Spiritually, this Mandi placement asks the native to detach from fear and control ` +
        `around ${hFocus}, and to treat this area as a field of seva (selfless service) rather than anxiety. ` +
        `Gradual acceptance, discipline and Saturn-oriented remedies help unlock this higher octave.`;

    const overallSummary = `In summary, Mandi in ${basicMandi.sign} in the ${basicMandi.house}th house shows that ` +
        `${hFocus} will not be handed easily, but with patience, remedies and conscious choices after the ` +
        `mid-thirties, this can become one of the most solid and wise parts of the native's life.`;

    return {
        ...basicMandi,
        ascendantSign,
        birthYear,
        coreTheme,
        placementDetails,
        strengthSummary,
        hiddenGifts,
        spiritualMeaning,
        overallSummary,
        lifePhases,
        transits,
        triggerYears
    };
};
