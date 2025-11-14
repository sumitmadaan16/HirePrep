import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8084/api/placements';

const Placements = () => {
    const [placements, setPlacements] = useState([]);
    const [activeTab, setActiveTab] = useState('available');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [userRole] = useState('STUDENT'); // Change to 'FACULTY' to test faculty view
    const [username] = useState('alex.johnson.student'); // Change based on role
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        role: '',
        experience: '',
        description: '',
        type: 'INTERNSHIP',
        dateOfDrive: '',
        lastDateToApply: '',
        compensation: '',
        bond: '',
        postedByUsername: username
    });

    useEffect(() => {
        fetchPlacements();
    }, [activeTab, username]);

    const fetchPlacements = async () => {
        try {
            setLoading(true);
            setError('');
            let response;

            if (userRole === 'FACULTY') {
                response = await axios.get(`${API_BASE_URL}`);
                setPlacements(response.data);
            } else if (userRole === 'STUDENT') {
                if (activeTab === 'available') {
                    response = await axios.get(`${API_BASE_URL}/available`, {
                        params: { studentUsername: username }
                    });
                    setPlacements(response.data);
                } else {
                    response = await axios.get(`${API_BASE_URL}/applications/student/${username}`);
                    const appliedPlacements = response.data.map(app => ({
                        ...app.placement,
                        applicationId: app.id,
                        appliedAt: app.appliedAt,
                        status: app.status
                    }));
                    setPlacements(appliedPlacements);
                }
            }
        } catch (err) {
            setError('Failed to fetch placements: ' + (err.response?.data?.error || err.message));
            console.error('Error fetching placements:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (placementId) => {
        try {
            setError('');
            await axios.post(`${API_BASE_URL}/${placementId}/apply`, null, {
                params: { studentUsername: username }
            });
            setSuccess('Successfully applied for placement!');
            setTimeout(() => setSuccess(''), 3000);
            fetchPlacements();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to apply for placement';
            setError(errorMsg);
            console.error('Error applying:', err);
        }
    };

    const handleCreatePlacement = async (e) => {
        e.preventDefault();
        try {
            setError('');
            const placementData = {
                ...formData,
                postedByUsername: username
            };
            await axios.post(API_BASE_URL, placementData);
            setSuccess('Placement posted successfully!');
            setTimeout(() => setSuccess(''), 3000);
            setShowCreateModal(false);
            resetForm();
            fetchPlacements();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to create placement';
            setError(errorMsg);
            console.error('Error creating placement:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            title: '',
            role: '',
            experience: '',
            description: '',
            type: 'INTERNSHIP',
            dateOfDrive: '',
            lastDateToApply: '',
            compensation: '',
            bond: '',
            postedByUsername: username
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="placements-container">
            <div className="placements-header">
                <h1 className="placements-title">Placement Opportunities</h1>
                {userRole === 'FACULTY' && (
                    <button onClick={() => setShowCreateModal(true)} className="btn-post-placement">
                        + Post Placement
                    </button>
                )}
            </div>

            {success && (
                <div className="success-banner">
                    ✓ {success}
                </div>
            )}

            {error && (
                <div className="error-banner-placement">
                    ✕ {error}
                </div>
            )}

            {userRole === 'STUDENT' && (
                <div className="placement-tabs">
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
                    >
                        Available
                    </button>
                    <button
                        onClick={() => setActiveTab('applied')}
                        className={`tab-button ${activeTab === 'applied' ? 'active' : ''}`}
                    >
                        Applied
                    </button>
                </div>
            )}

            {loading ? (
                <div className="placements-loading">
                    <div className="loading-spinner"></div>
                    <p className="loading-spinner-text">Loading placements...</p>
                </div>
            ) : placements.length === 0 ? (
                <div className="placements-empty">
                    <div className="empty-icon">📋</div>
                    <p className="empty-title">
                        No placements {userRole === 'STUDENT' && activeTab === 'applied' ? 'applied for' : 'available'} yet
                    </p>
                    <p className="empty-subtitle">
                        {userRole === 'FACULTY' ? 'Post your first placement opportunity!' : 'Check back later for new opportunities'}
                    </p>
                </div>
            ) : (
                <div className="placements-grid">
                    {placements.map(placement => (
                        <div key={placement.id} className="placement-card">
                            <div className="placement-card-header">
                                <div className="placement-header-content">
                                    <div className="placement-emoji">
                                        {placement.type === 'INTERNSHIP' ? '🎓' : '💼'}
                                    </div>
                                    <div>
                                        <h3 className="placement-card-title">
                                            {placement.title}
                                        </h3>
                                        <p className="placement-card-role">
                                            {placement.role}
                                        </p>
                                    </div>
                                </div>
                                <span className={`placement-type-badge ${placement.type === 'INTERNSHIP' ? 'internship' : 'fulltime'}`}>
                                    {placement.type}
                                </span>
                            </div>

                            <div className="placement-info">
                                <div className="placement-info-row">
                                    <span className="placement-info-label">
                                        {placement.type === 'INTERNSHIP' ? 'Stipend' : 'Salary'}
                                    </span>
                                    <span className="placement-info-value">
                                        ₹{placement.compensation?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="placement-info-row">
                                    <span className="placement-info-label">Experience</span>
                                    <span className="placement-info-value">{placement.experience}</span>
                                </div>
                                <div className="placement-info-row">
                                    <span className="placement-info-label">Drive Date</span>
                                    <span className="placement-info-value">{formatDate(placement.dateOfDrive)}</span>
                                </div>
                                <div className="placement-info-row">
                                    <span className="placement-info-label">Apply By</span>
                                    <span className="placement-info-value deadline">
                                        {formatDate(placement.lastDateToApply)}
                                    </span>
                                </div>
                                {placement.bond && (
                                    <div className="placement-info-row">
                                        <span className="placement-info-label">Bond</span>
                                        <span className="placement-info-value">{placement.bond}</span>
                                    </div>
                                )}
                            </div>

                            <p className="placement-description">
                                {placement.description?.substring(0, 100)}{placement.description?.length > 100 ? '...' : ''}
                            </p>

                            {userRole === 'STUDENT' && activeTab === 'available' ? (
                                <button onClick={() => handleApply(placement.id)} className="btn-apply">
                                    Apply Now
                                </button>
                            ) : userRole === 'STUDENT' && activeTab === 'applied' ? (
                                <div className="placement-applied-badge">
                                    ✓ Applied on {formatDate(placement.appliedAt)}
                                </div>
                            ) : userRole === 'FACULTY' ? (
                                <div className="placement-faculty-info">
                                    Posted by you • {placement.totalApplications || 0} application(s)
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-title">Post New Placement</h2>
                        <form onSubmit={handleCreatePlacement}>
                            <div className="modal-form-group">
                                <label className="modal-label">Company/Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="modal-input"
                                />
                            </div>
                            <div className="modal-form-group">
                                <label className="modal-label">Role *</label>
                                <input
                                    type="text"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                    className="modal-input"
                                />
                            </div>
                            <div className="modal-form-group">
                                <label className="modal-label">Type *</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    required
                                    className="modal-select"
                                >
                                    <option value="INTERNSHIP">Internship</option>
                                    <option value="FULLTIME">Full Time</option>
                                </select>
                            </div>
                            <div className="modal-form-group">
                                <label className="modal-label">Experience Required *</label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 0-1 years"
                                    required
                                    className="modal-input"
                                />
                            </div>
                            <div className="modal-form-group">
                                <label className="modal-label">
                                    {formData.type === 'INTERNSHIP' ? 'Stipend' : 'Salary'} (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="compensation"
                                    value={formData.compensation}
                                    onChange={handleInputChange}
                                    required
                                    className="modal-input"
                                />
                            </div>
                            <div className="modal-form-group">
                                <label className="modal-label">Drive Date *</label>
                                <input
                                    type="date"
                                    name="dateOfDrive"
                                    value={formData.dateOfDrive}
                                    onChange={handleInputChange}
                                    required
                                    className="modal-input"
                                />
                            </div>
                            <div className="modal-form-group">
                                <label className="modal-label">Last Date to Apply *</label>
                                <input
                                    type="date"
                                    name="lastDateToApply"
                                    value={formData.lastDateToApply}
                                    onChange={handleInputChange}
                                    required
                                    className="modal-input"
                                />
                            </div>
                            <div className="modal-form-group">
                                <label className="modal-label">Bond (if any)</label>
                                <input
                                    type="text"
                                    name="bond"
                                    value={formData.bond}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2 years"
                                    className="modal-input"
                                />
                            </div>
                            <div className="modal-form-group">
                                <label className="modal-label">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="4"
                                    className="modal-textarea"
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                                    className="btn-modal-cancel"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-modal-submit">
                                    Post Placement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Placements;