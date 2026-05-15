import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiDocumentArrowDown, HiUserGroup, HiClipboardDocumentCheck, HiCake, HiStar } from 'react-icons/hi2';
import { getAllEvents } from '../services/eventService';
import { exportUsers, exportAttendance, exportMeals, exportFeedback, downloadBlob } from '../services/exportService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ExportPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getAllEvents();
      setEvents(res.data.events);
      if (res.data.events.length > 0) {
        setSelectedEvent(res.data.events[0].id.toString());
      }
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      let res;
      let filename;
      const eid = parseInt(selectedEvent);

      switch (type) {
        case 'users':
          res = await exportUsers();
          filename = 'users_export.xlsx';
          break;
        case 'attendance':
          res = await exportAttendance(eid);
          filename = `attendance_event${eid}.xlsx`;
          break;
        case 'meals':
          res = await exportMeals(eid);
          filename = `meals_event${eid}.xlsx`;
          break;
        case 'feedback':
          res = await exportFeedback(eid);
          filename = `feedback_event${eid}.xlsx`;
          break;
        default:
          return;
      }

      downloadBlob(res, filename);
      toast.success(`${type} exported successfully!`);
    } catch {
      toast.error(`Failed to export ${type}`);
    } finally {
      setExporting('');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  const exports = [
    { type: 'users', label: 'Users', desc: 'Export all registered users with details', icon: HiUserGroup, color: 'primary', global: true },
    { type: 'attendance', label: 'Attendance', desc: 'Export attendance records for selected event', icon: HiClipboardDocumentCheck, color: 'green' },
    { type: 'meals', label: 'Meals', desc: 'Export meal tracking data for selected event', icon: HiCake, color: 'orange' },
    { type: 'feedback', label: 'Feedback', desc: 'Export feedback and ratings for selected event', icon: HiStar, color: 'cyan' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-white mb-2">Export Data</h1>
      <p className="text-gray-400 mb-8">Download Excel reports for analysis</p>

      {/* Event Selector */}
      <div className="glass-card p-6 mb-8">
        <label className="text-sm text-gray-400 mb-2 block">Select Event (for event-specific exports)</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="input-field"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id} className="bg-dark-900">{ev.title}</option>
          ))}
        </select>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exports.map((exp) => (
          <motion.div
            key={exp.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <exp.icon className="w-6 h-6 text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{exp.label}</h3>
                <p className="text-sm text-gray-400 mt-1 mb-4">{exp.desc}</p>
                <button
                  onClick={() => handleExport(exp.type)}
                  disabled={exporting === exp.type}
                  className="btn-primary text-sm !py-2 !px-4 flex items-center gap-2"
                >
                  {exporting === exp.type ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <HiDocumentArrowDown className="w-4 h-4" />
                  )}
                  Export to Excel
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
