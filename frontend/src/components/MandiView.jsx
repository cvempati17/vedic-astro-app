import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { calculateMandi, buildMandiReport } from '../utils/mandiUtils';
import './VariousBalasView.css'; // Reuse existing styles for consistency

const MandiView = ({ chartData, formData, onOpenInfo }) => {
    const { t } = useTranslation();

    const mandi = useMemo(() => {
        const basicMandi = calculateMandi(chartData, formData);
        if (!basicMandi) return null;

        const birthYear = new Date(formData.date).getFullYear();
        const ascendantSign = chartData.Ascendant?.sign || 'Aries'; // Fallback

        return buildMandiReport(basicMandi, ascendantSign, birthYear);
    }, [chartData, formData]);

    if (!mandi) {
        return <div className="various-balas-container" style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>
            <h3>{t('mandi.unableToCalculate', 'Unable to calculate Mandi. Please check birth details.')}</h3>
        </div>;
    }

    return (
        <div className="various-balas-container">
            <div className="section-title">
                <span>🪐</span>
                <h3>{t('mandi.title', 'Mandi (Gulika) Analysis')}</h3>
                <span
                    className="info-link"
                    onClick={onOpenInfo}
                    style={{
                        fontSize: '0.9rem',
                        color: '#a78bfa',
                        cursor: 'pointer',
                        marginLeft: '10px',
                        textDecoration: 'underline'
                    }}
                >
                    (More information)
                </span>
            </div>

            <div className="signature-section" style={{ borderLeftColor: '#f472b6' }}>
                <div className="signature-quote" style={{ color: '#f472b6' }}>
                    {t('mandi.position', 'Mandi in {{sign}} — {{house}} House', { sign: mandi.sign, house: mandi.house })}
                </div>
                <div className="signature-desc">
                    <strong>{t('mandi.coreTheme', 'Core Theme')}:</strong> {mandi.coreTheme}
                </div>
            </div>

            <div className="life-summary-section">
                <div className="section-title">
                    <span>📚</span>
                    <h3>{t('mandi.lifePhases', 'Mandi Life Phases')}</h3>
                </div>
                <div className="summary-table-wrapper">
                    <table className="summary-table">
                        <thead>
                            <tr>
                                <th className="phase-header">{t('mandi.phase', 'Phase')}</th>
                                <th className="years-header">{t('mandi.years', 'Years')}</th>
                                <th>{t('mandi.description', 'Description')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mandi.lifePhases && mandi.lifePhases.map((phase, i) => (
                                <tr key={i}>
                                    <td className="phase-cell">{phase.label}</td>
                                    <td className="years-cell">{phase.years}</td>
                                    <td className="path-cell">{phase.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="planet-analysis-card">
                <div className="planet-header">
                    <span className="planet-icon"></span>
                    <span className="planet-name">{t('mandi.placementDetails', 'Placement Interpretation')}</span>
                </div>
                <div className="life-advice">
                    <p style={{ margin: 0 }}>{mandi.placementDetails}</p>
                </div>
            </div>

            <div className="planet-analysis-card">
                <div className="planet-header">
                    <span className="planet-icon">🛡️</span>
                    <span className="planet-name">{t('mandi.strengthAndMitigation', 'Strength & Mitigation')}</span>
                </div>
                <div className="life-advice">
                    <p style={{ margin: 0 }}>{mandi.strengthSummary}</p>
                </div>
            </div>

            <div className="planet-analysis-card">
                <div className="planet-header">
                    <span className="planet-icon">🎁</span>
                    <span className="planet-name">{t('mandi.hiddenGifts', 'Hidden Gifts')}</span>
                </div>
                <div className="life-advice">
                    <p style={{ margin: 0 }}>{mandi.hiddenGifts}</p>
                </div>
            </div>

            <div className="planet-analysis-card">
                <div className="planet-header">
                    <span className="planet-icon">🕉️</span>
                    <span className="planet-name">{t('mandi.spiritualMeaning', 'Spiritual Meaning')}</span>
                </div>
                <div className="life-advice">
                    <p style={{ margin: 0 }}>{mandi.spiritualMeaning}</p>
                </div>
            </div>

            <div className="planet-analysis-card">
                <div className="planet-header">
                    <span className="planet-icon">🪔</span>
                    <span className="planet-name">{t('mandi.remedies', 'Remedies')}</span>
                </div>
                <div className="life-advice">
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {mandi.remedies.map((rem, i) => (
                            <li key={i} style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>{rem}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="planet-analysis-card">
                <div className="planet-header">
                    <span className="planet-icon">✅</span>
                    <span className="planet-name">{t('mandi.overallSummary', 'Overall Summary')}</span>
                </div>
                <div className="life-advice">
                    <p style={{ margin: 0 }}>{mandi.overallSummary}</p>
                </div>
            </div>

            <div className="life-summary-section">
                <div className="section-title">
                    <span>📅</span>
                    <h3>{t('mandi.triggerYears', 'Detailed Mandi Trigger Years')}</h3>
                </div>
                <div className="summary-table-wrapper">
                    <table className="summary-table">
                        <thead>
                            <tr>
                                <th>{t('mandi.year', 'Year')}</th>
                                <th>{t('mandi.impact', 'Impact')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mandi.triggerYears.map((item, i) => (
                                <tr key={i}>
                                    <td className="area-cell">{item.year}</td>
                                    <td className="path-cell">{item.impact}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="life-summary-section">
                <div className="section-title">
                    <span>📈</span>
                    <h3>{t('mandi.transitReport', 'Saturn + Mandi Transit Report (2025–2032)')}</h3>
                </div>
                <div className="summary-table-wrapper">
                    <table className="summary-table">
                        <thead>
                            <tr>
                                <th>{t('mandi.year', 'Year')}</th>
                                <th>{t('mandi.theme', 'Theme')}</th>
                                <th>{t('mandi.outcome', 'Outcome')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mandi.transits.map((item, i) => (
                                <tr key={i}>
                                    <td className="area-cell">{item.year}</td>
                                    <td className="path-cell" style={{ fontWeight: 'bold', color: '#f472b6' }}>{item.theme}</td>
                                    <td className="path-cell">{item.outcome}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MandiView;
