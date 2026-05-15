import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiQrCode } from 'react-icons/hi2';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass-strong"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <HiQrCode className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-display font-bold gradient-text">EventZen QR</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to={isAdmin() ? '/admin' : '/dashboard'}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <button onClick={logout} className="btn-secondary text-sm !py-2 !px-4">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm !py-2 !px-4">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
