import React from 'react';
import { useTranslation } from 'react-i18next';
import { calculateNakshatra, getNakshatraAbbr } from '../utils/nakshatraUtils';
import './NakshatraInfo.css';

const NakshatraInfo = ({ data }) => {
    const { t } = useTranslation();
    if (!data) return null;

    // Calculate nakshatras for key planets
    const moonNakshatra = data.Moon ? calculateNakshatra(data.Moon.longitude) : null;
    const ascendantNakshatra = data.Ascendant ? calculateNakshatra(data.Ascendant.longitude) : null;
    const sunNakshatra = data.Sun ? calculateNakshatra(data.Sun.longitude) : null;

    const calculateArudhaLagna = () => {
        if (!data.Ascendant || data.Ascendant.longitude === undefined) return null;

        const ascLong = data.Ascendant.longitude;
        const ascRasi = Math.floor(ascLong / 30); // 0-11

        const SIGN_LORDS = [
            'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
            'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
        ];

        const lagnaLord = SIGN_LORDS[ascRasi];
        const lordInfo = data[lagnaLord];
        if (!lordInfo || lordInfo.longitude === undefined) return null;

        const lordRasi = Math.floor(lordInfo.longitude / 30);

        // House number of Lagna lord from Lagna (1-12)
        const lordHouseFromLagna = ((lordRasi - ascRasi + 12) % 12) + 1;

        let arudhaHouseFromLagna;

        // Special rules from guide
        if (lordHouseFromLagna === 1) {
            // Lagna lord in 1st -> Arudha = 10th house
            arudhaHouseFromLagna = 10;
        } else if (lordHouseFromLagna === 7) {
            // Lagna lord in 7th -> Arudha = 4th house
            arudhaHouseFromLagna = 4;
        } else {
            // General rule: Arudha in 2 * N house from Lagna
            const twoN = 2 * lordHouseFromLagna;
            arudhaHouseFromLagna = ((twoN - 1) % 12) + 1;

            // If result lands in same house where Lagna lord is located, shift 10 houses forward
            if (arudhaHouseFromLagna === lordHouseFromLagna) {
                arudhaHouseFromLagna = ((arudhaHouseFromLagna + 10 - 1) % 12) + 1;
            }
        }

        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const arudhaRasiIndex = (ascRasi + (arudhaHouseFromLagna - 1)) % 12;

        return {
            rasiIndex: arudhaRasiIndex,
            rasiName: signs[arudhaRasiIndex],
            houseFromLagna: arudhaHouseFromLagna
        };
    };

    const arudhaLagna = calculateArudhaLagna();

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
            <h3 className="nakshatra-title">{t('nakshatra.title')}</h3>

            {/* Birth Star (Moon's Nakshatra) */}
            {moonNakshatra && (
                <div className="birth-star-section">
                    <h4 className="section-title">🌙 {t('nakshatra.birthStarTitle')}</h4>
                    <div className="nakshatra-card highlighted">
                        <div className="nakshatra-header">
                            <span className="nakshatra-name">{moonNakshatra.name}</span>
                            <span className="nakshatra-pada">{t('nakshatra.pada', { num: moonNakshatra.pada })}</span>
                        </div>
                        <div className="nakshatra-details">
                            <div className="detail-row">
                                <span className="label">{t('nakshatra.lord')}:</span>
                                <span className="value">{t(`planets.${moonNakshatra.lord}`) || moonNakshatra.lord}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">{t('nakshatra.deity')}:</span>
                                <span className="value">{moonNakshatra.deity}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">{t('nakshatra.position')}:</span>
                                <span className="value">{moonNakshatra.degrees}° {t('nakshatra.inNakshatra')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ascendant Nakshatra */}
            {ascendantNakshatra && (
                <div className="ascendant-nakshatra-section">
                    <h4 className="section-title">
                        ⬆️ {t('nakshatra.lagnaNakshatraTitle')}
</h4>
                    <div className="nakshatra-card">
                        <div className="nakshatra-header">
                            <span className="nakshatra-name">{ascendantNakshatra.name}</span>
                            <span className="nakshatra-pada">{t('nakshatra.pada', { num: ascendantNakshatra.pada })}</span>
                        </div>
                            <div className="nakshatra-details">
                                <div className="detail-row">
                                    <span className="label">{t('nakshatra.lord')}:</span>
                                    <span className="value">{t(`planets.${ascendantNakshatra.lord}`) || ascendantNakshatra.lord}</span>
                                </div>
                            <div className="detail-row">
                                <span className="label">{t('nakshatra.deity')}:</span>
                                <span className="value">{ascendantNakshatra.deity}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {arudhaLagna && (
                <div className="ascendant-nakshatra-section">
                    <h4 className="section-title">✨ Arudha Lagna</h4>
                    <div className="nakshatra-card">
                        <div className="nakshatra-details">
                            <div className="detail-row">
                                <span className="label">Sign (Rasi):</span>
                                <span className="value">{arudhaLagna.rasiName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">House from Lagna:</span>
                                <span className="value">{arudhaLagna.houseFromLagna}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Impact:</span>
                                <span className="value">
                                    {t('nakshatra.arudhaImpact', 'Arudha Lagna shows how others see you, your public image and perceived success.')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* All Planets Nakshatras */}
            <div className="all-nakshatras-section">
                <h4 className="section-title">🌟 {t('nakshatra.planetaryNakshatrasTitle')}</h4>
                <div className="nakshatra-grid">
                    {planetNakshatras.map(({ planet, nakshatra }) => (
                        <div key={planet} className="nakshatra-item">
                            <div className="planet-name">{t(`planets.${planet}`)}</div>
                            <div className="nakshatra-compact">
                                <span className="nak-name">{getNakshatraAbbr(nakshatra.name)}</span>
                                <span className="nak-pada">P{nakshatra.pada}</span>
                            </div>
                            <div className="nakshatra-lord">{t(`planets.${nakshatra.lord}`) || nakshatra.lord}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nakshatra Legend */}
            <div className="nakshatra-legend">
                <h4 className="section-title">📖 {t('nakshatra.cycleTitle')}</h4>
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
