import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, label, value, color = 'primary', trend }) {
  const colors = {
    primary: 'from-primary-500/20 to-primary-600/10 border-primary-500/20 text-primary-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20 text-cyan-400',
    pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/20 text-pink-400',
    green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20 text-orange-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 bg-gradient-to-br ${colors[color]}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${colors[color].split(' ').pop()}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </motion.div>
  );
}
