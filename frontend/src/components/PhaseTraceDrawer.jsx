import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, Coins, HeartHandshake, Activity, Users, GraduationCap, Sparkles, FileText, Code } from 'lucide-react';

// --- Dev Mode Configuration ---
const isDevMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === 'true';

const ruleYamlMap = {
    ROLE_CAPACITY_GATE: { file: "55_01_time_phase_thresholds.yaml", path: "ROLE_CAPACITY_GATE", version: "1.0" },
    INTENSITY_THRESHOLD: { file: "55_01_time_phase_thresholds.yaml", path: "INTENSITY_THRESHOLD", version: "1.0" },
    EMOTIONAL_RISK_SUPPRESSION: { file: "55_03_family_matrix_emotional_risk_overlay.yaml", path: "EMOTIONAL_RISK_SUPPRESSION", version: "1.2" },
    AXIS_PERMISSION: { file: "55_04_life_axis_phase_semantics.yaml", path: "AXIS_PERMISSION", version: "1.0" }
};

const REPO_BASE_URL = "https://github.com/org/repo/blob/main/config"; // Placeholder

// --- Axis Semantics Configuration ---
const axisSemantics = {
    career: {
        label: "Career & Public Contribution",
        domain_noun: "career",
        execution_phrase: "public contribution",
        disallowed_assumptions: ["employment", "job acquisition", "professional outcomes"]
    },
    wealth: {
        label: "Wealth & Material Stability",
        domain_noun: "wealth",
        execution_phrase: "material conversion",
        disallowed_assumptions: ["income guarantees", "asset growth", "financial success"]
    },
    relationships: {
        label: "Relationships & Bonds",
        domain_noun: "relationships",
        execution_phrase: "relational expression",
        disallowed_assumptions: ["marriage", "reconciliation", "relationship outcomes"]
    },
    care: {
        label: "Care & Support",
        domain_noun: "care",
        execution_phrase: "supportive presence",
        disallowed_assumptions: ["medical outcomes", "caregiving capacity"]
    },
    authority: {
        label: "Authority & Leadership",
        domain_noun: "authority",
        execution_phrase: "leadership expression",
        disallowed_assumptions: ["promotion", "political status"]
    },
    conflict: {
        label: "Conflict Resolution",
        domain_noun: "conflict",
        execution_phrase: "resolution capacity",
        disallowed_assumptions: ["victory", "legal outcomes"]
    },
    legacy: {
        label: "Legacy & Long-term Impact",
        domain_noun: "legacy",
        execution_phrase: "generational impact",
        disallowed_assumptions: ["fame", "historical record"]
    },
    emotional_load: {
        label: "Emotional Load",
        domain_noun: "stress",
        execution_phrase: "emotional resilience",
        disallowed_assumptions: ["happiness", "mental health diagnosis"]
    }
};

const axisIcons = {
    career: Briefcase,
    wealth: Coins,
    relationships: HeartHandshake,
    care: Activity,
    family: Users,
    authority: GraduationCap,
    conflict: Sparkles,
    legacy: Users,
    emotional_load: Activity
};

const PhaseTraceDrawer = ({ isOpen, onClose, traceData, comparisonData, axis, time, comparisonTime, phase, subjectType, memberId, memberName, intensity, multiplier, debugKeys, rawPoint }) => {
    const [showToast, setShowToast] = useState(false);
    const [verbosity, setVerbosity] = useState("standard"); // 'standard' | 'expert'

    // Self-Correcting Lookup
    let displayIntensity = intensity;
    if (displayIntensity === undefined && rawPoint && memberId) {
        // Try strict
        if (rawPoint[`member_${memberId}`] !== undefined) displayIntensity = rawPoint[`member_${memberId}`];
        // Try fuzzy
        else {
            const keys = Object.keys(rawPoint);
            const match = keys.find(k => k.includes('member_') && k.includes(String(memberId)));
            if (match) displayIntensity = rawPoint[match];
        }
    }
    // Family Fallback
    if (displayIntensity === undefined && rawPoint && subjectType !== 'member') {
        displayIntensity = rawPoint.familyBase;
    }

    // Focus Management
    const closeRef = useRef(null);
    useEffect(() => {
        if (isOpen) {
            closeRef.current?.focus();
        }
    }, [isOpen]);

    // Keyboard Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Derived State
    const currentAxis = axisSemantics[axis] || {
        label: axis,
        domain_noun: axis,
        execution_phrase: "expression",
        disallowed_assumptions: []
    };
    const AxisIcon = axisIcons[axis] || Sparkles;

    let effectiveIntensity = "Calculated";
    if (displayIntensity !== undefined) {
        effectiveIntensity = Math.round(displayIntensity);
    } else {
        const intensityStep = traceData?.evaluation_steps?.find(s => s.intensity !== undefined);
        if (intensityStep) effectiveIntensity = Math.round(intensityStep.intensity);
    }

    const isMemberSubject = subjectType === 'member';
    const roleGated = isMemberSubject && (effectiveIntensity < 60 || phase === 'HOLD');

    // --- Helpers ---
    const downloadTextFile = (filename, content) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const YamlLink = ({ ruleId }) => {
        if (!isDevMode || verbosity !== "expert") return null;
        const meta = ruleYamlMap[ruleId];
        if (!meta) return null;
        // Placeholder check because we don't have the real repo URL
        const url = `#yaml-source-${meta.path}`;

        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                    e.preventDefault();
                    window.open(`${REPO_BASE_URL}/${meta.file}#${meta.path}`, '_blank');
                }}
                className="yaml-link"
                aria-label={`Open YAML source for ${ruleId}`}
                style={{
                    marginLeft: '6px',
                    padding: '1px 4px',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    fontSize: '0.65rem',
                    color: '#6b7280',
                    textDecoration: 'none',
                    fontFamily: 'monospace',
                    display: 'inline-block',
                    verticalAlign: 'middle'
                }}
            >
                YAML
            </a>
        );
    };

    // --- Export Generators ---

    const handleShare = () => {
        const params = new URLSearchParams({
            axis,
            period: time,
            subject: subjectType,
            trace: 'open',
        });
        if (isMemberSubject && memberId) params.set('memberId', memberId);

        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        navigator.clipboard.writeText(url).then(() => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        });
    };

    const handleExportTrace = () => {
        const content = `TRACE EXPLANATION (EXPERT)

Subject: ${memberName || 'Family'}
Subject Type: ${subjectType === 'member' ? 'Individual' : 'Family'}
Axis: ${currentAxis.label}
Period: ${time}

----------------------------------------
FINAL RESULT
----------------------------------------
Effective Intensity: ${effectiveIntensity}
Primary Gate: ${phase}

----------------------------------------
FAMILY CONTEXT
----------------------------------------
Available family-level intensity:
${traceData?.family_intensity ? Math.round(traceData.family_intensity) : 'N/A'} (approx)

This reflects the broader environment
available to the family during this period.

----------------------------------------
EVALUATION SUMMARY
----------------------------------------
The effective value is limited by role-based
modeling rather than lack of opportunity.

${currentAxis.execution_phrase} is not modeled as the
primary channel of outward contribution
during this life stage.

----------------------------------------
AXIS MODELING RULE
----------------------------------------
This axis does not assume:
${currentAxis.disallowed_assumptions.map(a => `- ${a}`).join('\n')}

Values reflect readiness for public
contribution, not guaranteed outcomes.

----------------------------------------
WHAT WOULD CHANGE THIS VALUE
----------------------------------------
This value may change if:
- Role or dependency status is updated
- This axis becomes an active life domain

This value does not change automatically
with time or family-level conditions alone.

----------------------------------------
TRACE METADATA
----------------------------------------
Trace Version: 1.1.0
Generated At: ${new Date().toISOString()}

----------------------------------------
DISCLAIMER
----------------------------------------
This explanation describes system evaluation
logic. It does not predict future outcomes.`;

        const filename = `trace_${memberName || 'family'}_${axis}_${time}.txt`.toLowerCase().replace(/ /g, '_');
        downloadTextFile(filename, content);
    };

    const handleExportDiff = () => {
        if (!comparisonData) return;

        const content = `TRACE DIFFERENCE (EXPERT)

Subject: ${memberName || 'Family'}
Subject Type: ${subjectType === 'member' ? 'Individual' : 'Family'}
Axis: ${currentAxis.label}

----------------------------------------
PERIODS COMPARED
----------------------------------------
Current Period: ${time}
Compared Period: ${comparisonTime}

----------------------------------------
PRIMARY GATE CHANGE
----------------------------------------
Changed from:
${comparisonData.phase || 'N/A'}

Changed to:
${phase}

----------------------------------------
KEY REASONING CHANGES
----------------------------------------
- Family-level intensity changed
- Threshold conditions logic updated

----------------------------------------
UNCHANGED CONDITIONS
----------------------------------------
- Axis permission rules
- Emotional risk status

----------------------------------------
TRACE METADATA
----------------------------------------
Trace Version: 1.1.0
Generated At: ${new Date().toISOString()}

----------------------------------------
DISCLAIMER
----------------------------------------
This comparison explains changes in
evaluation logic. It does not indicate
improvement or decline.`;

        const filename = `trace_diff_${memberName || 'family'}_${axis}_${time}_vs_${comparisonTime}.txt`.toLowerCase().replace(/ /g, '_');
        downloadTextFile(filename, content);
    };

    return (
        <aside
            className="trace-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Explanation for ${currentAxis.label}`}
            style={{
                position: 'fixed', top: 0, right: 0, width: '400px', height: '100%',
                backgroundColor: '#111827', borderLeft: '1px solid #374151',
                boxShadow: '-4px 0 16px rgba(0,0,0,0.5)', zIndex: 2000,
                padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column'
            }}
        >
            {/* Header */}
            <header style={{ marginBottom: '24px', borderBottom: '1px solid #374151', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AxisIcon size={20} color="#9ca3af" aria-hidden="true" />
                        <div>
                            <h3 style={{ margin: 0, color: '#e6c87a', fontSize: '18px', lineHeight: 1.2 }}>Why this value?</h3>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{currentAxis.label}</div>
                        </div>
                    </div>
                    <button
                        ref={closeRef}
                        onClick={onClose}
                        aria-label="Close explanation"
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '24px', lineHeight: '1', padding: '4px' }}
                    >
                        ×
                    </button>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#d1d5db' }}>
                        <strong>{time}</strong> • <span>{isMemberSubject ? 'Individual' : 'Family'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={verbosity === 'expert'}
                                onChange={(e) => setVerbosity(e.target.checked ? 'expert' : 'standard')}
                                style={{ accentColor: '#4b5563' }}
                            />
                            Expert detail
                        </label>
                        <button
                            onClick={handleShare}
                            title="Share Deep Link"
                            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px' }}
                        >
                            Share
                        </button>
                    </div>
                </div>

                {/* Export Actions (Expert Only) */}
                {verbosity === 'expert' && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                        <button
                            onClick={handleExportTrace}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#374151', border: 'none', borderRadius: '4px', padding: '4px 8px', color: '#e5e7eb', fontSize: '11px', cursor: 'pointer' }}
                        >
                            <FileText size={12} /> Export Trace
                        </button>
                        {comparisonData && (
                            <button
                                onClick={handleExportDiff}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#374151', border: 'none', borderRadius: '4px', padding: '4px 8px', color: '#e5e7eb', fontSize: '11px', cursor: 'pointer' }}
                            >
                                <FileText size={12} /> Export Diff
                            </button>
                        )}
                        {isDevMode && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#374151', border: 'none', borderRadius: '4px', padding: '4px 8px', color: '#10b981', fontSize: '11px', cursor: 'default' }}>
                                <Code size={12} /> Dev Mode
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* Content Body */}
            <div className="trace-body" style={{ flex: 1 }}>

                {/* Section 1: Family Environment */}
                <section style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', color: '#d1d5db', marginBottom: '8px', borderLeft: '3px solid #6b7280', paddingLeft: '8px' }}>Family Environment</h4>
                    <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.5', margin: 0 }}>
                        During this period, the broader family environment shows changing conditions related to {currentAxis.domain_noun}.
                    </p>
                    {traceData?.family_intensity && (
                        <p style={{ fontSize: '13px', color: '#e5e7eb', marginTop: '6px' }}>
                            Family Baseline Intensity: <strong>{Math.round(traceData.family_intensity)}</strong>
                        </p>
                    )}
                </section>

                {/* Section 2: Role Capacity (Member Only) */}
                {isMemberSubject && (
                    <section style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '14px', color: '#d1d5db', marginBottom: '8px', borderLeft: '3px solid #6b7280', paddingLeft: '8px' }}>Individual Role Capacity</h4>
                        <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.5', margin: 0 }}>
                            At this life stage, {currentAxis.execution_phrase} is not modeled as the primary channel of outward expression.
                        </p>
                        <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.5', marginTop: '6px' }}>
                            This limits how much of the available family environment is converted into individual expression.
                        </p>
                    </section>
                )}

                {/* Section 3: Axis Rule */}
                <section style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', color: '#d1d5db', marginBottom: '8px', borderLeft: '3px solid #6b7280', paddingLeft: '8px' }}>{currentAxis.label} Rule</h4>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>This axis does <strong>not</strong> assume:</p>
                    <ul style={{ fontSize: '12px', color: '#9ca3af', paddingLeft: '20px', margin: '4px 0 8px 0' }}>
                        {currentAxis.disallowed_assumptions.map(item => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                        Values reflect readiness for {currentAxis.execution_phrase}, not guaranteed outcomes.
                    </p>
                </section>

                {/* Debug for Missing Data */}
                {displayIntensity === undefined && (
                    <section style={{ marginBottom: '20px', padding: '12px', background: '#3f1f1f', borderRadius: '6px', border: '1px solid #ef4444' }}>
                        <h4 style={{ fontSize: '12px', color: '#ef4444', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Data Lookup Failed</h4>
                        <div style={{ fontSize: '11px', color: '#fca5a5', fontFamily: 'monospace' }}>
                            <div>Target Member ID: {memberId || 'Family'}</div>
                            <div>Status: {rawPoint ? 'Raw Data Available' : 'No Raw Data'}</div>
                            <div style={{ marginTop: '8px', wordBreak: 'break-all' }}>
                                <strong>Keys in Raw Point:</strong><br />
                                {rawPoint ? Object.keys(rawPoint).join(', ') : (debugKeys ? debugKeys.join(', ') : 'No Keys')}
                            </div>
                        </div>
                    </section>
                )}

                {/* Section 4: Calculation Logic (New) */}
                {displayIntensity !== undefined && multiplier !== undefined && (
                    <section style={{ marginBottom: '20px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px dashed #374151' }}>
                        <h4 style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Calculation Logic</h4>

                        {/* Formula Text */}
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px', fontFamily: 'monospace' }}>
                            Formula: Dasha Base × Transit Multiplier = Final
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#d1d5db' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px' }}>BASE (DASHA)</div>
                                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#e5e7eb' }}>
                                    {Math.round(displayIntensity / multiplier)} <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'normal' }}>pts</span>
                                </div>
                            </div>
                            <div style={{ color: '#6b7280', padding: '0 8px' }}>×</div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px' }}>TRANSIT MULT</div>
                                <div style={{ fontWeight: 'bold', fontSize: '16px', color: multiplier < 1 ? '#ef4444' : (multiplier > 1 ? '#10b981' : '#d1d5db') }}>
                                    {multiplier.toFixed(2)}x
                                </div>
                            </div>
                            <div style={{ color: '#6b7280', padding: '0 8px' }}>=</div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px' }}>FINAL SCORE</div>
                                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#e6c87a' }}>
                                    {Math.round(displayIntensity)} <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'normal' }}>pts</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Section 5: Final Outcome */}
                <section style={{ marginBottom: '24px', padding: '12px', background: '#1f2937', borderRadius: '6px', border: '1px solid #374151' }}>
                    <h4 style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Final Outcome</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px', color: '#e6c87a', fontWeight: 'bold' }}>{effectiveIntensity}</span>
                        <span style={{ fontSize: '14px', color: '#d1d5db', fontWeight: 'bold' }}>{phase} PHASE</span>
                    </div>
                    {roleGated && (
                        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', fontStyle: 'italic' }}>
                            Reflects role-based gating, not lack of potential.
                        </p>
                    )}
                </section>

                {/* EXPERT MODE - Evaluation Steps */}
                {verbosity === 'expert' && traceData?.evaluation_steps && (
                    <section style={{ marginTop: '24px', borderTop: '1px solid #374151', paddingTop: '16px' }}>
                        <h4 style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '12px' }}>System Evaluation Path (Expert)</h4>
                        {traceData.evaluation_steps.map((step, idx) => (
                            <div key={idx} style={{ marginBottom: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#6b7280' }}>
                                <div style={{ color: '#d1d5db', display: 'flex', alignItems: 'center' }}>
                                    Step {step.step}: {step.rule || step.rule_type}
                                    {/* DEV MODE LINK */}
                                    <YamlLink ruleId={step.rule || step.rule_type} />
                                </div>
                                <div>Outcome: {step.outcome || step.risk_level || (step.intensity ? Math.round(step.intensity) : 'Auto')}</div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Section 6: Expandable */}
                <details style={{ marginTop: 'auto', borderTop: '1px solid #374151', paddingTop: '16px', color: '#6b7280', fontSize: '12px' }}>
                    <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>What would change this value?</summary>
                    <p style={{ margin: '0 0 4px 0' }}>This value may change if:</p>
                    <ul style={{ paddingLeft: '16px', margin: 0 }}>
                        <li>Role or dependency status is updated</li>
                        <li>This axis becomes an active life domain</li>
                        <li>Family data reflects a change in responsibility</li>
                    </ul>
                </details>

            </div>

            {/* Footer */}
            <footer style={{ marginTop: '24px', fontSize: '11px', color: '#4b5563', textAlign: 'center' }}>
                This explanation reflects system evaluation steps. It does not predict future outcomes.
            </footer>

            {/* Toast */}
            {showToast && (
                <div style={{
                    position: 'fixed', bottom: '20px', right: '20px', background: '#1f2937', color: '#f3f4f6',
                    padding: '8px 12px', borderRadius: '6px', fontSize: '13px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    zIndex: 3000, border: '1px solid #374151'
                }}>
                    Link copied to clipboard
                </div>
            )}
        </aside>
    );
};

export default PhaseTraceDrawer;
