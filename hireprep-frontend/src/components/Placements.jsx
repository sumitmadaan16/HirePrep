import React, { useState, useEffect } from 'react';
import { getUserInfo } from '../utils/auth';
import { API_BASE_URL, fetchWithAuth } from '../utils/api';

const Placements = () => {
    const userInfo = getUserInfo();
    const [userRole] = useState(userInfo?.role || 'STUDENT');
    const [username] = useState(userInfo?.username || '');

    const [placements, setPlacements] = useState([]);
    const [activeTab, setActiveTab] = useState('available');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
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

            if (userRole === 'FACULTY') {
                const response = await fetchWithAuth(`${API_BASE_URL}/api/placements`);
                if (!response.ok) throw new Error('Failed to fetch placements');
                const data = await response.json();
                setPlacements(data);
            } else if (userRole === 'STUDENT') {
                if (activeTab === 'available') {
                    const response = await fetchWithAuth(
                        `${API_BASE_URL}/api/placements/available?studentUsername=${username}`
                    );
                    if (!response.ok) throw new Error('Failed to fetch placements');
                    const data = await response.json();
                    setPlacements(data);
                } else {
                    const response = await fetchWithAuth(
                        `${API_BASE_URL}/api/placements/applications/student/${username}`
                    );
                    if (!response.ok) throw new Error('Failed to fetch applications');
                    const data = await response.json();
                    const appliedPlacements = data.map(app => ({
                        ...app.placement,
                        applicationId: app.id,
                        appliedAt: app.appliedAt,
                        status: app.status
                    }));
                    setPlacements(appliedPlacements);
                }
            }
        } catch (err) {
            setError('Failed to fetch placements');
            console.error('Error fetching placements:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (placementId) => {
        try {
            setError('');
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/placements/${placementId}/apply?studentUsername=${username}`,
                { method: 'POST' }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to apply');
            }

            setSuccess('Successfully applied for placement!');
            setTimeout(() => setSuccess(''), 3000);
            fetchPlacements();
        } catch (err) {
            setError(err.message);
            console.error('Error applying:', err);
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError('Company/Title is required');
            return false;
        }
        if (!formData.role.trim()) {
            setError('Role is required');
            return false;
        }
        if (!formData.experience.trim()) {
            setError('Experience is required');
            return false;
        }
        if (!formData.description.trim()) {
            setError('Description is required');
            return false;
        }
        if (!formData.compensation || formData.compensation <= 0) {
            setError('Valid compensation amount is required');
            return false;
        }
        if (!formData.dateOfDrive) {
            setError('Drive date is required');
            return false;
        }
        if (!formData.lastDateToApply) {
            setError('Last date to apply is required');
            return false;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastDate = new Date(formData.lastDateToApply);
        const driveDate = new Date(formData.dateOfDrive);

        if (lastDate < today) {
            setError('Last date to apply cannot be in the past');
            return false;
        }

        if (driveDate <= lastDate) {
            setError('Drive date must be after the last date to apply');
            return false;
        }

        return true;
    };

    const handleCreatePlacement = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setError('');
            const placementData = {
                ...formData,
                compensation: parseFloat(formData.compensation),
                postedByUsername: username
            };

            console.log('Sending placement data:', placementData); // Debug log

            const response = await fetchWithAuth(`${API_BASE_URL}/api/placements`, {
                method: 'POST',
                body: JSON.stringify(placementData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create placement');
            }

            setSuccess('Placement posted successfully!');
            setTimeout(() => setSuccess(''), 3000);
            setShowCreateModal(false);
            resetForm();
            fetchPlacements();
        } catch (err) {
            setError(err.message);
            console.error('Error creating placement:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (error) setError('');
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
        setError('');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get minimum date for last date to apply (today)
    const getMinLastDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Get minimum date for drive date (day after last date to apply)
    const getMinDriveDate = () => {
        if (formData.lastDateToApply) {
            const lastDate = new Date(formData.lastDateToApply);
            lastDate.setDate(lastDate.getDate() + 1);
            return lastDate.toISOString().split('T')[0];
        }
        return new Date().toISOString().split('T')[0];
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

            {error && !showCreateModal && (
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
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target.className === 'modal-overlay') {
                        setShowCreateModal(false);
                        resetForm();
                    }
                }}>
                    <div className="modal-content">
                        <h2 className="modal-title">Post New Placement</h2>

                        {error && (
                            <div className="error-banner-placement" style={{ marginBottom: '1rem' }}>
                                ✕ {error}
                            </div>
                        )}

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
                                    placeholder="e.g., Google, Microsoft"
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
                                    placeholder="e.g., Software Engineer, Data Analyst"
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
                                    placeholder="e.g., 0-1 years, Freshers"
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
                                    min="0"
                                    step="1000"
                                    className="modal-input"
                                    placeholder={formData.type === 'INTERNSHIP' ? 'e.g., 15000' : 'e.g., 600000'}
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
                                    min={getMinLastDate()}
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
                                    min={getMinDriveDate()}
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
                                    placeholder="e.g., 2 years, No bond"
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
                                    placeholder="Describe the role, responsibilities, requirements, etc."
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
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