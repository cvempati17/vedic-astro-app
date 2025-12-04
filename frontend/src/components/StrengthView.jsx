import React from 'react';
import { useTranslation } from 'react-i18next';
import { calculateDignity, getStrengthMeaning, getPlanetNature, calculateAvastha } from '../utils/strengthUtils';
import './StrengthView.css';

const StrengthView = ({ data }) => {
    const { t } = useTranslation();
    if (!data) return null;

    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const ascendantLong = data.Ascendant?.longitude || 0;

    const getPlanetIcon = (name) => {
        const icons = {
            Sun: '☀️', Moon: '🌙', Mars: '♂️', Mercury: '☿️',
            Jupiter: '♃', Venus: '♀️', Saturn: '♄', Rahu: '🐲', Ketu: '🐉'
        };
        return icons[name] || '🪐';
    };

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
            <h2 className="section-title">{t('strength.title')}</h2>
            <p className="section-subtitle">
                {t('strength.subtitle')}
            </p>

            <div className="strength-grid">
                {strengths.map((planet) => (
                    <div key={planet.name} className="strength-card">
                        <div className="strength-header">
                            <div className="planet-name">
                                <span className="planet-icon">{getPlanetIcon(planet.name)}</span>
                                {t(`planets.${planet.name}`)}
                            </div>
                            <div className="strength-badge" style={{ backgroundColor: planet.color + '20', color: planet.color }}>
                                {t(`dignity.${planet.status}`) || planet.status}
                            </div>
                        </div>

                        <div className="nature-badges">
                            <span className={`nature-tag ${planet.natural.includes('Benefic') ? 'nat-benefic' : 'nat-malefic'}`}>
                                {t(`nature.${planet.natural}`) || planet.natural}
                            </span>
                            <span className={`nature-tag ${planet.isBenefic ? 'func-benefic' : 'func-malefic'}`}>
                                {t(`nature.${planet.functional}`) || planet.functional}
                            </span>
                        </div>

                        <div className="avastha-info">
                            <span className="avastha-label">{t('strength.state')}:</span>
                            <span className="avastha-value">{t(`avastha.${planet.avastha.state}`) || planet.avastha.state}</span>
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
                            <span>{t('strength.house', { num: planet.house })}</span>
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

export default StrengthView;
