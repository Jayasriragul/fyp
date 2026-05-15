import QRCodeSVG from 'react-qr-code';
import { motion } from 'framer-motion';

export default function QRDisplay({ value, title, subtitle, size = 200 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="p-6 bg-white rounded-2xl shadow-2xl shadow-primary-500/20">
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          fgColor="#6C3CE1"
          bgColor="#FFFFFF"
        />
      </div>
      {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </motion.div>
  );
}
