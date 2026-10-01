import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function Exercise() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('loading'); // loading, list, playing, result
  const [answer, setAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const startTimeRef = useRef(Date.now());

  // Word ordering state
  const [orderedWords, setOrderedWords] = useState([]);

  useEffect(() => {
    if (id) {
      loadExercise(id);
    } else {
      loadExerciseList();
    }
  }, [id]);

  const loadExercise = async (exerciseId) => {
    try {
      const res = await api.get(`/exercises/${exerciseId}`);
      setCurrentExercise(res.data.exercise);
      setPhase('playing');
      startTimeRef.current = Date.now();
      resetAnswer();
    } catch (error) {
      console.error('Failed to load exercise:', error);
      setPhase('list');
    }
  };

  const loadExerciseList = async () => {
    try {
      const skillId = searchParams.get('skill');
      const url = skillId ? `/exercises/skill/${skillId}` : '/exercises/next?count=10';
      const res = await api.get(url);
      setExercises(res.data.exercises);
      setPhase('list');
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const resetAnswer = () => {
    setAnswer(null);
    setOrderedWords([]);
    setShowFeedback(false);
    setResult(null);
  };

  const startExercise = (exercise) => {
    setCurrentExercise(exercise);
    setPhase('playing');
    startTimeRef.current = Date.now();
    resetAnswer();
  };

  const submitAnswer = async () => {
    if (!currentExercise) return;
    setSubmitting(true);

    const timeSpent = Date.now() - startTimeRef.current;
    let formattedAnswer = {};

    switch (currentExercise.type) {
      case 'multiple_choice':
      case 'listen_select':
        formattedAnswer = { selected: answer };
        break;
      case 'word_ordering':
        formattedAnswer = { order: orderedWords };
        break;
      case 'fill_blank':
        formattedAnswer = { answer };
        break;
      case 'spelling':
        formattedAnswer = { spelling: answer };
        break;
      case 'reading_comprehension':
        formattedAnswer = { answers: answer };
        break;
      case 'match_sounds':
        formattedAnswer = { matches: answer };
        break;
      case 'identify_incorrect':
        formattedAnswer = { selected: answer };
        break;
      default:
        formattedAnswer = { selected: answer };
    }

    try {
      const res = await api.post(`/exercises/${currentExercise.id}/submit`, {
        answers: formattedAnswer,
        timeSpent,
      });
      setResult(res.data);
      setShowFeedback(true);

      if (res.data.newAchievements?.length > 0) {
        setAchievements(res.data.newAchievements);
      }

      setPhase('result');
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Exercise Type Renderers ─────────────────────────────────
  const renderExercise = () => {
    if (!currentExercise) return null;
    const { type, content, instructions } = currentExercise;

    return (
      <div className="exercise-body">
        <div className="exercise-instructions">{instructions}</div>

        {type === 'multiple_choice' && renderMultipleChoice(content)}
        {type === 'listen_select' && renderListenSelect(content)}
        {type === 'word_ordering' && renderWordOrdering(content)}
        {type === 'fill_blank' && renderFillBlank(content)}
        {type === 'spelling' && renderSpelling(content)}
        {type === 'reading_comprehension' && renderReadingComprehension(content)}
        {type === 'match_sounds' && renderMatchSounds(content)}
        {type === 'identify_incorrect' && renderIdentifyIncorrect(content)}

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-xl)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-ghost" onClick={() => { setPhase('list'); loadExerciseList(); }}>
            ← Back
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={submitAnswer}
            disabled={!isAnswerValid() || submitting}
          >
            {submitting ? 'Checking...' : 'Check Answer ✓'}
          </button>
        </div>
      </div>
    );
  };

  const isAnswerValid = () => {
    if (!currentExercise) return false;
    switch (currentExercise.type) {
      case 'word_ordering': return orderedWords.length > 0;
      case 'reading_comprehension': return answer && Object.keys(answer).length === (currentExercise.content.questions?.length || 0);
      case 'match_sounds': return answer && Object.keys(answer).length === (currentExercise.content.pairs?.length || 0);
      default: return answer !== null && answer !== '';
    }
  };

  // Multiple Choice
  const renderMultipleChoice = (content) => (
    <>
      <div className="exercise-question">{content.question}</div>
      <div className="options-grid">
        {content.options.map((opt, i) => (
          <button
            key={i}
            className={`option-btn ${answer === opt ? 'selected' : ''}`}
            onClick={() => setAnswer(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </>
  );

  // Listen & Select (with TTS)
  const renderListenSelect = (content) => {
    const speak = () => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(content.audioWord || content.correctAnswer);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    };

    return (
      <>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <button className="btn btn-primary btn-lg" onClick={speak} style={{ borderRadius: 'var(--radius-full)', width: '80px', height: '80px', fontSize: '2rem' }}>
            🔊
          </button>
          <p style={{ marginTop: 'var(--space-sm)', color: 'var(--text-secondary)' }}>Click to listen</p>
        </div>
        <div className="exercise-question">Select the word you hear:</div>
        <div className="options-grid">
          {content.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn ${answer === opt ? 'selected' : ''}`}
              onClick={() => setAnswer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </>
    );
  };

  // Word Ordering
  const renderWordOrdering = (content) => {
    const availableWords = content.words.filter((w, i) => !orderedWords.includes(i));

    const addWord = (index) => {
      setOrderedWords([...orderedWords, index]);
    };

    const removeWord = (position) => {
      setOrderedWords(orderedWords.filter((_, i) => i !== position));
    };

    return (
      <>
        <div className="exercise-question">Arrange the words to form a correct sentence:</div>

        <div className="word-sentence" style={{ minHeight: '60px' }}>
          {orderedWords.map((wordIndex, position) => (
            <div key={position} className="word-chip" onClick={() => removeWord(position)}
              style={{ background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }}>
              {content.words[wordIndex]}
            </div>
          ))}
          {orderedWords.length === 0 && (
            <span style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>Tap words below to build your sentence</span>
          )}
        </div>

        <div className="word-bank">
          {content.words.map((word, i) => (
            <div
              key={i}
              className={`word-chip ${orderedWords.includes(i) ? 'used' : ''}`}
              onClick={() => !orderedWords.includes(i) && addWord(i)}
            >
              {word}
            </div>
          ))}
        </div>
      </>
    );
  };

  // Fill in the Blank
  const renderFillBlank = (content) => {
    const parts = content.sentence.split('___');
    return (
      <>
        <div className="exercise-question">
          {parts[0]}
          <span style={{ borderBottom: '3px solid var(--primary)', padding: '0 16px', margin: '0 4px', minWidth: '80px', display: 'inline-block', fontWeight: 700, color: 'var(--primary)' }}>
            {answer || '?'}
          </span>
          {parts[1]}
        </div>
        <div className="options-grid">
          {content.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn ${answer === opt ? 'selected' : ''}`}
              onClick={() => setAnswer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </>
    );
  };

  // Spelling
  const renderSpelling = (content) => (
    <div className="spelling-input">
      <div className="exercise-question">
        {content.hint && <div className="spelling-hint">💡 Hint: {content.hint}</div>}
        {content.scrambled && (
          <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: 'var(--font-size-base)' }}>
            Scrambled letters: <strong style={{ letterSpacing: '0.15em', color: 'var(--primary)' }}>{content.scrambled}</strong>
          </div>
        )}
      </div>
      <input
        type="text"
        placeholder="Type the word..."
        value={answer || ''}
        onChange={(e) => setAnswer(e.target.value)}
        autoComplete="off"
        autoFocus
      />
    </div>
  );

  // Reading Comprehension
  const renderReadingComprehension = (content) => (
    <>
      <div className="exercise-passage">{content.passage}</div>
      {content.questions.map((q, qi) => (
        <div key={qi} style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ fontWeight: 700, marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-lg)' }}>
            {qi + 1}. {q.question}
          </div>
          <div className="options-grid">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                className={`option-btn ${answer?.[qi] === opt ? 'selected' : ''}`}
                onClick={() => {
                  const newAnswers = { ...(answer || {}) };
                  newAnswers[qi] = opt;
                  setAnswer(newAnswers);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );

  // Match Sounds
  const renderMatchSounds = (content) => {
    const allSounds = content.pairs.map((p) => p.sound);
    return (
      <>
        <div className="exercise-question">Match each word with its beginning sound:</div>
        <div className="match-container">
          {content.pairs.map((pair, i) => (
            <div key={i} className="match-row">
              <div className="match-word">{pair.word}</div>
              <span>→</span>
              <div className="match-options">
                {allSounds.map((sound, si) => (
                  <button
                    key={si}
                    className={`option-btn ${answer?.[i] === sound ? 'selected' : ''}`}
                    style={{ padding: '8px 16px', minWidth: 'auto' }}
                    onClick={() => {
                      const newMatches = { ...(answer || {}) };
                      newMatches[i] = sound;
                      setAnswer(newMatches);
                    }}
                  >
                    {sound}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  // Identify Incorrect
  const renderIdentifyIncorrect = (content) => (
    <>
      <div className="exercise-question">Tap the word that is spelled incorrectly:</div>
      <div className="word-highlight-container">
        {content.words.map((word, i) => (
          <span
            key={i}
            className={`word-highlight ${answer === word ? 'selected' : ''}`}
            onClick={() => setAnswer(word)}
          >
            {word}
          </span>
        ))}
      </div>
    </>
  );

  // ─── Result Screen ──────────────────────────────────────────
  const renderResult = () => {
    if (!result) return null;
    const { attempt, xp, streak, isPerfect, newAchievements } = result;
    const scorePercent = Math.round(attempt.score * 100);
    const isGood = scorePercent >= 70;

    return (
      <div className="exercise-body">
        <div className="exercise-result">
          <div className="result-icon">
            {isPerfect ? '🌟' : isGood ? '✅' : '💪'}
          </div>

          {xp?.leveledUp && (
            <div className="level-up-banner">
              🎉 Level Up! You reached Level {xp.currentLevel}!
            </div>
          )}

          <div className={`result-score ${isPerfect ? 'perfect' : ''}`}>
            {scorePercent}%
          </div>

          <div className="result-message">
            {isPerfect
              ? 'Perfect score! Amazing work!'
              : isGood
                ? 'Great job! Keep it up!'
                : 'Good effort! Practice makes perfect!'}
          </div>

          <div className="result-xp">
            ⭐ +{xp?.xpEarned || 0} XP
          </div>

          <div className="result-details">
            <div className="result-detail-item">
              ✅ {attempt.correctCount} / {attempt.totalCount} correct
            </div>
            {streak && (
              <div className="result-detail-item">
                🔥 {streak.currentStreak} day streak
              </div>
            )}
            <div className="result-detail-item">
              ⭐ Total XP: {xp?.totalXP || 0}
            </div>
          </div>

          {/* Detailed feedback */}
          {attempt.details && attempt.details.length > 0 && (
            <div style={{ marginTop: 'var(--space-lg)', textAlign: 'left' }}>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>Answer Details:</h4>
              {attempt.details.map((detail, i) => (
                <div key={i} className="result-detail-item" style={{
                  background: detail.correct ? 'var(--success-light)' : 'var(--error-light)',
                  borderLeft: `3px solid ${detail.correct ? 'var(--success)' : 'var(--error)'}`,
                }}>
                  <span>{detail.correct ? '✅' : '❌'}</span>
                  <span style={{ flex: 1 }}>
                    {detail.question || (detail.word ? `Word: ${detail.word}` : `Correct answer: ${detail.correctAnswer || detail.correctMatch || detail.correctWord || ''}`)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="result-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              ← Dashboard
            </button>
            <button className="btn btn-primary" onClick={() => { setPhase('list'); loadExerciseList(); }}>
              Next Exercise →
            </button>
          </div>
        </div>

        {/* Achievement toasts */}
        {newAchievements && newAchievements.map((achievement, i) => (
          <div key={i} className="achievement-toast" style={{ bottom: `${24 + i * 80}px` }}>
            <div className="achievement-toast-icon">{achievement.icon}</div>
            <div className="achievement-toast-text">
              <h4>Achievement Unlocked!</h4>
              <p>{achievement.name}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ─── Exercise List ───────────────────────────────────────────
  if (phase === 'loading') {
    return <div className="loading"><div className="spinner" /></div>;
  }

  if (phase === 'list') {
    return (
      <div className="exercise-page">
        <h1 style={{ marginBottom: 'var(--space-lg)' }}>📝 Exercises</h1>
        {exercises.length > 0 ? (
          <div className="exercise-list">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="exercise-card"
                onClick={() => startExercise(exercise)}
              >
                <div className="exercise-card-icon" style={{ background: `${exercise.skill?.color || '#7C3AED'}15` }}>
                  {exercise.skill?.icon || '📝'}
                </div>
                <div className="exercise-card-content">
                  <div className="exercise-card-title">{exercise.title}</div>
                  <div className="exercise-card-meta">
                    <span>{exercise.skill?.name}</span>
                    <span style={{ textTransform: 'capitalize' }}>{exercise.type.replace(/_/g, ' ')}</span>
                    <span className="exercise-card-difficulty">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`dot ${i < exercise.difficulty ? 'active' : ''}`} />
                      ))}
                    </span>
                    <span className="exercise-card-points">⭐ {exercise.points}</span>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>→</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No exercises available</h3>
            <p>Complete your assessment first to unlock exercises!</p>
            <button className="btn btn-primary" onClick={() => navigate('/assessment')} style={{ marginTop: '16px' }}>
              Take Assessment
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'result') {
    return <div className="exercise-page">{renderResult()}</div>;
  }

  // Playing phase
  return (
    <div className="exercise-page">
      <div className="exercise-header">
        <h2>{currentExercise?.title}</h2>
        <div className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
          {currentExercise?.skill?.icon} {currentExercise?.skill?.name}
        </div>
      </div>
      {renderExercise()}
    </div>
  );
}
