import React from 'react';
import { useTranslation } from 'react-i18next';

const SettingsPage = ({ onBack, onLogout, userType = 'basic', onUserTypeChange }) => {
    const { t, i18n } = useTranslation();

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi (हिंदी)' },
        { code: 'bn', name: 'Bengali (বাংলা)' },
        { code: 'te', name: 'Telugu (తెలుగు)' },
        { code: 'mr', name: 'Marathi (मराठी)' },
        { code: 'ta', name: 'Tamil (தமிழ்)' },
        { code: 'ur', name: 'Urdu (اردو)' },
        { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
        { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
        { code: 'es', name: 'Spanish (Español)' },
        { code: 'fr', name: 'French (Français)' },
        { code: 'de', name: 'German (Deutsch)' },
        { code: 'ja', name: 'Japanese (日本語)' },
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="settings-page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="header-actions" style={{ marginBottom: '2rem' }}>
                <button onClick={onBack} className="back-btn">
                    ← {t('common.back')}
                </button>
            </div>

            <h1 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>{t('settings.title')}</h1>

            <div className="settings-section" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '15px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>{t('settings.language')}</h2>

                <div className="language-selector">
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600' }}>
                        {t('settings.selectLanguage')}
                    </label>
                    <select
                        value={i18n.language}
                        onChange={(e) => changeLanguage(e.target.value)}
                    >
                        {languages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="settings-section" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
                <h2 style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>{t('settings.userType', 'User Type')}</h2>
                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600' }}>
                    {t('settings.chooseUserType', 'Choose experience mode')}
                </label>
                <select
                    value={userType}
                    onChange={(e) => onUserTypeChange && onUserTypeChange(e.target.value)}
                >
                    <option value="basic">{t('settings.userTypeBasic', 'Basic')}</option>
                    <option value="advance">{t('settings.userTypeAdvance', 'Advance')}</option>
                </select>
            </div>
        </div>
    );
};

export default SettingsPage;
