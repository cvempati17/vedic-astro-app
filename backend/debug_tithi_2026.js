const { calculatePanchang, TITHIS } = require('./utils/panchang');
const sweph = require('sweph');

// Configuration
const location = { lat: 17.3850, lng: 78.4867 }; // Hyderabad
const inputDate = '2003-12-28';
const inputTime = '16:50';

console.log("--- 1. CALCULATING SOURCE DETAILS ---");
const p = calculatePanchang(inputDate, inputTime, location.lat, location.lng, 5.5);
console.log(`Date: ${inputDate}, Tithi: ${p.tithi.name} (${p.tithi.paksha}), Index: ${p.tithi.index}`);

// Backtrack for Month
const dDaysSinceNM = p.tithi.index;
const dNMDate = new Date(inputDate);
dNMDate.setDate(new Date(inputDate).getDate() - dDaysSinceNM);
const dNMStr = dNMDate.toISOString().split('T')[0];
const dNMPan = calculatePanchang(dNMStr, "12:00", location.lat, location.lng, 5.5);
const dNMSunSign = Math.floor(dNMPan.positions.Sun.longitude / 30);
const amantaMonthIndex = (dNMSunSign + 1) % 12; // 0=Chaitra
const HINDU_MONTHS_Amanta = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];

console.log(`New Moon Date: ${dNMStr}`);
console.log(`NM Sun Sign Index: ${dNMSunSign} -> Amanta Month: ${HINDU_MONTHS_Amanta[amantaMonthIndex]}`);

const targetTithiIndex = p.tithi.index;
const targetMonthIndex = amantaMonthIndex;

console.log(`\n--- 2. SEARCHING 2026 for ${HINDU_MONTHS_Amanta[targetMonthIndex]} - ${p.tithi.name} ---`);
searchYear(2026, targetTithiIndex, targetMonthIndex);

console.log(`\n--- 3. SEARCHING 2025 for Check ---`);
searchYear(2025, targetTithiIndex, targetMonthIndex);

console.log(`\n--- 4. SEARCHING 2027 for Check ---`);
searchYear(2027, targetTithiIndex, targetMonthIndex);


function searchYear(year, tTithi, tMonth) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    let foundCount = 0;

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        try {
            const p = calculatePanchang(dateStr, "12:00", location.lat, location.lng, 5.5);
            if (p.tithi.index === tTithi) {
                // Check Month
                const days = p.tithi.index;
                const nmDate = new Date(d);
                nmDate.setDate(d.getDate() - days);
                const nmStr = nmDate.toISOString().split('T')[0];
                const nmP = calculatePanchang(nmStr, "12:00", location.lat, location.lng, 5.5);
                const nmSun = Math.floor(nmP.positions.Sun.longitude / 30);
                const mIdx = (nmSun + 1) % 12;

                if (mIdx === tMonth) {
                    console.log(`MATCH FOUND: ${dateStr} | Month: ${HINDU_MONTHS_Amanta[mIdx]}`);
                    foundCount++;
                }
            }
        } catch (e) { }
    }
    if (foundCount === 0) console.log("No dates found.");
}
