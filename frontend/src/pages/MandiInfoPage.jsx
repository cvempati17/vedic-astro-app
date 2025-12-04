import React from 'react';
import { useTranslation } from 'react-i18next';
import './BalasInfoPage.css'; // Reuse styles

const MandiInfoPage = ({ onBack }) => {
    const { t } = useTranslation();

    return (
        <div className="balas-info-container">
            <button className="back-button" onClick={onBack}>
                ← {t('common.back', 'Back')}
            </button>

            <header className="info-header">
                <h1>Understanding Mandi (Gulika)</h1>
                <p className="subtitle">The Karmic Sub-Planet of Saturn</p>
            </header>

            <section className="info-section">
                <p>
                    In Vedic Astrology, Mandi (also known as Gulika sometimes, though technically different in some traditions) is a sub-planet (Upagraha) connected with Saturn.
                    It does not have a physical existence but is a mathematically calculated point in the horoscope, believed to influence aspects of the native’s life significantly,
                    especially related to obstacles, delays, and karmic burdens.
                </p>
            </section>

            <section className="info-section">
                <h2>🌑 What is Mandi?</h2>
                <p>Mandi is considered a shadow planet ruled by Saturn. It is highly malefic and represents:</p>
                <ul>
                    <li>Sickness, sorrow, fear</li>
                    <li>Accidents, suffering, misfortune</li>
                    <li>Spiritual lessons through hardship</li>
                </ul>
                <p>It influences whichever house and sign it occupies.</p>
            </section>

            <section className="info-section">
                <h2>📐 How is Mandi Calculated?</h2>
                <p>
                    There are different methods depending on the day of the week and the duration of a day (from sunrise to next sunrise).
                    A commonly used method is:
                </p>
                <ul>
                    <li>Divide the time between sunrise to next sunrise into 8 equal parts.</li>
                    <li>Assign each part to a planet in a fixed order.</li>
                    <li>The segment of Saturn will determine the Mandi position.</li>
                </ul>
                <p><strong>Planetary order used in calculation:</strong> Sun → Moon → Mars → Mercury → Jupiter → Venus → Saturn → Rahu</p>
                <p><strong>Example:</strong></p>
                <ul>
                    <li>If sunrise is at 6:00 AM and next sunrise is at 6:00 AM (24 hours)</li>
                    <li>Each planetary segment = 24 ÷ 8 = 3 hours</li>
                    <li>Based on the weekday: On Monday, Saturn’s part = 7th segment</li>
                    <li>So Mandi position = starting of that 7th segment</li>
                </ul>
                <p>There is also a night-time formula (sunset to next sunrise) depending on birth at day or night.</p>
                <p><em>📌 Note: Many astrologers use software now because the manual method is complex.</em></p>
            </section>

            <section className="info-section">
                <h2>🪐 Difference Between Mandi and Gulika</h2>
                <table className="info-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Mandi</th>
                            <th>Gulika</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Association</td>
                            <td>Saturn</td>
                            <td>Saturn</td>
                        </tr>
                        <tr>
                            <td>Calculation method</td>
                            <td>Slightly different</td>
                            <td>Different segment order</td>
                        </tr>
                        <tr>
                            <td>Some systems</td>
                            <td>Treat them separately</td>
                            <td>Treat them separately</td>
                        </tr>
                        <tr>
                            <td>North Indian astrologers often</td>
                            <td>Use Gulika</td>
                            <td>&nbsp;</td>
                        </tr>
                        <tr>
                            <td>South Indian astrologers often</td>
                            <td>Use Mandi</td>
                            <td>&nbsp;</td>
                        </tr>
                    </tbody>
                </table>
                <p>Many modern systems treat them as interchangeable, but classical texts kept them distinct.</p>
            </section>

            <section className="info-section">
                <h2>🔍 Effects and Interpretations of Mandi</h2>
                <p>Mandi acts like a strong malefic where it sits. It often brings delays and karmic lessons in the area of life represented by that house.</p>
                <h3>House-wise Impact (General)</h3>
                <table className="info-table">
                    <thead>
                        <tr>
                            <th>House</th>
                            <th>Effect</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>1st</td><td>Poor health, struggles in life</td></tr>
                        <tr><td>2nd</td><td>Harsh speech, money issues</td></tr>
                        <tr><td>3rd</td><td>Lack of courage, sibling problems</td></tr>
                        <tr><td>4th</td><td>Stress at home, property issues</td></tr>
                        <tr><td>5th</td><td>Trouble with children, education obstacles</td></tr>
                        <tr><td>6th</td><td>Good placement — can defeat enemies</td></tr>
                        <tr><td>7th</td><td>Relationship &amp; partner troubles</td></tr>
                        <tr><td>8th</td><td>Accidents, chronic issues</td></tr>
                        <tr><td>9th</td><td>Bad luck, blocked dharma</td></tr>
                        <tr><td>10th</td><td>Career struggles, delays</td></tr>
                        <tr><td>11th</td><td>Gains come late and difficult</td></tr>
                        <tr><td>12th</td><td>Losses, hospitalization</td></tr>
                    </tbody>
                </table>
                <p><em>➡ The houses 6, 10, and 11 are considered somewhat better placements.</em></p>

                <h3>Mandi in Nakshatra or With Planets</h3>
                <table className="info-table">
                    <thead>
                        <tr>
                            <th>Conjunction</th>
                            <th>Outcome</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>With Sun</td><td>Ego issues, low vitality</td></tr>
                        <tr><td>With Moon</td><td>Emotional disturbances</td></tr>
                        <tr><td>With Mars</td><td>Accidents, anger issues</td></tr>
                        <tr><td>With Venus</td><td>Love failures, sensual troubles</td></tr>
                        <tr><td>With Jupiter</td><td>Blocked knowledge and fortune</td></tr>
                        <tr><td>With Mercury</td><td>Anxiety, communication struggles</td></tr>
                    </tbody>
                </table>

                <p><strong>Special Notes</strong></p>
                <ul>
                    <li>✔ Mandi gives karma-related life lessons</li>
                    <li>✔ Strong influence in Dasha (planetary periods)</li>
                    <li>✔ Remedies help reduce its negative effects</li>
                </ul>
            </section>

            <section className="info-section">
                <h2>🕉 Remedies for Mandi</h2>
                <ul className="remedy-list">
                    <li>Worship Lord Hanuman or Shani Dev</li>
                    <li>Donate black items on Saturday</li>
                    <li>Feed crows on Saturdays</li>
                    <li>Recite Maha Mrityunjaya Mantra or Shani Mantras</li>
                    <li>Avoid overuse of dark blue/black unless advised astrologically</li>
                    <li>Do charity towards the poor or disabled</li>
                </ul>
            </section>
        </div>
    );
};

export default MandiInfoPage;
