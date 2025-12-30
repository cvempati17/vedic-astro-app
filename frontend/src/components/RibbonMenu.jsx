import React, { useMemo, useState } from 'react';

const RibbonMenu = ({ title, logo = null, tabs = [], rightContent = null, defaultTabKey = null }) => {
    const normalizedTabs = useMemo(() => {
        return (Array.isArray(tabs) ? tabs : []).filter(t => t && t.key && t.label);
    }, [tabs]);

    const initialKey = useMemo(() => {
        if (defaultTabKey && normalizedTabs.some(t => t.key === defaultTabKey)) return defaultTabKey;
        return normalizedTabs[0]?.key || null;
    }, [defaultTabKey, normalizedTabs]);

    const [activeTabKey, setActiveTabKey] = useState(initialKey);

    const activeTab = useMemo(() => {
        return normalizedTabs.find(t => t.key === activeTabKey) || normalizedTabs[0] || null;
    }, [activeTabKey, normalizedTabs]);

    return (
        <div className="ribbon">
            <div className="ribbon-top">
                <div className="ribbon-left">
                    {logo}
                    {title ? <div className="ribbon-title">{title}</div> : null}
                </div>
                <div className="ribbon-right">
                    {rightContent}
                </div>
            </div>

            <div className="ribbon-tabs">
                {normalizedTabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        className={tab.key === activeTabKey ? 'ribbon-tab active' : 'ribbon-tab'}
                        onClick={() => setActiveTabKey(tab.key)}
                    >
                        {tab.icon ? <span className="ribbon-tab-icon">{tab.icon}</span> : null}
                        <span className="ribbon-tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="ribbon-panel">
                <div className="ribbon-groups">
                    {(activeTab?.groups || []).map((group) => (
                        <div key={group.key || group.label} className="ribbon-group">
                            <div className="ribbon-group-actions">
                                {(group.actions || []).map((action) => (
                                    <button
                                        key={action.key || action.label}
                                        type="button"
                                        className={action.variant === 'primary' ? 'ribbon-action primary' : 'ribbon-action'}
                                        onClick={action.onClick}
                                        disabled={action.disabled}
                                        title={action.title || action.label}
                                    >
                                        {action.icon ? <span className="ribbon-action-icon">{action.icon}</span> : null}
                                        <span className="ribbon-action-label">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                            {group.label ? <div className="ribbon-group-label">{group.label}</div> : null}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RibbonMenu;
