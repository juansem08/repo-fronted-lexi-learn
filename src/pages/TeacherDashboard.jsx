import { useState, useEffect } from 'react';
import api from '../services/api';

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await api.get('/dashboard/teacher');
      setStudents(res.data.students);
    } catch (error) {
      console.error('Failed to load teacher dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: 'var(--space-xs)' }}>ðŸ‘©â€ðŸ« Teacher Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Monitor student progress and identify areas where students need help.
      </p>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: 'var(--space-xl)' }}>
        <div className="card card-elevated" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{students.length}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Students</div>
        </div>
        <div className="card card-elevated" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
            {students.filter((s) => s.assessmentCompleted).length}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Assessments Done</div>
        </div>
        <div className="card card-elevated" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-dark)' }}>
            {students.reduce((sum, s) => sum + s.totalExercises, 0)}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Exercises</div>
        </div>
        <div className="card card-elevated" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary-dark)' }}>
            {students.length > 0
              ? Math.round(students.reduce((sum, s) => sum + s.averageScore, 0) / students.length)
              : 0}%
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Avg Score</div>
        </div>
      </div>

      {/* Students Table */}
      {students.length > 0 ? (
        <div className="card card-elevated">
          <div className="card-title" style={{ marginBottom: 'var(--space-lg)' }}>Student Overview</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Student</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Level</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>XP</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Exercises</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Avg Score</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Streak</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Weak Areas</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Skills</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: selectedStudent?.id === student.id ? 'var(--primary-bg)' : 'transparent',
                    }}
                    onClick={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600 }}>{student.student?.firstName} {student.student?.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{student.student?.email}</div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '16px', fontWeight: 700 }}>{student.level}</td>
                    <td style={{ textAlign: 'center', padding: '16px' }}>
                      <span className="badge badge-warning">{student.totalXP}</span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '16px' }}>{student.totalExercises}</td>
                    <td style={{ textAlign: 'center', padding: '16px' }}>
                      <span style={{
                        fontWeight: 700,
    </div>
  );
}
