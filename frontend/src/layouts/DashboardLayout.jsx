import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiHome, HiCalendar, HiQrCode, HiChartBar, HiCog, HiArrowRightOnRectangle, HiUserGroup, HiDocumentArrowDown, HiShieldExclamation } from 'react-icons/hi2';
import NotificationBell from '../components/NotificationBell';

export default function DashboardLayout() {
  const { user, userType, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userLinks = [
    { to: '/dashboard', icon: HiHome, label: 'Dashboard' },
  ];

  const adminLinks = [
    { to: '/admin', icon: HiHome, label: 'Dashboard' },
    { to: '/admin/events/create', icon: HiCalendar, label: 'Create Event' },
    { to: '/admin/export', icon: HiDocumentArrowDown, label: 'Export Data' },
  ];

  const links = isAdmin() ? adminLinks : userLinks;

  return (
    <div className="min-h-screen flex relative">
      <div className="bg-particles" />

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-64 fixed left-0 top-0 h-full glass-strong z-30 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-display font-bold gradient-text">EventZen QR</h1>
          <p className="text-xs text-gray-400 mt-1">{isAdmin() ? 'Admin Panel' : 'User Panel'}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-500/30 flex items-center justify-center text-primary-300 font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <HiArrowRightOnRectangle className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass-strong px-8 py-4 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-primary-500/30 flex items-center justify-center text-primary-300 text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
