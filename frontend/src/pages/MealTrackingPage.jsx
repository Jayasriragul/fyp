import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCake, HiSun, HiMoon } from 'react-icons/hi2';
import { getEventMeals, getMealStats } from '../services/attendanceService';
import { getEvent } from '../services/eventService';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MealTrackingPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({ meal_type: '', day: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [eventId, filter]);

  const fetchData = async () => {
    try {
      const [eventRes, mealRes, statsRes] = await Promise.all([
        getEvent(eventId),
        getEventMeals(eventId, filter.day || undefined, filter.meal_type || undefined),
        getMealStats(eventId),
      ]);
      setEvent(eventRes.data.event);
      setRecords(mealRes.data.meals);
      setStats(statsRes.data);
    } catch {
      toast.error('Failed to load meal data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-white mb-2">Meal Tracking</h1>
      <p className="text-gray-400 mb-6">{event?.title} — Day {stats?.current_day}</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard icon={HiSun} label="Breakfast" value={`${stats?.breakfast || 0} / ${stats?.total_registered || 0}`} color="orange" />
        <StatsCard icon={HiCake} label="Lunch" value={`${stats?.lunch || 0} / ${stats?.total_registered || 0}`} color="cyan" />
        <StatsCard icon={HiMoon} label="Dinner" value={`${stats?.dinner || 0} / ${stats?.total_registered || 0}`} color="primary" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter({ ...filter, meal_type: '' })}
          className={`px-4 py-2 rounded-lg text-sm ${!filter.meal_type ? 'bg-primary-500 text-white' : 'glass text-gray-400'}`}
        >
          All Meals
        </button>
        {['breakfast', 'lunch', 'dinner'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter({ ...filter, meal_type: type })}
            className={`px-4 py-2 rounded-lg text-sm capitalize ${filter.meal_type === type ? 'bg-primary-500 text-white' : 'glass text-gray-400'}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Records */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Meal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Scanned At</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Day</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No meal records</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{r.user?.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400 capitalize">
                        {r.meal_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{new Date(r.scanned_at).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">Day {r.day_number}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
