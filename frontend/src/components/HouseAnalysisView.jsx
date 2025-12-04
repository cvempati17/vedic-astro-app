import React from 'react';
import { useTranslation } from 'react-i18next';
import { getHouseType, getPurushartha, getRelationship } from '../utils/houseUtils';
import './HouseAnalysisView.css';

const HouseAnalysisView = ({ data }) => {
    const { t } = useTranslation();
    if (!data || !data.Ascendant) return null;

    const ascLong = data.Ascendant.longitude;
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    // Helper to get house number
    const getHouseNum = (planetLong) => {
        const planetRasi = Math.floor(planetLong / 30);
        const ascRasi = Math.floor(ascLong / 30);
        return ((planetRasi - ascRasi + 12) % 12) + 1;
    };

    // 1. House Classifications Data
    const classifications = planets.map(planet => {
        const houseNum = getHouseNum(data[planet].longitude);
        return {
            planet,
            house: houseNum,
            types: getHouseType(houseNum),
            purushartha: getPurushartha(houseNum)
        };
    });

    // 2. Key Relationships Data
    const relationships = [
        { p1: 'Sun', p2: 'Moon', labelKey: 'relSoulMind' },
        { p1: 'Mars', p2: 'Venus', labelKey: 'relPassion' },
        { p1: 'Jupiter', p2: 'Moon', labelKey: 'relWisdom' },
        { p1: 'Saturn', p2: 'Moon', labelKey: 'relStress' },
        { p1: 'Rahu', p2: 'Moon', labelKey: 'relObsession' }
    ];

    const relData = relationships.map(pair => ({
        ...pair,
        info: getRelationship(data[pair.p1].longitude, data[pair.p2].longitude)
    }));

    return (
        <div className="house-analysis-container">
            <h2 className="section-title">{t('houseAnalysis.title')}</h2>

            <div className="analysis-grid">
                {/* Section 1: House Classifications */}
                <div className="classification-section">
                    <h3>{t('houseAnalysis.placementsTitle')}</h3>
                    <div className="classification-table">
                        <div className="c-header">
                            <span>{t('houseAnalysis.planetHeader')}</span>
                            <span>{t('houseAnalysis.houseHeader')}</span>
                            <span>{t('houseAnalysis.classificationHeader')}</span>
                            <span>{t('houseAnalysis.goalHeader')}</span>
                        </div>
                        {classifications.map((item) => (
                            <div key={item.planet} className="c-row">
                                <span className="c-planet">{t(`planets.${item.planet}`)}</span>
                                <span className="c-house">{t('houseAnalysis.houseNum', { num: item.house })}</span>
                                <span className="c-types">
                                    {item.types.map(type => <span key={type} className="type-badge">{t(`houseTypes.${type}`)}</span>)}
                                </span>
                                <span className="c-goal">{t(`purusharthas.${item.purushartha}`)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 2: Planetary Relationships */}
                <div className="relationship-section">
                    <h3>{t('houseAnalysis.relationshipsTitle')}</h3>
                    <div className="rel-cards">
                        {relData.map((rel, idx) => (
                            <div key={idx} className={`rel-card ${rel.info.quality.toLowerCase().includes('inauspicious') ? 'rel-bad' : 'rel-good'}`}>
                                <div className="rel-header">
                                    <span className="rel-label">{t(`houseAnalysis.${rel.labelKey}`)}</span>
                                    <span className="rel-name">{rel.info.name}</span>
                                </div>
                                <div className="rel-desc">{rel.info.description}</div>
                                <div className="rel-quality">{rel.info.quality}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HouseAnalysisView;
