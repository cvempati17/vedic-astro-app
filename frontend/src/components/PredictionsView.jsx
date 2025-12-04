import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SIGN_INTERPRETATIONS, HOUSE_INTERPRETATIONS } from '../utils/interpretationData';
import { calculateNakshatra } from '../utils/nakshatraUtils';
import './PredictionsView.css';

const PredictionsView = ({ data }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('personality');

    if (!data) return null;

    const getSignIndex = (long) => Math.floor(long / 30);

    const ascSign = getSignIndex(data.Ascendant?.longitude || 0);
    const sunSign = getSignIndex(data.Sun?.longitude || 0);
    const moonSign = getSignIndex(data.Moon?.longitude || 0);

    const interpretations = {
        personality: {
            title: t('predictions.personalityTitle'),
            sign: ascSign,
            text: SIGN_INTERPRETATIONS[ascSign].ascendant,
            traits: SIGN_INTERPRETATIONS[ascSign].traits
        },
        soul: {
            title: t('predictions.soulTitle'),
            sign: sunSign,
            text: SIGN_INTERPRETATIONS[sunSign].sun,
            traits: SIGN_INTERPRETATIONS[sunSign].traits
        },
        mind: {
            title: t('predictions.mindTitle'),
            sign: moonSign,
            text: SIGN_INTERPRETATIONS[moonSign].moon,
            traits: SIGN_INTERPRETATIONS[moonSign].traits
        }
    };

    const current = interpretations[activeTab];
    const signNames = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const signName = t(`signs.${signNames[current.sign]}`);

    const moonNak = data.Moon?.longitude !== undefined ? calculateNakshatra(data.Moon.longitude) : null;
    const lagnaNak = data.Ascendant?.longitude !== undefined ? calculateNakshatra(data.Ascendant.longitude) : null;

    return (
        <div className="predictions-container">
            <h3 className="predictions-header">🔮 {t('predictions.title')}</h3>

            <div className="predictions-tabs">
                <button
                    className={`pred-tab ${activeTab === 'personality' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personality')}
                >
                    {t('predictions.personalityTab')}
                </button>
                <button
                    className={`pred-tab ${activeTab === 'soul' ? 'active' : ''}`}
                    onClick={() => setActiveTab('soul')}
                >
                    {t('predictions.soulTab')}
                </button>
                <button
                    className={`pred-tab ${activeTab === 'mind' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mind')}
                >
                    {t('predictions.mindTab')}
                </button>
            </div>

            <div className="prediction-content">
                <div className="sign-badge">{signName}</div>
                {(moonNak || lagnaNak) && (
                    <p className="prediction-summary">
                        {moonNak && (
                            <span>
                                Moon Nakshatra: {moonNak.name} (Pada {moonNak.pada})
                            </span>
                        )}
                        {lagnaNak && (
                            <span style={{ marginLeft: moonNak ? 12 : 0 }}>
                                | Lagna Nakshatra: {lagnaNak.name} (Pada {lagnaNak.pada})
                            </span>
                        )}
                    </p>
                )}
                <h4>{current.title}</h4>
                <p className="prediction-text">{current.text}</p>

                <div className="traits-box">
                    <strong>{t('predictions.keyTraits')}</strong> {current.traits}
                </div>
            </div>
        </div>
    );
};

export default PredictionsView;
