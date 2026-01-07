import React, { useState } from 'react';

const PhaseTraceDrawer = ({ isOpen, onClose, traceData, axis, time, phase }) => {
    const [showToast, setShowToast] = useState(false);

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

    const handleShare = () => {
        const params = new URLSearchParams({
            axis,
            period: time,
            trace: 'open'
        });
        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        navigator.clipboard.writeText(url).then(() => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        });
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
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={handleShare}
                            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
                        >
                            Share
                        </button>
                        <button
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '24px', lineHeight: '1' }}
                        >
                            ×
                        </button>
                    </div>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                    <strong>{time}</strong> • <span>{axis ? axis.toUpperCase() : ''}</span>
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
            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evaluation Path</h3>

                {traceData.evaluation_steps.map((step, idx) => (
                    <div key={idx} style={{
                        marginBottom: '16px',
                        paddingLeft: '16px',
                        borderLeft: `2px solid ${getOutcomeColor(step.outcome || step.risk_level)}`,
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute', left: '-5px', top: '0',
                            width: '8px', height: '8px', borderRadius: '50%',
                            backgroundColor: '#374151'
                        }} />

                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                            Step {step.step}: {formatRule(step.rule || step.rule_type)}
                        </div>

                        <div style={{ color: '#e5e7eb', fontSize: '14px', marginBottom: '4px' }}>
                            {step.risk_level ? `Risk Level: ${step.risk_level}` : `Result: ${step.outcome}`}
                        </div>

                        {step.threshold && (
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                Value: {Math.round(step.intensity)} vs Threshold: {step.threshold}
                            </div>
                        )}
                        {step.description && (
                            <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', marginTop: '4px' }}>
                                {step.description}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Disclaimer */}
            <footer style={{ marginTop: '24px', borderTop: '1px solid #374151', paddingTop: '16px', fontSize: '11px', color: '#4b5563', textAlign: 'center' }}>
                This explanation reflects system evaluation steps. It does not predict future outcomes.
            </footer>

            {/* Toast */}
            {showToast && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: '#1f2937',
                    color: '#f3f4f6',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    zIndex: 3000,
                    border: '1px solid #374151'
                }}>
                    Link copied to clipboard
                </div>
            )}
        </div>
    );
};

export default PhaseTraceDrawer;
