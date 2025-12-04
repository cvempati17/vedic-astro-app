import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { calculateVariousBalas, calculateLifeAspects, getPersonalSignature, getPlanetaryAnalysis } from '../utils/variousBalasUtils';
import './VariousBalasView.css';

const VariousBalasView = ({ chartData, onOpenInfo }) => {
    const { t } = useTranslation();

    const balas = useMemo(() => calculateVariousBalas(chartData), [chartData]);
    const lifeAspects = useMemo(() => calculateLifeAspects(chartData), [chartData]);
    const signature = useMemo(() => getPersonalSignature(chartData), [chartData]);
    const planetaryAnalysis = useMemo(() => getPlanetaryAnalysis(chartData), [chartData]);

    if (!balas || balas.length === 0) {
        return <div className="various-balas-container" style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>
            <h3>{t('variousBalas.unableToCalculate', 'Unable to calculate Balas. Please check chart data.')}</h3>
        </div>;
    }

    return (
        <div className="various-balas-container">
            {/* Section 1: List of Balas */}
            <div className="section-title">
                <span>📊</span>
                <h3>{t('variousBalas.title', 'Various Balas')}</h3>
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
                    (Need to know more about it)
                </span>
            </div>

            <div className="balas-grid">
                {balas.map((bala, index) => (
                    <div key={index} className="bala-card">
                        <div className="bala-header">
                            <span className="bala-name">{bala.name}</span>
                            <span className="bala-value">{Math.round(bala.value)} / {bala.max}</span>
                        </div>
                        <div className="bala-desc">{bala.description}</div>
                        <div className="bala-bar-bg">
                            <div
                                className="bala-bar-fill"
                                style={{ width: `${(bala.value / bala.max) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Section 2: Life Summary Table */}
            <div className="section-title">
                <span>🧬</span>
                <h3>{t('variousBalas.lifeSummary', 'Life Summary from Your Bala Profile')}</h3>
            </div>

            <div className="life-summary-section">
                <div className="summary-table-wrapper">
                    <table className="summary-table">
                        <thead>
                            <tr>
                                <th>{t('variousBalas.area', 'Area')}</th>
                                <th>{t('variousBalas.path', 'Path')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lifeAspects.map((aspect, index) => (
                                <tr key={index}>
                                    <td className="area-cell">
                                        {aspect.area}
                                        <div className={`status-cell status-${aspect.status.toLowerCase()}`}>
                                            {aspect.status} ({aspect.score}%)
                                        </div>
                                    </td>
                                    <td className="path-cell">{aspect.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 3: Personal Signature */}
            <div className="section-title">
                <span>✨</span>
                <h3>{t('variousBalas.coreThemes', 'Core Life Themes')}</h3>
            </div>

            <div className="signature-section">
                <div className="signature-quote">{signature.quote}</div>
                <div className="signature-desc">
                    <strong>{signature.title}:</strong> {signature.desc}
                </div>
            </div>

            {/* Section 4: Planetary Analysis */}
            <div className="section-title">
                <span>🪐</span>
                <h3>{t('variousBalas.lifeAdvice', 'Life Advice')}</h3>
            </div>

            {planetaryAnalysis.map((planet) => (
                <div key={planet.id} className="planet-analysis-card">
                    <div className="planet-header">
                        <span className="planet-icon">{planet.icon}</span>
                        <span className="planet-name">{planet.name}</span>
                        <span className="planet-title">- {planet.title}</span>
                    </div>
                    <div className="strength-reason">{planet.strengthReason}</div>

                    <div className="analysis-grid">
                        <div className="analysis-column">
                            <h4>{t('variousBalas.gifts', 'Gifts')}</h4>
                            <ul className="gifts-list">
                                {planet.gifts.map((gift, i) => <li key={i}>• {gift}</li>)}
                            </ul>
                        </div>
                        <div className="analysis-column">
                            <h4>{t('variousBalas.challenges', 'Challenges')}</h4>
                            <ul className="challenges-list">
                                {planet.challenges.map((challenge, i) => <li key={i}>• {challenge}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="life-advice">
                        <h4>💡 Advice</h4>
                        <p>{planet.advice}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VariousBalasView;
