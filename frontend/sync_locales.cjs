const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const enPath = path.join(localesDir, 'en.json');

// Read English file (Source of Truth)
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Get all other locale files
const files = fs.readdirSync(localesDir).filter(file => file.endsWith('.json') && file !== 'en.json');

files.forEach(file => {
    const filePath = path.join(localesDir, file);
    let localeData = {};

    try {
        localeData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        console.error(`Error reading ${file}, creating new object.`);
    }

    // Function to recursively merge keys
    const mergeKeys = (source, target) => {
        Object.keys(source).forEach(key => {
            if (typeof source[key] === 'object' && source[key] !== null) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                mergeKeys(source[key], target[key]);
            } else {
                if (!target.hasOwnProperty(key)) {
                    target[key] = source[key]; // Add missing key from English
                }
            }
        });
    };

    mergeKeys(enData, localeData);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(localeData, null, 2), 'utf8');
    console.log(`Synced ${file}`);
});

console.log('Localization sync complete!');
