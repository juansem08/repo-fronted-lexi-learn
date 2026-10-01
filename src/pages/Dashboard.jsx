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
        <h1>Welcome back, {student.firstName}! 👋</h1>
        <p>
          {assessmentCompleted
            ? "Let's continue building your skills today."
            : "Complete your initial assessment to start your personalized learning journey!"}
        </p>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-card-icon">⭐</div>
            <div className="stat-card-value">{gamification?.totalXP || 0}</div>
            <div className="stat-card-label">Total XP</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">📊</div>
            <div className="stat-card-value">Level {gamification?.level || 1}</div>
            <div className="stat-card-label">Current Level</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">🔥</div>
            <div className="stat-card-value">{gamification?.currentStreak || 0}</div>
            <div className="stat-card-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">✅</div>
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
              <h3>📋 Take Your Initial Assessment</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                This short assessment helps us understand your skills and create a personalized learning plan.
              </p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/assessment')}>
              Start Assessment →
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
            <span style={{ fontSize: '2rem' }}>🏅</span>
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
          <div className="dashboard-section-title">📊 Your Skills</div>
          <div className="skills-grid">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="skill-card"
                style={{ '--skill-color': skill.color, '--skill-bg': `${skill.color}15` }}
                onClick={() => navigate(`/exercises?skill=${skill.id}`)}
              >
                <div className="skill-card-header">
                  <div className="skill-card-icon" style={{ background: `${skill.color}15` }}>
                    {skill.icon}
                  </div>
                  <div>
                    <div className="skill-card-name">{skill.name}</div>
                    <div className="skill-card-level">Level {skill.level}</div>
                  </div>
                </div>
                <div className="progress-bar progress-bar-sm">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${skill.proficiency}%`, background: `linear-gradient(90deg, ${skill.color}, ${skill.color}aa)` }}
                  />
                </div>
                <div className="skill-card-stats">
                  <span>{skill.proficiency}% mastery</span>
                  <span>{skill.exercisesCompleted} completed</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recommended Exercises */}
          {recommendedExercises.length > 0 && (
            <>
              <div className="dashboard-section-title" style={{ marginTop: 'var(--space-xl)' }}>
                🎯 Recommended for You
              </div>
              <div className="exercise-list">
                {recommendedExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="exercise-card"
                    onClick={() => navigate(`/exercises/${exercise.id}`)}
                  >
                    <div className="exercise-card-icon" style={{ background: `${exercise.skillColor || '#7C3AED'}15` }}>
                      {exercise.skillIcon || '📝'}
                    </div>
                    <div className="exercise-card-content">
                      <div className="exercise-card-title">{exercise.title}</div>
                      <div className="exercise-card-meta">
                        <span>{exercise.skillName}</span>
                        <span className="exercise-card-difficulty">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`dot ${i < exercise.difficulty ? 'active' : ''}`} />
                          ))}
                        </span>
                        <span className="exercise-card-points">⭐ {exercise.points} XP</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>→</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Weak Areas */}
          {weakAreas.length > 0 && (
            <>
              <div className="dashboard-section-title" style={{ marginTop: 'var(--space-xl)' }}>
                💡 Areas to Improve
              </div>
              {weakAreas.map((area, i) => (
                <div key={i} className="card" style={{ marginBottom: '8px', border: '1px solid var(--warning-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{area.skill.icon}</span>
                    <div>
                      <strong>{area.skill.name}</strong>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{area.suggestion}</div>
                    </div>
                    <span className="badge badge-warning" style={{ marginLeft: 'auto' }}>{area.proficiency}%</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div>
          {/* Daily Goal */}
          <div className="card card-elevated" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="card-title" style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
              Daily Goal
            </div>
            <div className="daily-goal">
              <div className="daily-goal-circle">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" stroke="var(--gray-200)" strokeWidth="8" fill="none" />
                  <circle
                    cx="60" cy="60" r="54"
                    stroke={dailyProgress.goalMet ? 'var(--success)' : 'var(--primary)'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="goal-text">
                  <span className="goal-value">
                    {dailyProgress.goalMet ? '✓' : `${dailyProgress.xpEarned}`}
                  </span>
                  <span className="goal-label">
                    {dailyProgress.goalMet ? 'Complete!' : `/ ${gamification?.dailyGoalXP || 50} XP`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="card card-elevated" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Weekly Activity</div>
            <div className="weekly-chart">
              {(gamification?.weeklyProgress || []).map((day, i) => {
                const maxXP = Math.max(...(gamification?.weeklyProgress || []).map((d) => d.xp), 1);
                const height = Math.max(4, (day.xp / maxXP) * 80);
                return (
                  <div key={i} className="weekly-bar">
                    <div className="weekly-bar-value">{day.xp}</div>
                    <div
                      className={`weekly-bar-fill ${day.goalMet ? 'goal-met' : ''}`}
                      style={{ height: `${height}px` }}
                    />
                    <div className="weekly-bar-label">
                      {dayNames[new Date(day.date + 'T12:00:00').getDay()]}
                    </div>
                  </div>
                );
              })}
              {(!gamification?.weeklyProgress || gamification.weeklyProgress.length === 0) && (
                <div className="empty-state" style={{ padding: '16px' }}>
                  <p style={{ fontSize: '0.875rem' }}>Start exercising to see your weekly activity!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card card-elevated">
            <div className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Recent Activity</div>
            {recentActivity.length > 0 ? (
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon" style={{ background: 'var(--primary-bg)' }}>
                      {activity.skillIcon}
                    </div>
                    <div className="activity-info">
                      <div className="activity-title">{activity.exerciseTitle}</div>
                      <div className="activity-meta">{activity.skillName}</div>
                    </div>
                    <div className="activity-score" style={{ color: activity.score >= 80 ? 'var(--success)' : activity.score >= 50 ? 'var(--accent-dark)' : 'var(--error)' }}>
                      {activity.score}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '16px' }}>
                <p style={{ fontSize: '0.875rem' }}>No activity yet. Start your first exercise!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
