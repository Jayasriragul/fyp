import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiQrCode, HiUser, HiEnvelope, HiLockClosed, HiPhone } from 'react-icons/hi2';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      login(res.data.token, res.data.user, res.data.user.role || 'user');
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: HiUser, placeholder: 'John Doe' },
    { name: 'email', label: 'Email', type: 'email', icon: HiEnvelope, placeholder: 'you@email.com' },
    { name: 'phone', label: 'Phone (optional)', type: 'tel', icon: HiPhone, placeholder: '+91 9876543210', required: false },
    { name: 'password', label: 'Password', type: 'password', icon: HiLockClosed, placeholder: '••••••••' },
    { name: 'confirm', label: 'Confirm Password', type: 'password', icon: HiLockClosed, placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
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
            <h1 className="text-2xl font-display font-bold text-white">Create Account</h1>
            <p className="text-gray-400 text-sm mt-1">Join EventZen QR today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="text-sm text-gray-400 mb-1 block">{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    className="input-field !pl-11"
                    required={f.required !== false}
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
