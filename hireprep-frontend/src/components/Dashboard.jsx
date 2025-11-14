import React, { useState } from 'react';
import { TrendingUp, Award, Clock, Briefcase, Sparkles } from 'lucide-react';

const Dashboard = ({ onNavigateToGenie }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onNavigateToGenie(searchQuery.trim());
            setSearchQuery('');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome back, Aryan!</h1>
                    <p className="page-subtitle">Here is your preparation overview</p>
                </div>
                <button className="btn-primary">
                    Mark Attendance
                </button>
            </div>

            {/* HireGenie Quick Search */}
            <div className="card dashboard-genie-search">
                <div className="dashboard-genie-header">
                    <Sparkles className="w-6 h-6" />
                    <h2 className="dashboard-genie-title">Ask HireGenie</h2>
                </div>
                <p className="dashboard-genie-description">
                    Get instant help with interviews, resume tips, company insights, and more!
                </p>
                <form onSubmit={handleSearch} className="dashboard-genie-form">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., 'Help me prepare for Google interview' or 'Review my resume'"
                        className="dashboard-genie-input"
                    />
                    <button
                        type="submit"
                        disabled={!searchQuery.trim()}
                        className="dashboard-genie-btn"
                    >
                        <Sparkles className="w-5 h-5" />
                        Ask
                    </button>
                </form>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="stat-value">12/20</div>
                    <div className="stat-label">Tests Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <Award className="w-6 h-6" />
                    </div>
                    <div className="stat-value">78%</div>
                    <div className="stat-label">Average Score</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="stat-value">92%</div>
                    <div className="stat-label">Attendance</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="stat-value">5</div>
                    <div className="stat-label">Applications</div>
                </div>
            </div>

            <div className="card">
                <h2 className="text-xl font-semibold mb-4">Upcoming Placement Drives</h2>
                <div className="placement-list">
                    <div className="placement-item">
                        <div className="placement-company">
                            <div className="company-logo">G</div>
                            <div>
                                <div className="company-name">Google</div>
                                <div className="company-role">SDE Intern</div>
                            </div>
                        </div>
                        <div className="placement-details">
                            <div className="placement-salary">12 LPA</div>
                            <div className="placement-date">Nov 5, 2025</div>
                        </div>
                    </div>
                    <div className="placement-item">
                        <div className="placement-company">
                            <div className="company-logo">M</div>
                            <div>
                                <div className="company-name">Microsoft</div>
                                <div className="company-role">Software Engineer</div>
                            </div>
                        </div>
                        <div className="placement-details">
                            <div className="placement-salary">18 LPA</div>
                            <div className="placement-date">Nov 12, 2025</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;