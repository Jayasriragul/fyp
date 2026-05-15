import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiQrCode, HiEnvelope, HiLockClosed, HiShieldCheck } from 'react-icons/hi2';
import { loginUser, loginAdmin } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = isAdmin
        ? await loginAdmin({ email, password })
        : await loginUser({ email, password });

      const data = res.data;
      const userData = data.user || data.admin;
      const type = isAdmin ? 'admin' : userData.role || 'user';

      login(data.token, userData, type);
      toast.success(data.message);
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500 flex items-center justify-center">
              <HiQrCode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Welcome Back</h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to EventZen QR</p>
          </div>

          {/* Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsAdmin(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                !isAdmin ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              User Login
            </button>
            <button
              onClick={() => setIsAdmin(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                isAdmin ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Admin Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email</label>
              <div className="relative">
                <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="input-field !pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field !pl-11"
                  required
                />
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-primary-400 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <HiShieldCheck className="w-5 h-5" />
                  {isAdmin ? 'Admin Sign In' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          {!isAdmin && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:underline font-medium">
                Register
              </Link>
            </p>
          )}

          {isAdmin && (
            <div className="mt-4 p-3 bg-primary-500/10 rounded-xl border border-primary-500/20">
              <p className="text-xs text-primary-300 text-center">
                Default: admin@eventzenqr.com / admin123
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
