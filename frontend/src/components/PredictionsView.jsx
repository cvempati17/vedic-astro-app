import React, { useState } from 'react';
import { SIGN_INTERPRETATIONS, HOUSE_INTERPRETATIONS } from '../utils/interpretationData';
import './PredictionsView.css';

const PredictionsView = ({ data }) => {
    const [activeTab, setActiveTab] = useState('personality');

    if (!data) return null;

    const getSignIndex = (long) => Math.floor(long / 30);

    const ascSign = getSignIndex(data.Ascendant?.longitude || 0);
    const sunSign = getSignIndex(data.Sun?.longitude || 0);
    const moonSign = getSignIndex(data.Moon?.longitude || 0);

    const interpretations = {
        personality: {
            title: "Your Personality (Ascendant)",
            sign: ascSign,
            text: SIGN_INTERPRETATIONS[ascSign].ascendant,
            traits: SIGN_INTERPRETATIONS[ascSign].traits
        },
        soul: {
            title: "Your Soul & Ego (Sun)",
            sign: sunSign,
            text: SIGN_INTERPRETATIONS[sunSign].sun,
            traits: SIGN_INTERPRETATIONS[sunSign].traits
        },
        mind: {
            title: "Your Mind & Emotions (Moon)",
            sign: moonSign,
            text: SIGN_INTERPRETATIONS[moonSign].moon,
            traits: SIGN_INTERPRETATIONS[moonSign].traits
        }
    };

    const current = interpretations[activeTab];
    const signName = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][current.sign];

    return (
        <div className="predictions-container">
            <h3 className="predictions-header">🔮 Vedic Interpretations</h3>

            <div className="predictions-tabs">
                <button
                    className={`pred-tab ${activeTab === 'personality' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personality')}
                >
                    Personality
                </button>
                <button
                    className={`pred-tab ${activeTab === 'soul' ? 'active' : ''}`}
                    onClick={() => setActiveTab('soul')}
                >
                    Soul
                </button>
                <button
                    className={`pred-tab ${activeTab === 'mind' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mind')}
                >
                    Mind
                </button>
            </div>

            <div className="prediction-content">
                <div className="sign-badge">{signName}</div>
                <h4>{current.title}</h4>
                <p className="prediction-text">{current.text}</p>

                <div className="traits-box">
                    <strong>Key Traits:</strong> {current.traits}
                </div>
            </div>
        </div>
    );
};

export default PredictionsView;
