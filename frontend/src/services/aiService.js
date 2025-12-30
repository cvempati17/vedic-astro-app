import {
    SIGN_INTERPRETATIONS,
    HOUSE_INTERPRETATIONS,
    PLANET_HOUSE_INTERPRETATIONS,
    PLANET_KEYWORDS,
    CONJUNCTION_INTERPRETATIONS,
    ASPECT_INTERPRETATIONS,
    BHAVA_SIGNIFICATIONS,
    ASTRO_QUOTES
} from '../utils/interpretationData';

// Helper to get ordinal suffix
const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Helper for House Type
const getHouseType = (h) => {
    const kendras = [1, 4, 7, 10];
    const trikonas = [1, 5, 9];
    const upachayas = [3, 6, 10, 11];
    const dusthanas = [6, 8, 12];

    let types = [];
    if (kendras.includes(h)) types.push("Kendra (Strength)");
    if (trikonas.includes(h)) types.push("Trikona (Luck)");
    if (upachayas.includes(h)) types.push("Upachaya (Growth)");
    if (dusthanas.includes(h)) types.push("Dusthana (Challenge)");

    return types.length > 0 ? types.join(", ") : "Neutral House";
};

// Helper for Purushartha
const getPurushartha = (h) => {
    const dharma = [1, 5, 9];
    const artha = [2, 6, 10];
    const kama = [3, 7, 11];
    const moksha = [4, 8, 12];

    if (dharma.includes(h)) return "Dharma (Duty)";
    if (artha.includes(h)) return "Artha (Resource)";
    if (kama.includes(h)) return "Kama (Desire)";
    if (moksha.includes(h)) return "Moksha (Liberation)";
    return "Balanced";
};

export const generateHousePrediction = async (houseNum, signData, planetsInHouse, aspects, yogas, ascendantLong) => {
    // Simulate a brief "thinking" delay for better UX (optional, but feels nicer)
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
        console.log("LocalService: Generating report for House", houseNum, "[LOCAL_V2_ACTIVE]");

        // 1. Hero
        const heroTitle = planetsInHouse.length > 0
            ? `${planetsInHouse.map(p => p.name).join(" & ")} in the ${getOrdinal(houseNum)} House`
            : `${signData.name} on the ${getOrdinal(houseNum)} Cusp`;

        const heroSubtitle = `${signData.name} Ascendant • ${getPurushartha(houseNum)} Focus • ${getHouseType(houseNum)}`;

        // 2. House Overview
        const houseOverview = {
            house: `${getOrdinal(houseNum)} House (${HOUSE_INTERPRETATIONS[houseNum]?.split(',')[0]} Bhava)`,
            kendra: [1, 4, 7, 10].includes(houseNum) ? "Yes (Power House)" : "No",
            trikona: [1, 5, 9].includes(houseNum) ? "Yes (Fortune House)" : "No",
            dharmaType: getPurushartha(houseNum).split(' ')[0], // Just the first word
            purushartha: getPurushartha(houseNum)
        };

        // 3. Rashi Details (Use passed signData or lookup)
        // signData passed from UI typically has { name, element, ruler, quality }
        // We can augment with interpretationData
        const rashiDetails = {
            sign: signData.name,
            element: signData.element,
            nature: signData.quality || "Unknown",
            qualities: signData.traits || "Influential energy", // Fallback
            impact: `The energy of ${signData.name} brings ${signData.element?.toLowerCase()} qualities to the house of ${HOUSE_INTERPRETATIONS[houseNum]?.split(',')[0]}.`
        };

        // 4. Bhava Significations
        const bhavaSignifications = BHAVA_SIGNIFICATIONS[houseNum] || ["Fundamental aspects of life"];

        // 5. Planet Placements
        const planetPlacements = planetsInHouse.map(p => {
            // Try to find specific interpretation
            const key = `${p.name}-${houseNum}`;
            let interpretation = PLANET_HOUSE_INTERPRETATIONS[key];

            // Fallback Generator
            if (!interpretation) {
                if (PLANET_HOUSE_INTERPRETATIONS['default']) {
                    interpretation = PLANET_HOUSE_INTERPRETATIONS['default'](p.name, houseNum);
                } else {
                    interpretation = `${p.name} is placed in the ${getOrdinal(houseNum)} house, influencing ${HOUSE_INTERPRETATIONS[houseNum]}.`;
                }
            }

            return {
                planet: p.name,
                degree: "N/A", // We might not have raw degree readily available in this struct, or it's inside p.data
                avastha: p.data?.avastha || "Normal",
                nature: p.data?.nature || "Neutral",
                interpretation: interpretation
            };
        });

        // 6. Conjunctions
        let conjunctions = [];
        if (planetsInHouse.length > 1) {
            for (let i = 0; i < planetsInHouse.length; i++) {
                for (let j = i + 1; j < planetsInHouse.length; j++) {
                    const p1 = planetsInHouse[i].name;
                    const p2 = planetsInHouse[j].name;
                    const key1 = `${p1}-${p2}`;
                    const key2 = `${p2}-${p1}`;
                    const pairName = `${p1} & ${p2}`;

                    let result = CONJUNCTION_INTERPRETATIONS[key1] || CONJUNCTION_INTERPRETATIONS[key2];
                    if (!result) {
                        result = `The energies of ${p1} and ${p2} blend together. ${PLANET_KEYWORDS[p1]?.split(',')[0]} meets ${PLANET_KEYWORDS[p2]?.split(',')[0]}.`;
                    }
                    conjunctions.push({
                        pair: pairName,
                        nature: "Mixed",
                        results: [result]
                    });
                }
            }
        }

        // 7. Aspects
        // aspects passed as array of strings like ["Jupiter", "Mars"]
        const aspectDetails = aspects.map(aspPlanet => {
            const key = aspPlanet;
            const impact = ASPECT_INTERPRETATIONS[key] || `${aspPlanet} casts its glance on this house, modifying its results.`;
            return {
                planet: aspPlanet,
                type: "Aspect", // Simplified
                impact: impact
            };
        });

        // 8. Balance
        const beneficCount = planetsInHouse.filter(p => ["Jupiter", "Venus", "Moon", "Mercury"].includes(p.name)).length;
        const maleficCount = planetsInHouse.filter(p => ["Saturn", "Mars", "Rahu", "Ketu", "Sun"].includes(p.name)).length;

        let stability = "Moderate stability.";
        if (beneficCount > maleficCount) stability = "This area of life is generally smooth and favored.";
        if (maleficCount > beneficCount) stability = "This area requires effort, discipline, and overcoming challenges.";

        const balance = {
            beneficScore: beneficCount > 0 ? (beneficCount > 1 ? "High" : "Medium") : "Low",
            maleficScore: maleficCount > 0 ? (maleficCount > 1 ? "High" : "Medium") : "Low",
            stability: stability,
            protection: aspects.includes("Jupiter") ? "Jupiter's aspect provides divine protection." : "Standard protection."
        };

        // 9. Yoga Strength
        // relevantYogas passed as array of ALL yogas in chart. We must filter for this house.
        const planetNamesInHouse = planetsInHouse.map(p => p.name);

        const filteredYogas = yogas.filter(yoga => {
            // Check if yoga description mentions ANY of the planets in this house
            // OR if the yoga name implies the planets (e.g. "Gaja Kesari" -> Moon/Jupiter)
            // Ideally, checking if the yoga description contains the planet name is a good heuristic.
            return planetNamesInHouse.some(pName => yoga.description.includes(pName) || yoga.name.includes(pName));

            // To be more strict: check if ALL planets mentioned in description are in this house? 
            // Might be too strict if description says "Jupiter in Kendra from Moon".
            // Let's stick to "Is involved".
        });

        // Special handling: if House 1, 4, 7, 10 -> Mention Kendra strength if no specific yoga
        // If House 5, 9 -> Mention Trikona luck

        const primaryYoga = filteredYogas.length > 0 ? filteredYogas[0] : null;

        let yogaReasons = ["Planetary positions do not form a standard named Yoga primarily in this house."];
        if (primaryYoga) {
            yogaReasons = [primaryYoga.description];
        } else if ([1, 4, 7, 10].includes(houseNum)) {
            yogaReasons = ["This is a Kendra (Power) house, giving strength to any planets placed here."];
        } else if ([5, 9].includes(houseNum)) {
            yogaReasons = ["This is a Trikona (Luck) house, naturally boosting the beneficence of planets."];
        }

        const yogaStrength = {
            name: primaryYoga ? primaryYoga.name : (planetsInHouse.length > 0 ? "Planetary Placement" : "Empty House"),
            score: primaryYoga ? 8 : (planetsInHouse.length > 0 ? 5 : 2),
            reasons: yogaReasons
        };

        // 10. Summary
        const summaryPoints = [];
        summaryPoints.push(`${signData.name} here adds a flavor of ${signData.traits ? signData.traits.split('.')[0] : 'energy'}.`);
        if (planetsInHouse.length === 0) {
            summaryPoints.push("An empty house means results depend on the sign lord's placement.");
        } else {
            summaryPoints.push(`With ${planetsInHouse.length} planets, this is a very active area of life.`);
        }
        if (houseNum === 1 || houseNum === 10) summaryPoints.push("This placement significantly defines your public path.");
        if (houseNum === 4 || houseNum === 7) summaryPoints.push("Personal stability and relationships are key themes.");

        // 11. Quote
        const randomQuote = ASTRO_QUOTES[Math.floor(Math.random() * ASTRO_QUOTES.length)];

        return {
            hero: { title: heroTitle, subtitle: heroSubtitle },
            houseOverview,
            rashiDetails,
            bhavaSignifications,
            planetPlacements,
            conjunctions,
            aspects: aspectDetails,
            balance,
            yogaStrength,
            summary: summaryPoints,
            quote: randomQuote
        };

    } catch (e) {
        console.error("Local Logic Error:", e);
        return { error: "Local Generation Failed: " + e.message };
    }
};
