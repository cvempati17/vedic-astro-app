import React from 'react';
import { getHouseType, getPurushartha, getRelationship } from '../utils/houseUtils';
import './HouseAnalysisView.css';

const HouseAnalysisView = ({ data }) => {
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
        { p1: 'Sun', p2: 'Moon', label: 'Soul & Mind (Sun-Moon)' },
        { p1: 'Mars', p2: 'Venus', label: 'Passion (Mars-Venus)' },
        { p1: 'Jupiter', p2: 'Moon', label: 'Wisdom & Mind (Gaja Kesari)' },
        { p1: 'Saturn', p2: 'Moon', label: 'Stress & Mind (Sade Sati Check)' },
        { p1: 'Rahu', p2: 'Moon', label: 'Obsession & Mind' }
    ];

    const relData = relationships.map(pair => ({
        ...pair,
        info: getRelationship(data[pair.p1].longitude, data[pair.p2].longitude)
    }));

    return (
        <div className="house-analysis-container">
            <h2 className="section-title">House Classifications & Relationships</h2>

            <div className="analysis-grid">
                {/* Section 1: House Classifications */}
                <div className="classification-section">
                    <h3>House Placements</h3>
                    <div className="classification-table">
                        <div className="c-header">
                            <span>Planet</span>
                            <span>House</span>
                            <span>Classification</span>
                            <span>Goal (Purushartha)</span>
                        </div>
                        {classifications.map((item) => (
                            <div key={item.planet} className="c-row">
                                <span className="c-planet">{item.planet}</span>
                                <span className="c-house">House {item.house}</span>
                                <span className="c-types">
                                    {item.types.map(t => <span key={t} className="type-badge">{t}</span>)}
                                </span>
                                <span className="c-goal">{item.purushartha}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 2: Planetary Relationships */}
                <div className="relationship-section">
                    <h3>Key Planetary Relationships</h3>
                    <div className="rel-cards">
                        {relData.map((rel, idx) => (
                            <div key={idx} className={`rel-card ${rel.info.quality.toLowerCase().includes('inauspicious') ? 'rel-bad' : 'rel-good'}`}>
                                <div className="rel-header">
                                    <span className="rel-label">{rel.label}</span>
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
