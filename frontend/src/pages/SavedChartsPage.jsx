import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import CitySearch from '../components/CitySearch';
import { calculateHappinessIndex, getHappinessDetails, calculateWealthIndex, getWealthDetails, calculateHealthIndex, getHealthDetails } from '../utils/traitUtils';
import RibbonMenu from '../components/RibbonMenu';
import { Icons } from '../components/uiIcons.jsx';
import './SavedChartsPage.css';

const SavedChartsPage = ({ onBack, onLoadChart, onEditChart, onOpenMatchNew, onOpenMatchTraditional, onOpenNamakaran, onOpenBTR, onOpenBTRNew, onOpenForeignTravelNew, onOpenJobBusinessNew, onOpenBusinessPartnershipInput, onOpenBusinessPartnershipV6, onOpenAstrogravityTest, onOpenGeminiTest, onOpenPalmistry, onOpenPlanetaryChangesImpact, onOpenFamilyOS, onOpenMuhurat, onOpenTithi, onOpenSettings, onLogout, userType = 'basic' }) => {
    const { t } = useTranslation(); // Initialize hook
    const [charts, setCharts] = useState([]);
    // ... (rest of the file until sidebar)

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Inline Editing State
    const [editingId, setEditingId] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    // Action Menu State
    const [actionMenuOpen, setActionMenuOpen] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        happiness: true,
        wealth: true,
        health: true,
        savedOn: true,
        ayanamsa: true
    });

    const toggleColumn = (col) => {
        setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
    };

    // Sorting & Filtering State
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [filterConfig, setFilterConfig] = useState({
        name: '',
        gender: '',
        city: ''
    });

    const fileInputRef = useRef(null);

    const [toolsOpen, setToolsOpen] = useState(true);
    const [utilityOpen, setUtilityOpen] = useState(true);

    useEffect(() => {
        const fetchCharts = async () => {
            const token = localStorage.getItem('token');
            const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');

            if (!token) {
                setCharts(localCharts);
                setLoading(false);
                return;
            }

            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const response = await axios.get(`${API_URL}/api/charts`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCharts([...response.data, ...localCharts]);
            } catch (err) {
                console.error('Error fetching charts:', err);
                setError(t('savedCharts.loadCloudFailed', 'Failed to load cloud charts. Showing local charts only.'));
                setCharts(localCharts);
            } finally {
                setLoading(false);
            }
        };

        fetchCharts();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActionMenuOpen(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Load ValueStream widget script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://speak.valuestream.in/widget/widget_modern.js';
        script.setAttribute('data-project', 'AstroGravity');
        script.setAttribute('data-page', 'chart-view');
        script.setAttribute('data-user-id', 'reviewer@astrogravity.in');
        script.setAttribute('data-api-url', 'https://speak.valuestream.in');
        script.async = true;

        document.body.appendChild(script);

        return () => {
            // Cleanup: remove script when component unmounts
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedCharts = useMemo(() => {
        let sortableItems = [...charts];

        // 1. Filter
        if (filterConfig.name) {
            sortableItems = sortableItems.filter(c => c.name.toLowerCase().includes(filterConfig.name.toLowerCase()));
        }
        if (filterConfig.gender) {
            sortableItems = sortableItems.filter(c => (c.gender || '').toLowerCase().includes(filterConfig.gender.toLowerCase()));
        }
        if (filterConfig.city) {
            sortableItems = sortableItems.filter(c => (c.placeOfBirth?.city || '').toLowerCase().includes(filterConfig.city.toLowerCase()));
        }

        // 2. Sort
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                try {
                    let aValue, bValue;

                    if (sortConfig.key === 'happiness') {
                        aValue = a.chartData ? parseFloat(calculateHappinessIndex(a.chartData)) : -Infinity;
                        bValue = b.chartData ? parseFloat(calculateHappinessIndex(b.chartData)) : -Infinity;
                    } else if (sortConfig.key === 'wealth') {
                        aValue = a.chartData ? parseFloat(calculateWealthIndex(a.chartData)) : -Infinity;
                        bValue = b.chartData ? parseFloat(calculateWealthIndex(b.chartData)) : -Infinity;
                    } else if (sortConfig.key === 'health') {
                        aValue = a.chartData ? parseFloat(calculateHealthIndex(a.chartData)) : -Infinity;
                        bValue = b.chartData ? parseFloat(calculateHealthIndex(b.chartData)) : -Infinity;
                    } else if (sortConfig.key === 'city') {
                        aValue = (a.placeOfBirth?.city || '').toLowerCase();
                        bValue = (b.placeOfBirth?.city || '').toLowerCase();
                    } else if (sortConfig.key === 'name') {
                        aValue = (a.name || '').toLowerCase();
                        bValue = (b.name || '').toLowerCase();
                    } else {
                        aValue = a[sortConfig.key];
                        bValue = b[sortConfig.key];
                    }

                    // Handle null/undefined
                    if (aValue === undefined || aValue === null) aValue = '';
                    if (bValue === undefined || bValue === null) bValue = '';

                    if (aValue < bValue) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                } catch (e) {
                    return 0;
                }
            });
        }
        return sortableItems;
    }, [charts, sortConfig, filterConfig]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(charts.map(c => c._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const executeBulkDelete = async () => {
        // Separate local and cloud charts
        const localIds = [];
        const cloudIds = [];

        selectedIds.forEach(id => {
            const chart = charts.find(c => c._id === id);
            if (chart) {
                if (chart.isLocal) {
                    localIds.push(id);
                } else {
                    cloudIds.push(id);
                }
            }
        });

        // 1. Delete Local Charts
        if (localIds.length > 0) {
            const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
            const updatedLocal = localCharts.filter(c => !localIds.includes(c._id));
            localStorage.setItem('savedCharts', JSON.stringify(updatedLocal));
        }

        // 2. Delete Cloud Charts
        if (cloudIds.length > 0) {
            try {
                const token = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                await axios.post(`${API_URL}/api/charts/bulk-delete`, { ids: cloudIds }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) {
                console.error('Error deleting cloud charts:', err);
                alert(t('savedCharts.deleteCloudFailed', 'Failed to delete some cloud charts.'));
                // We might want to stop here or continue to update UI?
                // For now, let's assume partial success and update UI for what we can.
            }
        }

        // State Update
        setCharts(prev => prev.filter(c => !selectedIds.includes(c._id)));
        setSelectedIds([]);
        setShowDeleteConfirm(false);
    };

    const handleExport = () => {
        const chartsToExport = selectedIds.length > 0
            ? charts.filter(c => selectedIds.includes(c._id))
            : charts;

        if (chartsToExport.length === 0) {
            alert(t('savedCharts.noExport', "No charts to export."));
            return;
        }

        // CSV Header
        let csvContent = "Name,Gender,Date (YYYY-MM-DD),Time (HH:MM),City,Latitude,Longitude,Timezone\n";

        // CSV Rows
        chartsToExport.forEach(chart => {
            const row = [
                `"${(chart.name || '').replace(/"/g, '""')}"`,
                chart.gender || 'male',
                chart.dateOfBirth ? new Date(chart.dateOfBirth).toISOString().split('T')[0] : '',
                chart.timeOfBirth || '',
                `"${(chart.placeOfBirth?.city || '').replace(/"/g, '""')}"`,
                chart.placeOfBirth?.lat || '',
                chart.placeOfBirth?.lng || '',
                chart.placeOfBirth?.timezone || ''
            ].join(",");
            csvContent += row + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `charts_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadTemplate = () => {
        const csvContent = "Name,Gender,Date (YYYY-MM-DD),Time (HH:MM),City\nJohn Doe,male,1990-01-01,12:00,New York";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chart_template.csv';
        a.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const rows = text.split('\n').slice(1);

            const newCharts = [];
            rows.forEach(row => {
                const cols = row.split(',');
                if (cols.length >= 5) {
                    const [name, gender, date, time, city] = cols.map(c => c.trim());
                    if (name && date && time) {
                        newCharts.push({
                            _id: Date.now().toString() + Math.random().toString().substr(2, 5),
                            isLocal: true,
                            name,
                            gender: gender || 'male',
                            dateOfBirth: date,
                            timeOfBirth: time,
                            placeOfBirth: { city },
                            chartData: null,
                            createdAt: new Date().toISOString()
                        });
                    }
                }
            });

            if (newCharts.length > 0) {
                const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
                const updatedCharts = [...localCharts, ...newCharts];
                localStorage.setItem('savedCharts', JSON.stringify(updatedCharts));
                setCharts(prev => [...prev, ...newCharts]);
                alert(t('savedCharts.importSuccess', { count: newCharts.length }));
            }
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    const handleDelete = async (id, isLocal) => {
        if (!window.confirm(t('savedCharts.confirmDelete', 'Are you sure you want to delete this chart? This action cannot be undone.'))) return;

        if (isLocal) {
            const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
            const updatedCharts = localCharts.filter(chart => chart._id !== id);
            localStorage.setItem('savedCharts', JSON.stringify(updatedCharts));
            setCharts(prev => prev.filter(chart => chart._id !== id));
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.delete(`${API_URL}/api/charts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCharts(charts.filter(chart => chart._id !== id));
        } catch (err) {
            console.error('Error deleting chart:', err);
            alert(t('savedCharts.deleteFailed', 'Failed to delete chart'));
        }
    };

    const handleStartEdit = (e, chart) => {
        e.stopPropagation();
        setEditingId(chart._id);
        setIsAddingNew(false);
        setEditFormData({
            name: chart.name,
            gender: chart.gender || 'male',
            dateOfBirth: chart.dateOfBirth ? new Date(chart.dateOfBirth).toISOString().split('T')[0] : '',
            timeOfBirth: chart.timeOfBirth,
            city: chart.placeOfBirth?.city || '',
            latitude: chart.placeOfBirth?.lat,
            longitude: chart.placeOfBirth?.lng,
            timezone: chart.placeOfBirth?.timezone,
            ayanamsa: chart.ayanamsa || 'lahiri'
        });
        setActionMenuOpen(null);
    };

    const handleAddNew = () => {
        // Navigate to Enter Birth Details form via parent handler
        if (onEditChart) {
            onEditChart({});
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setIsAddingNew(false);
        setEditFormData({});
    };

    const handleSaveNew = async () => {
        if (!editFormData.name || !editFormData.dateOfBirth || !editFormData.timeOfBirth || !editFormData.city) {
            alert(t('savedCharts.fillAllFields', "Please fill all fields (Name, Date, Time, City)"));
            return;
        }

        if (!editFormData.latitude || !editFormData.longitude) {
            alert(t('savedCharts.selectCity', "Please select a city from the dropdown to get coordinates."));
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: editFormData.name,
                date: editFormData.dateOfBirth,
                time: editFormData.timeOfBirth,
                latitude: editFormData.latitude,
                longitude: editFormData.longitude,
                timezone: editFormData.timezone || 5.5,
                city: editFormData.city,
                ayanamsa: editFormData.ayanamsa || 'lahiri'
            };

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${API_URL}/api/calculate`, payload);

            if (response.data.success) {
                const newChart = {
                    _id: Date.now().toString(),
                    isLocal: true,
                    name: payload.name,
                    gender: editFormData.gender,
                    ayanamsa: payload.ayanamsa,
                    dateOfBirth: payload.date,
                    timeOfBirth: payload.time,
                    placeOfBirth: {
                        city: payload.city,
                        lat: payload.latitude,
                        lng: payload.longitude,
                        timezone: payload.timezone
                    },
                    chartData: response.data.data,
                    createdAt: new Date().toISOString()
                };

                const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
                localCharts.push(newChart);
                localStorage.setItem('savedCharts', JSON.stringify(localCharts));

                setCharts([newChart, ...charts]);
                setIsAddingNew(false);
                setEditFormData({});
            } else {
                alert(t('savedCharts.calcFailed', { error: response.data.error }));
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.error || err.message || "Unknown error";
            alert(t('savedCharts.calcError', { error: errorMessage }));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEdit = async (id, isLocal) => {
        const originalChart = charts.find(c => c._id === id);
        if (!originalChart) return;

        const payload = {
            name: editFormData.name || originalChart.name,
            date: editFormData.dateOfBirth || originalChart.dateOfBirth,
            time: editFormData.timeOfBirth || originalChart.timeOfBirth,
            city: editFormData.city || originalChart.placeOfBirth?.city,
            latitude: editFormData.latitude || originalChart.placeOfBirth?.lat,
            longitude: editFormData.longitude || originalChart.placeOfBirth?.lng,
            timezone: editFormData.timezone || originalChart.placeOfBirth?.timezone || 5.5,
            ayanamsa: editFormData.ayanamsa || originalChart.ayanamsa || 'lahiri'
        };

        if (!payload.latitude || !payload.longitude) {
            alert(t('savedCharts.selectCitySave', "Please select the City from the dropdown to fetch coordinates before saving."));
            return;
        }

        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${API_URL}/api/calculate`, payload);

            if (response.data.success) {
                const updatedChart = {
                    ...originalChart,
                    name: payload.name,
                    gender: editFormData.gender || originalChart.gender,
                    ayanamsa: payload.ayanamsa,
                    dateOfBirth: payload.date,
                    timeOfBirth: payload.time,
                    placeOfBirth: {
                        city: payload.city,
                        lat: payload.latitude,
                        lng: payload.longitude,
                        timezone: payload.timezone
                    },
                    chartData: response.data.data,
                    updatedAt: new Date().toISOString()
                };

                if (isLocal) {
                    const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
                    const updatedList = localCharts.map(c => c._id === id ? updatedChart : c);
                    localStorage.setItem('savedCharts', JSON.stringify(updatedList));
                }

                setCharts(prev => prev.map(c => c._id === id ? updatedChart : c));
                setEditingId(null);
                setEditFormData({});
            } else {
                alert(t('savedCharts.calcFailed', { error: response.data.error }));
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.error || err.message || "Unknown error";
            alert(t('savedCharts.calcError', { error: errorMessage }));
        } finally {
            setLoading(false);
        }
    };

    const handleEditInForm = (e, chart) => {
        if (e) e.stopPropagation();
        const formData = {
            name: chart.name,
            date: chart.dateOfBirth ? new Date(chart.dateOfBirth).toISOString().split('T')[0] : '',
            time: chart.timeOfBirth,
            city: chart.placeOfBirth?.city,
            latitude: chart.placeOfBirth?.lat,
            longitude: chart.placeOfBirth?.lng,
            timezone: 5.5,
            gender: chart.gender || 'male'
        };
        onEditChart(formData);
    };

    const handleLoad = (chart) => {
        if (!chart.chartData) {
            alert(t('savedCharts.notCalculated', "This chart has not been calculated yet. Please click the 'Edit' button (pencil icon), confirm the City to fetch coordinates, and click the 'Save' icon to generate the chart."));
            return;
        }

        const formData = {
            name: chart.name,
            date: chart.dateOfBirth,
            time: chart.timeOfBirth,
            city: chart.placeOfBirth?.city,
            latitude: chart.placeOfBirth?.lat,
            longitude: chart.placeOfBirth?.lng
        };
        onLoadChart(chart.chartData, formData);
    };

    const toggleActionMenu = (e, id) => {
        e.stopPropagation();
        setActionMenuOpen(actionMenuOpen === id ? null : id);
    };

    if (loading && !isAddingNew) return <div className="loading-container">{t('savedCharts.loading', 'Loading charts...')}</div>;

    return (
        <div className="saved-charts-container">
            <header className="saved-header">
                <div className="saved-header-spacer" />
                <div className="saved-header-title">
                    <h1>📂 Your Charts</h1>
                </div>
                <div className="saved-header-actions">
                    {selectedIds.length > 0 && (
                        <button className="delete-btn-bulk" onClick={() => setShowDeleteConfirm(true)} style={{ marginRight: '1rem', background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                            {t('savedCharts.deleteSelected', { count: selectedIds.length })}
                        </button>
                    )}
                    <button
                        type="button"
                        className="gear-btn"
                        onClick={onOpenSettings}
                        title={t('settings.settings', 'Settings')}
                    >
                        ⚙️
                    </button>
                    <button
                        aria-label={t('savedCharts.addNewTooltip', 'Add new Chart')}
                        onClick={handleAddNew}
                        type="button"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px' }}
                        title={t('savedCharts.addNewTooltip', 'Add new Chart')}
                    >
                        <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                            {/* Outer zodiac circle */}
                            <circle cx="32" cy="32" r="29" stroke="#8b5cf6" strokeWidth="3" fill="none" opacity="0.7" />

                            {/* Inner natal chart circle + cross (Asc/Desc & MC/IC) */}
                            <circle cx="32" cy="32" r="18" stroke="#c4b5fd" strokeWidth="2" fill="none" />
                            <line x1="32" y1="14" x2="32" y2="50" stroke="#c4b5fd" strokeWidth="2" />
                            <line x1="14" y1="32" x2="50" y2="32" stroke="#c4b5fd" strokeWidth="2" />

                            {/* 8 subtle degree markers on the wheel */}
                            <g fill="#a78bfa">
                                <circle cx="32" cy="8" r="2.5" />
                                <circle cx="56" cy="32" r="2.5" />
                                <circle cx="32" cy="56" r="2.5" />
                                <circle cx="8" cy="32" r="2.5" />
                                <circle cx="48" cy="16" r="2" />
                                <circle cx="48" cy="48" r="2" />
                                <circle cx="16" cy="16" r="2" />
                                <circle cx="16" cy="48" r="2" />
                            </g>

                            {/* Big bold "+" in the center */}
                            <g stroke="#10b981" strokeWidth="7" strokeLinecap="round">
                                <line x1="32" y1="24" x2="32" y2="40" />
                                <line x1="24" y1="32" x2="40" y2="32" />
                            </g>
                        </svg>
                    </button>
                </div>
            </header>

            <div>
                <RibbonMenu
                    logo={(
                        <span className="ribbon-logo" title="AstroGravity">
                            <img src="/AstroGravity_Logo_1.jpg" alt="AstroGravity" />
                        </span>
                    )}
                    title={t('savedCharts.title', 'My Charts')}
                    rightContent={userType === 'advance' ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                type="button"
                                className="ribbon-action"
                                onClick={() => setShowColumnMenu(!showColumnMenu)}
                            >
                                <span className="ribbon-action-icon">{Icons.columns()}</span>
                                Columns
                            </button>
                            {showColumnMenu && (
                                <div className="top-nav-dropdown" style={{ right: 0, left: 'auto' }}>
                                    <label><input type="checkbox" checked={visibleColumns.savedOn} onChange={() => toggleColumn('savedOn')} /> {t('cols.lastSaveDate', 'Last Save Date')}</label>
                                    <label><input type="checkbox" checked={visibleColumns.ayanamsa} onChange={() => toggleColumn('ayanamsa')} /> {t('cols.ayanamsa', 'Ayanamsa')}</label>
                                    <label><input type="checkbox" checked={visibleColumns.happiness} onChange={() => toggleColumn('happiness')} /> {t('cols.happiness', 'Happiness')}</label>
                                    <label><input type="checkbox" checked={visibleColumns.wealth} onChange={() => toggleColumn('wealth')} /> {t('cols.wealth', 'Wealth')}</label>
                                    <label><input type="checkbox" checked={visibleColumns.health} onChange={() => toggleColumn('health')} /> {t('cols.health', 'Health')}</label>
                                </div>
                            )}
                        </div>
                    ) : null}
                    defaultTabKey="myCharts"
                    tabs={[
                        {
                            key: 'myCharts',
                            label: 'My Charts',
                            icon: Icons.grid(),
                            groups: [
                                {
                                    key: 'chartActions',
                                    label: 'Charts',
                                    actions: [
                                        { key: 'newChart', label: 'New Chart', onClick: handleAddNew, variant: 'primary', icon: Icons.chart() },
                                        { key: 'palmistry', label: 'Palmistry', onClick: () => { if (onOpenPalmistry) { onOpenPalmistry(); } else { alert('Palmistry handler missing!'); } }, icon: Icons.chart() }
                                    ]
                                }
                            ]
                        },
                        {
                            key: 'tools',
                            label: t('nav.tools', 'Tools'),
                            icon: Icons.tool(),
                            groups: [
                                {
                                    key: 'toolsGroup',
                                    label: 'Tools',
                                    actions: [
                                        ...(userType === 'advance'
                                            ? [{ key: 'matchNew', label: t('nav.matchMakingNew', 'Match Making - New'), onClick: onOpenMatchNew, icon: Icons.star() }]
                                            : []),
                                        { key: 'matchTrad', label: t('nav.matchMakingTrad', 'Match Making - Trad'), onClick: onOpenMatchTraditional, icon: Icons.star() },
                                        { key: 'foreignTravelNew', label: t('nav.foreignTravelNew', 'Foreign Travel - New'), onClick: onOpenForeignTravelNew, icon: Icons.star() },
                                        { key: 'jobBusinessNew', label: 'Job vs Business - New', onClick: onOpenJobBusinessNew, icon: Icons.chart() },
                                        { key: 'businessPartnership', label: 'Advanced Compatibility Input', onClick: onOpenBusinessPartnershipInput, icon: Icons.chart() },
                                        { key: 'businessPartnershipV6', label: 'Business Partnership - V6.1', onClick: onOpenBusinessPartnershipV6, icon: Icons.chart() },
                                        { key: 'astrogravityTest', label: 'Test - Decision Engine', onClick: onOpenAstrogravityTest, icon: Icons.chart() },
                                        { key: 'geminiTest', label: 'Test 1Engines', onClick: onOpenGeminiTest, icon: Icons.chart() },
                                        { key: 'namakaran', label: t('nav.namakaran', 'Namakaran'), onClick: onOpenNamakaran, icon: Icons.report() },
                                        { key: 'btrNew', label: t('nav.birthTimeRectification', 'Birth Time Rectification'), onClick: onOpenBTRNew, icon: Icons.table() },
                                        { key: 'planetaryImpact', label: 'Planetry Changes and Its Impact', onClick: onOpenPlanetaryChangesImpact, icon: Icons.chart() },
                                        { key: 'familyOS', label: 'Family OS', onClick: onOpenFamilyOS, icon: Icons.chart() },
                                        { key: 'muhurat', label: 'Muhurat', onClick: onOpenMuhurat, icon: Icons.chart() },
                                        { key: 'tithi', label: 'Thithi Calculator', onClick: onOpenTithi, icon: Icons.chart() }
                                    ]
                                }
                            ]
                        },
                        ...(userType === 'advance'
                            ? [
                                {
                                    key: 'utility',
                                    label: t('nav.utility', 'Utility'),
                                    icon: Icons.table(),
                                    groups: [
                                        {
                                            key: 'fileGroup',
                                            label: 'File',
                                            actions: [
                                                { key: 'template', label: t('nav.template', 'Template'), onClick: handleDownloadTemplate, icon: Icons.download() },
                                                { key: 'export', label: t('nav.export', 'Export'), onClick: handleExport, icon: Icons.download() },
                                                { key: 'import', label: t('nav.import', 'Import'), onClick: () => fileInputRef.current && fileInputRef.current.click(), icon: Icons.upload() }
                                            ]
                                        }
                                    ]
                                }
                            ]
                            : []),
                        {
                            key: 'logout',
                            label: t('settings.logout', 'Logout'),
                            icon: Icons.logout(),
                            groups: [
                                {
                                    key: 'logoutGroup',
                                    label: 'Account',
                                    actions: [
                                        { key: 'logoutBtn', label: t('settings.logout', 'Logout'), onClick: onLogout, icon: Icons.logout() }
                                    ]
                                }
                            ]
                        }
                    ]}
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".csv"
                    onChange={handleImport}
                />

                <div className="results-content-column">
                    {error && <div className="error-msg">{error}</div>}

                    {charts.length === 0 && !loading && !isAddingNew ? (
                        <div className="empty-state">
                            <h3>{t('savedCharts.noCharts', 'No saved charts found')}</h3>
                            <button className="create-btn" onClick={handleAddNew}>{t('savedCharts.createNew', 'Create New Chart')}</button>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="charts-table">
                                <thead>
                                    <tr>
                                        <th><input type="checkbox" onChange={handleSelectAll} checked={charts.length > 0 && selectedIds.length === charts.length} /></th>
                                        <th onClick={() => handleSort('name')} className="sortable-th">{t('cols.name', 'Name')} {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                                        <th>{t('cols.gender', 'Gender')}</th>
                                        <th onClick={() => handleSort('dateOfBirth')} className="sortable-th">{t('cols.dob', 'Date of Birth')} {sortConfig.key === 'dateOfBirth' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                                        <th onClick={() => handleSort('timeOfBirth')} className="sortable-th">{t('cols.time', 'Time')} {sortConfig.key === 'timeOfBirth' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                                        <th onClick={() => handleSort('city')} className="sortable-th">{t('cols.place', 'Place')} {sortConfig.key === 'city' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                                        {visibleColumns.ayanamsa && <th>{t('cols.ayanamsa', 'Ayanamsa')}</th>}
                                        {visibleColumns.happiness && <th onClick={() => handleSort('happiness')} className="sortable-th">{t('cols.happiness', 'Happiness')} {sortConfig.key === 'happiness' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>}
                                        {visibleColumns.wealth && <th onClick={() => handleSort('wealth')} className="sortable-th">{t('cols.wealth', 'Wealth')} {sortConfig.key === 'wealth' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>}
                                        {visibleColumns.health && <th onClick={() => handleSort('health')} className="sortable-th">{t('cols.health', 'Health')} {sortConfig.key === 'health' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>}
                                        {visibleColumns.savedOn && <th>{t('cols.savedOn', 'Saved On')}</th>}
                                        <th>{t('cols.actions', 'Actions')}</th>
                                    </tr>
                                    <tr className="filter-row">
                                        <th></th>
                                        <th><input placeholder={t('filters.name', 'Filter Name')} value={filterConfig.name} onChange={e => setFilterConfig({ ...filterConfig, name: e.target.value })} className="filter-input" /></th>
                                        <th><input placeholder={t('filters.gender', 'Filter Gender')} value={filterConfig.gender} onChange={e => setFilterConfig({ ...filterConfig, gender: e.target.value })} className="filter-input" /></th>
                                        <th></th>
                                        <th></th>
                                        <th><input placeholder={t('filters.city', 'Filter City')} value={filterConfig.city} onChange={e => setFilterConfig({ ...filterConfig, city: e.target.value })} className="filter-input" /></th>
                                        {visibleColumns.ayanamsa && <th></th>}
                                        {visibleColumns.happiness && <th></th>}
                                        {visibleColumns.wealth && <th></th>}
                                        {visibleColumns.health && <th></th>}
                                        {visibleColumns.savedOn && <th></th>}
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* New Row Input */}
                                    {isAddingNew && (
                                        <tr className="editing-row new-row">
                                            <td></td>
                                            <td><input placeholder={t('placeholders.name', 'Name')} value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} /></td>
                                            <td>
                                                <select value={editFormData.gender} onChange={e => setEditFormData({ ...editFormData, gender: e.target.value })}>
                                                    <option value="male">{t('gender.male', 'Male')}</option>
                                                    <option value="female">{t('gender.female', 'Female')}</option>
                                                    <option value="other">{t('gender.other', 'Other')}</option>
                                                </select>
                                            </td>
                                            <td><input type="date" value={editFormData.dateOfBirth} onChange={e => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })} /></td>
                                            <td><input type="time" value={editFormData.timeOfBirth} onChange={e => setEditFormData({ ...editFormData, timeOfBirth: e.target.value })} /></td>
                                            <td>
                                                <div style={{ minWidth: '200px', position: 'relative' }}>
                                                    <CitySearch
                                                        defaultValue={editFormData.city}
                                                        onCitySelect={(cityData) => setEditFormData({
                                                            ...editFormData,
                                                            city: cityData.name,
                                                            latitude: cityData.latitude,
                                                            longitude: cityData.longitude,
                                                            timezone: cityData.timezone
                                                        })}
                                                    />
                                                </div>
                                            </td>
                                            {visibleColumns.ayanamsa && (
                                                <td>
                                                    <select value={editFormData.ayanamsa} onChange={e => setEditFormData({ ...editFormData, ayanamsa: e.target.value })} style={{ maxWidth: '100px' }}>
                                                        <option value="lahiri">{t('ayanamsa.lahiri', 'Lahiri')}</option>
                                                        <option value="raman">{t('ayanamsa.raman', 'Raman')}</option>
                                                        <option value="krishnamurti">{t('ayanamsa.kp', 'KP')}</option>
                                                        <option value="tropical">{t('ayanamsa.tropical', 'Tropical')}</option>
                                                    </select>
                                                </td>
                                            )}
                                            {visibleColumns.happiness && <td>-</td>}
                                            {visibleColumns.wealth && <td>-</td>}
                                            {visibleColumns.health && <td>-</td>}
                                            {visibleColumns.savedOn && <td>{t('common.now', 'Now')}</td>}
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="save-btn" onClick={handleSaveNew} title="Calculate & Save">💾</button>
                                                    <button className="cancel-btn" onClick={handleCancelEdit}>❌</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {sortedCharts.map((chart) => (
                                        <tr key={chart._id} className={editingId === chart._id ? 'editing-row' : ''}>
                                            <td><input type="checkbox" checked={selectedIds.includes(chart._id)} onChange={() => handleSelectRow(chart._id)} /></td>
                                            {editingId === chart._id ? (
                                                <>
                                                    <td><input value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} /></td>
                                                    <td>
                                                        <select value={editFormData.gender} onChange={e => setEditFormData({ ...editFormData, gender: e.target.value })}>
                                                            <option value="male">{t('gender.male', 'Male')}</option>
                                                            <option value="female">{t('gender.female', 'Female')}</option>
                                                            <option value="other">{t('gender.other', 'Other')}</option>
                                                        </select>
                                                    </td>
                                                    <td><input type="date" value={editFormData.dateOfBirth} onChange={e => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })} /></td>
                                                    <td><input type="time" value={editFormData.timeOfBirth} onChange={e => setEditFormData({ ...editFormData, timeOfBirth: e.target.value })} /></td>
                                                    <td>
                                                        <div style={{ minWidth: '200px', position: 'relative' }}>
                                                            <CitySearch
                                                                defaultValue={editFormData.city}
                                                                onCitySelect={(cityData) => setEditFormData({
                                                                    ...editFormData,
                                                                    city: cityData.name,
                                                                    latitude: cityData.latitude,
                                                                    longitude: cityData.longitude,
                                                                    timezone: cityData.timezone
                                                                })}
                                                            />
                                                        </div>
                                                    </td>
                                                    {visibleColumns.ayanamsa && (
                                                        <td>
                                                            <select value={editFormData.ayanamsa} onChange={e => setEditFormData({ ...editFormData, ayanamsa: e.target.value })} style={{ maxWidth: '100px' }}>
                                                                <option value="lahiri">{t('ayanamsa.lahiri', 'Lahiri')}</option>
                                                                <option value="raman">{t('ayanamsa.raman', 'Raman')}</option>
                                                                <option value="krishnamurti">{t('ayanamsa.kp', 'KP')}</option>
                                                                <option value="tropical">{t('ayanamsa.tropical', 'Tropical')}</option>
                                                            </select>
                                                        </td>
                                                    )}
                                                    {visibleColumns.happiness && <td>-</td>}
                                                    {visibleColumns.wealth && <td>-</td>}
                                                    {visibleColumns.health && <td>-</td>}
                                                    {visibleColumns.savedOn && <td>{new Date(chart.createdAt).toLocaleDateString()}</td>}
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="save-btn" onClick={() => handleSaveEdit(chart._id, chart.isLocal)}>💾</button>
                                                            <button className="cancel-btn" onClick={handleCancelEdit}>❌</button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td onClick={() => handleLoad(chart)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>{chart.name}</td>
                                                    <td>{chart.gender || '-'}</td>
                                                    <td>{new Date(chart.dateOfBirth).toLocaleDateString()}</td>
                                                    <td>{chart.timeOfBirth}</td>
                                                    <td>{chart.placeOfBirth?.city}</td>
                                                    {visibleColumns.ayanamsa && <td>{chart.ayanamsa || 'lahiri'}</td>}
                                                    {visibleColumns.happiness && (
                                                        <td>
                                                            <span
                                                                title={chart.chartData ? getHappinessDetails(chart.chartData) : ''}
                                                                style={{
                                                                    fontWeight: 'bold',
                                                                    cursor: 'help',
                                                                    color: (chart.chartData && calculateHappinessIndex(chart.chartData) >= 7) ? '#10b981' :
                                                                        (chart.chartData && calculateHappinessIndex(chart.chartData) >= 5) ? '#fbbf24' : '#ef4444'
                                                                }}
                                                            >
                                                                {chart.chartData ? calculateHappinessIndex(chart.chartData) : '-'}
                                                            </span>
                                                        </td>
                                                    )}
                                                    {visibleColumns.wealth && (
                                                        <td>
                                                            <span
                                                                title={chart.chartData ? getWealthDetails(chart.chartData) : ''}
                                                                style={{
                                                                    fontWeight: 'bold',
                                                                    cursor: 'help',
                                                                    color: (chart.chartData && calculateWealthIndex(chart.chartData) >= 7) ? '#10b981' :
                                                                        (chart.chartData && calculateWealthIndex(chart.chartData) >= 5) ? '#fbbf24' : '#ef4444'
                                                                }}
                                                            >
                                                                {chart.chartData ? calculateWealthIndex(chart.chartData) : '-'}
                                                            </span>
                                                        </td>
                                                    )}
                                                    {visibleColumns.health && (
                                                        <td>
                                                            <span
                                                                title={chart.chartData ? getHealthDetails(chart.chartData) : ''}
                                                                style={{
                                                                    fontWeight: 'bold',
                                                                    cursor: 'help',
                                                                    color: (chart.chartData && calculateHealthIndex(chart.chartData) >= 7) ? '#10b981' :
                                                                        (chart.chartData && calculateHealthIndex(chart.chartData) >= 5) ? '#fbbf24' : '#ef4444'
                                                                }}
                                                            >
                                                                {chart.chartData ? calculateHealthIndex(chart.chartData) : '-'}
                                                            </span>
                                                        </td>
                                                    )}
                                                    {visibleColumns.savedOn && <td>{new Date(chart.createdAt).toLocaleDateString()}</td>}
                                                    <td style={{ position: 'relative' }}>
                                                        <button className="gear-btn" onClick={(e) => toggleActionMenu(e, chart._id)}>⚙️</button>
                                                        {actionMenuOpen === chart._id && (
                                                            <div className="action-menu">
                                                                <div onClick={() => handleLoad(chart)}>👁️ Show Chart</div>
                                                                <div onClick={(e) => handleStartEdit(e, chart)}>✏️ Quick Edit</div>
                                                                <div onClick={(e) => handleEditInForm(e, chart)}>📝 Full Edit (Recalculate)</div>
                                                                <div onClick={() => handleDelete(chart._id, chart.isLocal)} className="delete-option">🗑️ Delete</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>

            {showDeleteConfirm && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: '#1e293b', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '400px', textAlign: 'center' }}>
                        <h3 style={{ marginTop: 0, color: 'white' }}>Confirm Deletion</h3>
                        <p style={{ color: '#cbd5e1' }}>You are about to delete {selectedIds.length} records. Do you want to proceed?</p>
                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                autoFocus
                                style={{ padding: '0.5rem 1.5rem', background: 'transparent', border: '1px solid #cbd5e1', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeBulkDelete}
                                style={{ padding: '0.5rem 1.5rem', background: '#ef4444', border: 'none', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedChartsPage;
