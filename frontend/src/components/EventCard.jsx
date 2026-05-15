import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiCalendar, HiMapPin, HiUserGroup } from 'react-icons/hi2';

export default function EventCard({ event, showRegister, onRegister, registered, isAdmin }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass-card overflow-hidden group"
    >
      {/* Banner */}
      <div className="h-40 bg-gradient-to-br from-primary-600/40 to-dark-800 relative overflow-hidden">
        {event.banner_url ? (
          <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiCalendar className="w-16 h-16 text-primary-400/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent" />
        {event.is_active && (
          <span className="absolute top-3 right-3 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30">
            Active
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <HiCalendar className="w-4 h-4 text-primary-400" />
            <span>{event.start_date} — {event.end_date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <HiMapPin className="w-4 h-4 text-cyan-400" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <HiUserGroup className="w-4 h-4 text-pink-400" />
            <span>{event.registration_count || 0} registered</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <Link to={`/admin/scanner/${event.id}`} className="btn-primary text-xs !py-2 !px-3 flex-1 text-center">
                Scanner
              </Link>
              <Link to={`/admin/analytics/${event.id}`} className="btn-secondary text-xs !py-2 !px-3 flex-1 text-center">
                Analytics
              </Link>
            </>
          ) : registered ? (
            <>
              <Link to={`/qr/${event.id}`} className="btn-primary text-xs !py-2 !px-3 flex-1 text-center">
                View QR
              </Link>
              <Link to={`/events/${event.id}`} className="btn-secondary text-xs !py-2 !px-3 flex-1 text-center">
                Details
              </Link>
            </>
          ) : showRegister ? (
            <button onClick={() => onRegister(event.id)} className="btn-primary text-xs !py-2 !px-3 w-full">
              Register Now
            </button>
          ) : (
            <Link to={`/events/${event.id}`} className="btn-secondary text-xs !py-2 !px-3 w-full text-center">
              View Details
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
