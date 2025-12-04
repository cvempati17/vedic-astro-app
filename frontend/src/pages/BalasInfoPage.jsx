import React from 'react';
import './BalasInfoPage.css';

const BalasInfoPage = ({ onBack }) => {
    return (
        <div className="balas-info-container">
            <button className="back-button" onClick={onBack}>
                ← Back to Charts
            </button>

            <div className="balas-info-content">
                <h1 className="page-title">What is Balas and its Importance</h1>

                <section className="intro-section">
                    <p>
                        In Vedic astrology, <strong>Bala (बल)</strong> means strength. It refers to how strong a planet is in a birth chart and whether it can give its positive results fully, partially, or weakly. A planet with high bala gives powerful results, while a weak planet may struggle and sometimes cause difficulties in areas it governs.
                    </p>
                    <p>
                        Vedic astrology uses a detailed method of calculating planetary strengths called <strong>Shadbala (षड्बल)</strong> — meaning sixfold strength. These six types include various sub-components that measure the true capability of each planet.
                    </p>
                </section>

                <section className="shadbala-section">
                    <h2>⭐ Six Types of Shadbala (Planetary Strengths)</h2>
                    <div className="info-table-wrapper">
                        <table className="info-table">
                            <thead>
                                <tr>
                                    <th>Type of Bala</th>
                                    <th>What it Measures</th>
                                    <th>Meaning / Life Significance</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>1️⃣ Sthana Bala</strong><br />(Positional Strength)</td>
                                    <td>Planet’s position by sign, house, exaltation, etc.</td>
                                    <td>Determines how naturally powerful the planet is in the zodiac; shows the ability to deliver its core significations.</td>
                                </tr>
                                <tr>
                                    <td><strong>2️⃣ Dig Bala</strong><br />(Directional Strength)</td>
                                    <td>Strength based on direction/house placement</td>
                                    <td>Shows how well the planet can show results in life activities like career, relationships, happiness, etc.</td>
                                </tr>
                                <tr>
                                    <td><strong>3️⃣ Kala Bala</strong><br />(Temporal/Time Strength)</td>
                                    <td>Strength from time-related factors: day/night, month, year, planetary periods</td>
                                    <td>Indicates how strong the planet is at certain life phases; helps assess timing of results.</td>
                                </tr>
                                <tr>
                                    <td><strong>4️⃣ Cheshta Bala</strong><br />(Motional Strength)</td>
                                    <td>Strength based on speed, retrogression</td>
                                    <td>Retrograde planets often gain high cheshta bala → giving more impact and drive to that planet's results.</td>
                                </tr>
                                <tr>
                                    <td><strong>5️⃣ Naisargika Bala</strong><br />(Natural Strength)</td>
                                    <td>Inherent strength of a planet by nature</td>
                                    <td>Sun & Moon naturally stronger → influence vitality, mind, authority. Saturn and Mercury lower by nature but still important.</td>
                                </tr>
                                <tr>
                                    <td><strong>6️⃣ Drik Bala</strong><br />(Aspectual Strength)</td>
                                    <td>Strength from positive or negative aspects received</td>
                                    <td>Shows how planets cooperate with each other → teamwork of energies in life events.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="additional-strength-section">
                    <h2>Additional Strength Systems Sometimes Used</h2>
                    <div className="info-table-wrapper">
                        <table className="info-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Meaning</th>
                                    <th>Significance</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Avastha Bala</strong></td>
                                    <td>Planet’s state (childhood, youth, old age, sleep, etc.)</td>
                                    <td>Shows maturity and readiness of a planet to give its results</td>
                                </tr>
                                <tr>
                                    <td><strong>Ishta vs Kashtha Phala</strong></td>
                                    <td>Benefic vs Malefic tendency</td>
                                    <td>Whether outcomes are pleasant or challenging</td>
                                </tr>
                                <tr>
                                    <td><strong>Uchcha & Neecha Bala</strong></td>
                                    <td>Exaltation and debility strength</td>
                                    <td>High bala means fortune; low means delay or struggle in that planet’s areas</td>
                                </tr>
                                <tr>
                                    <td><strong>Vimshopaka Bala</strong></td>
                                    <td>Planet’s dignity based on divisional charts</td>
                                    <td>Judges success in specific life domains like marriage, career, spirituality</td>
                                </tr>
                                <tr>
                                    <td><strong>Shad Varga / Saptavarga Strength</strong></td>
                                    <td>Dignity across multiple charts</td>
                                    <td>A planet strong in divisional charts gives powerful results throughout life</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="impact-section">
                    <h2>🔮 How Bala Impacts a Person’s Life</h2>
                    <div className="comparison-grid">
                        <div className="comparison-card positive">
                            <h3>If Planet is Strong (high bala)</h3>
                            <ul>
                                <li>Planet’s positive qualities flourish</li>
                                <li>Acts naturally and confidently</li>
                                <li>Supports good health and opportunities</li>
                                <li>Brings luck during its dasha/bhukti (periods)</li>
                            </ul>
                        </div>
                        <div className="comparison-card negative">
                            <h3>If Planet is Weak (low bala)</h3>
                            <ul>
                                <li>Delays or problems in planet-related areas</li>
                                <li>Results feel restricted or blocked</li>
                                <li>Weakness can cause physical, mental, or financial challenges</li>
                                <li>Periods may feel exhausting or stressful</li>
                            </ul>
                        </div>
                    </div>
                    <div className="example-box">
                        <h4>Example:</h4>
                        <p><strong>A strong Venus</strong> → happy relationships, artistic talent, prosperity</p>
                        <p><strong>A weak Venus</strong> → relationship problems, financial issues, self-esteem concerns</p>
                    </div>
                </section>

                <section className="importance-section">
                    <h2>🎯 Why Bala is Important</h2>
                    <ul className="check-list">
                        <li>✔ Determines the real ability of a planet to deliver results</li>
                        <li>✔ Helps in timing events (marriage, career rise, childbirth etc.)</li>
                        <li>✔ Used for remedies → to strengthen weak planets</li>
                        <li>✔ Essential for accurate predictions beyond sign and house placements</li>
                    </ul>
                </section>

                <section className="remedies-section">
                    <h2>🌱 Remedies for Weak Planetary Strength</h2>
                    <div className="remedies-grid">
                        <div className="remedy-item">Mantras & prayers</div>
                        <div className="remedy-item">Donations aligned to the planet</div>
                        <div className="remedy-item">Gemstones or metallic rings (only after expert advice)</div>
                        <div className="remedy-item">Fasting and behavioral disciplines</div>
                        <div className="remedy-item">Strengthening related houses and lords</div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BalasInfoPage;
