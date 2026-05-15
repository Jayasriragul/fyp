import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCalendar, HiPhoto } from 'react-icons/hi2';
import { createEvent, updateEvent, getEvent } from '../services/eventService';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '', description: '', venue: '', address: '',
    start_date: '', end_date: '', start_time: '09:00', end_time: '17:00',
    max_attendees: 100,
  });
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await getEvent(id);
      const e = res.data.event;
      setForm({
        title: e.title, description: e.description || '', venue: e.venue,
        address: e.address || '', start_date: e.start_date, end_date: e.end_date,
        start_time: e.start_time, end_time: e.end_time, max_attendees: e.max_attendees,
      });
    } catch { toast.error('Event not found'); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (banner) formData.append('banner', banner);

      if (isEdit) {
        await updateEvent(id, formData);
        toast.success('Event updated!');
      } else {
        await createEvent(formData);
        toast.success('Event created!');
      }
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          {isEdit ? 'Edit Event' : 'Create New Event'}
        </h1>
        <p className="text-gray-400 mb-8">Fill in all the details for your event</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <HiCalendar className="w-5 h-5 text-primary-400" /> Basic Info
            </h2>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Event Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="Tech Summit 2026" required />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="input-field resize-none" placeholder="Describe your event..." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Venue *</label>
                <input name="venue" value={form.venue} onChange={handleChange} className="input-field" placeholder="Convention Center" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Address</label>
                <input name="address" value={form.address} onChange={handleChange} className="input-field" placeholder="123 Main St" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Schedule</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Start Date *</label>
                <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">End Date *</label>
                <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Start Time *</label>
                <input type="time" name="start_time" value={form.start_time} onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">End Time *</label>
                <input type="time" name="end_time" value={form.end_time} onChange={handleChange} className="input-field" required />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Max Attendees (0 = unlimited)</label>
              <input type="number" name="max_attendees" value={form.max_attendees} onChange={handleChange} className="input-field" min="0" />
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <HiPhoto className="w-5 h-5 text-primary-400" /> Banner Image
            </h2>
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary-500/50 transition-colors">
                {banner ? (
                  <p className="text-primary-400">{banner.name}</p>
                ) : (
                  <>
                    <HiPhoto className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload banner image</p>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files[0])} className="hidden" />
            </label>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEdit ? 'Update Event' : 'Create Event'}
            </button>
            <button type="button" onClick={() => navigate('/admin')} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
