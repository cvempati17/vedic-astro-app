const fs = require('fs');

/**
 * Validates the raw text output of the Mission engine against strict compliance rules.
 * 
 * Rules:
 * - F1: Mission Mode Rationale must be present.
 * - F3: Every role (Father/Mother/Child) must have a Caution or Protection line.
 * - F4: Risks must have a Mitigation line.
 * - F6: Planetary Reinforcements must be specific (or generic fallback) but not empty.
 * 
 * @param {string} outputText - The generated report text.
 * @returns {object} - { status: 'PASS' | 'FAIL', missing_sections: [], violated_rules: [] }
 */
const validateMissionOutput = (outputText) => {
    const missingAndViolated = { missing: [], rules: [] };

    // Check 1: Mission Mode Rationale (F1)
    if (!outputText.includes('Rationale:') && !outputText.includes('Mission Mode:')) {
        missingAndViolated.missing.push('mission_mode_rationale');
        missingAndViolated.rules.push('F1');
    }

    // Check 2: Role Cautions (F3) - Check occurrences vs expected 'Role:' sections
    // This is a heuristic: check if 'Caution:' or 'Protection Rule:' appears roughly as often as 'Role:'
    // For simplicity, just ensure at least one Safety/Caution line exists if roles are present.
    const roleCount = (outputText.match(/Role:/g) || []).length;
    const cautionCount = (outputText.match(/Caution:/g) || []).length;
    const protectCount = (outputText.match(/Protection Rule:/g) || []).length;

    if (roleCount > 0 && (cautionCount + protectCount) < roleCount) {
        missingAndViolated.missing.push('role_cautions_incomplete');
        missingAndViolated.rules.push('F3');
    }

    // Check 3: Risk Mitigation (F4)
    if (!outputText.includes('Mitigation:')) {
        missingAndViolated.missing.push('risk_mitigation');
        missingAndViolated.rules.push('F4');
    }

    // Check 4: Planetary Reinforcements (F6)
    if (!outputText.includes('Planetary Focus') && !outputText.includes('Saturn:') && !outputText.includes('Jupiter:') && !outputText.includes('Mars:')) {
        missingAndViolated.missing.push('planetary_reinforcements');
        missingAndViolated.rules.push('F6');
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

module.exports = validateMissionOutput;
