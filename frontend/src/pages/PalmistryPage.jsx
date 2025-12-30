
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import './PalmistryPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const PalmistryPage = ({ onBack }) => {
    // State
    const [savedCharts, setSavedCharts] = useState([]);
    const [selectedChartId, setSelectedChartId] = useState('');
    const [leftPalm, setLeftPalm] = useState(null); // { file, preview }
    const [rightPalm, setRightPalm] = useState(null);
    const [combineWithChart, setCombineWithChart] = useState(false);

    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState('');
    const [error, setError] = useState('');

    const [aiProvider, setAiProvider] = useState('gemini'); // 'gemini' | 'huggingface' | 'simulation'
    const [hfToken, setHfToken] = useState(import.meta.env.VITE_HF_TOKEN || '');

    const leftInputRef = useRef(null);
    const rightInputRef = useRef(null);

    useEffect(() => {
        console.log("Palmistry Page Mounted");
        const fetchCharts = async () => {
            const token = localStorage.getItem('token');
            const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
            let cloudCharts = [];
            if (token) {
                try {
                    const response = await axios.get(`${API_URL}/api/charts`, { headers: { Authorization: `Bearer ${token}` } });
                    cloudCharts = response.data;
                } catch (e) { console.error(e); }
            }
            // Merge/Dedup logic if needed, simplify for now
            setSavedCharts([...cloudCharts, ...localCharts]);
        };
        fetchCharts();
    }, []);

    const handleFileChange = (e, side) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const data = { file, preview: reader.result };
                if (side === 'left') setLeftPalm(data);
                else setRightPalm(data);
            };
            reader.readAsDataURL(file);
        }
    };

    const fileToGenerativePart = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = reader.result.split(',')[1];
                resolve({
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type
                    },
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const runSimulation = () => {
        setLoading(true);
        setError('');
        setTimeout(() => {
            const mockPrediction = `## 🔮 Simulated Palmistry Reading (Demo Mode)
**Note:** This is a generated simulation because the AI rate limit was reached.

### 1. Vitality & Health (Life Line)
The Life Line appears deep and unbroken, suggesting **strong vitality** and a high resistance to illness. The curvature around the Mount of Venus is generous, indicating a **warm-hearted** and energetic nature.

### 2. Career & Fate (Fate Line)
The Fate Line starts from the base of the palm and moves straight up to the Mount of Saturn. This indicates a **self-made individual** who relies on their own efforts rather than luck. A slight branch towards Apollo suggests **creative success** later in life.

### 3. Intelligence & Mindset (Head Line)
The Head Line is slightly curved, sloping towards the Mount of Moon. This denotes a **creative and imaginative mind** rather than a purely logical one. You likely solve problems through intuition.

### 4. Emotions & Relationships (Heart Line)
The Heart Line terminates between Jupiter and Saturn. This is the mark of a **balanced romantic**, someone who is passionate but practical. You value loyalty above all else.

**Astrological Correlation:**
The strong solar influence (Apollo mount) correlates well with the requested chart context, enhancing the predictive accuracy for career fame.`;
            setPrediction(mockPrediction);
            setLoading(false);
        }, 2000);
    };

    const callHuggingFace = async (promptText) => {
        if (!hfToken) throw new Error("Hugging Face Token is missing. Please add VITE_HF_TOKEN to .env or enter it manually.");

        // Using LLaVA-1.5-7b for visionTasks
        const MODEL_ID = "llava-hf/llava-1.5-7b-hf";

        // Only using the left palm for HF demo as it usually takes one image
        if (!leftPalm) throw new Error("Hugging Face LLaVA demo currently requires the Left Palm image.");

        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL_ID}`,
            {
                headers: { Authorization: `Bearer ${hfToken}`, "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({
                    inputs: promptText,
                    image: leftPalm.preview.split(',')[1], // Send base64
                    options: { wait_for_model: true }
                }),
            }
        );

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`HF API Error: ${JSON.stringify(err)}`);
        }

        const result = await response.json();
        return result[0]?.generated_text || "No response text generated.";
    };

    const handlePredict = async () => {
        if (aiProvider === 'simulation') {
            runSimulation();
            return;
        }

        if (!leftPalm && !rightPalm) {
            alert("Please upload at least one palm image.");
            return;
        }

        if (combineWithChart && !selectedChartId) {
            alert("Please select a chart to combine with, or uncheck 'Combine'.");
            return;
        }

        if (aiProvider === 'gemini' && !GEMINI_API_KEY) {
            alert("API Key for AI (Gemini) is missing in configuration.");
            return;
        }
        if (aiProvider === 'huggingface' && !hfToken) {
            alert("Hugging Face Token is missing in configuration.");
            return;
        }

        setLoading(true);
        setError('');
        setPrediction('');

        try {
            // 1. Prepare Chart Data if needed
            let chartContext = "";
            if (combineWithChart && selectedChartId) {
                const chartMeta = savedCharts.find(c => c._id === selectedChartId);
                if (chartMeta) {
                    // Ideally we calculate planetary positions again to be precise
                    // For now, let's construct a prompt with available meta-data + request to consider chart
                    // If we want real positions, we should call backend /api/calculate.
                    // Let's do a quick calc call if possible, or just send birth details.

                    const payload = {
                        name: chartMeta.name,
                        date: chartMeta.dateOfBirth ? new Date(chartMeta.dateOfBirth).toISOString().split('T')[0] : '',
                        time: chartMeta.timeOfBirth,
                        latitude: chartMeta.placeOfBirth?.lat,
                        longitude: chartMeta.placeOfBirth?.lng,
                        timezone: chartMeta.placeOfBirth?.timezone || 5.5,
                        city: chartMeta.placeOfBirth?.city || 'Unknown'
                    };

                    // Calling backend for planets
                    try {
                        const res = await fetch(`${API_URL}/api/calculate`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                        const data = await res.json();
                        if (data.success) {
                            const planets = data.data;
                            // Format for AI
                            let pStr = Object.keys(planets).map(k => {
                                if (k === 'Ascendant') return `Ascendant: ${planets[k].sign} (${planets[k].longitude.toFixed(2)}°)`;
                                return `${k}: ${planets[k].sign} (House ${planets[k].house})`;
                            }).join(", ");
                            chartContext = `ASTROLOGICAL CHART CONTEXT:\nName: ${payload.name}\nDOB: ${payload.date}, Time: ${payload.time}\nCity: ${payload.city}\nPlanetary Positions: ${pStr}\n\nINSTRUCTION: Combine the analysis of the palm lines with the astrological signals above. Correlate palm findings with planetary strengths (e.g., Mount of Jupiter with Jupiter position).`;
                        } else {
                            chartContext = `Chart Context: User ${chartMeta.name} (Details: ${JSON.stringify(payload)}). (Calculation failed, use general birth data).`;
                        }
                    } catch (e) {
                        chartContext = `Chart Context: User ${chartMeta.name}.`;
                    }
                }
            }

            let prompt = "Act as an expert Palmyst. Analyze the image. Cover Life Line, Fate Line, Head Line, Heart Line. ";
            if (combineWithChart) prompt += `Context: ${chartContext}`;

            if (aiProvider === 'huggingface') {
                const text = await callHuggingFace(prompt);
                setPrediction(text);
                setLoading(false);
                return;
            }

            // 2. Prepare AI Request with Fallback Strategy (GEMINI LOGIC)
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const candidateModels = [
                "gemini-2.0-flash",
                "gemini-2.0-flash-exp",
                "gemini-1.5-flash"
            ];

            const delay = ms => new Promise(res => setTimeout(res, ms));
            let responseText = null;
            let errors = [];

            const imageParts = [];
            if (leftPalm) imageParts.push(await fileToGenerativePart(leftPalm.file));
            if (rightPalm) imageParts.push(await fileToGenerativePart(rightPalm.file));

            // Original Gemini prompt logic
            let geminiPrompt = "Act as an expert Palmyst and Vedic Astrologer. Analyze the provided palm image(s) in detail. Cover:\n1. Vitality & Health (Life Line)\n2. Career & Fate (Fate Line)\n3. Intelligence & Mindset (Head Line)\n4. Emotions & Relationships (Heart Line).\n\n";

            if (combineWithChart) {
                geminiPrompt += `COMBINED ANALYSIS REQUIRED.\n${chartContext}\n\nSynthesize findings from BOTH the palm images and the astrology chart. If they contradict, mention the conflict. If they align, emphasize the strength.`;
            } else {
                geminiPrompt += "Provide a comprehensive Palmistry reading based ONLY on the visual evidence in the images.";
            }


            for (const modelName of candidateModels) {
                try {
                    console.log(`Attempting prediction with model: ${modelName}`);
                    // Update loading text to show current model
                    setLoading(true);

                    const model = genAI.getGenerativeModel({ model: modelName });

                    const result = await model.generateContent([geminiPrompt, ...imageParts]);
                    const response = await result.response;
                    responseText = response.text();

                    if (responseText) {
                        console.log(`Success with model: ${modelName}`);
                        break;
                    }
                } catch (e) {
                    console.warn(`Model ${modelName} failed:`, e);
                    errors.push(`${modelName}: ${e.message}`);
                    if (e.message.includes('429')) {
                        console.log("Rate limited. Waiting 15s...");
                        // Update UI to let user know
                        alert(`Rate limit hit for ${modelName}. Waiting 15s before trying next model...`);
                        await delay(15000);
                    }
                }
            }

            if (!responseText) {
                const combinedError = errors.join(" | ");
                throw new Error(`All models failed. Details: ${combinedError}`);
            }

            setPrediction(responseText);

        } catch (err) {
            console.error(err);
            setError("Failed to generate prediction. " + (err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="palmistry-container">
            <div className="palmistry-header">
                <button className="back-btn" onClick={onBack} style={{ background: 'none', border: '1px solid white', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>← Back</button>
                <h1>Palmistry & Astro-Palmistry Engine</h1>
            </div>

            <div className="palmistry-content">
                {/* Provider Selector */}
                <div style={{ marginBottom: '20px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>AI Provider:</span>
                    <label style={{ cursor: 'pointer', color: 'white' }}>
                        <input type="radio" value="gemini" checked={aiProvider === 'gemini'} onChange={() => setAiProvider('gemini')} /> Google Gemini
                    </label>
                    <label style={{ cursor: 'pointer', color: 'white' }}>
                        <input type="radio" value="simulation" checked={aiProvider === 'simulation'} onChange={() => setAiProvider('simulation')} /> 🛠️ Simulation (Free)
                    </label>
                    {/* 
                     <label style={{cursor:'pointer', color:'white'}}>
                        <input type="radio" value="huggingface" checked={aiProvider === 'huggingface'} onChange={() => setAiProvider('huggingface')} /> Hugging Face (LlaVA)
                    </label>
                    */}
                </div>

                <div className="input-section">
                    <div className="selection-row">
                        <div className="chart-selector">
                            <label>Select Person (Saved Chart)</label>
                            <select
                                className="chart-dropdown"
                                value={selectedChartId}
                                onChange={e => { setSelectedChartId(e.target.value); if (e.target.value) setCombineWithChart(true); }}
                            >
                                <option value="">-- Select --</option>
                                {savedCharts.map(c => <option key={c._id} value={c._id}>{c.name} ({c.placeOfBirth?.city})</option>)}
                            </select>
                        </div>
                        <div className="combine-toggle">
                            <input
                                type="checkbox"
                                id="combine"
                                checked={combineWithChart}
                                onChange={e => setCombineWithChart(e.target.checked)}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <label htmlFor="combine" style={{ cursor: 'pointer', fontSize: '1.1rem' }}>Combine with Astrology Chart</label>
                        </div>
                    </div>

                    <div className="palm-upload-grid">
                        {/* Left Palm */}
                        <div className="upload-card" onClick={() => leftInputRef.current.click()}>
                            {leftPalm ? (
                                <>
                                    <img src={leftPalm.preview} alt="Left Palm" className="image-preview" />
                                    <span>Click to replace (Left Palm)</span>
                                </>
                            ) : (
                                <div className="upload-placeholder">
                                    <span className="upload-icon">✋</span>
                                    <h3>Upload LEFT Palm</h3>
                                    <p>Click to browse</p>
                                </div>
                            )}
                            <input type="file" ref={leftInputRef} onChange={e => handleFileChange(e, 'left')} style={{ display: 'none' }} accept="image/*" />
                        </div>

                        {/* Right Palm */}
                        <div className="upload-card" onClick={() => rightInputRef.current.click()}>
                            {rightPalm ? (
                                <>
                                    <img src={rightPalm.preview} alt="Right Palm" className="image-preview" />
                                    <span>Click to replace (Right Palm)</span>
                                </>
                            ) : (
                                <div className="upload-placeholder">
                                    <span className="upload-icon">✋</span>
                                    <h3>Upload RIGHT Palm</h3>
                                    <p>Click to browse</p>
                                </div>
                            )}
                            <input type="file" ref={rightInputRef} onChange={e => handleFileChange(e, 'right')} style={{ display: 'none' }} accept="image/*" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button className="analyze-btn" onClick={handlePredict} disabled={loading}>
                            {loading ? (aiProvider === 'simulation' ? "Generating Simulation..." : "Analyzing with AI...") : (aiProvider === 'simulation' ? "GENERATE SIMULATION" : "PREDICT ALL ASPECTS")}
                        </button>
                        {error && <button type="button" onClick={() => setAiProvider('simulation')} style={{ padding: '0 15px', background: '#22c55e', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>✅ Use Simulation</button>}
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    setLoading(true);
                                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
                                    const data = await res.json();
                                    if (data.models) {
                                        const names = data.models.map(m => m.name.replace('models/', '')).join(', ');
                                        alert(`Available Models:\n${names}`);
                                        console.log("Full Model List:", data.models);
                                    } else {
                                        alert("No models found. Check API Key permissions.");
                                        console.error(data);
                                    }
                                } catch (e) {
                                    alert(`Failed to list models: ${e.message}`);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            style={{ padding: '0 15px', background: '#334155', border: '1px solid #475569', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
                            title="Check connection and valid models"
                        >
                            🔍 Check API
                        </button>
                    </div>

                    {error && <div style={{ color: '#ef4444', marginTop: '15px', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '5px' }}>
                        <strong>Error:</strong> {error}
                        <div style={{ fontSize: '0.9em', marginTop: '5px' }}>Google Gemini Free Tier has strict rate limits. Try the "Simulation" mode above to verify the UI.</div>
                    </div>}
                </div>

                {prediction && (
                    <div className="result-section markdown-content">
                        <ReactMarkdown>{prediction}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PalmistryPage;
