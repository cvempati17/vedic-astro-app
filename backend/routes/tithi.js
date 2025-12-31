const express = require('express');
const router = express.Router();
const { calculatePanchang, TITHIS } = require('../utils/panchang');
const sweph = require('sweph');

// Tithi mapping helpers
const HINDU_MONTHS_Amanta = [
    "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
    "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"
];

// Router for Tithi Calculation
router.post('/calculate', async (req, res) => {
    try {
        const { mode, year, inputDate, hinduDate, location } = req.body;
        // location = { lat, lng }

        let targetTithiIndex = 0; // 1-30
        let targetMonthIndex = 0; // 0-11 (Chaitra=0) relative to Sun entry into Aries
        let targetSolarMonth = 0; // Sun Sign index (0 = Aries/Mesha -> Chaitra approx)

        let searchYear = parseInt(year);

        if (mode === 'gregorian') {
            const timeToUse = req.body.inputTime || "12:00";
            const panchang = calculatePanchang(inputDate, timeToUse, location.lat, location.lng, 5.5);
            targetTithiIndex = panchang.tithi.index; // 1-30

            // Correct Lunar Month Calculation based on PREVIOUS New Moon
            const daysSinceNewMoon = panchang.tithi.index;
            const approxNewMoonDate = new Date(inputDate);
            approxNewMoonDate.setDate(approxNewMoonDate.getDate() - daysSinceNewMoon); // Backtrack
            const nmDateStr = approxNewMoonDate.toISOString().split('T')[0];

            // Get Sun Sign at previous New Moon
            const nmPanchang = calculatePanchang(nmDateStr, "12:00", location.lat, location.lng, 5.5);
            const sunSignAtNM = Math.floor(nmPanchang.positions.Sun.longitude / 30);

            // Map Sun Sign at NM to Amanta Month (Standard)
            // Aquarius (10) -> Phalguna (11) | Pisces (11) -> Chaitra (0)
            const amantaMonthIndex = (sunSignAtNM + 1) % 12;
            const amantaMonthName = HINDU_MONTHS_Amanta[amantaMonthIndex];

            // Purnimanta (North): Starts 1 fortnight earlier in name (Krishna Paksha diff)
            let purnimantaMonthName = amantaMonthName;
            if (panchang.tithi.paksha === 'Krishna') {
                const pIdx = (amantaMonthIndex + 1) % 12;
                purnimantaMonthName = HINDU_MONTHS_Amanta[pIdx];
            }

            // Tamil Month: Based on Current Sun Sign
            const TAMIL_MONTHS = [
                "Chithirai", "Vaikasi", "Aani", "Aadi", "Avani", "Purhattasi",
                "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni"
            ];
            const currentSunSign = Math.floor(panchang.positions.Sun.longitude / 30);
            const tamilMonthName = TAMIL_MONTHS[currentSunSign];

            // For Search Logic: Match Amanta Month
            targetSolarMonth = currentSunSign; // Keep track of Solar Sign for seasons
            targetMonthIndex = amantaMonthIndex; // New target for Month Matching

            if (req.body.returnSourceDetails) {
                return res.json({
                    success: true,
                    sourceDetails: {
                        tithi: panchang.tithi.name,
                        paksha: panchang.tithi.paksha,
                        day: panchang.weekday,
                        hinduMonth: amantaMonthName,
                        purnimantaMonth: purnimantaMonthName,
                        tamilMonth: tamilMonthName,
                        sunSign: currentSunSign
                    }
                });
            }

            console.log(`Source: ${inputDate} -> Tithi ${targetTithiIndex}, MonthIdx ${targetMonthIndex}`);

        } else {
            // mode = 'hindu'
            // hinduDate = { month: "Chaitra", paksha: "Shukla", tithi: "Pratipada" }

            // Map Month Name to approximate Sun Sign window for search optimization
            const mIdx = HINDU_MONTHS_Amanta.indexOf(hinduDate.month);
            targetMonthIndex = mIdx;

            // paksha: Shukla vs Krishna
            // tithi: Name
            // Map to Index 1-30
            // Shukla Pratipada = 1 ... Purnima = 15
            // Krishna Pratipada = 16 ... Amavasya = 30

            // Find index matching name and paksha half
            const isShukla = hinduDate.paksha === 'Shukla';
            const baseIndex = isShukla ? 0 : 15;

            const tithiName = hinduDate.tithi;
            let found = -1;
            for (let i = baseIndex; i < baseIndex + 15; i++) {
                if (TITHIS[i] === tithiName) {
                    found = i;
                    break;
                }
            }
            targetTithiIndex = found + 1; // 1-30

            // Approximate Sun Sign for this Lunar Month
            targetSolarMonth = (targetMonthIndex + 11) % 12;
        }

        // Algo to find Gregorian Date in 'searchYear'
        // Scan full year
        const results = [];
        const start = new Date(searchYear, 0, 1);
        const end = new Date(searchYear, 11, 31);

        // Define Tamil Months for use in loop
        const TAMIL_MONTHS_LOOP = [
            "Chithirai", "Vaikasi", "Aani", "Aadi", "Avani", "Purhattasi",
            "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni"
        ];

        try {
            for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
                // Formatting date carefully
                const dateStr = d.toISOString().split('T')[0];

                // Wrap pancang calculation for safety
                try {
                    const p = calculatePanchang(dateStr, "12:00", location.lat, location.lng, 5.5);

                    // Check Tithi Match
                    if (p.tithi.index === targetTithiIndex) {
                        // Match Found for Tithi. Now verify Month Logic.

                        // We need to calculate the Lunar Month for this candidate date efficiently.
                        // Backtrack to previous New Moon.
                        const dDaysSinceNM = p.tithi.index;
                        const dNMDate = new Date(d);
                        dNMDate.setDate(d.getDate() - dDaysSinceNM);
                        const dNMStr = dNMDate.toISOString().split('T')[0];

                        const dNMPan = calculatePanchang(dNMStr, "12:00", location.lat, location.lng, 5.5);
                        const dNMSunSign = Math.floor(dNMPan.positions.Sun.longitude / 30);

                        const dAmantaIndex = (dNMSunSign + 1) % 12;

                        // Does it match our target Month?
                        if (dAmantaIndex === targetMonthIndex) {
                            // MATCH CONFIRMED

                            const dAmantaName = HINDU_MONTHS_Amanta[dAmantaIndex];

                            // Regional Variations
                            let dPurnimantaName = dAmantaName;
                            if (p.tithi.paksha === 'Krishna') {
                                const pIdx = (dAmantaIndex + 1) % 12;
                                dPurnimantaName = HINDU_MONTHS_Amanta[pIdx]; // Purnimanta is 1 month ahead in Krishna Paksha
                            }

                            const dCurrentSunSign = Math.floor(p.positions.Sun.longitude / 30);
                            const dTamilName = TAMIL_MONTHS_LOOP[dCurrentSunSign];

                            results.push({
                                date: dateStr,
                                tithi: p.tithi.name,
                                paksha: p.tithi.paksha,
                                sunSign: dCurrentSunSign,
                                hinduMonth: dAmantaName,
                                purnimantaMonth: dPurnimantaName,
                                tamilMonth: dTamilName,
                                day: p.weekday
                            });
                        }
                    }
                } catch (pError) {
                    // Ignore individual day calculation errors (e.g. malformed ephemeris data)
                    // console.warn(`Skipping date ${dateStr} due to calculation error`);
                }
            }
        } catch (loopError) {
            console.error("Error in Search Loop:", loopError);
            throw new Error("Failed to search dates: " + loopError.message);
        }

        res.json({ success: true, results });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
