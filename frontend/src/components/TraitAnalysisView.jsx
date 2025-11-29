import React, { useMemo, useState } from 'react';
import { calculateProfiles } from '../utils/traitUtils';
import './TraitAnalysisView.css';

const TraitAnalysisView = ({ data }) => {
    const profiles = useMemo(() => calculateProfiles(data), [data]);
    const [activeProfile, setActiveProfile] = useState('husband_potential');

    if (!profiles) return null;

    return (
        <div className="trait-analysis-container">
            <header className="analysis-header">
                <h2>Detailed Trait Analysis</h2>
                <div className="profile-selector">
                    {Object.entries(profiles).map(([key, profile]) => (
                        <button
                            key={key}
                            className={`profile-btn ${activeProfile === key ? 'active' : ''}`}
                            onClick={() => setActiveProfile(key)}
                        >
                            {profile.title}
                        </button>
                    ))}
                </div>
            </header>

            <div className="profile-content">
                {profiles[activeProfile].sections.map((section, idx) => (
                    <div key={idx} className="trait-section">
                        <h3 className="section-title">{section.title}</h3>
                        <div className="trait-grid">
                            {section.traits.map(trait => (
                                <div key={trait.id} className="trait-card">
                                    <div className="trait-header">
                                        <h4>{trait.name}</h4>
                                        <span className="trait-score">{trait.score}</span>
                                    </div>

                                    <div className="score-bar-container">
                                        <div
                                            className="score-bar-fill"
                                            style={{ width: `${trait.score * 10}%` }}
                                        ></div>
                                    </div>

                                    <p className="trait-description">{trait.description}</p>

                                    <div className="trait-details">
                                        <h5>Indicators:</h5>
                                        <ul className="trait-indicators">
                                            {trait.indicators.map((ind, i) => (
                                                <li key={i}>{ind}</li>
                                            ))}
                                        </ul>

                                        <h5>Reasoning:</h5>
                                        <ul className="trait-reasons">
                                            {trait.reasons.map((reason, i) => (
                                                <li key={i}>{reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TraitAnalysisView;
