import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Assessment() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('intro'); // intro, testing, results
  const [assessmentId, setAssessmentId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const startAssessment = async () => {
    setLoading(true);
    try {
      const res = await api.post('/assessment/start');
      setAssessmentId(res.data.assessment.id);
      setQuestions(res.data.questions);
      setPhase('testing');
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error('Failed to start assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) return;

    const question = questions[currentIndex];
    const timeSpent = Date.now() - (startTimeRef.current || Date.now());

    const response = {
      skillId: question.skillId,
      skillSlug: question.skillSlug,
      questionIndex: question.questionIndex,
      prompt: question.prompt,
      answer: selectedAnswer,
      correctAnswer: question.correctAnswer,
      timeSpent,
    };

    const newResponses = [...responses, response];
    setResponses(newResponses);
    setSelectedAnswer(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      startTimeRef.current = Date.now();
    } else {
      submitAssessment(newResponses);
    }
  };

  const submitAssessment = async (allResponses) => {
    setLoading(true);
    try {
      const res = await api.post(`/assessment/${assessmentId}/submit`, {
        responses: allResponses,
      });
      setResults(res.data);
      setPhase('results');
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Intro phase
  if (phase === 'intro') {
    return (
      <div className="assessment-page">
        <div className="card card-elevated">
          <div className="assessment-intro">
            <h1>📋 Initial Assessment</h1>
            <p>
              This assessment helps us understand your current skills so we can create
              the best learning experience for you. There are no wrong answers — just do your best!
            </p>

            <div className="assessment-skills-preview">
              <div className="assessment-skill-item">
                <span>📖</span>
                <span>Reading</span>
              </div>
              <div className="assessment-skill-item">
                <span>👁️</span>
                <span>Words</span>
              </div>
              <div className="assessment-skill-item">
                <span>✏️</span>
                <span>Spelling</span>
              </div>
              <div className="assessment-skill-item">
                <span>🔊</span>
                <span>Sounds</span>
              </div>
              <div className="assessment-skill-item">
                <span>🧠</span>
                <span>Memory</span>
              </div>
              <div className="assessment-skill-item">
                <span>⚡</span>
                <span>Fluency</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px', margin: '0 auto var(--space-xl)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <div>✓ Takes about 5-10 minutes</div>
              <div>✓ 18 questions across 6 skill areas</div>
              <div>✓ Earns you 100 bonus XP</div>
              <div>✓ Creates your personalized learning path</div>
            </div>

            <button className="btn btn-primary btn-lg" onClick={startAssessment} disabled={loading}>
              {loading ? 'Preparing...' : "🚀 Let's Begin!"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Testing phase
  if (phase === 'testing') {
    const question = questions[currentIndex];
    const progressPercent = ((currentIndex) / questions.length) * 100;
    const currentSkillColor = question.skillColor || '#7C3AED';

    return (
      <div className="assessment-page">
        <div className="assessment-progress-header">
          <div className="assessment-skill-badge" style={{ background: `${currentSkillColor}15`, color: currentSkillColor }}>
            {question.skillIcon} {question.skillName}
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="progress-bar" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="exercise-body">
          <div className="exercise-question">{question.prompt}</div>

          <div className="options-grid">
            {question.options.map((option, i) => (
              <button
                key={i}
                className={`option-btn ${selectedAnswer === option ? 'selected' : ''}`}
                onClick={() => handleAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 'var(--space-xl)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={nextQuestion}
              disabled={selectedAnswer === null}
            >
              {currentIndex + 1 < questions.length ? 'Next →' : 'Finish Assessment ✓'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results phase
  if (phase === 'results' && results) {
    const { overallScore, skillScores } = results.results;
    return (
      <div className="assessment-page">
        <div className="card card-elevated">
          <div className="assessment-results">
            <div className="result-icon">🎉</div>
            <h2 style={{ marginBottom: 'var(--space-xs)' }}>Assessment Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Great job! Here's how you did across each skill area.
            </p>

            <div className="result-xp">⭐ +{results.xp?.xpEarned || 100} XP earned!</div>

            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, margin: 'var(--space-lg) 0 var(--space-xs)' }}>
              {overallScore}%
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>Overall Score</p>

            <div className="results-grid">
              {Object.entries(skillScores).map(([slug, data]) => {
                const scoreColor = data.score >= 70 ? 'var(--success)' : data.score >= 40 ? 'var(--accent-dark)' : 'var(--error)';
                return (
                  <div key={slug} className="result-skill-card">
                    <div style={{ fontSize: '1.5rem' }}>
                      {slug === 'reading-comprehension' && '📖'}
                      {slug === 'word-recognition' && '👁️'}
                      {slug === 'spelling' && '✏️'}
                      {slug === 'phonological-awareness' && '🔊'}
                      {slug === 'working-memory' && '🧠'}
                      {slug === 'reading-fluency' && '⚡'}
                    </div>
                    <div className="result-skill-score" style={{ color: scoreColor }}>
                      {data.score}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {data.correct}/{data.total} correct
                    </div>
                    <div className="progress-bar progress-bar-sm" style={{ marginTop: '8px' }}>
                      <div className="progress-bar-fill" style={{ width: `${data.score}%`, background: scoreColor }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 'var(--space-2xl)' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
                Go to Dashboard →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="loading"><div className="spinner" /></div>;
}
