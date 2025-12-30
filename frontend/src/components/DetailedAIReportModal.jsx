import React, { useEffect, useState } from 'react';
import { getSignData, getAspectingPlanets } from '../utils/advancedChartUtils';
import { calculateYogas } from '../utils/yogaUtils';
import { generateHousePrediction } from '../services/aiService';
import {
    AstrologyHero, HouseOverviewCard, RashiDetailsBlock, BhavaSignifications,
    PlanetPlacementCard, ConjunctionAnalysis, AspectInfluence, BeneficMaleficBalance,
    YogaStrength, PredictiveSummary, AstrologyQuote
} from './predictions/PredictionBlocks';

const DetailedAIReportModal = ({ houseNum, signIndex, planetsInHouse, allPlanetsData, ascendantLong, onClose }) => {
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const signData = getSignData(signIndex);
                const aspects = getAspectingPlanets(signIndex, allPlanetsData);
                const yogas = calculateYogas(allPlanetsData);

                const data = await generateHousePrediction(houseNum, signData, planetsInHouse, aspects, yogas, ascendantLong);

                if (data && !data.error) {
                    setAiData(data);
                } else {
                    let errMsg = data?.error || "Unknown Error";
                    if (data?.error === "MISSING_KEY") errMsg = "API Key is missing from .env configuration.";
                    if (data?.error === "ALL_MODELS_FAILED") errMsg = "Unable to connect to any Gemini model.";

                    setError(errMsg);
                    // Pass details if available (checking if we can use a separate state or append to error)
                    if (data?.details) {
                        setError(prev => `${errMsg}\n\nDETAILS:\n${data.details}`);
                    }
                }
            } catch (err) {
                console.error(err);
                setError(err.message || "An error occurred while analyzing the chart.");
            } finally {
                setLoading(false);
            }
        };

        if (houseNum && signIndex !== undefined) {
            fetchData();
        }
    }, [houseNum, signIndex, planetsInHouse, allPlanetsData, ascendantLong]);

    // Styles
    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#f8fafc',
        zIndex: 9999,
        overflowY: 'auto',
        fontFamily: '"Inter", sans-serif'
    };

    const containerStyle = {
        maxWidth: '800px', margin: '0 auto', padding: '0 0 60px 0',
        backgroundColor: '#ffffff', minHeight: '100vh',
        boxShadow: '0 0 20px rgba(0,0,0,0.05)'
    };

    const backButtonStyle = {
        position: 'fixed', top: '20px', right: '20px',
        padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#475569',
        border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: '600',
        zIndex: 10000, boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    };

    if (loading) {
        return (
            <div style={{ ...overlayStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
                <h2 style={{ marginTop: '20px', color: '#475569' }}>Divine Analysis in Progress...</h2>
                <p style={{ color: '#94a3b8' }}>Consulting the planetary alignments</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <button style={backButtonStyle} onClick={onClose}>Cancel</button>
            </div>
        );
    }

    if (error) {
        const isDetails = error.includes("DETAILS:");
        const [mainMsg, detailsMsg] = error.split("DETAILS:");

        return (
            <div style={{ ...overlayStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <h2 style={{ color: '#ef4444' }}>Report Status (Debug Mode)</h2>
                <p style={{ color: '#475569', maxWidth: '400px', textAlign: 'center', marginBottom: '10px' }}>{mainMsg}</p>

                {detailsMsg && (
                    <div style={{
                        backgroundColor: '#fff1f2', border: '1px solid #fecdd3',
                        padding: '10px', borderRadius: '6px', fontSize: '0.75rem',
                        color: '#be123c', marginBottom: '10px', fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto', width: '90%'
                    }}>
                        <strong>Attempt Log:</strong>
                        {detailsMsg}
                    </div>
                )}

                {/* Debug Info for User */}
                <div style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b', marginBottom: '20px', fontFamily: 'monospace' }}>
                    DEBUG INFO:<br />
                    Key Status: {import.meta.env.VITE_GEMINI_API_KEY ? "Detected ✅" : "Not Found ❌"}<br />
                    {import.meta.env.VITE_GEMINI_API_KEY && `Key Prefix: ${import.meta.env.VITE_GEMINI_API_KEY.substring(0, 4)}...`}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <a
                        href="https://aistudio.google.com/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ padding: '10px 20px', backgroundColor: '#64748b', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '0.9rem' }}
                    >
                        Verify Key @ Google
                    </a>
                    <button style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }} onClick={onClose}>
                        Close Report
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={overlayStyle}>
            <button style={backButtonStyle} onClick={onClose}>Close Report</button>

            <div style={containerStyle}>
                {/* Block 1: Hero */}
                {aiData.hero && <AstrologyHero data={aiData.hero} />}

                <div style={{ padding: '0 20px' }}>

                    {/* Block 2: House Overview */}
                    {aiData.houseOverview && <HouseOverviewCard data={aiData.houseOverview} />}

                    {/* Block 3: Rashi Details */}
                    {aiData.rashiDetails && <RashiDetailsBlock data={aiData.rashiDetails} />}

                    {/* Block 4: Bhava Significations */}
                    {aiData.bhavaSignifications && <BhavaSignifications data={aiData.bhavaSignifications} />}

                    {/* Block 5: Planet Placements */}
                    {aiData.planetPlacements && aiData.planetPlacements.map((planet, idx) => (
                        <PlanetPlacementCard key={idx} data={planet} />
                    ))}

                    {/* Block 6: Conjunctions */}
                    {aiData.conjunctions && aiData.conjunctions.map((conj, idx) => (
                        <ConjunctionAnalysis key={idx} data={conj} />
                    ))}

                    {/* Block 7: Aspects */}
                    {aiData.aspects && aiData.aspects.map((asp, idx) => (
                        <AspectInfluence key={idx} data={asp} />
                    ))}

                    {/* Block 8: Balance */}
                    {aiData.balance && <BeneficMaleficBalance data={aiData.balance} />}

                    {/* Block 9: Yoga Strength */}
                    {aiData.yogaStrength && <YogaStrength data={aiData.yogaStrength} />}

                    {/* Block 10: Summary */}
                    {aiData.summary && <PredictiveSummary data={aiData.summary} />}

                    {/* Block 11: Quote */}
                    {aiData.quote && <AstrologyQuote quote={aiData.quote} />}

                </div>
            </div>
        </div>
    );
};

export default DetailedAIReportModal;
