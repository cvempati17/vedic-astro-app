import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const CitySearch = ({ onCitySelect, defaultValue }) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState(defaultValue || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        // Debounce search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchCities(query);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [query]);

    const searchCities = async (searchQuery) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=10&language=en&format=json`
            );
            const data = await response.json();

            if (data.results) {
                setResults(data.results);
                setShowDropdown(true);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error('City search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCity = (city) => {
        setQuery(`${city.name}, ${city.admin1 || ''}, ${city.country}`);
        setShowDropdown(false);

        // Calculate timezone offset from timezone string
        const timezoneOffset = getTimezoneOffset(city.timezone);

        onCitySelect({
            name: city.name,
            latitude: city.latitude,
            longitude: city.longitude,
            timezone: timezoneOffset,
            country: city.country,
            state: city.admin1
        });
    };

    const getTimezoneOffset = (timezoneName) => {
        try {
            // Get the current time in the timezone
            const now = new Date();
            const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezoneName }));
            const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));

            // Calculate offset in hours
            const offset = (tzDate - utcDate) / (1000 * 60 * 60);
            return offset;
        } catch (error) {
            console.error('Timezone conversion error:', error);
            return 0;
        }
    };

    return (
        <div className="city-search">
            <label>{t('inputForm.cityLabel')}</label>
            <div className="search-container">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('inputForm.cityPlaceholder')}
                    className="city-input"
                />
                {loading && <span className="search-loading">{t('inputForm.searching')}</span>}

                {showDropdown && results.length > 0 && (
                    <div className="city-dropdown">
                        {results.map((city, index) => (
                            <div
                                key={index}
                                className="city-option"
                                onClick={() => handleSelectCity(city)}
                            >
                                <div className="city-name">{city.name}</div>
                                <div className="city-details">
                                    {city.admin1 && `${city.admin1}, `}
                                    {city.country}
                                    {city.population && ` • Pop: ${(city.population / 1000).toFixed(0)}k`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CitySearch;
