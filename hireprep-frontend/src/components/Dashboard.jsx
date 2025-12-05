import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Clock, Briefcase, Sparkles, ChevronRight, X, Calendar, Building2, Bell } from 'lucide-react';
import { getUserInfo } from '../utils/auth';
import { API_BASE_URL, fetchWithAuth } from '../utils/api';

const Dashboard = ({ onNavigateToGenie }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const userInfo = getUserInfo();
    const username = userInfo?.username;
    const [profile, setProfile] = useState(null);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [applications, setApplications] = useState([]);
    const [upcomingPlacements, setUpcomingPlacements] = useState([]);
    const [showApplicationsModal, setShowApplicationsModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (username) {
            fetchDashboardData();
        }
    }, [username]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const profileRes = await fetchWithAuth(`${API_BASE_URL}/api/profile/${username}`);
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile(profileData);
            }
            if (userInfo?.role === 'STUDENT') {
                const attendanceRes = await fetchWithAuth(`${API_BASE_URL}/api/attendance/student/${username}/stats`);
                if (attendanceRes.ok) {
                    const attendanceData = await attendanceRes.json();
                    setAttendanceStats(attendanceData);
                }

                const applicationsRes = await fetchWithAuth(`${API_BASE_URL}/api/placements/applications/student/${username}`);
                if (applicationsRes.ok) {
                    const applicationsData = await applicationsRes.json();
                    setApplications(applicationsData);
                }
                const placementsRes = await fetchWithAuth(`${API_BASE_URL}/api/placements/available?studentUsername=${username}`);
                if (placementsRes.ok) {
                    const placementsData = await placementsRes.json();
                    setUpcomingPlacements(placementsData.slice(0, 3));
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onNavigateToGenie(searchQuery.trim());
            setSearchQuery('');
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            setApplications(prev =>
                prev.map(app =>
                    app.id === applicationId ? { ...app, status: newStatus } : app
                )
            );
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            APPLIED: 'bg-blue-100 text-blue-800',
            SHORTLISTED: 'bg-yellow-100 text-yellow-800',
            REJECTED: 'bg-red-100 text-red-800',
            SELECTED: 'bg-green-100 text-green-800',
            INTERVIEW_PENDING: 'bg-purple-100 text-purple-800',
            INTERVIEW_GIVEN: 'bg-indigo-100 text-indigo-800',
            LOI_RECEIVED: 'bg-teal-100 text-teal-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-message">Loading dashboard...</div>
            </div>
        );
    }

    const displayName = profile ? `${profile.firstName} ${profile.lastName}` : username;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome back, {displayName}!</h1>
                    <p className="page-subtitle">Here is your preparation overview</p>
                </div>
            </div>

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
            {userInfo?.role === 'STUDENT' && (
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
                        <div className="stat-value">
                            {attendanceStats ? `${attendanceStats.attendancePercentage.toFixed(1)}%` : '0%'}
                        </div>
                        <div className="stat-label">Attendance</div>
                    </div>
                    <div className="stat-card stat-card-clickable" onClick={() => setShowApplicationsModal(true)}>
                        <div className="stat-icon orange">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div className="stat-value-with-arrow">
                            <span className="stat-value">{applications.length}</span>
                            <ChevronRight className="stat-arrow" />
                        </div>
                        <div className="stat-label">Applications</div>
                    </div>
                </div>
            )}
            <div className="card">
                <div className="dashboard-section-header">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h2 className="dashboard-section-title">Notice Board</h2>
                </div>
                <div className="notice-list">
                    <div className="notice-item">
                        <div className="notice-date">Nov 20, 2024</div>
                        <div className="notice-content">
                            <div className="notice-title">Campus Placement Drive - Winter 2024</div>
                            <div className="notice-description">
                                Multiple companies will be visiting campus for placement drives. Ensure your profiles are updated.
                            </div>
                        </div>
                    </div>
                    <div className="notice-item">
                        <div className="notice-date">Nov 15, 2024</div>
                        <div className="notice-content">
                            <div className="notice-title">Resume Workshop</div>
                            <div className="notice-description">
                                Attend the resume building workshop this Friday at 3 PM in the Auditorium.
                            </div>
                        </div>
                    </div>
                    <div className="notice-item">
                        <div className="notice-date">Nov 10, 2024</div>
                        <div className="notice-content">
                            <div className="notice-title">Mock Interview Sessions</div>
                            <div className="notice-description">
                                Sign up for mock interview sessions with industry experts. Limited slots available.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {userInfo?.role === 'STUDENT' && upcomingPlacements.length > 0 && (
                <div className="card">
                    <div className="dashboard-section-header">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h2 className="dashboard-section-title">Upcoming Placement Drives</h2>
                    </div>
                    <div className="placement-list">
                        {upcomingPlacements.map((placement) => (
                            <div key={placement.id} className="placement-item">
                                <div className="placement-company">
                                    <div className="company-logo">
                                        {placement.title.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="company-name">{placement.title}</div>
                                        <div className="company-role">{placement.role}</div>
                                    </div>
                                </div>
                                <div className="placement-details">
                                    <div className="placement-salary">
                                        ₹{placement.compensation?.toLocaleString()}
                                    </div>
                                    <div className="placement-date">
                                        {formatDate(placement.dateOfDrive)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {showApplicationsModal && (
                <div className="modal-overlay" onClick={() => setShowApplicationsModal(false)}>
                    <div className="modal-content applications-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-content">
                                <Building2 className="w-6 h-6 text-blue-600" />
                                <h2 className="modal-title">My Applications ({applications.length})</h2>
                            </div>
                            <button
                                onClick={() => setShowApplicationsModal(false)}
                                className="modal-close-btn"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {applications.length === 0 ? (
                            <div className="no-applications">
                                <Briefcase className="w-12 h-12 text-gray-300" />
                                <p className="no-applications-text">No applications yet</p>
                                <p className="no-applications-subtext">Start applying to placement opportunities!</p>
                            </div>
                        ) : (
                            <div className="applications-list">
                                {applications.map((app) => (
                                    <div key={app.id} className="application-item">
                                        <div className="application-header">
                                            <div className="application-company-info">
                                                <div className="application-company-logo">
                                                    {app.placement.title.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="application-company-name">
                                                        {app.placement.title}
                                                    </div>
                                                    <div className="application-role">
                                                        {app.placement.role}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="application-type-badge">
                                                {app.placement.type}
                                            </div>
                                        </div>

                                        <div className="application-details">
                                            <div className="application-detail-item">
                                                <span className="application-detail-label">Applied On:</span>
                                                <span className="application-detail-value">
                                                    {formatDate(app.appliedAt)}
                                                </span>
                                            </div>
                                            <div className="application-detail-item">
                                                <span className="application-detail-label">Compensation:</span>
                                                <span className="application-detail-value">
                                                    ₹{app.placement.compensation?.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="application-detail-item">
                                                <span className="application-detail-label">Drive Date:</span>
                                                <span className="application-detail-value">
                                                    {formatDate(app.placement.dateOfDrive)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="application-status-section">
                                            <label className="application-status-label">Status:</label>
                                            <select
                                                value={app.status}
                                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                                className="application-status-select"
                                            >
                                                <option value="APPLIED">Applied</option>
                                                <option value="SHORTLISTED">Shortlisted</option>
                                                <option value="INTERVIEW_PENDING">Interview Pending</option>
                                                <option value="INTERVIEW_GIVEN">Interview Given</option>
                                                <option value="LOI_RECEIVED">LOI Received</option>
                                                <option value="SELECTED">Selected</option>
                                                <option value="REJECTED">Rejected</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
