import React from 'react';
import { Home, BookOpen, ClipboardList, Briefcase, Calendar, LogOut, User, Star, Megaphone, Sparkles } from 'lucide-react';
import { logout } from '../utils/auth';

const Sidebar = ({ activeSection, setActiveSection }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h1 className="sidebar-title">HirePrep</h1>
                <p className="sidebar-subtitle">Placement Portal</p>
            </div>

            <nav className="sidebar-nav">
                <button
                    onClick={() => setActiveSection('dashboard')}
                    className={`sidebar-button ${activeSection === 'dashboard' ? 'active' : ''}`}
                >
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                </button>
                <button
                    onClick={() => setActiveSection('hiregenie')}
                    className={`sidebar-button ${activeSection === 'hiregenie' ? 'active' : ''} sidebar-button-genie`}
                >
                    <Sparkles className="w-5 h-5" />
                    <span>HireGenie AI</span>
                </button>
                <button
                    onClick={() => setActiveSection('profile')}
                    className={`sidebar-button ${activeSection === 'profile' ? 'active' : ''}`}
                >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                </button>
                <button
                    onClick={() => setActiveSection('resources')}
                    className={`sidebar-button ${activeSection === 'resources' ? 'active' : ''}`}
                >
                    <BookOpen className="w-5 h-5" />
                    <span>Resources</span>
                </button>
                <button
                    onClick={() => setActiveSection('tests')}
                    className={`sidebar-button ${activeSection === 'tests' ? 'active' : ''}`}
                >
                    <ClipboardList className="w-5 h-5" />
                    <span>Tests</span>
                </button>
                <button
                    onClick={() => setActiveSection('placements')}
                    className={`sidebar-button ${activeSection === 'placements' ? 'active' : ''}`}
                >
                    <Briefcase className="w-5 h-5" />
                    <span>Placements</span>
                </button>
                <button
                    onClick={() => setActiveSection('reviews')}
                    className={`sidebar-button ${activeSection === 'reviews' ? 'active' : ''}`}
                >
                    <Star className="w-5 h-5" />
                    <span>Reviews</span>
                </button>
                <button
                    onClick={() => setActiveSection('noticeboard')}
                    className={`sidebar-button ${activeSection === 'noticeboard' ? 'active' : ''}`}
                >
                    <Megaphone className="w-5 h-5" />
                    <span>Notices</span>
                </button>
                <button
                    onClick={() => setActiveSection('attendance')}
                    className={`sidebar-button ${activeSection === 'attendance' ? 'active' : ''}`}
                >
                    <Calendar className="w-5 h-5" />
                    <span>Attendance</span>
                </button>
            </nav>

            <div className="sidebar-footer">
                <button onClick={logout} className="logout-button">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;