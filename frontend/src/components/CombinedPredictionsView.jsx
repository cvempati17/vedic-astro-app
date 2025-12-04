import React, { useMemo } from 'react';
import PredictionsView from './PredictionsView';
import { calculateAspectsOfLife, getAspectLabel } from '../utils/aspectLifeUtils';
import './VariousBalasView.css';

const KEY_ASPECTS = ['career', 'finances', 'marriage', 'health'];

const buildNarrative = (label, avg, reasons) => {
    if (!avg) return '';
    let tone;
    if (avg >= 7.5) tone = `Overall, ${label.toLowerCase()} looks highly supportive, with many favourable periods.`;
    else if (avg >= 6) tone = `Overall, ${label.toLowerCase()} is positive with some mixed phases that require awareness.`;
    else if (avg >= 4.5) tone = `Overall, ${label.toLowerCase()} shows ups and downs, asking for patience and conscious choices.`;
    else tone = `Overall, ${label.toLowerCase()} carries strong karmic lessons and can feel heavy at times, especially in certain periods.`;

    const topReasons = reasons.slice(0, 3).filter(Boolean);
    const detail = topReasons.length
        ? ` Key themes repeatedly visible across dasha-bhukti are: ${topReasons.join(' ')} `
        : '';

    return `${tone}${detail}`;
};

const CombinedPredictionsView = ({ chartData, birthDate }) => {
    const aspectNarratives = useMemo(() => {
        if (!chartData || !birthDate) return null;
        const rows = calculateAspectsOfLife(chartData, birthDate) || [];
        if (!rows.length) return null;

        const out = {};
        KEY_ASPECTS.forEach(key => {
            let total = 0;
            let count = 0;
            const reasons = [];
            rows.forEach(r => {
                const a = r.aspects?.[key];
                if (a) {
                    total += a.score;
                    count += 1;
                    if (a.reason) reasons.push(a.reason);
                }
            });
            if (count > 0) {
                const avg = total / count;
                const label = getAspectLabel(key);
                out[key] = {
                    average: avg,
                    label,
                    text: buildNarrative(label, avg, reasons)
                };
            }
        });

        return out;
    }, [chartData, birthDate]);

    return (
        <div className="various-balas-container">
            <div className="section-title">
                <span>🔮</span>
                <h3>General Predictions</h3>
            </div>
            <div className="planet-analysis-card">
                <PredictionsView data={chartData} />
            </div>

            {aspectNarratives && (
                <div className="life-summary-section">
                    <div className="section-title">
                        <span>📖</span>
                        <h3>Aspect-wise Life Predictions</h3>
                    </div>

                    {KEY_ASPECTS.map(key => aspectNarratives[key] && (
                        <div key={key} className="planet-analysis-card">
                            <div className="planet-header">
                                <span className="planet-icon">✨</span>
                                <span className="planet-name">{aspectNarratives[key].label}</span>
                            </div>
                            <div className="life-advice">
                                <p style={{ margin: 0 }}>{aspectNarratives[key].text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CombinedPredictionsView;
