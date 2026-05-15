import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUserGroup, HiCalendar, HiQrCode, HiShieldExclamation, HiPlus, HiChartBar, HiClipboardDocumentCheck } from 'react-icons/hi2';
import { getDashboard, getFraudLogs } from '../services/feedbackService';
import { getAllEvents } from '../services/eventService';
import StatsCard from '../components/StatsCard';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [fraudLogs, setFraudLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, eventRes] = await Promise.all([getDashboard(), getAllEvents()]);
      setStats(dashRes.data.stats);
      setFraudLogs(dashRes.data.recent_fraud);
      setEvents(eventRes.data.events);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-display font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of all events and activities</p>
        </motion.div>
        <Link to="/admin/events/create" className="btn-primary flex items-center gap-2">
          <HiPlus className="w-5 h-5" />
          Create Event
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={HiUserGroup} label="Total Users" value={stats?.total_users || 0} color="primary" />
        <StatsCard icon={HiCalendar} label="Active Events" value={stats?.active_events || 0} color="cyan" />
        <StatsCard icon={HiClipboardDocumentCheck} label="Today's Check-ins" value={stats?.today_attendance || 0} color="green" />
        <StatsCard icon={HiShieldExclamation} label="Fraud Alerts" value={stats?.unresolved_fraud || 0} color="pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* More stats */}
        <StatsCard icon={HiQrCode} label="Total Registrations" value={stats?.total_registrations || 0} color="orange" />
        <StatsCard icon={HiChartBar} label="Total Attendance" value={stats?.total_attendance || 0} color="cyan" />
        <StatsCard icon={HiCalendar} label="Today's Registrations" value={stats?.today_registrations || 0} color="green" />
      </div>

      {/* Recent Fraud Alerts */}
      {fraudLogs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <HiShieldExclamation className="w-5 h-5 text-red-400" />
            Recent Fraud Alerts
          </h2>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {fraudLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                <div>
                  <span className="text-sm font-medium text-red-400 capitalize">{log.fraud_type.replace(/_/g, ' ')}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                </div>
                <span className="text-xs text-gray-600">{new Date(log.detected_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Events */}
      <h2 className="text-xl font-bold text-white mb-4">All Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} isAdmin={true} />
        ))}
        {events.length === 0 && (
          <div className="col-span-full text-center py-16">
            <HiCalendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No events yet</p>
            <Link to="/admin/events/create" className="btn-primary">Create Your First Event</Link>
          </div>
        )}
      </div>
    </div>
  );
}
