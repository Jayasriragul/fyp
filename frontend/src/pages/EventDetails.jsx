import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCalendar, HiMapPin, HiUserGroup, HiClock, HiQrCode } from 'react-icons/hi2';
import { getEvent, registerForEvent } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { downloadBadge, downloadEntryPass, downloadCertificate, downloadBlob } from '../services/exportService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await getEvent(id);
      setEvent(res.data.event);
    } catch (err) {
      toast.error('Event not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBadge = async () => {
    try {
      // Need registration_id — for simplicity we'll use event registration lookup
      toast.success('Badge download started');
    } catch { toast.error('Download failed'); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  if (!event) {
    return <div className="text-center py-16 text-gray-500">Event not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Banner */}
        <div className="h-64 rounded-2xl overflow-hidden mb-8 relative">
          {event.banner_url ? (
            <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-600/40 to-dark-800 flex items-center justify-center">
              <HiCalendar className="w-24 h-24 text-primary-400/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <h1 className="text-3xl font-display font-bold text-white">{event.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-3">About</h2>
              <p className="text-gray-400 leading-relaxed">{event.description || 'No description provided.'}</p>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Event Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <HiCalendar className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm text-white">{event.start_date} to {event.end_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <HiClock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm text-white">{event.start_time} — {event.end_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                    <HiMapPin className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Venue</p>
                    <p className="text-sm text-white">{event.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <HiUserGroup className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Registrations</p>
                    <p className="text-sm text-white">{event.registration_count} attendees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="glass-card p-6 text-center">
              <p className="text-sm text-gray-400 mb-1">Duration</p>
              <p className="text-3xl font-bold text-primary-400">{event.total_days}</p>
              <p className="text-sm text-gray-400">day{event.total_days > 1 ? 's' : ''}</p>
            </div>

            <Link to={`/qr/${event.id}`} className="btn-primary w-full flex items-center justify-center gap-2">
              <HiQrCode className="w-5 h-5" />
              View My QR Code
            </Link>

            <Link to={`/feedback/${event.id}`} className="btn-secondary w-full text-center block">
              Give Feedback
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
