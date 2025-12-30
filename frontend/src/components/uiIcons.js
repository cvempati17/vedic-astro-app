import React from 'react';

const base = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
};

export const Icons = {
    home: (props = {}) => (
        <svg viewBox="0 0 24 24" {...base} {...props}>
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
        </svg>
    ),
    grid: (props = {}) => (
        <svg viewBox="0 0 24 24" {...base} {...props}>
            <rect x="3" y="3" width="8" height="8" rx="2" />
            <rect x="13" y="3" width="8" height="8" rx="2" />
            <rect x="3" y="13" width="8" height="8" rx="2" />
            <rect x="13" y="13" width="8" height="8" rx="2" />
        </svg>
    ),
    tool: (props = {}) => (
        <svg viewBox="0 0 24 24" {...base} {...props}>
            <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6L3 18v3h3l6.1-6.1a4 4 0 0 0 5.6-5.6l-2.2 2.2-2.8-2.8 2.2-2.4z" />
        </svg>
    ),
    chart: (props = {}) => (
        <svg viewBox="0 0 24 24" {...base} {...props}>
            <path d="M4 19V5" />
            <path d="M4 19h16" />
            <path d="M8 15v-5" />
            <path d="M12 15v-9" />
            <path d="M16 15v-3" />
        </svg>
    ),
    star: (props = {}) => (
        <svg viewBox="0 0 24 24" {...base} {...props}>
            <path d="M12 2l3 7 7 .6-5.3 4.6L18 21l-6-3.6L6 21l1.3-6.8L2 9.6 9 9z" />
        </svg>
    ),
    table: (props = {}) => (
        <svg viewBox="0 0 24 24" {...base} {...props}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 10h18" />
            <path d="M8 5v14" />
            <path d="M16 5v14" />
        </svg>
    ),
    upload: (props = {}) => (
        <svg viewBox="0 0 24 24" {...base} {...props}>
            <path d="M12 3v12" />
            <path d="M7 8l5-5 5 5" />
            <path d="M5 21h14" />
        </svg>
    ),
    download: (props = {}) => (
        <svg viewBox="0 0 24 24" {...base} {...props}>
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M5 21h14" />
        </svg>
    ),
    logout: (props = {}) => (
        <svg viewBox="0 0 24 24" {...base} {...props}>
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M21 3v18" />
        </svg>
    ),
    columns: (props = {}) => (
        <svg viewBox="0 0 24 24" {...base} {...props}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M9 5v14" />
            <path d="M15 5v14" />
        </svg>
    ),
    report: (props = {}) => (
        <svg viewBox="0 0 24 24" {...base} {...props}>
            <path d="M7 3h10v18H7z" />
            <path d="M9 7h6" />
            <path d="M9 11h6" />
            <path d="M9 15h4" />
        </svg>
    )
};
