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

  // â”€â”€â”€ Exercise Type Renderers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            â† Back
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={submitAnswer}
            disabled={!isAnswerValid() || submitting}
          >
    </div>
  );
}
