import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getEventAnalytics } from '../services/feedbackService';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiUserGroup, HiCheckCircle, HiShieldExclamation, HiStar, HiCake, HiGift } from 'react-icons/hi2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#9ca3af', font: { family: 'Inter' } } },
  },
  scales: {
    x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.05)' } },
  },
};

export default function AnalyticsPage() {
  const { eventId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      const res = await getEventAnalytics(eventId);
      setData(res.data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  if (!data) return <div className="text-center py-16 text-gray-500">No data available</div>;

  // Daily attendance chart
  const attendanceChart = {
    labels: data.daily_attendance.map((d) => `Day ${d.day}`),
    datasets: [{
      label: 'Attendance',
      data: data.daily_attendance.map((d) => d.count),
      backgroundColor: 'rgba(108, 60, 225, 0.6)',
      borderColor: '#6c3ce1',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  // Meal distribution doughnut
  const mealByType = {};
  data.meal_stats.forEach((m) => {
    mealByType[m.type] = (mealByType[m.type] || 0) + m.count;
  });
  const mealChart = {
    labels: Object.keys(mealByType).map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
    datasets: [{
      data: Object.values(mealByType),
      backgroundColor: ['#ff9100', '#00d4ff', '#6c3ce1'],
      borderWidth: 0,
    }],
  };

  // Sentiment doughnut
  const sentimentChart = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      data: [data.feedback.sentiments.positive, data.feedback.sentiments.neutral, data.feedback.sentiments.negative],
      backgroundColor: ['#00e676', '#ff9100', '#ff2d7b'],
      borderWidth: 0,
    }],
  };

  // Fraud by type
  const fraudChart = {
    labels: Object.keys(data.fraud.by_type).map((t) => t.replace(/_/g, ' ')),
    datasets: [{
      label: 'Incidents',
      data: Object.values(data.fraud.by_type),
      backgroundColor: 'rgba(255, 45, 123, 0.6)',
      borderColor: '#ff2d7b',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-white mb-2">Analytics</h1>
      <p className="text-gray-400 mb-8">{data.event?.title}</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={HiUserGroup} label="Registered" value={data.registrations} color="primary" />
        <StatsCard icon={HiCheckCircle} label="Attended" value={data.attended} color="green" />
        <StatsCard icon={HiStar} label="Avg Rating" value={data.feedback.average_rating || 'N/A'} color="orange" />
        <StatsCard icon={HiShieldExclamation} label="Fraud Incidents" value={data.fraud.total} color="pink" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatsCard icon={HiGift} label="Kits Issued" value={`${data.welcome_kits.issued} / ${data.welcome_kits.total}`} color="cyan" />
        <StatsCard icon={HiCake} label="Total Meals Served" value={Object.values(mealByType).reduce((a, b) => a + b, 0)} color="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Daily Attendance</h3>
          <div className="h-64">
            {data.daily_attendance.length > 0 ? (
              <Bar data={attendanceChart} options={chartOptions} />
            ) : (
              <p className="text-gray-500 text-center pt-24">No attendance data yet</p>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Meal Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {Object.keys(mealByType).length > 0 ? (
              <Doughnut data={mealChart} options={{ ...chartOptions, scales: undefined }} />
            ) : (
              <p className="text-gray-500">No meal data yet</p>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Feedback Sentiment</h3>
          <div className="h-64 flex items-center justify-center">
            {data.feedback.total > 0 ? (
              <Doughnut data={sentimentChart} options={{ ...chartOptions, scales: undefined }} />
            ) : (
              <p className="text-gray-500">No feedback yet</p>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Fraud Detection</h3>
          <div className="h-64">
            {data.fraud.total > 0 ? (
              <Bar data={fraudChart} options={chartOptions} />
            ) : (
              <p className="text-gray-500 text-center pt-24">No fraud incidents 🎉</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
