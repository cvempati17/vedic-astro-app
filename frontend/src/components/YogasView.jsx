import React from 'react';
import { calculateYogas } from '../utils/yogaUtils';
import './YogasView.css';

const YogasView = ({ data }) => {
    if (!data) return null;

    const yogas = calculateYogas(data);

    if (yogas.length === 0) {
        return (
            <div className="yogas-container">
                <h2 className="section-title">Vedic Yogas</h2>
                <div className="no-yogas">No major Yogas detected in this simplified analysis.</div>
            </div>
        );
    }

    // Group by type
    const groupedYogas = yogas.reduce((acc, yoga) => {
        if (!acc[yoga.type]) acc[yoga.type] = [];
        acc[yoga.type].push(yoga);
        return acc;
    }, {});

    return (
        <div className="yogas-container">
            <h2 className="section-title">Vedic Yogas (Planetary Combinations)</h2>
            <p className="section-subtitle">
                Special planetary unions that grant specific powers, wealth, or challenges.
            </p>

            <div className="yogas-grid">
                {Object.entries(groupedYogas).map(([type, typeYogas]) => (
                    <div key={type} className="yoga-group">
                        <h3 className="yoga-type-title">{type}</h3>
                        <div className="yoga-list">
                            {typeYogas.map((yoga, idx) => (
                                <div key={idx} className="yoga-card">
                                    <div className="yoga-header">
                                        <span className="yoga-icon">✨</span>
                                        <span className="yoga-name">{yoga.name}</span>
                                    </div>
                                    <p className="yoga-desc">{yoga.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YogasView;
