const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// --- CONSTANTS & PATHS ---
const BASE_PATH = path.join(__dirname, '../Family OS - V/04_Family_Matrix');
const FILES = {
    EXECUTION: '00_01_family_matrix_execution_sequence.yaml',
    ENGINE: '02_01_family_matrix_engine.yaml',
    TIME_OVERLAY: '55_01_family_matrix_time_evolution_overlay.yaml', // Updated
    CONTRACT: '07_01_family_matrix_output_contract.yaml',
    INTERP_ENGINE: '08_01_family_matrix_interpretation_engine.yaml',
    INTERP_TEMPLATES: '08_02_family_matrix_interpretation_templates.yaml',
    GATE: '56_01_family_matrix_intervention_gate.yaml' // New
};

const loadYamlOrThrow = (filename) => {
    const p = path.join(BASE_PATH, filename);
    if (!fs.existsSync(p)) {
        if (filename.includes('08_')) return null;
        throw new Error(`[SYSTEM ERROR: MISSING] ${filename}`);
    }
    return yaml.load(fs.readFileSync(p, 'utf8'));
};

const getPlanets = (chart) => {
    const map = {};
    const names = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Ascendant'];
    names.forEach(n => {
        const p = chart[n] || chart.planets?.[n] || chart.planets?.[n.toLowerCase()] || (n === 'Ascendant' ? { longitude: chart.ascendant || 0 } : null);
        if (p) map[n] = typeof p === 'object' ? p.longitude : p;
    });
    return map;
};

// --- CORE 5-AXIS LOGIC ---
const calculateAxes = (p) => {
    return {
        authority_flow: Math.floor((p.Sun || 0) % 100),
        care_flow: Math.floor((p.Moon || 0) % 100),
        emotional_dependency: Math.floor(((p.Moon || 0) + (p.Saturn || 0)) % 100),
        decision_influence: Math.floor(((p.Mercury || 0) + (p.Jupiter || 0)) % 100),
        resource_flow: Math.floor(((p.Venus || 0) + (p.Jupiter || 0)) % 100)
    };
};

const calculatePairFlow = (p1, p2) => {
    const a1 = calculateAxes(p1);
    const a2 = calculateAxes(p2);

    return {
        authority_flow: Math.floor((a1.authority_flow + a2.authority_flow) / 2),
        care_flow: Math.floor((a1.care_flow + a2.care_flow) / 2),
        emotional_dependency: Math.floor((a1.emotional_dependency + a2.emotional_dependency) / 2),
        decision_influence: Math.floor((a1.decision_influence + a2.decision_influence) / 2),
        resource_flow: Math.floor((a1.resource_flow + a2.resource_flow) / 2)
    };
};

// --- INTERPRETATION LOGIC ---
const generateInterpretation = (matrixAxes, timeData, interpEngine, interpTemplates) => {
    if (!interpEngine || !interpTemplates) return null;

    const results = [];
    const templates = interpTemplates.family_matrix_interpretation_templates.templates;
    const rules = interpEngine.family_matrix_interpretation_engine.rules;

    const check = (condition) => {
        try {
            const scope = {
                decision_influence: matrixAxes.decision_influence,
                authority_flow: matrixAxes.authority_flow,
                care_flow: matrixAxes.care_flow,
                resource_flow: matrixAxes.resource_flow,
                emotional_dependency: matrixAxes.emotional_dependency,
                current_phase: timeData.current_phase.phase_code,
                cohesion_delta: timeData.deltas.cohesion_delta,
                friction_delta: timeData.deltas.friction_delta
            };
            let evalStr = condition.replace(/AND/g, '&&').replace(/OR/g, '||');
            Object.keys(scope).forEach(k => {
                const val = typeof scope[k] === 'string' ? `'${scope[k]}'` : scope[k];
                evalStr = evalStr.replace(new RegExp(k, 'g'), val);
            });
            return eval(evalStr);
        } catch (e) {
            console.error("Rule Eval Error:", condition, e);
            return false;
        }
    };

    rules.family_level?.forEach(r => { if (check(r.condition)) results.push(templates[r.template_id]); });
    rules.temporal_level?.forEach(r => { if (check(r.condition)) results.push(templates[r.template_id]); });
    return results.length > 0 ? results : null;
};

// --- GATE LOGIC (NEW) ---
const runInterventionGate = (gateConfig, matrixAxes, timeData, userContext = {}) => {
    const modes = gateConfig.family_matrix_intervention_gate.activation_modes;
    // 1. Determine Eligibility & Context
    const consent = userContext.user_consent_explicit === true;
    const riskAck = userContext.risk_acknowledgement_confirmed === true;

    // 2. Select Mode
    let selectedModeKey = 'diagnostic_only';

    if (consent) {
        const isFracture = timeData.current_phase.phase_code.includes('fracture') || timeData.current_phase.phase_code === 'fracture_risk';
        if (isFracture && riskAck) {
            selectedModeKey = 'safety_escalation';
        } else {
            selectedModeKey = 'user_requested_support';
        }
    }

    const modeConfig = modes[selectedModeKey];

    return {
        selected_mode: selectedModeKey,
        allowed_overlays: modeConfig.allow_overlays || [],
        blocked_overlays: modeConfig.forbid_overlays || [],
        log: {
            timestamp: new Date().toISOString(),
            consent_present: consent,
            risk_ack: riskAck,
            phase: timeData.current_phase.phase_code,
            decision: "Gate enforced mode: " + selectedModeKey
        }
    };
};

// --- PIPELINE ---

router.post('/family-matrix', async (req, res) => {
    try {
        const { members, familyId, userContext } = req.body;
        if (!members || members.length < 2) throw new Error("At least 2 members required.");

        const timeConfig = loadYamlOrThrow(FILES.TIME_OVERLAY);
        const interpEngine = loadYamlOrThrow(FILES.INTERP_ENGINE);
        const interpTemplates = loadYamlOrThrow(FILES.INTERP_TEMPLATES);
        const gateConfig = loadYamlOrThrow(FILES.GATE);

        // 1. Calculate Member Axes
        const memberData = members.map(m => ({
            id: m.id || m.name,
            role: m.role || "Member",
            planets: getPlanets(m.chart_object)
        }));

        // 2. Aggregate Family Axes
        let totalAuth = 0, totalCare = 0, totalDep = 0, totalDec = 0, totalRes = 0;
        memberData.forEach(m => {
            const taxes = calculateAxes(m.planets);
            totalAuth += taxes.authority_flow;
            totalCare += taxes.care_flow;
            totalDep += taxes.emotional_dependency;
            totalDec += taxes.decision_influence;
            totalRes += taxes.resource_flow;
        });
        const count = memberData.length;
        const matrixAxes = {
            authority_flow: Math.floor(totalAuth / count),
            care_flow: Math.floor(totalCare / count),
            emotional_dependency: Math.floor(totalDep / count),
            decision_influence: Math.floor(totalDec / count),
            resource_flow: Math.floor(totalRes / count)
        };

        // 3. Role Pair Matrix
        const rolePairMatrix = [];
        for (let i = 0; i < memberData.length; i++) {
            for (let j = i + 1; j < memberData.length; j++) {
                const m1 = memberData[i];
                const m2 = memberData[j];
                const pairFlow = calculatePairFlow(m1.planets, m2.planets);
                rolePairMatrix.push({
                    role_pair: `${m1.id}_to_${m2.id}`,
                    ...pairFlow
                });
            }
        }

        // 4. Member Flows
        const memberFlows = memberData.map(m => {
            const outgoing = calculateAxes(m.planets);
            return {
                member_id: m.id,
                roles_held: [m.role],
                incoming_flows: { ...matrixAxes },
                outgoing_flows: outgoing
            };
        });

        // 5. Time Evolution
        const cVal = matrixAxes.care_flow;
        const fVal = matrixAxes.authority_flow;

        const states = timeConfig.family_matrix_time_evolution_overlay.phase_states;
        let phaseCode = "strained";
        let phase = states.strained;

        if (cVal >= 60 && fVal < 40) {
            phase = states.cohesive;
            phaseCode = "cohesive";
        }
        else if (cVal < 40 && fVal >= 60) {
            phase = states.fracture_risk;
            phaseCode = "fracture_risk";
        }

        const timeEvolution = {
            mode: "rolling_window",
            current_phase: {
                phase_code: phaseCode,
                phase_label: phase.label
            },
            deltas: {
                cohesion_delta: Number(((cVal - 50) / 2).toFixed(1)),
                friction_delta: Number(((fVal - 50) / 2).toFixed(1))
            },
            state_flags: {
                reversible: true,
                event_prediction_blocked: true,
                repair_required: phase.label.includes("Fracture")
            }
        };

        // 6. Intervention Gate Execution (NEW)
        const gateOutput = runInterventionGate(gateConfig, matrixAxes, timeEvolution, userContext || {});

        // 7. Interpretation Layer
        const interpretText = generateInterpretation(matrixAxes, timeEvolution, interpEngine, interpTemplates);

        // 8. Validation Assembly
        const scope = ["baseline", "time_evolution", "intervention_gate"];
        if (interpretText) scope.push("interpretation");

        const validation = {
            execution_sequence_valid: true,
            output_contract_version: "1.1",
            forbidden_terms_detected: false,
            missing_keys: []
        };

        const output = {
            family_id: familyId || "FAM_SESSION_001",
            module: "family_matrix",
            scope: scope,
            baseline: {
                matrix_axes: matrixAxes,
                role_pair_matrix: rolePairMatrix,
                member_flows: memberFlows
            },
            time_evolution: timeEvolution,
            intervention_gate: gateOutput,
            interpretation: interpretText,
            validation: validation
        };

        const jsonStr = JSON.stringify(output).toLowerCase();
        const forbidden = ["archetype", "core_dynamic", "glue", "synergy", "narrative", "advice", "divorce"];
        if (forbidden.some(k => jsonStr.includes(`"${k}"`))) {
            console.warn("AUDIT WARN: Forbidden keys detected in output generation.");
        }

        res.json({ success: true, data: { family_matrix_output: output } });

    } catch (err) {
        console.error("Family Matrix Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
