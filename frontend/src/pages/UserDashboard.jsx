import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiCalendar, HiQrCode, HiTicket, HiStar } from 'react-icons/hi2';
import { getEvents, getMyEvents, registerForEvent } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('my');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [myRes, allRes] = await Promise.all([getMyEvents(), getEvents()]);
      setMyEvents(myRes.data.events);
      setAllEvents(allRes.data.events);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await registerForEvent(eventId);
      toast.success('Registered successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  const myEventIds = new Set(myEvents.map((e) => e.id));
  const availableEvents = allEvents.filter((e) => !myEventIds.has(e.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Welcome, {user?.name}! 👋
        </h1>
        <p className="text-gray-400 mb-8">Manage your events and QR codes</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={HiCalendar} label="My Events" value={myEvents.length} color="primary" />
        <StatsCard icon={HiQrCode} label="Active QR Codes" value={myEvents.filter((e) => e.qr_active).length} color="cyan" />
        <StatsCard icon={HiTicket} label="Available Events" value={availableEvents.length} color="green" />
        <StatsCard icon={HiStar} label="Attended" value={myEvents.filter((e) => e.registration_status === 'attended').length} color="orange" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('my')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === 'my' ? 'bg-primary-500 text-white' : 'glass text-gray-400 hover:text-white'
          }`}
        >
          My Events ({myEvents.length})
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === 'all' ? 'bg-primary-500 text-white' : 'glass text-gray-400 hover:text-white'
          }`}
        >
          Browse Events ({availableEvents.length})
        </button>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tab === 'my' ? (
          myEvents.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <HiCalendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No registered events. Browse available events!</p>
            </div>
          ) : (
            myEvents.map((event) => (
              <EventCard key={event.id} event={event} registered={true} />
            ))
          )
        ) : availableEvents.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-gray-500">No new events available.</p>
          </div>
        ) : (
          availableEvents.map((event) => (
            <EventCard key={event.id} event={event} showRegister onRegister={handleRegister} />
          ))
        )}
      </div>
    </div>
  );
}
