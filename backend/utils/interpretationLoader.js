const path = require('path');
const { loadYamlOrThrow } = require('./yamlHelper');
const fs = require('fs');

const BASE_DIR = path.join(__dirname, '../Family OS - V/05_Time_Engine/interpretation');

const AXES = ['career', 'wealth', 'care', 'conflict', 'legacy', 'emotional_load'];
const SHARED = ['gate', 'intensity', 'timeline_guidance']; // mapped to filename prefix

const loadInterpretationPack = (lang = 'en') => {
    const pack = {
        axes: {},
        gate: null,
        intensity: null,
        guidance: null
    };

    // Helper to try load lang then fallback to en
    const loadWithFallback = (filename) => {
        const langPath = path.join(BASE_DIR, lang, filename);
        const enPath = path.join(BASE_DIR, 'en', filename);

        if (fs.existsSync(langPath)) {
            try {
                return loadYamlOrThrow(langPath);
            } catch (e) {
                console.warn(`[WARN] Failed to load ${lang}/${filename}, falling back to English. Error: ${e.message}`);
            }
        }

        // Fallback
        return loadYamlOrThrow(enPath);
    };

    // Load Axes
    AXES.forEach(axis => {
        // Filename format: axis_narrative_career_v1.0.yaml
        const filename = `axis_narrative_${axis}_v1.0.yaml`;
        const data = loadWithFallback(filename);
        // data usually has key 'career' or 'wealth' etc at root.
        // We handle that structure.
        if (data && data[axis]) {
            pack.axes[axis] = data[axis];
        } else {
            console.error(`[ERROR] Loaded ${filename} but root key '${axis}' was missing.`);
            pack.axes[axis] = {}; // empty fallback
        }
    });

    // Load Shared
    // gate_narrative_v1.0.yaml
    const gateData = loadWithFallback('gate_narrative_v1.0.yaml');
    if (gateData) {
        // Filter out metadata, return keys like BLOCK, HOLD, OPEN
        const { meta, ...rest } = gateData;
        pack.gate = rest;
    }

    // intensity_narrative_v1.0.yaml
    const intensityData = loadWithFallback('intensity_narrative_v1.0.yaml');
    if (intensityData) {
        const { meta, ...rest } = intensityData;
        pack.intensity = rest;
    }

    // timeline_guidance_v1.0.yaml
    const guidanceData = loadWithFallback('timeline_guidance_v1.0.yaml');
    if (guidanceData) {
        const { meta, ...rest } = guidanceData;
        pack.guidance = rest;
    }

    return pack;
};

module.exports = { loadInterpretationPack };
