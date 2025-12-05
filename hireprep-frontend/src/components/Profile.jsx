import React, { useState, useEffect } from 'react';
import { AlertCircle, Save, Edit2, X, Upload, Download, UserCheck } from 'lucide-react';
import { getUserInfo } from '../utils/auth';
import { API_BASE_URL, fetchWithAuth } from '../utils/api';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [sameAsPresentAddress, setSameAsPresentAddress] = useState(false);
    const [facultyList, setFacultyList] = useState([]);

    // Get username from JWT
    const userInfo = getUserInfo();
    const username = userInfo?.username;

    useEffect(() => {
        if (username) {
            fetchProfile();
            fetchFacultyList();
        } else {
            setError('Please log in to view your profile');
            setLoading(false);
        }
    }, [username]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchWithAuth(`${API_BASE_URL}/api/profile/${username}`);

            if (!response.ok) throw new Error('Profile not found');
            const data = await response.json();
            console.log('Profile data:', data); // Debug log
            setProfile(data);
            setEditedProfile(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFacultyList = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/profile/faculty`);
            if (response.ok) {
                const data = await response.json();
                setFacultyList(data);
            }
        } catch (err) {
            console.error('Error fetching faculty list:', err);
        }
    };

    const handleInputChange = (field, value) => {
        setEditedProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleMentorChange = (mentorUsername) => {
        const selectedMentor = facultyList.find(f => f.username === mentorUsername);
        setEditedProfile(prev => ({
            ...prev,
            mentor: selectedMentor || null
        }));
    };

    const handleAddressChange = (addressType, field, value) => {
        setEditedProfile(prev => ({
            ...prev,
            [addressType]: {
                ...(prev[addressType] || {}),
                [field]: value
            }
        }));

        if (addressType === 'presentAddress' && sameAsPresentAddress) {
            setEditedProfile(prev => ({
                ...prev,
                permanentAddress: {
                    ...(prev.presentAddress || {}),
                    [field]: value
                }
            }));
        }
    };

    const handleSameAddressChange = (checked) => {
        setSameAsPresentAddress(checked);
        if (checked) {
            setEditedProfile(prev => ({
                ...prev,
                permanentAddress: { ...prev.presentAddress }
            }));
        }
    };

    const handleEducationChange = (index, field, value) => {
        setEditedProfile(prev => {
            const newEducation = [...(prev.education || [])];
            newEducation[index] = {
                ...newEducation[index],
                [field]: value
            };
            return { ...prev, education: newEducation };
        });
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file only');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        try {
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const storageKey = `resume_${username}`;
            localStorage.setItem(storageKey, base64);

            const resumePath = `localStorage:${storageKey}`;
            setEditedProfile(prev => ({
                ...prev,
                resumePath: resumePath
            }));

            setError(null);
            alert('Resume uploaded successfully! Remember to save changes.');
        } catch (err) {
            setError('Failed to upload resume: ' + err.message);
        }
    };

    const handleDownloadResume = () => {
        const displayProfile = isEditing ? editedProfile : profile;
        if (!displayProfile.resumePath) return;

        try {
            if (displayProfile.resumePath.startsWith('localStorage:')) {
                const storageKey = displayProfile.resumePath.replace('localStorage:', '');
                const base64Data = localStorage.getItem(storageKey);

                if (!base64Data) {
                    setError('Resume not found in storage');
                    return;
                }
                const link = document.createElement('a');
                link.href = base64Data;
                link.download = `${username}_resume.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                window.open(displayProfile.resumePath, '_blank');
            }
        } catch (err) {
            setError('Failed to download resume: ' + err.message);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            const updateData = {
                email: editedProfile.email,
                firstName: editedProfile.firstName,
                lastName: editedProfile.lastName,
                phoneNumber: editedProfile.phoneNumber,
                gender: editedProfile.gender,
                presentAddress: editedProfile.presentAddress,
                permanentAddress: editedProfile.permanentAddress,
            };

            if (editedProfile.role === 'STUDENT') {
                updateData.education = editedProfile.education;
                updateData.experience = editedProfile.experience;
                updateData.disabilities = editedProfile.disabilities;
                updateData.resumePath = editedProfile.resumePath;
                updateData.mentorUsername = editedProfile.mentor?.username || '';
            } else if (editedProfile.role === 'FACULTY') {
                updateData.department = editedProfile.department;
                updateData.employeeId = editedProfile.employeeId;
            }

            console.log('Sending update data:', updateData); // Debug log

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/profile/${username}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(updateData)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            const updatedData = await response.json();
            console.log('Updated profile:', updatedData); // Debug log
            setProfile(updatedData);
            setEditedProfile(updatedData);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
        setError(null);
        setSameAsPresentAddress(false);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="error-screen">
                <div className="error-card">
                    <div className="error-header">
                        <AlertCircle className="icon" />
                        <h2 className="error-title">Error Loading Profile</h2>
                    </div>
                    <p className="error-message">{error}</p>
                    <button onClick={fetchProfile} className="btn btn-primary">Retry</button>
                </div>
            </div>
        );
    }

    const displayProfile = isEditing ? editedProfile : profile;
    const initials = displayProfile ? `${displayProfile.firstName?.[0] || ''}${displayProfile.lastName?.[0] || ''}` : 'NA';

    return (
        <div className="profile-container">
            <div className="profile-wrapper">
                <div className="profile-header">
                    <h1 className="profile-title">My Profile</h1>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="btn btn-edit">
                            <Edit2 className="icon-small" />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button onClick={handleCancel} className="btn btn-cancel" disabled={saving}>
                                <X className="icon-small" />
                                Cancel
                            </button>
                            <button onClick={handleSave} className="btn btn-save" disabled={saving}>
                                <Save className="icon-small" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>

                {error && profile && (
                    <div className="error-banner">
                        <AlertCircle className="icon-small" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="profile-card">
                    <div className="profile-info">
                        <div className="profile-avatar">{initials}</div>
                        <div className="profile-details">
                            <h2 className="profile-name">
                                {displayProfile.firstName} {displayProfile.lastName}
                            </h2>
                            <p className="profile-username">@{displayProfile.username}</p>
                            <p className="profile-role">{displayProfile.role}</p>
                        </div>
                    </div>
                </div>

                {/* Mentor Section for Students */}
                {displayProfile.role === 'STUDENT' && (
                    <div className="profile-section">
                        <h3 className="section-title">
                            <UserCheck className="icon-small" />
                            Mentor Information
                        </h3>
                        {isEditing ? (
                            <div className="form-group">
                                <label>Select Mentor</label>
                                <select
                                    value={displayProfile.mentor?.username || ''}
                                    onChange={(e) => handleMentorChange(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">No Mentor</option>
                                    {facultyList.map(faculty => (
                                        <option key={faculty.username} value={faculty.username}>
                                            {faculty.firstName} {faculty.lastName} - {faculty.department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            displayProfile.mentor ? (
                                <div className="mentor-card">
                                    <p className="mentor-label">Your Mentor</p>
                                    <p className="mentor-name">
                                        {displayProfile.mentor.firstName} {displayProfile.mentor.lastName}
                                    </p>
                                    <p className="mentor-department">{displayProfile.mentor.department}</p>
                                    <p className="mentor-email">{displayProfile.mentor.email}</p>
                                </div>
                            ) : (
                                <p style={{ color: '#666', padding: '1rem' }}>No mentor assigned</p>
                            )
                        )}
                    </div>
                )}

                <div className="profile-section">
                    <h3 className="section-title">Personal Information</h3>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={displayProfile.firstName || ''}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                disabled={!isEditing}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={displayProfile.lastName || ''}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                disabled={!isEditing}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={displayProfile.email || ''}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={!isEditing}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                value={displayProfile.phoneNumber || ''}
                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                disabled={!isEditing}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Gender</label>
                            {isEditing ? (
                                <select
                                    value={displayProfile.gender || ''}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={displayProfile.gender || ''}
                                    disabled
                                    className="input-field"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h3 className="section-title">Address Information</h3>

                    <h4 className="subsection-title">Present Address</h4>
                    <div className="grid-2">
                        <div className="form-group wide">
                            <label>Address Line 1</label>
                            <input
                                type="text"
                                value={displayProfile.presentAddress?.addressLine1 || ''}
                                onChange={(e) => handleAddressChange('presentAddress', 'addressLine1', e.target.value)}
                                disabled={!isEditing}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group wide">
                            <label>Address Line 2</label>
                            <input
                                type="text"
                                value={displayProfile.presentAddress?.addressLine2 || ''}
                                onChange={(e) => handleAddressChange('presentAddress', 'addressLine2', e.target.value)}
                                disabled={!isEditing}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>State</label>
                            <input
                                type="text"
                                value={displayProfile.presentAddress?.state || ''}
                                onChange={(e) => handleAddressChange('presentAddress', 'state', e.target.value)}
                                disabled={!isEditing}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Pincode</label>
                            <input
                                type="number"
                                value={displayProfile.presentAddress?.pincode || ''}
                                onChange={(e) => handleAddressChange('presentAddress', 'pincode', parseInt(e.target.value) || '')}
                                disabled={!isEditing}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <h4 className="subsection-title">Permanent Address</h4>
                    {isEditing && (
                        <div className="same-address-checkbox">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={sameAsPresentAddress}
                                    onChange={(e) => handleSameAddressChange(e.target.checked)}
                                    className="checkbox-input"
                                />
                                <span>Same as Present Address</span>
                            </label>
                        </div>
                    )}
                    <div className="grid-2">
                        <div className="form-group wide">
                            <label>Address Line 1</label>
                            <input
                                type="text"
                                value={displayProfile.permanentAddress?.addressLine1 || ''}
                                onChange={(e) => handleAddressChange('permanentAddress', 'addressLine1', e.target.value)}
                                disabled={!isEditing || sameAsPresentAddress}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group wide">
                            <label>Address Line 2</label>
                            <input
                                type="text"
                                value={displayProfile.permanentAddress?.addressLine2 || ''}
                                onChange={(e) => handleAddressChange('permanentAddress', 'addressLine2', e.target.value)}
                                disabled={!isEditing || sameAsPresentAddress}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>State</label>
                            <input
                                type="text"
                                value={displayProfile.permanentAddress?.state || ''}
                                onChange={(e) => handleAddressChange('permanentAddress', 'state', e.target.value)}
                                disabled={!isEditing || sameAsPresentAddress}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Pincode</label>
                            <input
                                type="number"
                                value={displayProfile.permanentAddress?.pincode || ''}
                                onChange={(e) => handleAddressChange('permanentAddress', 'pincode', parseInt(e.target.value) || '')}
                                disabled={!isEditing || sameAsPresentAddress}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                {displayProfile.role === 'STUDENT' && (
                    <>
                    {displayProfile.education && displayProfile.education.length > 0 && (
                        <div className="profile-section">
                            <h3 className="section-title">Education</h3>
                            {displayProfile.education.map((edu, index) => (
                                <div key={index} className="education-block">
                                    <h4 className="subsection-title">{edu.level}</h4>
                                    <div className="grid-2">
                                        <div className="form-group">
                                            <label>School/College</label>
                                            <input
                                                type="text"
                                                value={edu.schoolName || ''}
                                                onChange={(e) => handleEducationChange(index, 'schoolName', e.target.value)}
                                                disabled={!isEditing}
                                                className="input-field"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Board</label>
                                            <input
                                                type="text"
                                                value={edu.board || ''}
                                                onChange={(e) => handleEducationChange(index, 'board', e.target.value)}
                                                disabled={!isEditing}
                                                className="input-field"
                                            />
                                        </div>
                                        {edu.startYear !== undefined && (
                                            <div className="form-group">
                                                <label>Start Year</label>
                                                <input
                                                    type="number"
                                                    value={edu.startYear || ''}
                                                    onChange={(e) => handleEducationChange(index, 'startYear', parseInt(e.target.value) || null)}
                                                    disabled={!isEditing}
                                                    className="input-field"
                                                />
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label>Completion Year</label>
                                            <input
                                                type="number"
                                                value={edu.completionYear || ''}
                                                onChange={(e) => handleEducationChange(index, 'completionYear', parseInt(e.target.value) || '')}
                                                disabled={!isEditing}
                                                className="input-field"
                                            />
                                        </div>
                                        {edu.percentage !== undefined && (
                                            <div className="form-group">
                                                <label>Percentage</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={edu.percentage || ''}
                                                    onChange={(e) => handleEducationChange(index, 'percentage', parseFloat(e.target.value) || null)}
                                                    disabled={!isEditing}
                                                    className="input-field"
                                                />
                                            </div>
                                        )}
                                        {edu.cgpa !== undefined && (
                                            <div className="form-group">
                                                <label>CGPA</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={edu.cgpa || ''}
                                                    onChange={(e) => handleEducationChange(index, 'cgpa', parseFloat(e.target.value) || null)}
                                                    disabled={!isEditing}
                                                    className="input-field"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                        <div className="profile-section">
                            <h3 className="section-title">Additional Information</h3>
                            <div className="form-group">
                                <label>Experience</label>
                                <textarea
                                    value={displayProfile.experience || ''}
                                    onChange={(e) => handleInputChange('experience', e.target.value)}
                                    disabled={!isEditing}
                                    rows="3"
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Disabilities</label>
                                <input
                                    type="text"
                                    value={displayProfile.disabilities || ''}
                                    onChange={(e) => handleInputChange('disabilities', e.target.value)}
                                    disabled={!isEditing}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Resume</label>
                                <div className="resume-actions">
                                    {displayProfile.resumePath ? (
                                        <button
                                            onClick={handleDownloadResume}
                                            className="btn btn-download"
                                            type="button"
                                        >
                                            <Download className="icon-small" />
                                            Download Resume
                                        </button>
                                    ) : (
                                        <p className="no-resume-text">No resume uploaded</p>
                                    )}
                                    {isEditing && (
                                        <div className="resume-upload-wrapper">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleResumeUpload}
                                                id="resume-upload"
                                                className="resume-file-input"
                                            />
                                            <label
                                                htmlFor="resume-upload"
                                                className="btn btn-upload"
                                            >
                                                <Upload className="icon-small" />
                                                {displayProfile.resumePath ? 'Update Resume' : 'Upload Resume'}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {displayProfile.role === 'FACULTY' && (
                    <div className="profile-section">
                        <h3 className="section-title">Faculty Information</h3>
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Department</label>
                                <input
                                    type="text"
                                    value={displayProfile.department || ''}
                                    onChange={(e) => handleInputChange('department', e.target.value)}
                                    disabled={!isEditing}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Employee ID</label>
                                <input
                                    type="text"
                                    value={displayProfile.employeeId || ''}
                                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                                    disabled={!isEditing}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        {displayProfile.mentees && displayProfile.mentees.length > 0 && (
                            <div className="mentee-section">
                                <h4 className="subsection-title">Mentees ({displayProfile.mentees.length})</h4>
                                {displayProfile.mentees.map((mentee) => (
                                    <div key={mentee.id} className="mentee-card">
                                        <p className="mentee-name">{mentee.firstName} {mentee.lastName}</p>
                                        <p className="mentee-username">@{mentee.username}</p>
                                        <p className="mentee-email">{mentee.email}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;