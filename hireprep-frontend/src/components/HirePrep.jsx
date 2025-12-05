import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Resources from './Resources';
import Tests from './Tests';
import Placements from './Placements';
import Reviews from './Reviews';
import NoticeBoard from './NoticeBoard';
import Attendance from './Attendance';
import HireGenie from './HireGenie';

const HirePrep = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [geniePrompt, setGeniePrompt] = useState('');

    const handleNavigateToGenie = (prompt) => {
        setGeniePrompt(prompt);
        setActiveSection('hiregenie');
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <Dashboard onNavigateToGenie={handleNavigateToGenie} />;
            case 'hiregenie':
                return <HireGenie initialPrompt={geniePrompt} key={geniePrompt} />;
            case 'profile':
                return <Profile />;
            case 'resources':
                return <Resources />;
            case 'tests':
                return <Tests />;
            case 'placements':
                return <Placements />;
            case 'reviews':
                return <Reviews />;
            case 'noticeboard':
                return <NoticeBoard />;
            case 'attendance':
                return <Attendance />;
            default:
                return <Dashboard onNavigateToGenie={handleNavigateToGenie} />;
        }
    };

    return (
        <div className="hireprep-container">
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

            <div className="main-content">
                {renderContent()}
            </div>


        </div>
    );
};

export default HirePrep;