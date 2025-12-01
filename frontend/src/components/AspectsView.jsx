import React from 'react';
import { calculateAspects, calculateConjunctions, getAspectsOnSign } from '../utils/aspectUtils';
import './AspectsView.css';

const AspectsView = ({ data }) => {
    if (!data) return null;

    const aspects = calculateAspects(data);
    const conjunctions = calculateConjunctions(data);

    // Calculate aspects on Ascendant
    const ascendantLong = data.Ascendant?.longitude || 0;
    const ascRasiIndex = Math.floor(ascendantLong / 30);
    const aspectsOnAsc = getAspectsOnSign(ascRasiIndex, aspects);

    const getPlanetIcon = (planet) => {
        const icons = {
            'Sun': '☀️', 'Moon': '🌙', 'Mars': '♂️', 'Mercury': '☿️',
            'Jupiter': '♃', 'Venus': '♀️', 'Saturn': '♄', 'Rahu': '🐲', 'Ketu': '🐉'
        };
        return icons[planet] || '🪐';
    };

    return (
        <div className="aspects-container">
            <h2 className="results-section-title">👁️ Planetary Aspects (Drishti)</h2>

            <div className="aspects-grid">
                {/* Conjunctions Card */}
                <div className="aspect-card conjunctions">
                    <h3>🤝 Conjunctions (Yogas)</h3>
                    {Object.keys(conjunctions).length > 0 ? (
                        <div className="conjunction-list">
                            {Object.entries(conjunctions).map(([sign, planets]) => (
                                <div key={sign} className="conjunction-item">
                                    <span className="sign-badge">{sign}</span>
                                    <div className="planet-group">
                                        {planets.map(p => (
                                            <span key={p} className="planet-pill">
                                                {getPlanetIcon(p)} {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-text">No major conjunctions found.</p>
                    )}
                </div>

                {/* Aspects on Ascendant */}
                <div className="aspect-card ascendant-aspects">
                    <h3>⬆️ Aspects on Ascendant</h3>
                    {aspectsOnAsc.length > 0 ? (
                        <ul className="aspect-list">
                            {aspectsOnAsc.map((item, idx) => (
                                <li key={idx}>
                                    <strong>{getPlanetIcon(item.planet)} {item.planet}</strong>
                                    <span className="aspect-type"> casts {item.type}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-text">No planets aspecting the Ascendant.</p>
                    )}
                </div>

                {/* Full Aspects Table */}
                <div className="aspect-card full-aspects">
                    <h3>🌐 Planetary Aspects</h3>
                    <div className="table-wrapper">
                        <table className="aspect-table">
                            <thead>
                                <tr>
                                    <th>Planet</th>
                                    <th>Aspects (Drishti)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(aspects).map(([planet, aspectList]) => (
                                    <tr key={planet}>
                                        <td className="planet-cell">
                                            {getPlanetIcon(planet)} {planet}
                                        </td>
                                        <td>
                                            <div className="aspect-targets">
                                                {aspectList.map((a, i) => (
                                                    <span key={i} className="aspect-tag">
                                                        {a.targetRasi} ({a.houseDistance}th)
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AspectsView;
