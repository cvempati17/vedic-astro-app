import React, { useMemo, useState } from 'react';

const TopNavMenu = ({ title, sections = [], rightContent = null }) => {
    const [openKey, setOpenKey] = useState(null);

    const normalized = useMemo(() => {
        return (Array.isArray(sections) ? sections : []).filter(s => s && s.items && s.items.length > 0);
    }, [sections]);

    return (
        <div className="top-nav-bar">
            <div className="top-nav-left">
                {title ? <div className="top-nav-title">{title}</div> : null}

                <div className="top-nav-sections">
                    {normalized.map((section) => {
                        const key = section.key || section.label;
                        const isOpen = openKey === key;

                        return (
                            <div
                                key={key}
                                className="top-nav-section"
                                onMouseLeave={() => setOpenKey(null)}
                            >
                                <button
                                    type="button"
                                    className="top-nav-section-btn"
                                    onClick={() => setOpenKey(prev => (prev === key ? null : key))}
                                >
                                    {section.label}
                                    <span className="top-nav-caret">▾</span>
                                </button>

                                {isOpen ? (
                                    <div className="top-nav-dropdown">
                                        {section.items.map((item) => (
                                            <button
                                                key={item.key || item.label}
                                                type="button"
                                                className={item.active ? 'top-nav-item active' : 'top-nav-item'}
                                                onClick={() => {
                                                    setOpenKey(null);
                                                    if (typeof item.onClick === 'function') item.onClick();
                                                }}
                                                disabled={item.disabled}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="top-nav-right">
                {rightContent}
            </div>
        </div>
    );
};

export default TopNavMenu;
