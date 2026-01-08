import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CitySearch from './CitySearch';

const InputForm = ({ onCalculate, initialData, isLoading }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(initialData || {
        name: '',
        date: '',
        time: '',
        latitude: '',
        longitude: '',
        timezone: 5.5,
        city: '',
        country: '',
        state: '',
        gender: 'male',
        ayanamsa: 'lahiri'
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCitySelect = (cityData) => {
        setFormData({
            ...formData,
            city: cityData.name,
            latitude: cityData.latitude,
            longitude: cityData.longitude,
            timezone: cityData.timezone,
            country: cityData.country,
            state: cityData.state
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Debug: Log what we're sending
        console.log('Form Data:', formData);

        // Validate required fields
        if (!formData.date || !formData.time) {
            alert(t('inputForm.fillDateAndTime'));
            return;
        }

        onCalculate(formData, false);
    };

    const handleSaveAndGenerate = (e) => {
        e.preventDefault();
        // Validate required fields
        if (!formData.date || !formData.time) {
            alert(t('inputForm.fillDateAndTime'));
            return;
        }
        onCalculate(formData, true);
    };

    return (
        <form onSubmit={handleSubmit} className="input-form">
            <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                    <label>{t('inputForm.nameLabel')}</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('inputForm.namePlaceholder')}
                    />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                    <label>{t('inputForm.genderLabel')}</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <option value="male">{t('gender.male')}</option>
                        <option value="female">{t('gender.female')}</option>
                        <option value="other">{t('gender.other')}</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>{t('inputForm.dobLabel')}</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>{t('inputForm.tobLabel')}</label>
                    <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div style={{ flex: 3 }}>
                    <CitySearch onCitySelect={handleCitySelect} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label>{t('inputForm.timezoneLabel')}</label>
                    <input
                        type="number"
                        step="any"
                        name="timezone"
                        placeholder={t('inputForm.tzPlaceholder')}
                        value={formData.timezone}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>{t('inputForm.latitudeLabel')}</label>
                    <input
                        type="number"
                        step="any"
                        name="latitude"
                        placeholder={t('inputForm.latPlaceholder')}
                        value={formData.latitude}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
                <div className="form-group">
                    <label>{t('inputForm.longitudeLabel')}</label>
                    <input
                        type="number"
                        step="any"
                        name="longitude"
                        placeholder={t('inputForm.longPlaceholder')}
                        value={formData.longitude}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
            </div>

            <div className="form-group">
                <label>{t('inputForm.ayanamsaLabel')}</label>
                <select
                    name="ayanamsa"
                    value={formData.ayanamsa || 'lahiri'}
                    onChange={handleChange}
                >
                    <option value="lahiri">{t('ayanamsa.lahiri')}/Chitrapaksha</option>
                    <option value="raman">{t('ayanamsa.raman')}</option>
                    <option value="krishnamurti">{t('ayanamsa.kp')}</option>
                    <option value="tropical">{t('ayanamsa.tropical')}</option>
                </select>
            </div>

            <div className="button-group" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                    type="button"
                    className="submit-btn"
                    onClick={handleSaveAndGenerate}
                    disabled={isLoading}
                    style={{ background: isLoading ? '#6b7280' : '#10b981', flex: 1, cursor: isLoading ? 'wait' : 'pointer' }}
                >
                    {isLoading ? 'Saving...' : t('inputForm.saveAndGenerate')}
                </button>
                <button
                    type="submit"
                    className="submit-btn"
                    disabled={isLoading}
                    style={{ flex: 1, opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
                >
                    {isLoading ? 'Generating...' : t('inputForm.generate')}
                </button>
            </div>
        </form>
    );
};

export default InputForm;
