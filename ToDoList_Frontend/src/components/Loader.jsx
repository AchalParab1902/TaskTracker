import React from 'react';
import './Loader.css';

const Loader = ({ fullPage = false }) => {
    if (fullPage) {
        return (
            <div className="loader-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    return <div className="spinner small"></div>;
};

export default Loader;
