import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import StatusAlert from '../components/StatusAlert';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminQuizBuilderPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Forms
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizFormData, setQuizFormData] = useState({
    title: '',
    description: '',
    pass_mark: 70,
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    explanation: '',
  });

  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const token = authService.getToken();
  const user = authService.getStoredUser();

  // Fetch quiz and questions
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Try to fetch existing quiz
        try {
          const quizRes = await axios.get(
            `${API_BASE_URL}/api/quizzes/module/${moduleId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setQuiz(quizRes.data.quiz);

          const questionsRes = await axios.get(
            `${API_BASE_URL}/api/admin/quizzes/${quizRes.data.quiz.id}/questions`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setQuestions(questionsRes.data.questions || []);
        } catch (err) {
          // Quiz doesn't exist yet, that's okay
          if (err.response?.status !== 404) {
            throw err;
          }
        }
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError(err.response?.data?.message || 'Failed to load quiz data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'admin' && token) {
      fetchQuizData();
    } else {
      setError('Admin access required');
      setIsLoading(false);
    }
  }, [moduleId, user, token]);

  // Create quiz
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/quizzes`,
        {
          module_id: moduleId,
          ...quizFormData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuiz(res.data.quiz);
      setShowQuizForm(false);
      setQuizFormData({ title: '', description: '', pass_mark: 70 });
      setSuccess('Quiz created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    }
  };

  // Update quiz
  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/admin/quizzes/${quiz.id}`,
        quizFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuiz(res.data.quiz);
      setShowQuizForm(false);
      setSuccess('Quiz updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quiz');
    }
  };

  // Add question
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/quizzes/${quiz.id}/questions`,
        questionFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuestions([...questions, res.data.question]);
      setShowQuestionForm(false);
      setQuestionFormData({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        explanation: '',
      });
      setSuccess('Question added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    }
  };

  // Update question
  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/admin/quizzes/${quiz.id}/questions/${editingQuestionId}`,
        questionFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuestions(
        questions.map(q => (q.id === editingQuestionId ? res.data.question : q))
      );
      setEditingQuestionId(null);
      setShowQuestionForm(false);
      setQuestionFormData({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        explanation: '',
      });
      setSuccess('Question updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update question');
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/quizzes/${quiz.id}/questions/${questionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuestions(questions.filter(q => q.id !== questionId));
      setSuccess('Question deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question');
    }
  };

  // Edit question
  const handleEditQuestion = (question) => {
    setQuestionFormData({
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_option: question.correct_option,
      explanation: question.explanation || '',
    });
    setEditingQuestionId(question.id);
    setShowQuestionForm(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <p className="text-slate-600">Loading quiz builder...</p>
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
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-900">Quiz Builder</h1>
            <p className="text-slate-600 mt-1">Module ID: {moduleId}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-outline px-6 py-2"
          >
            ← Back
          </button>
        </div>

        {/* Messages */}
        {error && (
          <StatusAlert type="error" message={error} onClose={() => setError('')} />
        )}
        {success && (
          <StatusAlert type="success" message={success} onClose={() => setSuccess('')} />
        )}

        {/* Quiz Section */}
        {!quiz ? (
          <div className="card p-8 text-center mb-8">
            <p className="text-slate-600 mb-4">No quiz exists for this module yet.</p>
            <button
              onClick={() => setShowQuizForm(true)}
              className="btn-primary"
            >
              Create Quiz
            </button>
          </div>
        ) : (
          <div className="card p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-navy-900">{quiz.title}</h2>
                {quiz.description && (
                  <p className="text-slate-600 mt-2">{quiz.description}</p>
                )}
                <div className="mt-4 flex gap-6">
                  <div>
                    <p className="text-xs font-medium text-slate-600">Pass Mark</p>
                    <p className="text-xl font-bold text-navy-900">{quiz.pass_mark}%</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Questions</p>
                    <p className="text-xl font-bold text-navy-900">{questions.length}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setQuizFormData({
                    title: quiz.title,
                    description: quiz.description,
                    pass_mark: quiz.pass_mark,
                  });
                  setShowQuizForm(true);
                }}
                className="btn-outline px-6 py-2"
              >
                Edit Quiz
              </button>
            </div>
          </div>
        )}

        {/* Quiz Form Modal */}
        {showQuizForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
              <h3 className="text-2xl font-bold text-navy-900 mb-6">
                {quiz ? 'Edit Quiz' : 'Create Quiz'}
              </h3>

              <form onSubmit={quiz ? handleUpdateQuiz : handleCreateQuiz} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-2">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={quizFormData.title}
                    onChange={(e) => setQuizFormData({ ...quizFormData, title: e.target.value })}
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={quizFormData.description}
                    onChange={(e) => setQuizFormData({ ...quizFormData, description: e.target.value })}
                    className="input-field w-full h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-2">
                    Pass Mark (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quizFormData.pass_mark}
                    onChange={(e) => setQuizFormData({ ...quizFormData, pass_mark: parseInt(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {quiz ? 'Update Quiz' : 'Create Quiz'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuizForm(false)}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Questions Section */}
        {quiz && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-navy-900">Questions ({questions.length})</h3>
              <button
                onClick={() => {
                  setEditingQuestionId(null);
                  setQuestionFormData({
                    question_text: '',
                    option_a: '',
                    option_b: '',
                    option_c: '',
                    option_d: '',
                    correct_option: 'A',
                    explanation: '',
                  });
                  setShowQuestionForm(true);
                }}
                className="btn-primary"
              >
                + Add Question
              </button>
            </div>

            {/* Question Cards */}
            {questions.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-slate-600 mb-4">No questions added yet.</p>
              </div>
            ) : (
              questions.map((question, idx) => (
                <div key={question.id} className="card p-6">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-600 mb-1">Question {idx + 1}</p>
                    <p className="text-lg font-bold text-navy-900">{question.question_text}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {['option_a', 'option_b', 'option_c', 'option_d'].map((key, i) => {
                      const option = String.fromCharCode(65 + i);
                      const isCorrect = question.correct_option === option;
                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-lg ${
                            isCorrect
                              ? 'bg-green-50 border-2 border-green-500'
                              : 'bg-slate-50 border border-slate-200'
                          }`}
                        >
                          <p className="text-xs font-medium text-slate-600">
                            {option} {isCorrect && '✓ Correct'}
                          </p>
                          <p className="text-sm text-slate-900 mt-1">{question[key]}</p>
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-600 mb-1">Explanation</p>
                      <p className="text-sm text-blue-900">{question.explanation}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="btn-outline px-4 py-2 flex-1 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="btn-outline px-4 py-2 flex-1 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Question Form Modal */}
        {showQuestionForm && quiz && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
              <h3 className="text-2xl font-bold text-navy-900 mb-6">
                {editingQuestionId ? 'Edit Question' : 'Add Question'}
              </h3>

              <form
                onSubmit={editingQuestionId ? handleUpdateQuestion : handleAddQuestion}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={questionFormData.question_text}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                    className="input-field w-full h-16 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['a', 'b', 'c', 'd'].map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-navy-900 mb-2">
                        Option {key.toUpperCase()}
                      </label>
                      <input
                        type="text"
                        value={questionFormData[`option_${key}`]}
                        onChange={(e) =>
                          setQuestionFormData({
                            ...questionFormData,
                            [`option_${key}`]: e.target.value,
                          })
                        }
                        className="input-field w-full"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-2">
                    Correct Answer
                  </label>
                  <select
                    value={questionFormData.correct_option}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, correct_option: e.target.value })}
                    className="input-field w-full"
                  >
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-2">
                    Explanation (optional)
                  </label>
                  <textarea
                    value={questionFormData.explanation}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, explanation: e.target.value })}
                    className="input-field w-full h-16 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingQuestionId ? 'Update Question' : 'Add Question'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionForm(false);
                      setEditingQuestionId(null);
                    }}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
