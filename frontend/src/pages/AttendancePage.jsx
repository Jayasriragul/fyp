import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUserGroup, HiCheckCircle, HiClock } from 'react-icons/hi2';
import { getEventAttendance, getAttendanceStats } from '../services/attendanceService';
import { getEvent } from '../services/eventService';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [eventId, selectedDay]);

  const fetchData = async () => {
    try {
      const [eventRes, attRes, statsRes] = await Promise.all([
        getEvent(eventId),
        getEventAttendance(eventId, selectedDay),
        getAttendanceStats(eventId),
      ]);
      setEvent(eventRes.data.event);
      setRecords(attRes.data.attendance);
      setStats(statsRes.data);
    } catch {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  const totalDays = event?.total_days || 1;

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-white mb-2">Attendance</h1>
      <p className="text-gray-400 mb-6">{event?.title}</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={HiUserGroup} label="Total Registered" value={stats?.total_registered || 0} color="primary" />
        <StatsCard icon={HiCheckCircle} label="Total Attended" value={stats?.total_attended || 0} color="green" />
        <StatsCard icon={HiClock} label="Today's Check-ins" value={stats?.today_attendance || 0} color="cyan" />
        <StatsCard icon={HiClock} label={`Day ${stats?.current_day} / ${stats?.total_days}`} value={`Day ${stats?.current_day}`} color="orange" />
      </div>

      {/* Day Filter */}
      {totalDays > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedDay(null)}
            className={`px-4 py-2 rounded-lg text-sm ${!selectedDay ? 'bg-primary-500 text-white' : 'glass text-gray-400'}`}
          >
            All Days
          </button>
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg text-sm ${selectedDay === day ? 'bg-primary-500 text-white' : 'glass text-gray-400'}`}
            >
              Day {day}
            </button>
          ))}
        </div>
      )}

      {/* Records Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Check In</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Day</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No attendance records</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{r.user?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{r.user?.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{new Date(r.check_in_time).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.scan_type === 'entry' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {r.scan_type}
                      </span>
                    </td>
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
