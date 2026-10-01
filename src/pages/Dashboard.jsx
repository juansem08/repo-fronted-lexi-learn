import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  if (!data) {
    return <div className="empty-state"><p>Failed to load dashboard data.</p></div>;
  }

  const { student, gamification, skills, recentActivity, weakAreas, recommendedExercises, assessmentCompleted } = data;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Daily goal circle
  const dailyProgress = gamification?.dailyProgress || { progress: 0, xpEarned: 0, goalMet: false };
  const goalPercent = Math.min(1, dailyProgress.progress);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - goalPercent * circumference;

  return (
    <div className="dashboard">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <h1>Welcome back, {student.firstName}! ðŸ‘‹</h1>
        <p>
          {assessmentCompleted
            ? "Let's continue building your skills today."
            : "Complete your initial assessment to start your personalized learning journey!"}
        </p>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-card-icon">â­</div>
            <div className="stat-card-value">{gamification?.totalXP || 0}</div>
            <div className="stat-card-label">Total XP</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">ðŸ“Š</div>
            <div className="stat-card-value">Level {gamification?.level || 1}</div>
            <div className="stat-card-label">Current Level</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">ðŸ”¥</div>
            <div className="stat-card-value">{gamification?.currentStreak || 0}</div>
            <div className="stat-card-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">âœ…</div>
            <div className="stat-card-value">{gamification?.totalExercisesCompleted || 0}</div>
            <div className="stat-card-label">Exercises Done</div>
          </div>
        </div>
      </div>

      {/* Assessment CTA if not completed */}
      {!assessmentCompleted && (
        <div className="card card-elevated" style={{ border: '2px solid var(--accent)', background: 'var(--warning-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3>ðŸ“‹ Take Your Initial Assessment</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                This short assessment helps us understand your skills and create a personalized learning plan.
              </p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/assessment')}>
              Start Assessment â†’
            </button>
          </div>
        </div>
      )}

      {/* Level progress */}
      {gamification?.nextLevel && (
        <div className="card card-elevated">
          <div className="card-header">
            <div>
              <div className="card-title">Level {gamification.level} Progress</div>
              <div className="card-subtitle">
                {gamification.nextLevel.current} / {gamification.nextLevel.needed} XP to Level {gamification.level + 1}
              </div>
            </div>
            <span style={{ fontSize: '2rem' }}>ðŸ…</span>
          </div>
          <div className="progress-bar progress-bar-lg">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.round(gamification.nextLevel.progress * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div>
          {/* Skills Overview */}
          <div className="dashboard-section-title">ðŸ“Š Your Skills</div>
          <div className="skills-grid">
    </div>
  );
}
