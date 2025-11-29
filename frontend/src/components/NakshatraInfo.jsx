import React from 'react';
import { calculateNakshatra, getNakshatraAbbr } from '../utils/nakshatraUtils';
import './NakshatraInfo.css';

const NakshatraInfo = ({ data }) => {
    if (!data) return null;

    // Calculate nakshatras for key planets
    const moonNakshatra = data.Moon ? calculateNakshatra(data.Moon.longitude) : null;
    const ascendantNakshatra = data.Ascendant ? calculateNakshatra(data.Ascendant.longitude) : null;
    const sunNakshatra = data.Sun ? calculateNakshatra(data.Sun.longitude) : null;

    // Get all planet nakshatras
    const planetNakshatras = Object.entries(data)
        .filter(([planet, info]) => planet !== 'Ascendant' && info.longitude !== undefined)
        .map(([planet, info]) => ({
            planet,
            nakshatra: calculateNakshatra(info.longitude),
            longitude: info.longitude
        }));

    return (
        <div className="nakshatra-info-container">
            <h3 className="nakshatra-title">Nakshatra Information</h3>

            {/* Birth Star (Moon's Nakshatra) */}
            {moonNakshatra && (
                <div className="birth-star-section">
                    <h4 className="section-title">🌙 Birth Star (Janma Nakshatra)</h4>
                    <div className="nakshatra-card highlighted">
                        <div className="nakshatra-header">
                            <span className="nakshatra-name">{moonNakshatra.name}</span>
                            <span className="nakshatra-pada">Pada {moonNakshatra.pada}</span>
                        </div>
                        <div className="nakshatra-details">
                            <div className="detail-row">
                                <span className="label">Lord:</span>
                                <span className="value">{moonNakshatra.lord}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Deity:</span>
                                <span className="value">{moonNakshatra.deity}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Position:</span>
                                <span className="value">{moonNakshatra.degrees}° in Nakshatra</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ascendant Nakshatra */}
            {ascendantNakshatra && (
                <div className="ascendant-nakshatra-section">
                    <h4 className="section-title">⬆️ Lagna Nakshatra</h4>
                    <div className="nakshatra-card">
                        <div className="nakshatra-header">
                            <span className="nakshatra-name">{ascendantNakshatra.name}</span>
                            <span className="nakshatra-pada">Pada {ascendantNakshatra.pada}</span>
                        </div>
                        <div className="nakshatra-details">
                            <div className="detail-row">
                                <span className="label">Lord:</span>
                                <span className="value">{ascendantNakshatra.lord}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Deity:</span>
                                <span className="value">{ascendantNakshatra.deity}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* All Planets Nakshatras */}
            <div className="all-nakshatras-section">
                <h4 className="section-title">🌟 Planetary Nakshatras</h4>
                <div className="nakshatra-grid">
                    {planetNakshatras.map(({ planet, nakshatra }) => (
                        <div key={planet} className="nakshatra-item">
                            <div className="planet-name">{planet}</div>
                            <div className="nakshatra-compact">
                                <span className="nak-name">{getNakshatraAbbr(nakshatra.name)}</span>
                                <span className="nak-pada">P{nakshatra.pada}</span>
                            </div>
                            <div className="nakshatra-lord">{nakshatra.lord}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nakshatra Legend */}
            <div className="nakshatra-legend">
                <h4 className="section-title">📖 Nakshatra Cycle</h4>
                <div className="legend-grid">
                    {Array.from({ length: 27 }, (_, i) => {
                        const testNak = calculateNakshatra(i * 13.333);
                        const isActive =
                            testNak.name === moonNakshatra?.name ||
                            testNak.name === ascendantNakshatra?.name;

                        return (
                            <div
                                key={i}
                                className={`legend-item ${isActive ? 'active' : ''}`}
                                title={`${testNak.name} - ${testNak.lord}`}
                            >
                                <span className="legend-number">{i + 1}</span>
                                <span className="legend-name">{getNakshatraAbbr(testNak.name)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default NakshatraInfo;
