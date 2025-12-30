import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { calculateVimshottariDasha, calculateSubDashas, formatDate } from '../utils/dashaUtils';
import { ASPECTS, evaluatePlanetStrength, PLANET_FRIENDS, PLANET_ENEMIES, getAspectLabel } from '../utils/aspectLifeUtils';
import './DashaView.css';

const DashaView = ({ moonLongitude, birthDate, chartData }) => {
    const { t } = useTranslation();
    const [path, setPath] = useState([]); // Array of dasha objects representing the drill-down path
    const [currentList, setCurrentList] = useState([]);

    useEffect(() => {
        if (moonLongitude && birthDate) {
            const data = calculateVimshottariDasha(moonLongitude, birthDate);
            if (data && data.dashas) {
                setCurrentList(data.dashas);
                setPath([]);
            }
        }
    }, [moonLongitude, birthDate]);

    const handleLevelClick = (dasha) => {
        // If we are already at level 6, maybe just show info?
        // But let's assume we can drill down if < 6
        if (dasha.level < 6) {
            const subDashas = calculateSubDashas(dasha.planet, dasha.startDate, dasha.fullDuration, dasha.level + 1);
            setPath([...path, dasha]);
            setCurrentList(subDashas);
        } else {
            // Reached deepest level
        }
    };

    const handleBreadcrumbClick = (index) => {
        if (index === -1) {
            // Reset to root
            const data = calculateVimshottariDasha(moonLongitude, birthDate);
            setPath([]);
            setCurrentList(data.dashas);
        } else {
            // Go back to specific level
            const newPath = path.slice(0, index + 1);
            const targetDasha = newPath[newPath.length - 1]; // The parent of the list we want to show? 
            // Wait, path[0] is L1. Clicking path[0] should show L2 (its children).
            // So if I click Breadcrumb 0 (Jupiter), I want to see Jupiter's children.
            // So new path is just [Jupiter].

            // Actually, let's recalculate the list for the *last item in the new path*.
            const lastItem = newPath[newPath.length - 1];
            const subDashas = calculateSubDashas(lastItem.planet, lastItem.startDate, lastItem.fullDuration, lastItem.level + 1);

            setPath(newPath);
            setCurrentList(subDashas);
        }
    };

    // Helper to render stars
    const renderStars = (score) => {
        // Score is 1-10. Map to 1-5.
        const stars = Math.max(1, Math.min(5, Math.round(score / 2)));
        return (
            <>
                <span className="star-filled">{'★'.repeat(stars)}</span>
                <span className="star-empty">{'☆'.repeat(5 - stars)}</span>
            </>
        );
    };

    const getAspectRatings = (planet, parentPlanet, chartData) => {
        if (!chartData) return [];

        // Define the specific aspects requested by user
        // Health, Finance, Relationship, Career, Business, Kids, Family
        // Map to our keys: health, finances, marriage, career, business, kids, parents
        const targetKeys = ['health', 'finances', 'marriage', 'career', 'business', 'kids', 'parents'];

        return targetKeys.map(key => {
            const aspectDef = ASPECTS[key];
            if (!aspectDef) return null;

            let totalScore = 5.0; // Base

            // Primary Planet Influence
            const pEval = evaluatePlanetStrength(planet, chartData, key);
            totalScore += pEval.score;

            // Parent Planet Influence (if exists) -> Treat like MD/AD relationship logic
            if (parentPlanet) {
                const parentEval = evaluatePlanetStrength(parentPlanet, chartData, key);
                totalScore += (parentEval.score * 0.6); // Weight for secondary/parent

                // Relation
                if (PLANET_FRIENDS[parentPlanet]?.includes(planet)) {
                    totalScore += 1.0;
                } else if (PLANET_ENEMIES[parentPlanet]?.includes(planet)) {
                    totalScore -= 1.0;
                }
            }

            // Clamp 1-10
            totalScore = Math.max(1, Math.min(10, totalScore));

            return {
                key,
                label: aspectDef.label, // Or use getAspectLabel(key)
                score: totalScore
            };
        }).filter(Boolean);
    };

    // Prediction Generation (Mock)
    const getPrediction = (dasha) => {
        const parent = path.length > 0 ? (path.length > 1 ? path[path.length - 2].planet : null) : null;
        // Logic check: 
        // If path has 1 item (e.g. [Mars]), we are viewing Mars sub-periods. The "Context" is Mars. Parent is null (or Main).
        // If path has 2 items ([Mars, Rahu]), we are viewing Rahu sub-periods. Context is Rahu. Parent is Mars.
        // The dasha passed to getPrediction is `path[path.length-1]`.

        // Actually, if path is [Mars], getPrediction is called with Mars object.
        // parent should be null if it's the root MD. 
        // But wait, the `path` array accumulates the drill down.
        // path[0] is MD. path[1] is AD.
        // If path.length === 1, we are at MD level. Parent is null.
        // If path.length > 1, parent is path[path.length - 2].planet.

        const parentPlanet = path.length > 1 ? path[path.length - 2].planet : null;
        const planet = dasha.planet;

        const ratings = getAspectRatings(planet, parentPlanet, chartData);

        return (
            <div className="prediction-box">
                <h4>✨ {planet} {getLevelName(dasha.level)} Analysis</h4>
                <p>
                    Experiencing the energy of <strong>{planet}</strong>
                    {parentPlanet && <span> under the influence of <strong>{parentPlanet}</strong></span>}.
                    This period activates results related to {planet}'s natural significations
                    and its placement in your birth chart.
                </p>

                {/* Aspect Ratings Section */}
                {ratings.length > 0 && (
                    <div className="aspect-ratings-grid">
                        {ratings.map(r => (
                            <div key={r.key} className="aspect-rating-item">
                                <span className="aspect-label">{r.label}</span>
                                <span className="aspect-stars" title={`Score: ${r.score.toFixed(1)}/10`}>
                                    {renderStars(r.score)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="prediction-tags">
                    <span>Outcome: Depends on {planet}'s strength</span>
                </div>
            </div>
        );
    };

    const getLevelName = (level) => {
        switch (level) {
            case 1: return "Mahadasha";
            case 2: return "Antardasha";
            case 3: return "Pratyantardasha";
            case 4: return "Sookshma Dasha";
            case 5: return "Prana Dasha";
            case 6: return "Deha Dasha"; // Often Deha is 6th
            default: return "Dasha";
        }
    };

    if (!currentList) return null;

    return (
        <div className="dasha-view-container">
            <h3 className="dasha-main-title">🔮 {t('dasha.title')} <span className="depth-badge">Level {path.length + 1}</span></h3>

            {/* Breadcrumbs */}
            <div className="dasha-breadcrumbs">
                <span
                    className="breadcrumb-item home"
                    onClick={() => handleBreadcrumbClick(-1)}
                >
                    🏠 Main
                </span>
                {path.map((p, i) => (
                    <React.Fragment key={i}>
                        <span className="breadcrumb-separator">›</span>
                        <span
                            className={`breadcrumb-item ${i === path.length - 1 ? 'active' : ''}`}
                            onClick={() => handleBreadcrumbClick(i)}
                        >
                            {p.planet}
                        </span>
                    </React.Fragment>
                ))}
                {path.length > 0 && (
                    <span className="breadcrumb-date-display">
                        {formatDate(path[path.length - 1].startDate)} — {formatDate(path[path.length - 1].endDate)}
                    </span>
                )}
            </div>

            {/* Selected Dasha Context / Prediction */}
            {path.length > 0 && (
                <div className="active-dasha-context">
                    {getPrediction(path[path.length - 1])}
                </div>
            )}

            {/* Dasha List */}
            <div className="dasha-list-wrapper">
                <table className="dasha-table-enhanced">
                    <thead>
                        <tr>
                            <th>Period Lord</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentList.map((dasha, idx) => (
                            <tr key={idx} className={dasha.isCurrent ? 'row-current' : ''}>
                                <td className="col-planet">
                                    <div className="planet-info-cell">
                                        <div className={`planet-dot-lg planet-${dasha.planet.toLowerCase()}`}></div>
                                        <div>
                                            <div className="planet-name-lg">{dasha.planet}</div>
                                            <div className="dasha-level-sm">{getLevelName(dasha.level)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{formatDate(dasha.startDate)}</td>
                                <td>{formatDate(dasha.endDate)}</td>
                                <td>
                                    {dasha.level < 6 ? (
                                        <button
                                            className="drill-btn"
                                            onClick={() => handleLevelClick(dasha)}
                                        >
                                            Explore ➔
                                        </button>
                                    ) : (
                                        <span className="end-badge">Final</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashaView;
