const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const RULES_CSV_PATH = path.join(__dirname, 'trait_scoring_rules_all_traits.csv');
const MASTER_CSV_PATH = path.join(__dirname, 'master_all_traits_v2.csv');
const OUTPUT_PATH = path.join(__dirname, 'frontend', 'src', 'utils', 'traitRules.js');

const run = () => {
    const rulesCsv = fs.readFileSync(RULES_CSV_PATH, 'utf8');
    const masterCsv = fs.readFileSync(MASTER_CSV_PATH, 'utf8');

    const rulesData = Papa.parse(rulesCsv, { header: true, skipEmptyLines: true }).data;
    const masterData = Papa.parse(masterCsv, { header: true, skipEmptyLines: true }).data;

    const traitRules = {};

    // 1. Process Master CSV to get Categories and Key Houses
    masterData.forEach(row => {
        const traitName = row['Traits'];
        if (!traitName) return;

        // Parse JSON for key houses if available, otherwise fallback or leave empty
        let keyHouses = [];
        try {
            const json = JSON.parse(row['What Influences JSON']);
            if (json.houses) {
                keyHouses = json.houses.map(h => parseInt(h.replace('H', '')));
            }
        } catch (e) {
            // console.warn(`Failed to parse JSON for ${traitName}`);
        }

        traitRules[traitName] = {
            category: 'General', // Will be updated from Rules CSV
            keyHouses: keyHouses,
            factors: {}
        };
    });

    // 2. Process Rules CSV to populate factors and rules
    rulesData.forEach(row => {
        const group = row['Group'];
        const traitName = row['Trait'];
        const factorName = row['House and Planets'];
        const status = row['Status'];
        const points = parseInt(row['Points']);

        if (!traitRules[traitName]) {
            // Should have been created from Master, but just in case
            traitRules[traitName] = {
                category: group,
                keyHouses: [],
                factors: {}
            };
        }

        // Update category
        traitRules[traitName].category = group;

        // Determine Factor Type and Clean Name
        let type = 'other';
        let cleanFactorName = factorName;

        if (factorName === 'Base') {
            type = 'base';
        } else if (factorName.includes('(')) {
            // e.g., "Sun (identity & leadership)" -> "Sun"
            cleanFactorName = factorName.split('(')[0].trim();
            if (['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].includes(cleanFactorName)) {
                type = 'planet';
            }
        } else if (factorName.includes('house & lord')) {
            // e.g., "6th house & lord (daily work)" -> "6"
            type = 'house';
            cleanFactorName = parseInt(factorName.split('th')[0].split('st')[0].split('nd')[0].split('rd')[0]);
        } else if (factorName.includes('Lagna')) {
            type = 'lagna';
            cleanFactorName = 'Lagna';
        }

        if (!traitRules[traitName].factors[cleanFactorName]) {
            traitRules[traitName].factors[cleanFactorName] = {
                name: cleanFactorName,
                type: type,
                rules: []
            };
        }

        traitRules[traitName].factors[cleanFactorName].rules.push({
            status: status,
            points: points,
            originalFactor: factorName // Keep original for display if needed
        });
    });

    // Convert object to array or keep as object? Object is easier for lookup.
    // Let's format it nicely for the JS file.

    const fileContent = `// Auto-generated from CSVs
export const TRAIT_RULES = ${JSON.stringify(traitRules, null, 4)};
`;

    fs.writeFileSync(OUTPUT_PATH, fileContent);
    console.log(`Successfully generated ${OUTPUT_PATH}`);
};

run();
