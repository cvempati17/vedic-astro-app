import React, { useState } from 'react';
import CitySearch from './CitySearch';

const InputForm = ({ onCalculate, initialData }) => {
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
            alert('Please fill in Date and Time fields');
            return;
        }

        onCalculate(formData, false);
    };

    const handleSaveAndGenerate = (e) => {
        e.preventDefault();
        // Validate required fields
        if (!formData.date || !formData.time) {
            alert('Please fill in Date and Time fields');
            return;
        }
        onCalculate(formData, true);
    };

    return (
        <form onSubmit={handleSubmit} className="input-form">
            <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                    />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                    <label>Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '0.5rem',
                            color: 'white',
                            fontSize: '0.9rem'
                        }}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Time of Birth</label>
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
                    <label>Timezone</label>
                    <input
                        type="number"
                        step="any"
                        name="timezone"
                        placeholder="TZ"
                        value={formData.timezone}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Latitude</label>
                    <input
                        type="number"
                        step="any"
                        name="latitude"
                        placeholder="Lat"
                        value={formData.latitude}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
                <div className="form-group">
                    <label>Longitude</label>
                    <input
                        type="number"
                        step="any"
                        name="longitude"
                        placeholder="Long"
                        value={formData.longitude}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Kundali Ayanamsa</label>
                <select
                    name="ayanamsa"
                    value={formData.ayanamsa || 'lahiri'}
                    onChange={handleChange}
                    style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.9rem'
                    }}
                >
                    <option value="lahiri">Lahiri/Chitrapaksha</option>
                    <option value="raman">B.V. Raman</option>
                    <option value="krishnamurti">Krishnamurthi</option>
                    <option value="tropical">No Ayanamsa/Tropical</option>
                </select>
            </div>

            <div className="button-group" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="submit-btn" onClick={handleSaveAndGenerate} style={{ background: '#10b981', flex: 1 }}>Save & Generate</button>
                <button type="submit" className="submit-btn" style={{ flex: 1 }}>Generate</button>
            </div>
        </form>
    );
};

export default InputForm;
