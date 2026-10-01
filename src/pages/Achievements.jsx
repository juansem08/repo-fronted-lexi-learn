import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const res = await api.get('/gamification/achievements');
      setAchievements(res.data.achievements);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: 'var(--space-xs)' }}>🏆 Achievements</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        {unlocked.length} of {achievements.length} unlocked
      </p>

      <div className="progress-bar" style={{ marginBottom: 'var(--space-xl)' }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${achievements.length > 0 ? (unlocked.length / achievements.length) * 100 : 0}%`,
            background: 'linear-gradient(90deg, var(--accent), #F59E0B)',
          }}
        />
      </div>

      {unlocked.length > 0 && (
        <>
          <h2 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-lg)' }}>
            ✨ Unlocked ({unlocked.length})
          </h2>
          <div className="achievements-grid" style={{ marginBottom: 'var(--space-2xl)' }}>
            {unlocked
              .sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0))
              .map((achievement) => (
                <div key={achievement.id} className="achievement-card">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-name">{achievement.name}</div>
                  <div className="achievement-desc">{achievement.description}</div>
                  <span className={`badge badge-${achievement.rarity}`}>{achievement.rarity}</span>
                  <div className="achievement-xp" style={{ marginTop: '8px' }}>+{achievement.xpReward} XP</div>
                  {achievement.unlockedAt && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </>
      )}

      {locked.length > 0 && (
        <>
          <h2 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-lg)' }}>
            🔒 Locked ({locked.length})
          </h2>
          <div className="achievements-grid">
            {locked
              .sort((a, b) => (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0))
              .map((achievement) => (
                <div key={achievement.id} className="achievement-card locked">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-name">{achievement.name}</div>
                  <div className="achievement-desc">{achievement.description}</div>
                  <span className={`badge badge-${achievement.rarity}`}>{achievement.rarity}</span>
                  <div className="achievement-xp" style={{ marginTop: '8px' }}>+{achievement.xpReward} XP</div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
