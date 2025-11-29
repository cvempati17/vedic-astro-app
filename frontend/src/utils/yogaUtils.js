// Utility to calculate Vedic Yogas

const getRasiNumber = (longitude) => Math.floor(longitude / 30);

// Helper: Get House number (1-12) for a planet relative to Ascendant
const getHouse = (planetLong, ascLong) => {
    const planetRasi = getRasiNumber(planetLong);
    const ascRasi = getRasiNumber(ascLong);
    return ((planetRasi - ascRasi + 12) % 12) + 1;
};

// Helper: Get Sign Lord
const getSignLord = (rasiNum) => {
    const lords = {
        0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon',
        4: 'Sun', 5: 'Mercury', 6: 'Venus', 7: 'Mars',
        8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter'
    };
    return lords[rasiNum];
};

// Helper: Get Planets in a specific House
const getPlanetsInHouse = (houseNum, data, ascLong) => {
    return Object.keys(data).filter(planet => {
        if (planet === 'Ascendant') return false;
        return getHouse(data[planet].longitude, ascLong) === houseNum;
    });
};

// Helper: Get Planets in a specific Sign
const getPlanetsInSign = (rasiNum, data) => {
    return Object.keys(data).filter(planet => {
        if (planet === 'Ascendant') return false;
        return getRasiNumber(data[planet].longitude) === rasiNum;
    });
};

// Helper: Check Conjunction
const checkConjunction = (p1, p2, data) => {
    return getRasiNumber(data[p1].longitude) === getRasiNumber(data[p2].longitude);
};

// Helper: Check Aspect (Simple Parashari - 7th aspect for all)
// Note: Full aspect logic is complex, using simple opposition for now + special aspects
const checkAspect = (looker, target, data) => {
    const lookerRasi = getRasiNumber(data[looker].longitude);
    const targetRasi = getRasiNumber(data[target].longitude);
    const diff = (targetRasi - lookerRasi + 12) % 12;

    if (diff === 6) return true; // 7th aspect (opposition)

    // Special Aspects
    if (looker === 'Mars' && (diff === 3 || diff === 7)) return true; // 4th, 8th
    if (looker === 'Jupiter' && (diff === 4 || diff === 8)) return true; // 5th, 9th
    if (looker === 'Saturn' && (diff === 2 || diff === 9)) return true; // 3rd, 10th

    return false;
};

export const calculateYogas = (data) => {
    if (!data || !data.Ascendant) return [];

    const yogas = [];
    const ascLong = data.Ascendant.longitude;
    const ascRasi = getRasiNumber(ascLong);

    // --- 1. Pancha Mahapurusha Yogas (5 Great Person Yogas) ---
    // Mars in Kendra + Own/Exalted -> Ruchaka
    const marsHouse = getHouse(data.Mars.longitude, ascLong);
    const marsRasi = getRasiNumber(data.Mars.longitude);
    if ([1, 4, 7, 10].includes(marsHouse)) {
        if ([0, 7, 9].includes(marsRasi)) { // Aries, Scorpio, Capricorn
            yogas.push({ name: 'Ruchaka Yoga', type: 'Mahapurusha', description: 'Mars in Kendra in Own/Exalted sign. Gives courage, strength, and leadership.' });
        }
    }

    // Mercury in Kendra + Own/Exalted -> Bhadra
    const mercHouse = getHouse(data.Mercury.longitude, ascLong);
    const mercRasi = getRasiNumber(data.Mercury.longitude);
    if ([1, 4, 7, 10].includes(mercHouse)) {
        if ([2, 5].includes(mercRasi)) { // Gemini, Virgo
            yogas.push({ name: 'Bhadra Yoga', type: 'Mahapurusha', description: 'Mercury in Kendra in Own/Exalted sign. Gives intelligence, wit, and communication skills.' });
        }
    }

    // Jupiter in Kendra + Own/Exalted -> Hamsa
    const jupHouse = getHouse(data.Jupiter.longitude, ascLong);
    const jupRasi = getRasiNumber(data.Jupiter.longitude);
    if ([1, 4, 7, 10].includes(jupHouse)) {
        if ([3, 8, 11].includes(jupRasi)) { // Cancer, Sag, Pisces
            yogas.push({ name: 'Hamsa Yoga', type: 'Mahapurusha', description: 'Jupiter in Kendra in Own/Exalted sign. Gives wisdom, spirituality, and respect.' });
        }
    }

    // Venus in Kendra + Own/Exalted -> Malavya
    const venHouse = getHouse(data.Venus.longitude, ascLong);
    const venRasi = getRasiNumber(data.Venus.longitude);
    if ([1, 4, 7, 10].includes(venHouse)) {
        if ([1, 6, 11].includes(venRasi)) { // Taurus, Libra, Pisces
            yogas.push({ name: 'Malavya Yoga', type: 'Mahapurusha', description: 'Venus in Kendra in Own/Exalted sign. Gives beauty, luxury, and artistic talent.' });
        }
    }

    // Saturn in Kendra + Own/Exalted -> Sasa
    const satHouse = getHouse(data.Saturn.longitude, ascLong);
    const satRasi = getRasiNumber(data.Saturn.longitude);
    if ([1, 4, 7, 10].includes(satHouse)) {
        if ([9, 10, 6].includes(satRasi)) { // Cap, Aq, Libra
            yogas.push({ name: 'Sasa Yoga', type: 'Mahapurusha', description: 'Saturn in Kendra in Own/Exalted sign. Gives discipline, authority, and longevity.' });
        }
    }

    // --- 2. Solar Yogas (Sun) ---
    // Budhaditya: Sun + Mercury conjunction
    if (checkConjunction('Sun', 'Mercury', data)) {
        yogas.push({ name: 'Budhaditya Yoga', type: 'Auspicous', description: 'Sun and Mercury together. Gives intelligence and skill in calculations.' });
    }

    // Vesi: Planet (except Moon/Rahu/Ketu) in 2nd from Sun
    const sunRasi = getRasiNumber(data.Sun.longitude);
    const secondFromSun = (sunRasi + 1) % 12;
    const planetsIn2ndFromSun = getPlanetsInSign(secondFromSun, data).filter(p => !['Moon', 'Rahu', 'Ketu'].includes(p));
    if (planetsIn2ndFromSun.length > 0) {
        yogas.push({ name: 'Vesi Yoga', type: 'Solar', description: 'Planet in 2nd from Sun. Gives good speech and wealth.' });
    }

    // Vasi: Planet (except Moon/Rahu/Ketu) in 12th from Sun
    const twelfthFromSun = (sunRasi + 11) % 12;
    const planetsIn12thFromSun = getPlanetsInSign(twelfthFromSun, data).filter(p => !['Moon', 'Rahu', 'Ketu'].includes(p));
    if (planetsIn12thFromSun.length > 0) {
        yogas.push({ name: 'Vasi Yoga', type: 'Solar', description: 'Planet in 12th from Sun. Gives fame and skill.' });
    }

    // Ubhayachari: Planets in both 2nd and 12th from Sun
    if (planetsIn2ndFromSun.length > 0 && planetsIn12thFromSun.length > 0) {
        yogas.push({ name: 'Ubhayachari Yoga', type: 'Solar', description: 'Planets in 2nd and 12th from Sun. Gives a balanced and successful life.' });
    }

    // --- 3. Lunar Yogas (Moon) ---
    // Gaja Kesari: Jupiter in Kendra from Moon
    const moonLong = data.Moon.longitude;
    const jupFromMoon = getHouse(data.Jupiter.longitude, moonLong);
    if ([1, 4, 7, 10].includes(jupFromMoon)) {
        yogas.push({ name: 'Gaja Kesari Yoga', type: 'Auspicous', description: 'Jupiter in Kendra from Moon. Gives fame, virtue, and lasting reputation.' });
    }

    // Chandra Mangala: Moon + Mars conjunction
    if (checkConjunction('Moon', 'Mars', data)) {
        yogas.push({ name: 'Chandra Mangala Yoga', type: 'Wealth', description: 'Moon and Mars together. Gives earnings and financial acumen.' });
    }

    // Sunapha: Planet (except Sun) in 2nd from Moon
    const moonRasi = getRasiNumber(moonLong);
    const secondFromMoon = (moonRasi + 1) % 12;
    const planetsIn2ndFromMoon = getPlanetsInSign(secondFromMoon, data).filter(p => !['Sun', 'Rahu', 'Ketu'].includes(p));
    if (planetsIn2ndFromMoon.length > 0) {
        yogas.push({ name: 'Sunapha Yoga', type: 'Lunar', description: 'Planet in 2nd from Moon. Gives intelligence and wealth.' });
    }

    // Anapha: Planet (except Sun) in 12th from Moon
    const twelfthFromMoon = (moonRasi + 11) % 12;
    const planetsIn12thFromMoon = getPlanetsInSign(twelfthFromMoon, data).filter(p => !['Sun', 'Rahu', 'Ketu'].includes(p));
    if (planetsIn12thFromMoon.length > 0) {
        yogas.push({ name: 'Anapha Yoga', type: 'Lunar', description: 'Planet in 12th from Moon. Gives health and good manners.' });
    }

    // Durudhara: Planets in both 2nd and 12th from Moon
    if (planetsIn2ndFromMoon.length > 0 && planetsIn12thFromMoon.length > 0) {
        yogas.push({ name: 'Durudhara Yoga', type: 'Lunar', description: 'Planets in 2nd and 12th from Moon. Gives wealth and comforts.' });
    }

    // Kemadruma: No planets in 2nd or 12th from Moon (and no Kendra support - simplified)
    if (planetsIn2ndFromMoon.length === 0 && planetsIn12thFromMoon.length === 0) {
        // Check for cancellation (Planets in Kendra from Moon or Lagna)
        const planetsInKendraFromMoon = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].some(p => [1, 4, 7, 10].includes(getHouse(data[p].longitude, moonLong)));
        if (!planetsInKendraFromMoon) {
            yogas.push({ name: 'Kemadruma Yoga', type: 'Inauspicious', description: 'No planets flanking Moon. Can indicate loneliness or struggles.' });
        }
    }

    // --- 4. Raj Yogas (Royal Union) ---
    // Lords of Kendra (1, 4, 7, 10) and Trikona (1, 5, 9) conjunction or aspect
    // Simplified: Check Conjunctions of specific lords
    // We need a way to get the Lord of a House
    const getLordOfHouse = (houseNum) => {
        const signInHouse = (ascRasi + houseNum - 1) % 12;
        return getSignLord(signInHouse);
    };

    const lord1 = getLordOfHouse(1);
    const lord4 = getLordOfHouse(4);
    const lord5 = getLordOfHouse(5);
    const lord7 = getLordOfHouse(7);
    const lord9 = getLordOfHouse(9);
    const lord10 = getLordOfHouse(10);

    // Dharma-Karma Adhipati Yoga (9th and 10th Lords)
    if (checkConjunction(lord9, lord10, data)) {
        yogas.push({ name: 'Dharma-Karma Adhipati Yoga', type: 'Raj Yoga', description: 'Conjunction of 9th and 10th Lords. Highly auspicious for career and dharma.' });
    }

    // 1st and 5th
    if (checkConjunction(lord1, lord5, data)) {
        yogas.push({ name: 'Raj Yoga (1-5)', type: 'Raj Yoga', description: 'Conjunction of 1st and 5th Lords. Gives fame and intelligence.' });
    }
    // 1st and 9th
    if (checkConjunction(lord1, lord9, data)) {
        yogas.push({ name: 'Raj Yoga (1-9)', type: 'Raj Yoga', description: 'Conjunction of 1st and 9th Lords. Gives fortune and personal power.' });
    }
    // 4th and 5th
    if (checkConjunction(lord4, lord5, data)) {
        yogas.push({ name: 'Raj Yoga (4-5)', type: 'Raj Yoga', description: 'Conjunction of 4th and 5th Lords. Gives happiness and status.' });
    }
    // 4th and 9th
    if (checkConjunction(lord4, lord9, data)) {
        yogas.push({ name: 'Raj Yoga (4-9)', type: 'Raj Yoga', description: 'Conjunction of 4th and 9th Lords. Gives property and luck.' });
    }
    // 5th and 10th
    if (checkConjunction(lord5, lord10, data)) {
        yogas.push({ name: 'Raj Yoga (5-10)', type: 'Raj Yoga', description: 'Conjunction of 5th and 10th Lords. Excellent for profession.' });
    }

    // --- 5. Dhan Yogas (Wealth) ---
    const lord2 = getLordOfHouse(2);
    const lord11 = getLordOfHouse(11);

    // 2nd and 11th
    if (checkConjunction(lord2, lord11, data)) {
        yogas.push({ name: 'Dhan Yoga (2-11)', type: 'Wealth', description: 'Conjunction of 2nd and 11th Lords. Great wealth.' });
    }
    // 5th and 9th (Lakshmi Yoga variant)
    if (checkConjunction(lord5, lord9, data)) {
        yogas.push({ name: 'Dhan Yoga (5-9)', type: 'Wealth', description: 'Conjunction of 5th and 9th Lords. Wealth through speculation or luck.' });
    }
    // 2nd and 5th
    if (checkConjunction(lord2, lord5, data)) {
        yogas.push({ name: 'Dhan Yoga (2-5)', type: 'Wealth', description: 'Conjunction of 2nd and 5th Lords. Wealth through intelligence.' });
    }
    // 2nd and 9th
    if (checkConjunction(lord2, lord9, data)) {
        yogas.push({ name: 'Dhan Yoga (2-9)', type: 'Wealth', description: 'Conjunction of 2nd and 9th Lords. Inherited wealth or luck.' });
    }

    // --- 6. Vipareeta Raj Yogas (Reversal) ---
    const lord6 = getLordOfHouse(6);
    const lord8 = getLordOfHouse(8);
    const lord12 = getLordOfHouse(12);

    // Harsha Yoga (6th Lord in 6th)
    if (getHouse(data[lord6].longitude, ascLong) === 6) {
        yogas.push({ name: 'Harsha Yoga', type: 'Vipareeta', description: '6th Lord in 6th House. Victory over enemies.' });
    }
    // Sarala Yoga (8th Lord in 8th)
    if (getHouse(data[lord8].longitude, ascLong) === 8) {
        yogas.push({ name: 'Sarala Yoga', type: 'Vipareeta', description: '8th Lord in 8th House. Longevity and fearlessness.' });
    }
    // Vimala Yoga (12th Lord in 12th)
    if (getHouse(data[lord12].longitude, ascLong) === 12) {
        yogas.push({ name: 'Vimala Yoga', type: 'Vipareeta', description: '12th Lord in 12th House. Independence and savings.' });
    }

    // --- 7. Other Important Yogas ---
    // Amala Yoga: Benefic (Jup, Ven, Merc) in 10th from Asc or Moon
    const benefics = ['Jupiter', 'Venus', 'Mercury'];
    const tenthFromAsc = getPlanetsInHouse(10, data, ascLong);
    const tenthFromMoon = getPlanetsInHouse(10, data, moonLong);

    if (tenthFromAsc.some(p => benefics.includes(p)) || tenthFromMoon.some(p => benefics.includes(p))) {
        yogas.push({ name: 'Amala Yoga', type: 'Auspicous', description: 'Benefic in 10th House. Gives professional success and good reputation.' });
    }

    // Parivartana Yoga (Exchange of Signs) - Simplified check for a few pairs
    // Example: 1st and 2nd Lords exchange
    const houseOfLord1 = getHouse(data[lord1].longitude, ascLong);
    const houseOfLord2 = getHouse(data[lord2].longitude, ascLong);
    if (houseOfLord1 === 2 && houseOfLord2 === 1) {
        yogas.push({ name: 'Parivartana Yoga (1-2)', type: 'Exchange', description: 'Exchange of 1st and 2nd Lords. Wealth and self-effort.' });
    }
    const houseOfLord9 = getHouse(data[lord9].longitude, ascLong);
    const houseOfLord10 = getHouse(data[lord10].longitude, ascLong);
    if (houseOfLord9 === 10 && houseOfLord10 === 9) {
        yogas.push({ name: 'Parivartana Yoga (9-10)', type: 'Exchange', description: 'Exchange of 9th and 10th Lords. Powerful Raj Yoga.' });
    }

    // Neecha Bhanga Raj Yoga (Cancellation of Debilitation) - Simplified
    // If a planet is debilitated, but its dispositor is in Kendra from Lagna or Moon
    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].forEach(planet => {
        // Check debilitation (simplified logic from strengthUtils)
        // ... (omitted for brevity, assuming we check if planet is in debilitated sign)
    });

    // --- 8. Additional Requested Yogas ---

    // Helper for Planet Strength (Exalted/Own)
    const isStrong = (planetName, planetLong) => {
        const rasi = getRasiNumber(planetLong);
        const rules = {
            Sun: { ex: 0, own: [4] },
            Moon: { ex: 1, own: [3] },
            Mars: { ex: 9, own: [0, 7] },
            Mercury: { ex: 5, own: [2, 5] },
            Jupiter: { ex: 3, own: [8, 11] },
            Venus: { ex: 11, own: [1, 6] },
            Saturn: { ex: 6, own: [9, 10] }
        };
        const rule = rules[planetName];
        if (!rule) return false;
        return rasi === rule.ex || rule.own.includes(rasi);
    };

    const isDebilitated = (planetName, planetLong) => {
        const rasi = getRasiNumber(planetLong);
        const rules = {
            Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0
        };
        return rasi === rules[planetName];
    };

    // Adhi Yoga: Benefics (Jup, Ven, Merc) in 6th, 7th, 8th from Moon
    const beneficsList = ['Jupiter', 'Venus', 'Mercury'];
    const adhiHouses = [6, 7, 8];
    const beneficsInAdhi = beneficsList.filter(p => {
        const houseFromMoon = getHouse(data[p].longitude, moonLong);
        return adhiHouses.includes(houseFromMoon);
    });
    if (beneficsInAdhi.length >= 2) { // At least 2 benefics for significant effect
        yogas.push({ name: 'Adhi Yoga', type: 'Auspicous', description: 'Benefics in 6th, 7th, 8th from Moon. Gives leadership, stability, and health.' });
    }

    // Vasumathi Yoga: Benefics in Upachayas (3, 6, 10, 11) from Moon or Lagna
    const upachayas = [3, 6, 10, 11];
    const beneficsInUpachayaLagna = beneficsList.filter(p => upachayas.includes(getHouse(data[p].longitude, ascLong)));
    const beneficsInUpachayaMoon = beneficsList.filter(p => upachayas.includes(getHouse(data[p].longitude, moonLong)));

    if (beneficsInUpachayaLagna.length === 3 || beneficsInUpachayaMoon.length === 3) {
        yogas.push({ name: 'Vasumathi Yoga', type: 'Wealth', description: 'All benefics in Upachaya houses. Gives immense wealth and independence.' });
    }

    // Sakata Yoga: Moon in 6, 8, 12 from Jupiter AND not in Kendra from Lagna
    const moonFromJup = getHouse(moonLong, data.Jupiter.longitude);
    const moonFromLagna = getHouse(moonLong, ascLong);
    if ([6, 8, 12].includes(moonFromJup) && ![1, 4, 7, 10].includes(moonFromLagna)) {
        yogas.push({ name: 'Sakata Yoga', type: 'Inauspicious', description: 'Moon in 6/8/12 from Jupiter. Can bring fluctuations in fortune.' });
    }

    // Lakshmi Yoga: Lord of 9th in Kendra/Trikona + Lord of 1st Strong
    const lord9House = getHouse(data[lord9].longitude, ascLong);
    const isLord1Strong = isStrong(lord1, data[lord1].longitude);
    if ([1, 4, 5, 7, 9, 10].includes(lord9House) && isLord1Strong) {
        yogas.push({ name: 'Lakshmi Yoga', type: 'Wealth', description: '9th Lord well-placed and Ascendant Lord strong. Gives wealth, beauty, and grace.' });
    }

    // Jaya Yoga: Lord of 10th Exalted + Lord of 6th Debilitated
    const isLord10Exalted = getRasiNumber(data[lord10].longitude) === (lord10 === 'Mercury' ? 5 : (lord10 === 'Saturn' ? 6 : (lord10 === 'Mars' ? 9 : (lord10 === 'Jupiter' ? 3 : (lord10 === 'Venus' ? 11 : (lord10 === 'Sun' ? 0 : (lord10 === 'Moon' ? 1 : -1)))))));
    const isLord6Debilitated = isDebilitated(lord6, data[lord6].longitude);

    if (isLord10Exalted && isLord6Debilitated) {
        yogas.push({ name: 'Jaya Yoga', type: 'Auspicous', description: '10th Lord Exalted and 6th Lord Debilitated. Victory over enemies and success.' });
    }

    // Saraswathi Yoga: Jup, Ven, Merc in Kendra/Trikona/2nd + Jupiter Strong
    const validHouses = [1, 2, 4, 5, 7, 9, 10];
    const areBeneficsPlaced = beneficsList.every(p => validHouses.includes(getHouse(data[p].longitude, ascLong)));
    const isJupiterStrong = isStrong('Jupiter', data.Jupiter.longitude);

    if (areBeneficsPlaced && isJupiterStrong) {
        yogas.push({ name: 'Saraswathi Yoga', type: 'Auspicous', description: 'Benefics in good houses and Jupiter strong. Gives wisdom, learning, and artistic skills.' });
    }

    return yogas;
};
