import { HiQrCode } from 'react-icons/hi2';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HiQrCode className="w-5 h-5 text-primary-400" />
            <span className="font-display font-semibold gradient-text">EventZen QR</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} EventZen QR. AI Driven Event Management.
          </p>
        </div>
      </div>
    </footer>
  );
}
