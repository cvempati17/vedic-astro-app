import React from 'react';
import { useTranslation } from 'react-i18next';

const Disclaimer = () => {
    const { t } = useTranslation();

    return (
        <footer style={{
            backgroundColor: '#060918',
            color: '#94a3b8',
            padding: '2rem 5%',
            textAlign: 'center',
            borderTop: '1px solid #1e293b',
            marginTop: 'auto',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <p>&copy; {new Date().getFullYear()} AstroGravity. All rights reserved.</p>
            <div style={{
                marginTop: '1rem',
                fontSize: '0.85rem',
                color: '#64748b',
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: '1.5'
            }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#cbd5e1' }}>{t('disclaimer.title')}</p>
                <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: t('disclaimer.text') }} />
            </div>
        </footer>
    );
};

export default Disclaimer;
