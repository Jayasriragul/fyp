import { useState, useEffect } from 'react';
import { getNotifications, markNotifRead, markAllRead } from '../services/feedbackService';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBell, HiXMark } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user && !isAdmin()) fetchNotifs();
  }, [user]);

  const fetchNotifs = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications);
      setUnread(res.data.unread_count);
    } catch (e) {
      /* ignore */
    }
  };

  const handleRead = async (id) => {
    await markNotifRead(id);
    fetchNotifs();
  };

  const handleReadAll = async () => {
    await markAllRead();
    fetchNotifs();
  };

  if (isAdmin()) return null;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 hover:bg-white/5 rounded-xl transition-colors">
        <HiBell className="w-5 h-5 text-gray-400" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-pink text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 glass-strong rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={handleReadAll} className="text-xs text-primary-400 hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)}>
                  <HiXMark className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && handleRead(n.id)}
                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                      !n.is_read ? 'bg-primary-500/5' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.message}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
