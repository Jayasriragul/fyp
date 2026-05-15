import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiStar } from 'react-icons/hi2';
import { submitFeedback, getMyFeedback, getEventFeedback } from '../services/feedbackService';
import { getEvent } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function FeedbackPage() {
  const { eventId } = useParams();
  const { isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [myFeedback, setMyFeedback] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventRes, fbRes] = await Promise.all([
        getEvent(eventId),
        getEventFeedback(eventId),
      ]);
      setEvent(eventRes.data.event);
      setAllFeedback(fbRes.data.feedback);
      setStats({ avg: fbRes.data.average_rating, total: fbRes.data.total, sentiments: fbRes.data.sentiments });

      if (!isAdmin()) {
        const myRes = await getMyFeedback(eventId);
        if (myRes.data.feedback) {
          setMyFeedback(myRes.data.feedback);
          setRating(myRes.data.feedback.rating);
          setComment(myRes.data.feedback.comment || '');
        }
      }
    } catch {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a rating');
    setSubmitting(true);
    try {
      await submitFeedback({ event_id: parseInt(eventId), rating, comment });
      toast.success(myFeedback ? 'Feedback updated!' : 'Feedback submitted!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-white mb-2">Feedback</h1>
      <p className="text-gray-400 mb-8">{event?.title}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submit Form */}
        {!isAdmin() && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-4">
              {myFeedback ? 'Update Your Feedback' : 'Share Your Experience'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <HiStar className={`w-10 h-10 transition-colors ${
                        star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-600'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Tell us about your experience..."
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Submitting...' : myFeedback ? 'Update Feedback' : 'Submit Feedback'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Stats & List */}
        <div className="space-y-6">
          {/* Overall Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-yellow-400">{stats.avg || 0}</p>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <HiStar key={s} className={`w-4 h-4 ${s <= Math.round(stats.avg || 0) ? 'text-yellow-400' : 'text-gray-600'}`} />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">{stats.total || 0} reviews</p>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-emerald-400">👍 {stats.sentiments?.positive || 0}</span>
                  <span className="text-orange-400">😐 {stats.sentiments?.neutral || 0}</span>
                  <span className="text-red-400">👎 {stats.sentiments?.negative || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feedback List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allFeedback.map((fb) => (
              <div key={fb.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{fb.user?.name}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <HiStar key={s} className={`w-3.5 h-3.5 ${s <= fb.rating ? 'text-yellow-400' : 'text-gray-600'}`} />
                    ))}
                  </div>
                </div>
                {fb.comment && <p className="text-sm text-gray-400">{fb.comment}</p>}
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    fb.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                    fb.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {fb.sentiment}
                  </span>
                  <span className="text-xs text-gray-600">{new Date(fb.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {allFeedback.length === 0 && (
              <p className="text-center text-gray-500 py-8">No feedback yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
