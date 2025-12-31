const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { calculatePanchang, NAKSHATRAS } = require('./panchang');
const { calculatePlanetaryPositions } = require('../astroService');

// CONSTANTS
const RULES_PATH = path.join(__dirname, '../../Muhurat/muhurat_rules_expanded.yaml');

class MuhuratEngine {
    constructor() {
        this.rules = null;
        this.loadRules();
    }

    loadRules() {
        try {
            const fileContents = fs.readFileSync(RULES_PATH, 'utf8');
            this.rules = yaml.load(fileContents);
            console.log("Muhurat Rules Loaded Version:", this.rules.muhurat_engine.version);
        } catch (e) {
            console.error("Failed to load Muhurat Rules:", e);
            throw e;
        }
    }

    /**
     * Main Entry Point
     */
    calculate(startDate, endDate, ceremonyId, members, location, businessType = null) {
        let activeRules = this.rules;

        // Dynamic Rule Loading for Business
        if (ceremonyId === 'business_opening') {
            try {
                const businessRulesPath = path.join(__dirname, '../../Muhurat/Business Opening.yaml');
                const businessContent = fs.readFileSync(businessRulesPath, 'utf8');
                activeRules = yaml.load(businessContent);
                console.log("Loaded Specific Business Rules:", activeRules.muhurat_engine.name);
            } catch (e) {
                console.error("Failed to load Business Opening.yaml, falling back to default.", e);
            }
        }

        if (!activeRules) this.loadRules(); // Fallback

        const ceremonyKey = ceremonyId.toLowerCase().replace(/\s+/g, '_');
        const ceremonyRules = activeRules.ceremonies[ceremonyKey];

        if (!ceremonyRules) {
            throw new Error(`Ceremony '${ceremonyId}' not defined in rules.`);
        }

        const results = [];
        let currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];

            // 1. Check Global Day Filters
            const dayPanchang = calculatePanchang(dateStr, "12:00", location.lat, location.lng, location.timezone);

            // Global Filter: Weekday
            if (this.checkGlobalFilters(dayPanchang, activeRules.global_restrictions) === false) {
                // optionally skip
            }

            // 2. Iterate through Lagnas
            for (let h = 6; h < 30; h += 2) {
                let checkHour = h;
                let checkDateStr = dateStr;

                if (h >= 24) {
                    checkHour = h - 24;
                    const nextDay = new Date(currentDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    checkDateStr = nextDay.toISOString().split('T')[0];
                }

                const timeStr = `${String(checkHour).padStart(2, '0')}:00`;
                const panchang = calculatePanchang(checkDateStr, timeStr, location.lat, location.lng, location.timezone);

                // Calculate Hora for this window (Simplified: Starts at 6 AM)
                // Hour offset from 6 AM
                let hourFromSunrise = h - 6;
                if (hourFromSunrise < 0) hourFromSunrise += 24;
                // However loop starts at 6.

                const horaName = this.calculateHora(panchang.weekday, hourFromSunrise);

                // 3. Score this window
                const analysis = this.analyzeWindow(panchang, ceremonyRules, members, activeRules, businessType, horaName);

                if (analysis.totalScore >= 50) {
                    results.push({
                        date: checkDateStr,
                        time: timeStr,
                        weekday: panchang.weekday,
                        hora: horaName,
                        nakshatra: panchang.nakshatra.name,
                        tithi: panchang.tithi.name,
                        lagna: this.getSignName(Math.floor(panchang.positions.Ascendant.longitude / 30) + 1),
                        score: Math.round(analysis.totalScore),
                        quality: this.getQualityLabel(analysis.totalScore),
                        analysis: analysis
                    });
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return results.sort((a, b) => b.score - a.score);
    }

    checkGlobalFilters(panchang, restrictions) {
        if (!restrictions) return true;
        if (restrictions.weekdays && restrictions.weekdays.avoid.includes(panchang.weekday)) return false;
        if (restrictions.tithi && restrictions.tithi.avoid.includes(panchang.tithi.name)) return false;
        if (restrictions.yoga && restrictions.yoga.avoid.includes(panchang.yoga.name)) return false;
        if (restrictions.karana && restrictions.karana.avoid.includes(panchang.karana.name)) return false;
        return true;
    }

    calculateHora(weekday, hourFromSunrise) {
        // Sequence of Lords: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars
        const lords = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];

        // Map Weekday to Starting Lord Index
        const dayLords = { "Sunday": 0, "Monday": 3, "Tuesday": 6, "Wednesday": 2, "Thursday": 5, "Friday": 1, "Saturday": 4 };

        let startIndex = dayLords[weekday];
        if (startIndex === undefined) startIndex = 0;

        // Cyclical increment
        const horaIndex = (startIndex + hourFromSunrise) % 7;
        return lords[horaIndex];
    }

    analyzeWindow(panchang, ceremonyRules, members, allRules, businessType, horaName) {
        let log = [];
        let scoreParts = {
            nakshatra: 0,
            rashi: 0,
            lagna: 0,
            business: 0,
            penalty: 0
        };

        // Business Logic Setup
        let businessRule = null;
        if (businessType && ceremonyRules.business_types && ceremonyRules.business_types[businessType]) {
            businessRule = ceremonyRules.business_types[businessType];
            log.push(`Applying Business Logic: ${businessType}`);
        }

        // 1. Tara Bala (Nakshatra)
        let totalTaraScore = 0;
        let participantCount = 0;

        members.forEach(member => {
            if (ceremonyRules.participants.includes(member.role)) {
                const taraScore = this.calculateTaraBala(member.birthDetails, panchang.nakshatra.name, allRules.nakshatra_rules.tara_bala);
                totalTaraScore += taraScore;
                participantCount++;
                log.push(`${member.role}(${member.name}): Tara Score ${taraScore}`);
            }
        });
        const avgTaraScore = participantCount > 0 ? (totalTaraScore / participantCount) : 0;

        const finalNakshatraScore = avgTaraScore;
        scoreParts.nakshatra = finalNakshatraScore * (allRules.nakshatra_rules.tara_bala.weight || 2);

        // 2. Chandra Bala (Rashi)
        let totalChandraScore = 0;
        members.forEach(member => {
            if (ceremonyRules.participants.includes(member.role)) {
                const dayMoonSignIndex = Math.floor(panchang.positions.Moon.longitude / 30) + 1;
                const birthMoon = member.birthDetails.moonSignIndex || 1;

                let count = (dayMoonSignIndex - birthMoon + 1);
                if (count <= 0) count += 12;

                const rashiRules = allRules.rashi_rules.chandra_bala;
                let s = rashiRules.scores.neutral;
                if (rashiRules.favorable_positions.includes(count)) s = rashiRules.scores.favorable;
                else if (rashiRules.unfavorable_positions.includes(count)) s = rashiRules.scores.unfavorable;

                totalChandraScore += s;
                log.push(`${member.role}(${member.name}): Chandra Pos ${count} -> ${s}`);
            }
        });
        const avgChandraScore = participantCount > 0 ? (totalChandraScore / participantCount) : 0;
        scoreParts.rashi = avgChandraScore * (allRules.rashi_rules.chandra_bala.weight || 3);

        // 3. Lagna Analysis
        const ascLong = panchang.positions.Ascendant.longitude;
        const ascSignIndex = Math.floor(ascLong / 30) + 1;
        const ascSignName = this.getSignName(ascSignIndex);

        const lagnaRules = allRules.lagna_rules.lagna_shuddhi;
        let lagnaRawScore = lagnaRules.scores.medium;

        if (lagnaRules.preferred_signs.includes(ascSignName)) lagnaRawScore = lagnaRules.scores.strong;
        if (lagnaRules.avoid_signs.includes(ascSignName)) lagnaRawScore = lagnaRules.scores.weak;

        // Business Specific Lagna Override
        if (businessRule) {
            if (businessRule.preferred_lagna_signs && businessRule.preferred_lagna_signs.includes(ascSignName)) {
                lagnaRawScore = 120; // Super Boost
                log.push(`Business Bonus: Preferred Lagna (${ascSignName})`);
            }
            if (businessRule.avoid_lagna_signs && businessRule.avoid_lagna_signs.includes(ascSignName)) {
                lagnaRawScore = 0; // Strict Avoid
                log.push(`Business Penalty: Avoid Lagna (${ascSignName})`);
            }
        }

        scoreParts.lagna = lagnaRawScore * (lagnaRules.weight || 6);

        // 4. Business Specific Extras (Weekday & Hora)
        if (businessRule) {
            // Weekday
            if (businessRule.preferred_weekdays && businessRule.preferred_weekdays.includes(panchang.weekday)) {
                scoreParts.business += 50;
                log.push(`Business Bonus: Preferred Weekday (${panchang.weekday})`);
            }
            // Hora
            if (horaName && businessRule.preferred_horas && businessRule.preferred_horas.includes(horaName)) {
                scoreParts.business += 50;
                log.push(`Business Bonus: Preferred Hora (${horaName})`);
            }
        }

        // 5. Global Penalties
        if (this.checkGlobalFilters(panchang, allRules.global_restrictions) === false) {
            scoreParts.penalty += 500;
            log.push("Global Restriction Violated");
        }

        // Calculate Total
        const totalRaw = scoreParts.nakshatra + scoreParts.rashi + scoreParts.lagna + scoreParts.business;
        // Adjust max to include potential business bonus
        // Approx max denominator
        const maxRaw = 1000 + (businessRule ? 100 : 0);

        let normalized = (totalRaw / 1100) * 100; // Rough normalization
        normalized -= scoreParts.penalty;

        // Cap at 100
        if (normalized > 100) normalized = 100;

        return {
            totalScore: normalized,
            details: scoreParts,
            log: log
        };
    }

    calculateTaraBala(birthDetails, dayNakshatraName, rules) {
        // Need to know Birth Nakshatra Index
        // Assuming birthDetails has `nakshatraIndex` (1-27) or name
        // We need a helper to get index from name if string provided

        const birthNakIndex = birthDetails.nakshatraIndex; // 1-based
        const dayNakIndex = NAKSHATRAS.indexOf(dayNakshatraName) + 1;

        if (!birthNakIndex) return 50; // Unknown

        // Distance
        let dist = dayNakIndex - birthNakIndex + 1;
        if (dist <= 0) dist += 27;

        // Cycle (1-9)
        const cycle = (dist - 1) % 9 + 1;

        // Map cycle to Tara Name
        const mapKeys = Object.keys(rules.mapping);
        // Janma(1), Sampat(2), Vipat(3), Kshema(4), Pratyak(5), Sadhaka(6), Naidhana(7), Mitra(8), ParamaMitra(9)
        // The mapping keys in YAML are strings. We need to map integer index to Key.
        // Simplified Logic based on index:
        // 1: Janma, 2: Sampat, 3: Vipat, 4: Kshema, 5: Pratyak, 6: Sadhaka, 7: Naidhana, 8: Mitra, 9: ParamaMitra

        let val = 0;
        if (cycle === 1) val = rules.mapping.Janma;
        if (cycle === 2) val = rules.mapping.Sampat;
        if (cycle === 3) val = rules.mapping.Vipat;
        if (cycle === 4) val = rules.mapping.Kshema;
        if (cycle === 5) val = rules.mapping.Pratyak;
        if (cycle === 6) val = rules.mapping.Sadhaka;
        if (cycle === 7) val = rules.mapping.Naidhana;
        if (cycle === 8) val = rules.mapping.Mitra;
        if (cycle === 9) val = rules.mapping.ParamaMitra;

        return val;
    }

    getNakshatraQuality(name, rules) {
        if (rules.benefic.includes(name)) return rules.scores.benefic;
        if (rules.malefic.includes(name)) return rules.scores.malefic;
        return rules.scores.neutral;
    }

    getSignName(index) {
        const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
        return signs[(index - 1) % 12];
    }

    getQualityLabel(score) {
        if (score >= 80) return "Excellent";
        if (score >= 65) return "Good";
        if (score >= 50) return "Average";
        return "Avoid";
    }
}

module.exports = new MuhuratEngine();
