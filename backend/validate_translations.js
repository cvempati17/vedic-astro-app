const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const langs = ['en', 'hi', 'te', 'ta'];
const files = ['axis_narrative_career_v1.0.yaml', 'gate_narrative_v1.0.yaml', 'timeline_guidance_v1.0.yaml'];
const baseDir = path.join(__dirname, 'Family OS - V/05_Time_Engine/interpretation');

console.log("Validating YAML Translation Packs...");

let errors = [];

langs.forEach(lang => {
    files.forEach(file => {
        const filePath = path.join(baseDir, lang, file);
        if (fs.existsSync(filePath)) {
            try {
                const doc = yaml.load(fs.readFileSync(filePath, 'utf8'));
                console.log(`[OK] ${lang}/${file} parsed successfully.`);

                // key check
                if (file.includes('gate')) {
                    if (!doc.BLOCK || !doc.HOLD || !doc.OPEN) errors.push(`${lang}/${file} missing BLOCK/HOLD/OPEN keys`);
                }
            } catch (e) {
                errors.push(`[ERROR] ${lang}/${file}: ${e.message}`);
            }
        } else {
            console.log(`[WARN] ${lang}/${file} does not exist yet.`);
        }
    });
});

if (errors.length > 0) {
    console.error("Validation Failed:");
    errors.forEach(e => console.error(e));
} else {
    console.log("Validation Complete. All existing files are valid YAML.");
}
