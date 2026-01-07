import React from 'react';

const PhaseTraceDrawer = ({ isOpen, onClose, traceData, axis, time, phase }) => {
    if (!isOpen || !traceData) return null;

    // Helper to format rule names
    const formatRule = (rule) => {
        return rule.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    // Helper to get Color based on Outcome/Phase
    const getOutcomeColor = (outcome, rule) => {
        const str = String(outcome).toUpperCase();
        if (str.includes('BLOCK')) return '#8E44AD'; // Purple
        if (str.includes('OPEN') && !str.includes('SUPPRESSED')) return '#2ECC71'; // Green
        if (str.includes('HIGH')) return '#E74C3C'; // Red (Risk)
        if (str.includes('SUPPRESSED')) return '#F39C12'; // Amber
        return '#9ca3af'; // Grey
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px',
            height: '100%',
            backgroundColor: '#111827', // Gray 900
            borderLeft: '1px solid #374151',
            boxShadow: '-4px 0 16px rgba(0,0,0,0.5)',
            zIndex: 2000,
            padding: '24px',
            overflowY: 'auto',
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #374151', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h2 style={{ margin: 0, color: '#e6c87a', fontSize: '20px' }}>Phase Logic Trace</h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '24px' }}
                    >
                        ×
                    </button>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                    <strong>{time}</strong> • <span>{axis.toUpperCase()}</span>
                </div>
            </div>

            {/* Final Resolution */}
            <div style={{
                marginBottom: '24px',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: '#1f2937',
                border: `1px solid ${getOutcomeColor(phase)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div>
                    <span style={{ display: 'block', fontSize: '12px', color: '#9ca3af', uppercase: true }}>Final Resolution</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: getOutcomeColor(phase) }}>
                        {phase} PHASE
                    </span>
                </div>
                <div style={{
                    width: '12px', height: '12px', borderRadius: '50%',
                    backgroundColor: getOutcomeColor(phase)
                }} />
            </div>

            {/* Evaluation Steps */}
            <h3 style={{ color: '#d1d5db', fontSize: '16px', marginBottom: '16px' }}>Evaluation Sequence</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {traceData.evaluation_steps.map((step, idx) => (
                    <div key={idx} style={{
                        position: 'relative',
                        paddingLeft: '24px',
                        borderLeft: `2px solid ${getOutcomeColor(step.outcome, step.rule)}`
                    }}>
                        {/* Dot */}
                        <div style={{
                            position: 'absolute', left: '-6px', top: '0',
                            width: '10px', height: '10px', borderRadius: '50%',
                            backgroundColor: '#111827',
                            border: `2px solid ${getOutcomeColor(step.outcome, step.rule)}`
                        }} />

                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                            Step {step.step} • {formatRule(step.rule)}
                        </div>

                        <div style={{ color: '#e5e7eb', fontSize: '14px', marginBottom: '4px' }}>
                            <strong>Outcome:</strong> <span style={{ color: getOutcomeColor(step.outcome, step.rule) }}>
                                {String(step.outcome).replace(/_/g, ' ')}
                            </span>
                        </div>

                        {/* Details */}
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {step.risk_level && <div>Risk Level: {step.risk_level}</div>}
                            {step.house_hit && <div>House Hit: {step.house_hit}</div>}
                            {step.suppression_reason && <div style={{ color: '#F39C12' }}>Reason: {step.suppression_reason}</div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #374151', color: '#6b7280', fontSize: '12px', textAlign: 'center' }}>
                System Trace v1.1.0 • Governance Locked
            </div>
        </div>
    );
};

export default PhaseTraceDrawer;
