import React from 'react';
import { useTranslation } from 'react-i18next';
import InputForm from '../components/InputForm';

const HomePage = ({ onCalculate, initialData, onBack, onOpenSettings }) => {
    const { t } = useTranslation();

    return (
        <>
            <header className="app-header" style={{ position: 'relative' }}>
                <button className="back-btn" onClick={onBack} style={{ alignSelf: 'flex-start', marginBottom: '0.5rem' }}>
                    ← {t('home.backToCharts', 'Back to Your Charts')}
                </button>
                {onOpenSettings && (
                    <button
                        type="button"
                        className="gear-btn"
                        onClick={onOpenSettings}
                        title={t('settings.settings', 'Settings')}
                        style={{ position: 'absolute', top: 0, right: 0 }}
                    >
                        ⚙️
                    </button>
                )}
                <h1>{t('home.title', '🌟 Vedic Horoscope Generator')}</h1>
                <p>{t('home.subtitle', 'Generate your birth chart (Kundali/Jaatakam) with precision')}</p>
            </header>

            <main className="app-main">
                <div className="card input-card">
                    <h2>{t('home.enterDetails', 'Enter Birth Details')}</h2>
                    <InputForm onCalculate={onCalculate} initialData={initialData} />
                </div>
            </main>
        </>
    );
};

export default HomePage;
