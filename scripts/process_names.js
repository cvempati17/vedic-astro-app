const https = require('https');
const fs = require('fs');
const path = require('path');

const FEMALE_URL = 'https://raw.githubusercontent.com/balasahebgulave/Dataset-indian-names/master/Indian-Female-Names.csv';
const MALE_URL = 'https://raw.githubusercontent.com/balasahebgulave/Dataset-indian-names/master/Indian-Male-Names.csv';

const OUTPUT_DIR = path.join(__dirname, '../frontend/public/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'names.json');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function download(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function parseCSV(csv, gender) {
    const lines = csv.split('\n');
    const names = [];
    // Skip header if present (usually these gists don't have headers or are just lists)
    // Inspecting the gist content structure is hard without seeing it, but usually it's "name,race" or just "name"
    // Based on common datasets from mbejda, it's usually "name,gender,race" or similar.
    // Let's assume it might be just a list or CSV.
    // Actually, looking at the URL "Indian-Female-Names.csv", it likely contains lines like "name,race" or just names.
    // Let's try to parse simple lines first.

    lines.forEach(line => {
        const parts = line.split(',');
        let name = parts[0].trim();
        if (name && name !== 'name' && /^[a-zA-Z]+$/.test(name)) { // Basic validation
            names.push({
                name: name,
                gender: gender,
                religion: 'Hindu', // Defaulting to Hindu as requested/assumed for this dataset
                tags: [],
                start: name.charAt(0).toUpperCase(),
                meaning: '' // No meaning in this dataset
            });
        }
    });
    return names;
}

async function main() {
    console.log('Downloading Female Names...');
    const femaleCSV = await download(FEMALE_URL);
    console.log('Female CSV Preview:', femaleCSV.substring(0, 500));
    const femaleNames = parseCSV(femaleCSV, 'female');
    console.log(`Parsed ${femaleNames.length} female names.`);

    console.log('Downloading Male Names...');
    const maleCSV = await download(MALE_URL);
    console.log('Male CSV Preview:', maleCSV.substring(0, 500));
    const maleNames = parseCSV(maleCSV, 'male');
    console.log(`Parsed ${maleNames.length} male names.`);

    const allNames = [...femaleNames, ...maleNames];

    // Sort
    allNames.sort((a, b) => a.name.localeCompare(b.name));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allNames, null, 2));
    console.log(`Saved ${allNames.length} names to ${OUTPUT_FILE}`);
}

main().catch(console.error);
