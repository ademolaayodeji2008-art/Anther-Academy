import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState([]);

  const token = authService.getToken();
  const user = authService.getStoredUser();

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        setError('');

        const res = await axios.get(
          `${API_BASE_URL}/api/quizzes/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setQuiz(res.data.quiz);
        setQuestions(res.data.questions);

        // Fetch previous attempts
        const attemptsRes = await axios.get(
          `${API_BASE_URL}/api/quizzes/${quizId}/attempts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAttempts(attemptsRes.data.attempts);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(err.response?.data?.message || 'Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && token) {
      fetchQuiz();
    }
  }, [quizId, user, token]);

  const handleSelectAnswer = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);

      const res = await axios.post(
        `${API_BASE_URL}/api/quizzes/${quizId}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(res.data.result);
      console.log('✅ Quiz submitted:', res.data.result);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setQuizStarted(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <p className="text-slate-600">Loading quiz...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show results screen
  if (result) {
    const passed = result.passed;
    const scorePercent = result.score;

    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className={`card p-12 text-center ${passed ? 'border-2 border-green-500' : 'border-2 border-orange-500'}`}>
            {/* Score Display */}
            <div className={`text-6xl font-bold mb-4 ${passed ? 'text-green-600' : 'text-orange-600'}`}>
              {scorePercent}%
            </div>

            {/* Pass/Fail Message */}
            <h2 className={`text-3xl font-bold mb-2 ${passed ? 'text-green-700' : 'text-orange-700'}`}>
              {passed ? '🎉 You Passed!' : '📚 Please Try Again'}
            </h2>

            {/* Details */}
            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Your Score</p>
                  <p className="text-2xl font-bold text-navy-900">{result.score}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Pass Mark</p>
                  <p className="text-2xl font-bold text-navy-900">{result.pass_mark}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Correct Answers</p>
                  <p className="text-2xl font-bold text-navy-900">
                    {result.correct_count}/{result.total_questions}
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback Message */}
            {passed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium mb-2">Congratulations!</p>
                <p className="text-green-700 text-sm">
                  You have successfully completed this module quiz. You can now proceed to the next module or certificate issuance.
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-orange-800 font-medium mb-2">Score Below Pass Mark</p>
                <p className="text-orange-700 text-sm">
                  You need {result.pass_mark - result.score} more percentage points to pass. Review the material and try again.
                </p>
              </div>
            )}

            {/* Previous Attempts */}
            {attempts && attempts.length > 1 && (
              <div className="mb-6 text-left">
                <p className="text-sm font-medium text-slate-600 mb-3">Your Attempts:</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {attempts.map((attempt, idx) => (
                    <div key={attempt.id} className="flex items-center justify-between p-2 bg-slate-100 rounded">
                      <span className="text-sm text-slate-700">Attempt {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${attempt.passed ? 'text-green-600' : 'text-orange-600'}`}>
                          {attempt.score}%
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(attempt.attempted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!passed && (
                <button
                  onClick={handleRetakeQuiz}
                  className="btn-primary px-8 py-3"
                >
                  Retake Quiz
                </button>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-outline px-8 py-3"
              >
                Back to Dashboard
              </button>
              {passed && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary px-8 py-3"
                >
                  Continue Learning →
                </button>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Quiz instructions screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="card p-8">
            <h1 className="text-3xl font-bold text-navy-900 mb-4">{quiz?.title}</h1>
            {quiz?.description && (
              <p className="text-slate-600 mb-6">{quiz.description}</p>
            )}

            <div className="bg-slate-50 rounded-lg p-6 mb-6 space-y-4">
              <div>
                <p className="font-medium text-navy-900">📝 Quiz Details:</p>
                <ul className="text-sm text-slate-700 mt-2 space-y-1">
                  <li>• Total Questions: <span className="font-bold">{questions.length}</span></li>
                  <li>• Pass Mark: <span className="font-bold">{quiz?.pass_mark}%</span></li>
                  <li>• Question Type: Multiple Choice</li>
                  <li>• Format: One question at a time</li>
                </ul>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="font-medium text-navy-900">⚠️ Instructions:</p>
                <ul className="text-sm text-slate-700 mt-2 space-y-1">
                  <li>• Select one answer for each question</li>
                  <li>• You can review and change answers before submitting</li>
                  <li>• Use navigation buttons to move between questions</li>
                  <li>• Once submitted, your responses will be graded immediately</li>
                </ul>
              </div>
            </div>

            {attempts && attempts.some(a => a.passed) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  You've already passed this quiz!
                </p>
                <p className="text-green-700 text-sm mt-1">You can retake it to improve your score.</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setQuizStarted(true)}
                className="btn-primary flex-1 py-3"
              >
                Start Quiz →
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-outline flex-1 py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Quiz taking screen
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <p className="text-red-700 font-medium">No questions found for this quiz</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestion.id];
  const allAnswered = questions.every(q => answers[q.id]);
  const questionOptions = [
    { key: 'A', label: currentQuestion.option_a },
    { key: 'B', label: currentQuestion.option_b },
    { key: 'C', label: currentQuestion.option_c },
    { key: 'D', label: currentQuestion.option_d },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-slate-600">
              {Object.keys(answers).length} answered
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gold-400 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Quiz Card */}
        <div className="card p-8">
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-2">
              Question {currentQuestionIndex + 1}
            </h2>
            <p className="text-lg text-slate-700">{currentQuestion.question_text}</p>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {questionOptions.map(option => (
              <button
                key={option.key}
                onClick={() => handleSelectAnswer(currentQuestion.id, option.key)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  answers[currentQuestion.id] === option.key
                    ? 'border-navy-500 bg-navy-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion.id] === option.key
                        ? 'border-navy-500 bg-navy-500'
                        : 'border-slate-300'
                    }`}
                  >
                    {answers[currentQuestion.id] === option.key && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-slate-900">{option.key}</p>
                    <p className="text-slate-700">{option.label}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="btn-outline px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {currentQuestionIndex < questions.length - 1 && (
              <button
                onClick={handleNextQuestion}
                disabled={!isAnswered}
                className="btn-outline px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex-grow"
              >
                Next →
              </button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-600 mb-3">Jump to Question:</p>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-full h-8 rounded text-xs font-medium transition-colors ${
                    answers[q.id]
                      ? 'bg-green-500 text-white'
                      : idx === currentQuestionIndex
                      ? 'bg-navy-500 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitQuiz}
            disabled={!allAnswered || isSubmitting}
            className={`w-full py-3 font-bold rounded-lg transition-all ${
              allAnswered && !isSubmitting
                ? 'btn-primary'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Submitting...' : allAnswered ? 'Submit Quiz' : 'Answer all questions to submit'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
