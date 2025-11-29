import React from 'react';
import { calculateDignity, getStrengthMeaning, getPlanetNature, calculateAvastha } from '../utils/strengthUtils';
import './StrengthView.css';

const StrengthView = ({ data }) => {
    if (!data) return null;

    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const ascendantLong = data.Ascendant?.longitude || 0;

    const strengths = planets.map(planet => {
        const info = data[planet];
        if (!info) return null;
        const nature = getPlanetNature(planet, ascendantLong);
        const avastha = calculateAvastha(info.longitude);
        return {
            name: planet,
            ...calculateDignity(planet, info.longitude, ascendantLong),
            ...nature,
            avastha
        };
    }).filter(Boolean);

    return (
        <div className="strength-container">
            <h2 className="section-title">Planetary Strength & Nature</h2>
            <p className="section-subtitle">
                Understanding dignity (strength), functional nature, and avastha (state) for your chart.
            </p>

            <div className="strength-grid">
                {strengths.map((planet) => (
                    <div key={planet.name} className="strength-card">
                        <div className="strength-header">
                            <div className="planet-name">
                                <span className="planet-icon">{getPlanetIcon(planet.name)}</span>
                                {planet.name}
                            </div>
                            <div className="strength-badge" style={{ backgroundColor: planet.color + '20', color: planet.color }}>
                                {planet.status}
                            </div>
                        </div>

                        <div className="nature-badges">
                            <span className={`nature-tag ${planet.natural.includes('Benefic') ? 'nat-benefic' : 'nat-malefic'}`}>
                                {planet.natural}
                            </span>
                            <span className={`nature-tag ${planet.isBenefic ? 'func-benefic' : 'func-malefic'}`}>
                                {planet.functional}
                            </span>
                        </div>

                        <div className="avastha-info">
                            <span className="avastha-label">State:</span>
                            <span className="avastha-value">{planet.avastha.state}</span>
                            <span className="avastha-meaning">({planet.avastha.meaning})</span>
                        </div>

                        <div className="strength-bar-container">
                            <div
                                className="strength-bar"
                                style={{
                                    width: `${planet.score}%`,
                                    backgroundColor: planet.color
                                }}
                            ></div>
                        </div>

                        <div className="strength-details">
                            <span>House {planet.house}</span>
                            {planet.details && <span className="detail-tag">{planet.details}</span>}
                        </div>

                        <div className="strength-meaning">
                            {getStrengthMeaning(planet.status)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const getPlanetIcon = (name) => {
    const icons = {
        Sun: '☀️', Moon: '🌙', Mars: '♂️', Mercury: '☿️',
        Jupiter: '♃', Venus: '♀️', Saturn: '♄', Rahu: '🐲', Ketu: '🐉'
    };
    return icons[name] || '🪐';
};

export default StrengthView;
