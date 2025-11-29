// Divisional Chart (Varga) calculations

// Helper: Get Sign (0-11)
const getSign = (long) => Math.floor(long / 30);
// Helper: Get Degree in Sign (0-30)
const getDeg = (long) => long % 30;
// Helper: Normalize to 0-360
const norm = (deg) => (deg + 360) % 360;

// --- D-1: Rasi (Birth Chart) ---
export const calculateD1 = (long) => long;

// --- D-2: Hora (Wealth) ---
// Odd Signs: 0-15 Sun (Leo-4), 15-30 Moon (Cancer-3)
// Even Signs: 0-15 Moon (Cancer-3), 15-30 Sun (Leo-4)
export const calculateD2 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    const isOdd = sign % 2 === 0; // Aries is 0 (Odd sign in Astro, Even index in 0-based? No. 0=Aries=Odd)
    // Wait, 0=Aries(Odd), 1=Taurus(Even). So sign%2===0 is Odd.

    let targetSign;
    if (isOdd) {
        targetSign = deg < 15 ? 4 : 3; // Sun(Leo), Moon(Cancer)
    } else {
        targetSign = deg < 15 ? 3 : 4; // Moon(Cancer), Sun(Leo)
    }
    return targetSign * 30 + (deg * 2) % 30; // Scale degree to fill sign
};

// --- D-3: Drekkana (Siblings) ---
// 0-10: Same, 10-20: 5th, 20-30: 9th
export const calculateD3 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    let shift = 0;
    if (deg >= 10 && deg < 20) shift = 4; // 5th sign
    if (deg >= 20) shift = 8; // 9th sign
    const targetSign = (sign + shift) % 12;
    return targetSign * 30 + (deg * 3) % 30;
};

// --- D-4: Chaturthamsa (Fortune) ---
// 0-7.5: Same, 7.5-15: 4th, 15-22.5: 7th, 22.5-30: 10th
export const calculateD4 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    const part = Math.floor(deg / 7.5); // 0, 1, 2, 3
    const shifts = [0, 3, 6, 9]; // 1st, 4th, 7th, 10th
    const targetSign = (sign + shifts[part]) % 12;
    return targetSign * 30 + (deg * 4) % 30;
};

// --- D-7: Saptamsa (Children) ---
// Odd: Count from same. Even: Count from 7th.
export const calculateD7 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    const part = Math.floor(deg / (30 / 7)); // 0-6
    const isOdd = sign % 2 === 0;
    const startSign = isOdd ? sign : (sign + 6) % 12;
    const targetSign = (startSign + part) % 12;
    return targetSign * 30 + (deg * 7) % 30;
};

// --- D-9: Navamsa (Spouse/Dharma) ---
// 1/9th parts. Start from movable (1,10,7) logic?
// Easier: ((sign * 9) + part) % 12?
// Standard: Fire(1,5,9) -> Aries; Earth(2,6,10) -> Cap; Air(3,7,11) -> Libra; Water(4,8,12) -> Cancer
// Wait, that's not the standard formula.
// Correct: Count from Aries(1), Capricorn(10), Libra(7), Cancer(4) based on element.
// Or simply: Absolute Navamsa Index = (Total Deg / 3.333) % 12.
export const calculateD9 = (long) => {
    const totalMin = long * 60;
    const navamsaSpan = 200; // 3deg 20min = 200 min
    const index = Math.floor(totalMin / navamsaSpan);
    const targetSign = index % 12;
    return targetSign * 30 + (long * 9) % 30;
};

// --- D-10: Dasamsa (Profession) ---
// Odd: Same. Even: 9th.
export const calculateD10 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    const part = Math.floor(deg / 3); // 0-9
    const isOdd = sign % 2 === 0;
    const startSign = isOdd ? sign : (sign + 8) % 12;
    const targetSign = (startSign + part) % 12;
    return targetSign * 30 + (deg * 10) % 30;
};

// --- D-12: Dwadasamsa (Parents) ---
// Count from same sign.
export const calculateD12 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    const part = Math.floor(deg / 2.5); // 0-11
    const targetSign = (sign + part) % 12;
    return targetSign * 30 + (deg * 12) % 30;
};

// --- D-16: Shodasamsa (Vehicles) ---
// Moveable(1,4,7,10): Aries. Fixed(2,5,8,11): Leo. Dual(3,6,9,12): Sag.
export const calculateD16 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    const part = Math.floor(deg / (30 / 16)); // 0-15

    let startSign;
    if ([0, 3, 6, 9].includes(sign)) startSign = 0; // Aries (Movable)
    else if ([1, 4, 7, 10].includes(sign)) startSign = 4; // Leo (Fixed)
    else startSign = 8; // Sag (Dual)

    // Martandamsa variation: Odd->Aries, Even->Pisces (Reverse).
    // Parashara: Movable->Aries, Fixed->Leo, Dual->Sag.
    const targetSign = (startSign + part) % 12;
    return targetSign * 30 + (deg * 16) % 30;
};

// --- D-20: Vimsamsa (Spiritual) ---
// Moveable: Aries. Fixed: Sag. Dual: Leo. (Note: Fixed/Dual swapped compared to D16 usually)
// Parashara: Movable->Aries, Fixed->Sag, Dual->Leo.
export const calculateD20 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    const part = Math.floor(deg / 1.5); // 0-19

    let startSign;
    if ([0, 3, 6, 9].includes(sign)) startSign = 0; // Aries
    else if ([1, 4, 7, 10].includes(sign)) startSign = 8; // Sag
    else startSign = 4; // Leo

    const targetSign = (startSign + part) % 12;
    return targetSign * 30 + (deg * 20) % 30;
};

// --- D-24: Chaturvimsamsa (Education) ---
// Odd: Leo. Even: Cancer.
export const calculateD24 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    const part = Math.floor(deg / 1.25); // 0-23
    const isOdd = sign % 2 === 0;
    const startSign = isOdd ? 4 : 3; // Leo : Cancer
    const targetSign = (startSign + part) % 12;
    return targetSign * 30 + (deg * 24) % 30;
};

// --- D-27: Saptavimsamsa (Strength) ---
// Fiery: Aries. Earthy: Cancer. Airy: Libra. Watery: Cap.
export const calculateD27 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    const part = Math.floor(deg / (30 / 27)); // 0-26

    const element = sign % 4; // 0=Fire, 1=Earth, 2=Air, 3=Water
    let startSign;
    if (element === 0) startSign = 0; // Aries
    else if (element === 1) startSign = 3; // Cancer
    else if (element === 2) startSign = 6; // Libra
    else startSign = 9; // Cap

    const targetSign = (startSign + part) % 12;
    return targetSign * 30 + (deg * 27) % 30;
};

// --- D-30: Trimsamsa (Evils) ---
// Odd: 0-5 Mars(0), 5-10 Sat(10), 10-18 Jup(8), 18-25 Merc(2), 25-30 Ven(6)
// Even: 0-5 Ven(1), 5-12 Merc(5), 12-20 Jup(11), 20-25 Sat(9), 25-30 Mars(7)
// Note: Signs are Aries(0), Aq(10), Sag(8), Gem(2), Lib(6) etc.
export const calculateD30 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    const isOdd = sign % 2 === 0;

    let targetSign;
    if (isOdd) {
        if (deg < 5) targetSign = 0; // Aries
        else if (deg < 10) targetSign = 10; // Aquarius
        else if (deg < 18) targetSign = 8; // Sagittarius
        else if (deg < 25) targetSign = 2; // Gemini
        else targetSign = 6; // Libra
    } else {
        if (deg < 5) targetSign = 1; // Taurus
        else if (deg < 12) targetSign = 5; // Virgo
        else if (deg < 20) targetSign = 11; // Pisces
        else if (deg < 25) targetSign = 9; // Capricorn
        else targetSign = 7; // Scorpio
    }
    return targetSign * 30 + (deg * 30) % 30; // Scale arbitrary
};

// --- D-40: Khavedamsa (Auspicious) ---
// Odd: Aries. Even: Libra.
export const calculateD40 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    const part = Math.floor(deg / (30 / 40));
    const isOdd = sign % 2 === 0;
    const startSign = isOdd ? 0 : 6; // Aries : Libra
    const targetSign = (startSign + part) % 12;
    return targetSign * 30 + (deg * 40) % 30;
};

// --- D-45: Akshavedamsa (General) ---
// Moveable: Aries. Fixed: Leo. Dual: Sag.
export const calculateD45 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    const part = Math.floor(deg / (30 / 45));

    let startSign;
    if ([0, 3, 6, 9].includes(sign)) startSign = 0; // Aries
    else if ([1, 4, 7, 10].includes(sign)) startSign = 4; // Leo
    else startSign = 8; // Sag

    const targetSign = (startSign + part) % 12;
    return targetSign * 30 + (deg * 45) % 30;
};

// --- D-60: Shastiamsa (Karma) ---
// Ignore sign, count from sign itself?
// Parashara: "Multiply longitude by 2..." No, that's simple logic.
// Standard: Each part 0.5 deg. Count from the sign itself.
export const calculateD60 = (long) => {
    const sign = getSign(long);
    const deg = getDeg(long);
    const part = Math.floor(deg / 0.5); // 0-59
    const targetSign = (sign + part) % 12;
    return targetSign * 30 + (deg * 60) % 30;
};

// --- Bhava Chalit (Equal House) ---
// House 1 Center = Ascendant. Span: Asc +/- 15 deg.
export const calculateBhavaChalit = (long, ascLong) => {
    const angleFromAsc = (long - ascLong + 360 + 15) % 360;
    const houseIndex = Math.floor(angleFromAsc / 30); // 0 = 1st House, 1 = 2nd House...

    // Map to the Sign corresponding to that House relative to Ascendant Sign
    const ascSign = getSign(ascLong);
    const targetSign = (ascSign + houseIndex) % 12;

    // Keep the original degree within the sign for display purposes? 
    // Or just place it in the center of the sign?
    // Let's keep the relative position in the house.
    const degInHouse = angleFromAsc % 30;
    return targetSign * 30 + degInHouse;
};

// --- Main Calculator ---
export const calculateDivisionalCharts = (longitude) => {
    return {
        d1: calculateD1(longitude),
        // ... other existing calls ...
        d60: calculateD60(longitude)
    };
};

export const getDivisionalChartName = (division) => {
    const names = {
        d1: 'Rasi (D-1)',
        d2: 'Hora (D-2)',
        d3: 'Drekkana (D-3)',
        d4: 'Chaturthamsa (D-4)',
        d7: 'Saptamsa (D-7)',
        d9: 'Navamsa (D-9)',
        d10: 'Dasamsa (D-10)',
        d12: 'Dwadasamsa (D-12)',
        d16: 'Shodasamsa (D-16)',
        d20: 'Vimsamsa (D-20)',
        d24: 'Chaturvimsamsa (D-24)',
        d27: 'Saptavimsamsa (D-27)',
        d30: 'Trimsamsa (D-30)',
        d40: 'Khavedamsa (D-40)',
        d45: 'Akshavedamsa (D-45)',
        d60: 'Shastiamsa (D-60)',
        bhava: 'Bhava Chalit (Houses)'
    };
    return names[division] || division.toUpperCase();
};

export const transformToVarga = (birthData, vargaKey) => {
    if (!birthData) return null;
    const vargaData = {};

    // Special handling for Bhava Chalit which needs Ascendant
    if (vargaKey === 'bhava') {
        const ascLong = birthData.Ascendant?.longitude || 0;
        Object.entries(birthData).forEach(([planet, info]) => {
            if (info.longitude !== undefined) {
                vargaData[planet] = {
                    ...info,
                    longitude: calculateBhavaChalit(info.longitude, ascLong),
                    originalLongitude: info.longitude
                };
            }
        });
        return vargaData;
    }

    const calcFuncs = {
        d1: calculateD1, d2: calculateD2, d3: calculateD3, d4: calculateD4,
        d7: calculateD7, d9: calculateD9, d10: calculateD10, d12: calculateD12,
        d16: calculateD16, d20: calculateD20, d24: calculateD24, d27: calculateD27,
        d30: calculateD30, d40: calculateD40, d45: calculateD45, d60: calculateD60
    };
    const calc = calcFuncs[vargaKey] || calculateD1;

    Object.entries(birthData).forEach(([planet, info]) => {
        if (info.longitude !== undefined) {
            vargaData[planet] = {
                ...info,
                longitude: calc(info.longitude),
                originalLongitude: info.longitude
            };
        }
    });
    return vargaData;
};

export const transformToNavamsa = (data) => transformToVarga(data, 'd9');

