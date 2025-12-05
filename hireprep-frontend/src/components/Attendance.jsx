import React, { useState, useEffect } from 'react';
import { Calendar, Users, BookOpen, Check, X, Plus, AlertCircle } from 'lucide-react';
import { getUserInfo } from '../utils/auth';
import { API_BASE_URL, fetchWithAuth } from '../utils/api';

const Attendance = () => {
    const userInfo = getUserInfo();
    const [userRole] = useState(userInfo?.role || 'STUDENT');
    const [username] = useState(userInfo?.username || '');

    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [stats, setStats] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');

    // Faculty state
    const [mentees, setMentees] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (userRole === 'STUDENT') {
            fetchStudentData();
        } else if (userRole === 'FACULTY') {
            fetchFacultyData();
        }
    }, [userRole, username]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [recordsResponse, statsResponse] = await Promise.all([
                fetchWithAuth(`${API_BASE_URL}/api/attendance/student/${username}`),
                fetchWithAuth(`${API_BASE_URL}/api/attendance/student/${username}/stats`)
            ]);

            if (!recordsResponse.ok || !statsResponse.ok) {
                throw new Error('Failed to fetch attendance data');
            }

            const recordsData = await recordsResponse.json();
            const statsData = await statsResponse.json();
            recordsData.sort((a, b) => new Date(b.date) - new Date(a.date));

            setAttendanceRecords(recordsData);
            setFilteredRecords(recordsData);
            const uniqueSubjects = [...new Set(recordsData.map(r => r.subject))];
            setSubjects(uniqueSubjects);

            setStats(statsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFacultyData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [menteesResponse, subjectsResponse] = await Promise.all([
                fetchWithAuth(`${API_BASE_URL}/api/profile/faculty/${username}/mentees`),
                fetchWithAuth(`${API_BASE_URL}/api/attendance/subjects`)
            ]);

            if (!menteesResponse.ok || !subjectsResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const menteesData = await menteesResponse.json();
            const subjectsData = await subjectsResponse.json();

            setMentees(menteesData);
            setSubjects(subjectsData);

            const initialData = {};
            menteesData.forEach(student => {
                initialData[student.username] = { present: true, remarks: '' };
            });
            setAttendanceData(initialData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceToggle = (studentUsername) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentUsername]: {
                ...prev[studentUsername],
                present: !prev[studentUsername].present
            }
        }));
    };

    const handleRemarksChange = (studentUsername, remarks) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentUsername]: {
                ...prev[studentUsername],
                remarks: remarks
            }
        }));
    };

    const handleSubmitAttendance = async () => {
        if (!selectedSubject) {
            setError('Please select a subject');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            setSuccessMessage('');

            const studentsAttendance = mentees.map(student => ({
                username: student.username,
                present: attendanceData[student.username].present,
                remarks: attendanceData[student.username].remarks
            }));

            const requestData = {
                subject: selectedSubject,
                date: selectedDate,
                facultyUsername: username,
                students: studentsAttendance
            };

            const response = await fetchWithAuth(`${API_BASE_URL}/api/attendance/mark`, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to mark attendance');
            }

            setSuccessMessage(`Attendance marked successfully for ${selectedSubject} on ${new Date(selectedDate).toLocaleDateString()}!`);
            const initialData = {};
            mentees.forEach(student => {
                initialData[student.username] = { present: true, remarks: '' };
            });
            setAttendanceData(initialData);

            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSubjectFilter) {
            const filtered = attendanceRecords.filter(r => r.subject === selectedSubjectFilter);
            setFilteredRecords(filtered);
        } else {
            setFilteredRecords(attendanceRecords);
        }
    }, [selectedSubjectFilter, attendanceRecords]);

    if (loading && !stats && mentees.length === 0) {
        return (
            <div className="page-container">
                <div className="loading-message">Loading attendance data...</div>
            </div>
        );
    }

    if (userRole === 'STUDENT') {
        return (
            <div className="page-container">
                <h1 className="page-title">My Attendance</h1>

                {error && (
                    <div className="error-message">
                        <X className="icon-small" />
                        {error}
                    </div>
                )}

                {stats && (
                    <div className="attendance-grid">
                        <div className="card attendance-stat-card overall">
                            <div className="attendance-value overall">
                                {stats.attendancePercentage.toFixed(1)}%
                            </div>
                            <div className="attendance-label">Overall Attendance</div>
                        </div>
                        <div className="card attendance-stat-card attended">
                            <div className="attendance-value attended">
                                {stats.classesAttended}
                            </div>
                            <div className="attendance-label">Classes Attended</div>
                        </div>
                        <div className="card attendance-stat-card missed">
                            <div className="attendance-value missed">
                                {stats.classesMissed}
                            </div>
                            <div className="attendance-label">Classes Missed</div>
                        </div>
                    </div>
                )}

                {subjects.length > 0 && (
                    <div className="filter-container" style={{ margin: '1rem 0' }}>
                        <label className="filter-label">
                            <BookOpen className="icon-small" />
                            Filter by Subject:
                        </label>
                        <select
                            value={selectedSubjectFilter}
                            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                            className="input-field"
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>
                                    {subject}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="card">
                    <h3 className="section-title">Attendance Records</h3>
                    {filteredRecords.length > 0 ? (
                        <div className="attendance-table-container">
                            <table className="attendance-table">
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Faculty</th>
                                    <th>Remarks</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredRecords.map((record) => (
                                    <tr key={record.id}>
                                        <td>
                                            {new Date(record.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="subject-cell">{record.subject}</td>
                                        <td className="status-cell">
                                            <span className={`status-badge ${record.present ? 'present' : 'absent'}`}>
                                                {record.present ? (
                                                    <>
                                                        <Check className="icon-tiny" />
                                                        Present
                                                    </>
                                                ) : (
                                                    <>
                                                        <X className="icon-tiny" />
                                                        Absent
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td>{record.facultyName}</td>
                                        <td className="remarks-cell">{record.remarks || 'No remarks'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-data-message">
                            <AlertCircle className="icon" />
                            <p>No attendance records found for the selected subject.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1 className="page-title">Mark Attendance</h1>

            {error && (
                <div className="error-message">
                    <X className="icon-small" />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="success-message">
                    <Check className="icon-small" />
                    {successMessage}
                </div>
            )}

            <div className="card">
                <div className="attendance-form-header">
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <BookOpen className="icon-small" />
                                Subject
                            </label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Select Subject</option>
                                {subjects.map((subject) => (
                                    <option key={subject} value={subject}>
                                        {subject}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>
                                <Calendar className="icon-small" />
                                Date
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                {selectedSubject ? (
                    <>
                        <h3 className="section-title">
                            <Users className="icon-small" />
                            My Mentees ({mentees.length})
                        </h3>

                        {mentees.length > 0 ? (
                            <>
                                <div className="students-grid">
                                    {mentees.map((student) => (
                                        <div key={student.username} className="student-attendance-card">
                                            <div className="student-info">
                                                <div className="student-avatar">
                                                    {student.firstName[0]}{student.lastName[0]}
                                                </div>
                                                <div className="student-details">
                                                    <p className="student-name">
                                                        {student.firstName} {student.lastName}
                                                    </p>
                                                    <p className="student-username">@{student.username}</p>
                                                </div>
                                            </div>
                                            <div className="attendance-controls">
                                                <button
                                                    onClick={() => handleAttendanceToggle(student.username)}
                                                    className={`attendance-btn ${
                                                        attendanceData[student.username]?.present
                                                            ? 'present'
                                                            : 'absent'
                                                    }`}
                                                >
                                                    {attendanceData[student.username]?.present ? (
                                                        <>
                                                            <Check className="icon-small" />
                                                            Present
                                                        </>
                                                    ) : (
                                                        <>
                                                            <X className="icon-small" />
                                                            Absent
                                                        </>
                                                    )}
                                                </button>
                                                <input
                                                    type="text"
                                                    placeholder="Remarks (optional)"
                                                    value={attendanceData[student.username]?.remarks || ''}
                                                    onChange={(e) => handleRemarksChange(student.username, e.target.value)}
                                                    className="remarks-input"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-actions">
                                    <button
                                        onClick={handleSubmitAttendance}
                                        disabled={loading || !selectedSubject}
                                        className="btn btn-save"
                                    >
                                        <Plus className="icon-small" />
                                        {loading ? 'Marking Attendance...' : 'Mark Attendance'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="no-data-message">
                                <Users className="icon" />
                                <p>No mentees assigned to you.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-data-message">
                        <BookOpen className="icon" />
                        <p>Please select a subject to view students and mark attendance.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;