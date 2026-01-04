const fs = require('fs');

/**
 * Validates the raw text output of the Vision engine against strict compliance rules.
 * Based on 99_vision_output_validator.yaml
 * 
 * Rules:
 * - V1: Alignment Level and Rationale must be present.
 * - V2: Guiding Principle must be present.
 * - V3: Father/Mother must have Vision Role and Caution.
 * - V4: Child must have Vision Role and Protection Rule.
 * 
 * @param {string} outputText - The generated report text.
 * @returns {object} - { status: 'PASS' | 'FAIL', missing_sections: [], violated_rules: [] }
 */
const validateVisionOutput = (outputText) => {
    const missingAndViolated = { missing: [], rules: [] };

    // Check 1: Alignment Level & Rationale
    if (!outputText.match(/\(Alignment: .+\)/) || !outputText.includes('Rationale:')) {
        missingAndViolated.missing.push('alignment_rationale');
        missingAndViolated.rules.push('V1');
    }

    // Check 2: Guiding Principle
    if (!outputText.includes('Guiding Vision Principle')) {
        missingAndViolated.missing.push('guiding_vision_principle');
        missingAndViolated.rules.push('V2');
    }

    // Check 3: Role Requirements (Heuristic based on presence of roles)
    // We check if "Father" exists, then "Caution:" must exist near it. 
    // Since text is a blob, we simply ensure strict counts roughly match or containment.

    // A more robust check for regex-based validation:
    const fatherRolePresent = outputText.includes('Father – Vision Role:');
    const motherRolePresent = outputText.includes('Mother – Vision Role:');

    // Count 'Caution' tags. Vision uses '⚠️ Caution:' or similar. 
    // In previous step we added "⚠️ Caution:" explicitly.
    const cautionCount = (outputText.match(/⚠️ Caution:/g) || []).length;

    let expectedCautions = 0;
    if (fatherRolePresent) expectedCautions++;
    if (motherRolePresent) expectedCautions++;

    if (cautionCount < expectedCautions) {
        missingAndViolated.missing.push('parent_role_cautions');
        missingAndViolated.rules.push('V3');
    }

    // Check 4: Child Protection Rule
    // Look for "Child" role presence
    const childRoleCount = (outputText.match(/Child \d+ .*Vision Role:/g) || []).length;
    const protectionCount = (outputText.match(/🛡️ Protection Rule:/g) || []).length;

    if (childRoleCount > 0 && protectionCount < childRoleCount) {
        missingAndViolated.missing.push('child_protection_rules');
        missingAndViolated.rules.push('V4');
    }

    if (missingAndViolated.rules.length > 0) {
        return {
            status: 'FAIL',
            missing_sections: missingAndViolated.missing,
            violated_rules: missingAndViolated.rules
        };
    }

    return { status: 'PASS', missing_sections: [], violated_rules: [] };
};

module.exports = validateVisionOutput;
