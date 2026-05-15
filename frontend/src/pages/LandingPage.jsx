import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiQrCode, HiShieldCheck, HiChartBar, HiBolt, HiUserGroup, HiDevicePhoneMobile } from 'react-icons/hi2';

const features = [
  { icon: HiQrCode, title: 'Smart QR Codes', desc: 'Unique QR per attendee with daily reset and expiry management', color: 'text-primary-400' },
  { icon: HiShieldCheck, title: 'AI Security', desc: 'Duplicate detection, rapid scan alerts, and fraud prevention', color: 'text-emerald-400' },
  { icon: HiChartBar, title: 'Live Analytics', desc: 'Real-time dashboards with attendance and meal tracking', color: 'text-cyan-400' },
  { icon: HiBolt, title: 'Instant Check-in', desc: 'Webcam & mobile scanning with instant verification', color: 'text-orange-400' },
  { icon: HiUserGroup, title: 'Meal Tracking', desc: 'Breakfast, lunch, dinner tracking with duplicate prevention', color: 'text-pink-400' },
  { icon: HiDevicePhoneMobile, title: 'Multi-Device', desc: 'Works on desktop, tablet, and mobile browsers', color: 'text-violet-400' },
];

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-300">AI-Powered Event Management</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-black mb-6 leading-tight">
              <span className="gradient-text">EventZen</span>{' '}
              <span className="text-white">QR</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              AI-driven QR event management with real-time check-in, meal tracking, fraud detection, and beautiful analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg !px-8 !py-4">
                Get Started Free
              </Link>
              <Link to="/login" className="btn-secondary text-lg !px-8 !py-4">
                Admin Login
              </Link>
            </div>
          </motion.div>

          {/* Floating QR illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 flex justify-center"
          >
            <div className="relative animate-float">
              <div className="w-48 h-48 glass-strong rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/20">
                <HiQrCode className="w-24 h-24 text-primary-400" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                <HiShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Comprehensive event management with cutting-edge AI security and real-time analytics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8"
              >
                <feat.icon className={`w-10 h-10 ${feat.color} mb-4`} />
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Ready to Manage Your Events?
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Join thousands of organizers who use EventZen QR for seamless event management.
              </p>
              <Link to="/register" className="btn-primary text-lg !px-10 !py-4">
                Start Now — It's Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
