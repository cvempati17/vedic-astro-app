const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const loadYamlOrThrow = (filePath) => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`[SYSTEM ERROR: MISSING] ${filePath}`);
    }
    return yaml.load(fs.readFileSync(filePath, 'utf8'));
};

module.exports = { loadYamlOrThrow };
