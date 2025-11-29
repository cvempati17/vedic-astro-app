import React from 'react';
import InputForm from '../components/InputForm';

const HomePage = ({ onCalculate, initialData }) => {
    return (
        <>
            <header className="app-header">
                <h1>🌟 Vedic Horoscope Generator</h1>
                <p>Generate your birth chart (Kundali/Jaatakam) with precision</p>
            </header>

            <main className="app-main">
                <div className="card input-card">
                    <h2>Enter Birth Details</h2>
                    <InputForm onCalculate={onCalculate} initialData={initialData} />
                </div>
            </main>

            <footer className="app-footer">
                <p>Powered by Swiss Ephemeris & Node.js</p>
            </footer>
        </>
    );
};

export default HomePage;
