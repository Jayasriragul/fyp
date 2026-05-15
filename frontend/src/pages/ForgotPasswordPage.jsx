import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiEnvelope, HiLockClosed, HiQrCode } from 'react-icons/hi2';
import { forgotPassword } from '../services/authService';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword({ email, new_password: newPassword });
      toast.success('Password reset successful!');
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed');
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500 flex items-center justify-center">
              <HiQrCode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Reset Password</h1>
            <p className="text-gray-400 text-sm mt-1">Enter your email and new password</p>
          </div>

          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
              <p className="text-white mb-4">Password reset successful!</p>
              <Link to="/login" className="btn-primary">
                Go to Login
              </Link>
            </div>
          ) : (
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
                <label className="text-sm text-gray-400 mb-1 block">New Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field !pl-11"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  'Reset Password'
                )}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-primary-400 hover:underline">Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
