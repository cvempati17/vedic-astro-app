import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, Coins, HeartHandshake, Activity, Users, GraduationCap, Sparkles } from 'lucide-react';

// --- Axis Semantics Configuration (Single Source of Layout Truth) ---
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
    authority: GraduationCap, // Metaphor for status
    conflict: Sparkles, // Metaphor for friction/energy
    legacy: Users,
    emotional_load: Activity
};

const PhaseTraceDrawer = ({ isOpen, onClose, traceData, axis, time, phase, subjectType, memberId, memberName }) => {
    const [showToast, setShowToast] = useState(false);
    const [verbosity, setVerbosity] = useState("standard"); // 'standard' | 'expert'

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

    // Determine Effective Intensity from Trace Steps (Look for FINAL_INTENSITY or derived)
    // Fallback to Phase logic if intensity not explicit in generic trace
    let effectiveIntensity = "Calculated";
    const intensityStep = traceData?.evaluation_steps?.find(s => s.intensity !== undefined);
    if (intensityStep) effectiveIntensity = Math.round(intensityStep.intensity);

    const isMemberSubject = subjectType === 'member';
    const roleGated = isMemberSubject && (effectiveIntensity < 60 || phase === 'HOLD'); // Simple heuristic for now

    const handleShare = () => {
        const params = new URLSearchParams({
            axis,
            period: time,
            subject: subjectType,
            trace: 'open',
            // If expert mode is open, share that state too? For now standard share.
        });
        if (isMemberSubject && memberId) params.set('memberId', memberId);

        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        navigator.clipboard.writeText(url).then(() => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        });
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
                            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px' }}
                        >
                            Share
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Body */}
            <div className="trace-body" style={{ flex: 1 }}>

                {/* Section 1: Family Environment */}
                <section style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', color: '#d1d5db', marginBottom: '8px', borderLeft: '3px solid #6b7280', paddingLeft: '8px' }}>Family Environment</h4>
                    <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.5', margin: 0 }}>
                        During this period, the broader family environment shows changing conditions related to {currentAxis.domain_noun}.
                    </p>
                    {/* Placeholder for range if available */}
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

                {/* Section 4: Final Outcome */}
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
                                <div style={{ color: '#d1d5db' }}>Step {step.step}: {step.rule || step.rule_type}</div>
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
