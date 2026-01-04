const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Shared Validator Engine
 * Validates output text against a YAML configuration profile.
 */

const loadYaml = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return null;
        return yaml.load(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.error("Validator YAML Load Error:", e);
        return null;
    }
};

const validateOutput = (outputText, validatorConfigPath, familyId = 'unknown') => {
    const config = loadYaml(validatorConfigPath);
    if (!config) {
        // Fallback or error if config missing
        console.error("Validator Config Missing:", validatorConfigPath);
        return { status: 'FAIL', errors: ['Validator configuration missing'], warnings: [] };
    }

    // Generic Config Handler
    const rules = config.vision_output_validator ||
        config.mission_output_validator ||
        config; // Fallback to root if it is the new standard (Philosophy)

    // Determine Profile
    // If version has profile 'tolerant' (Vision) or if implied strict (Mission)
    let isTolerant = false;
    if (rules.version && rules.version.profile === 'tolerant') isTolerant = true;
    if (rules.mode === 'compression_tolerant') isTolerant = true;
    if (rules.validation_profile && rules.validation_profile.strictness === 'tolerant') isTolerant = true;

    const result = {
        timestamp: new Date().toISOString(),
        family_id: familyId,
        status: 'PASS',
        errors: [],
        warnings: [],
        violated_rules: [],
        affected_sections: []
    };

    // --- HELPER CHECKS ---
    const checkPresence = (text, contentDesc) => {
        // Simple heuristic: does the text roughly exist?
        // Ideally we'd use regex from config, but we'll map common keys for now
        if (contentDesc === 'alignment_level') return text.match(/\(Alignment: .+\)/);
        if (contentDesc === 'alignment_rationale') return text.includes('Rationale:');
        if (contentDesc === 'guiding_vision_principle') return text.includes('Guiding Vision Principle');
        if (contentDesc === 'vision_summary') return text.includes('FAMILY VISION STATEMENT');

        // Mission specific mappings to Output Text
        if (contentDesc === 'narrative') return text.includes('ission Mode'); // Rationale is part of narrative block usually
        if (contentDesc === 'execution_risks') return text.includes('EXECUTION RISKS');
        if (contentDesc === 'planetary_reinforcements') return text.includes('PLANETARY REINFORCEMENTS');

        // Mission specific
        if (contentDesc === 'mission_mode') return text.includes('Mission Mode:');
        if (contentDesc === 'mission_rationale') return text.includes('Rationale:'); // Shared key
        if (contentDesc === 'execution_risk') return text.includes('EXECUTION RISKS');
        if (contentDesc === 'mitigation') return text.includes('Mitigation:') || text.includes('🛡️');
        if (contentDesc === 'planetary_reinforcement') return text.includes('PLANETARY REINFORCEMENTS') || text.includes('Planetary Focus');

        return false;
    };

    // --- 1. FAMILY LEVEL CHECKS ---
    if (rules.family_level_checks) {
        Object.entries(rules.family_level_checks).forEach(([field, check]) => {
            if (check.required) {
                if (!checkPresence(outputText, field)) {
                    const msg = `Missing ${field}`;
                    if (check.on_missing === 'warn' && isTolerant) result.warnings.push(msg);
                    else {
                        result.errors.push(msg);
                        result.violated_rules.push(field);
                    }
                }
            }
        });
    } else if (rules.required_family_fields || rules.required_sections) {
        // Legacy/Simple format support
        const fields = rules.required_family_fields || rules.required_sections;
        fields.forEach(field => {
            if (!checkPresence(outputText, field)) {
                // For simplified strings like "Core Philosophical Identity", checkPresence heuristic (indexOf) is generally fine if not matched by specific keys.
                // We'll trust checkPresence or fall back to includes (CASE INSENSITIVE).
                const textLower = outputText.toLowerCase();
                const fieldLower = field.toLowerCase();

                if (!checkPresence(outputText, field) && !textLower.includes(fieldLower)) {
                    result.errors.push(`Missing ${field}`);
                    result.violated_rules.push(field);
                }
            }
        });
    }

    // --- 2. MEMBER LEVEL CHECKS ---
    // Extract textual blocks for members approx.
    // Heuristic: Split by "Role:" or numbered list

    // Simplification: Global strictness check on specific phrases
    if (rules.member_level_checks || rules.member_level_requirements) {
        const memberRules = rules.member_level_checks || rules.member_level_requirements;

        // Check Common/Parents
        const hasFather = outputText.includes('Father');
        const hasMother = outputText.includes('Mother');
        const hasChild = outputText.includes('Child');

        // Count Cautions/Protections
        const cautionMatches = (outputText.match(/Caution:|⚠️/g) || []).length;
        const protectMatches = (outputText.match(/Protection Rule:|🛡️/g) || []).length;

        let expectedProtections = 0; // Strict requirements

        // Verify Specific Roles if configured
        if (memberRules.father && hasFather) {
            // Vision usually requires caution
            if (memberRules.father.must_include && memberRules.father.must_include.includes('caution')) {
                // We assume one of the global cautions belongs here. 
                // In a real precise parser we'd scope it.
            }
        }

        // Broad Sweep Checks (Robust & Simple)
        if (isTolerant) {
            // Vision Logic
            if (hasFather && hasMother && cautionMatches < 1) {
                result.warnings.push("Parental cautions might be missing");
            }
            if (hasChild && protectMatches < 1) {
                result.errors.push("Child protection rule missing");
                result.violated_rules.push('child_protection');
            }
        } else {
            // Mission Logic (Strict)
            // Expecting 1 caution per role approx
            let roleCount = (outputText.match(/Role:/g) || []).length;
            if (roleCount > 0 && (cautionMatches + protectMatches) < roleCount) {
                result.errors.push("Missing Role Cautions/Protections");
                result.violated_rules.push("F3_role_cautions");
            }
        }
    }

    // --- 3. LANGUAGE SAFETY ---
    const forbidden = rules.language_safety_rules?.forbid_fatalistic_phrases || []; // Legacy
    const newForbidden = rules.forbidden_patterns || []; // New Philosophy Standard

    // Legacy Check
    forbidden.forEach(phrase => {
        if (outputText.includes(phrase)) {
            result.errors.push(`Fatalistic phrase detected: "${phrase}"`);
            result.violated_rules.push('fatalism');
        }
    });

    // New Standard Check
    newForbidden.forEach(item => {
        if (outputText.includes(item.pattern)) {
            const msg = item.message || `Forbidden pattern detected: "${item.pattern}"`;
            if (item.severity === 'fatal' || item.severity === 'error') {
                result.errors.push(msg);
                result.violated_rules.push(item.pattern);
            } else {
                if (isTolerant) result.warnings.push(msg);
                else {
                    // In strict mode, warnings might be failures depending on implementation,
                    // but let's treat non-fatal/error as warning to be safe unless strict profile says otherwise.
                    // The prompt said "If SEVERITY = error: Render with warning banner". 
                    // Validator logic here separates errors (blocking) vs warnings.
                    result.warnings.push(msg);
                }
            }
        }
    });

    // --- DECISION LOGIC ---
    if (result.errors.length > 0) {
        result.status = 'FAIL';
    } else if (result.warnings.length > 0) {
        result.status = isTolerant ? 'PASS_WITH_WARNINGS' : 'FAIL';
    } else {
        result.status = 'PASS';
    }

    // LOGGING
    if (result.status !== 'PASS') {
        console.log(`[VALIDATOR] ${path.basename(validatorConfigPath)} -> ${result.status}`);
        if (result.errors.length) console.log("Errors:", result.errors);
        if (result.warnings.length) console.log("Warnings:", result.warnings);
    }

    return result;
};

module.exports = validateOutput;
