import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { calculateVimshottariDasha, calculateAntardashas, formatDate } from '../utils/dashaUtils';
import './DashaTable.css';

const DashaTable = ({ moonLongitude, birthDate }) => {
    const { t } = useTranslation();
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

    const getPlanetIcon = (planet) => {
        const icons = {
            'Sun': '☀️', 'Moon': '🌙', 'Mars': '♂️', 'Mercury': '☿️',
            'Jupiter': '♃', 'Venus': '♀️', 'Saturn': '♄', 'Rahu': '🐲', 'Ketu': '🐉'
        };
        return icons[planet] || '🪐';
    };

    return (
        <div className="dasha-container">
            <h3 className="dasha-title">⏳ {t('dasha.title')}</h3>

            <div className="balance-info">
                <span className="label">{t('dasha.birthBalance')}</span>
                <span className="value">
                    {t('dasha.remaining', {
                        planet: t(`planets.${dashaData.balance.planet}`),
                        years: dashaData.balance.years,
                        months: dashaData.balance.months,
                        days: dashaData.balance.days
                    })}
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
                                    <span className="planet-name">{t(`planets.${dasha.planet}`)}</span>
                                    {dasha.isCurrent && <span className="current-badge">{t('dasha.current')}</span>}
                                </div>
                                <div className="dasha-dates">
                                    {formatDate(dasha.startDate)} — {formatDate(dasha.endDate)}
                                </div>
                                <div className="dasha-duration">
                                    {index === 0 ? t('dasha.balance') : t('dasha.fullYears', { years: dasha.fullDuration })}
                                    <span className="arrow">{isExpanded ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="antardasha-list">
                                    <h4 className="antardasha-title">{t('dasha.antardashas')}</h4>
                                    <div className="antardasha-grid">
                                        {antardashas.map((ad) => (
                                            <div
                                                key={ad.planet}
                                                className={`antardasha-item ${ad.isCurrent ? 'current-sub' : ''}`}
                                            >
                                                <div className="ad-planet">
                                                    {t(`planets.${dasha.planet}`)} — {t(`planets.${ad.planet}`)}
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

export default DashaTable;
