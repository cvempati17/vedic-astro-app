import React, { useState } from 'react';
import { calculateVimshottariDasha, calculateAntardashas, formatDate } from '../utils/dashaUtils';
import './DashaTable.css';

const DashaTable = ({ moonLongitude, birthDate }) => {
    const [expandedDasha, setExpandedDasha] = useState(null);

    if (!moonLongitude || !birthDate) return null;

    const dashaData = calculateVimshottariDasha(moonLongitude, birthDate);

    if (!dashaData) return null;

    const toggleDasha = (index, planet, startDate) => {
        if (expandedDasha === index) {
            setExpandedDasha(null);
        } else {
            setExpandedDasha(index);
        }
    };

    return (
        <div className="dasha-container">
            <h3 className="dasha-title">⏳ Vimshottari Dasha</h3>

            <div className="balance-info">
                <span className="label">Birth Balance:</span>
                <span className="value">
                    {dashaData.balance.planet} Dasha remaining for{' '}
                    {dashaData.balance.years}y {dashaData.balance.months}m {dashaData.balance.days}d
                </span>
            </div>

            <div className="dasha-timeline">
                {dashaData.dashas.map((dasha, index) => {
                    const isExpanded = expandedDasha === index;
                    const antardashas = isExpanded ? calculateAntardashas(dasha.planet, dasha.startDate) : [];

                    return (
                        <div
                            key={dasha.planet}
                            className={`dasha-item ${dasha.isCurrent ? 'current' : ''} ${isExpanded ? 'expanded' : ''}`}
                        >
                            <div
                                className="dasha-header"
                                onClick={() => toggleDasha(index, dasha.planet, dasha.startDate)}
                            >
                                <div className="dasha-planet">
                                    <span className="planet-icon">{getPlanetIcon(dasha.planet)}</span>
                                    <span className="planet-name">{dasha.planet}</span>
                                    {dasha.isCurrent && <span className="current-badge">Current</span>}
                                </div>
                                <div className="dasha-dates">
                                    {formatDate(dasha.startDate)} — {formatDate(dasha.endDate)}
                                </div>
                                <div className="dasha-duration">
                                    {index === 0 ? 'Balance' : `${dasha.fullDuration} Years`}
                                    <span className="arrow">{isExpanded ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="antardasha-list">
                                    <h4 className="antardasha-title">Antardashas (Sub-periods)</h4>
                                    <div className="antardasha-grid">
                                        {antardashas.map((ad) => (
                                            <div
                                                key={ad.planet}
                                                className={`antardasha-item ${ad.isCurrent ? 'current-sub' : ''}`}
                                            >
                                                <div className="ad-planet">
                                                    {dasha.planet} — {ad.planet}
                                                </div>
                                                <div className="ad-dates">
                                                    {formatDate(ad.startDate)} — {formatDate(ad.endDate)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const getPlanetIcon = (planet) => {
    const icons = {
        'Sun': '☀️', 'Moon': '🌙', 'Mars': '♂️', 'Mercury': '☿️',
        'Jupiter': '♃', 'Venus': '♀️', 'Saturn': '♄', 'Rahu': '🐲', 'Ketu': '🐉'
    };
    return icons[planet] || '🪐';
};

export default DashaTable;
