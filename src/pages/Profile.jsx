import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, fetchUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [profileRes, skillsRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/skills'),
      ]);
      setProfile(profileRes.data.profile);
      setSkills(skillsRes.data.skills);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        dailyGoalXP: profileRes.data.profile.dailyGoalXP,
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/student/profile', formData);
      await fetchUser();
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-large">{initials}</div>
        <div className="profile-info">
          <h1>{user.firstName} {user.lastName}</h1>
          <p>{user.email}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <span className="badge badge-primary">Level {profile?.currentLevel || 1}</span>
            <span className="badge badge-warning">⭐ {profile?.totalXP || 0} XP</span>
            {profile?.currentStreak > 0 && (
              <span className="badge badge-success">🔥 {profile.currentStreak} streak</span>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className="card" style={{ background: 'var(--success-light)', border: '1px solid var(--success)', marginBottom: '16px', textAlign: 'center' }}>
          ✅ {message}
        </div>
      )}

      {/* Profile Settings */}
      <div className="card card-elevated" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <div className="card-title">👤 Profile Settings</div>
          {!editing ? (
            <button className="btn btn-sm btn-secondary" onClick={() => setEditing(true)}>Edit</button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                className="form-input"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                className="form-input"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Daily XP Goal</label>
              <select
                className="form-input"
                value={formData.dailyGoalXP || 50}
                onChange={(e) => setFormData({ ...formData, dailyGoalXP: parseInt(e.target.value) })}
              >
                <option value={30}>30 XP - Casual</option>
                <option value={50}>50 XP - Regular</option>
                <option value={100}>100 XP - Serious</option>
                <option value={200}>200 XP - Intense</option>
              </select>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Name</div>
              <div style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email</div>
              <div style={{ fontWeight: 600 }}>{user.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Daily Goal</div>
              <div style={{ fontWeight: 600 }}>{profile?.dailyGoalXP || 50} XP</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Member Since</div>
              <div style={{ fontWeight: 600 }}>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Learning Stats */}
      <div className="card card-elevated" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-title" style={{ marginBottom: 'var(--space-lg)' }}>📊 Learning Statistics</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div style={{ textAlign: 'center', padding: '16px', background: 'var(--primary-bg)', borderRadius: '12px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{profile?.currentLevel || 1}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Level</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: 'var(--warning-light)', borderRadius: '12px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-dark)' }}>{profile?.totalXP || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total XP</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: 'var(--success-light)', borderRadius: '12px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{profile?.longestStreak || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Longest Streak</div>
          </div>
        </div>
      </div>

      {/* Skills Breakdown */}
      <div className="card card-elevated">
        <div className="card-title" style={{ marginBottom: 'var(--space-lg)' }}>🎯 Skills Breakdown</div>
        {skills.map((studentSkill) => (
          <div key={studentSkill.id} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {studentSkill.skill?.icon} {studentSkill.skill?.name}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Level {studentSkill.level} • {Math.round(studentSkill.proficiency)}%
              </span>
            </div>
            <div className="progress-bar progress-bar-sm">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${studentSkill.proficiency}%`,
                  background: `linear-gradient(90deg, ${studentSkill.skill?.color || 'var(--primary)'}, ${studentSkill.skill?.color || 'var(--primary)'}aa)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
