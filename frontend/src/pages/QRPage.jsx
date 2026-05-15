import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiQrCode, HiArrowDownTray, HiArrowPath } from 'react-icons/hi2';
import { getMyQR } from '../services/qrService';
import { downloadBadge, downloadEntryPass, downloadCertificate, downloadBlob } from '../services/exportService';
import QRDisplay from '../components/QRDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function QRPage() {
  const { eventId } = useParams();
  const [qrData, setQrData] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQR();
  }, [eventId]);

  const fetchQR = async () => {
    try {
      const res = await getMyQR(eventId);
      setQrData(res.data.qr_code);
      setQrImage(res.data.qr_image);
      setUserData(res.data.user);
      setEventData(res.data.event);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type) => {
    try {
      let res;
      const regId = qrData?.registration_id;
      if (!regId) return toast.error('Registration not found');

      if (type === 'badge') {
        res = await downloadBadge(regId);
        downloadBlob(res, 'event_badge.pdf');
      } else if (type === 'pass') {
        res = await downloadEntryPass(regId);
        downloadBlob(res, 'entry_pass.pdf');
      } else {
        res = await downloadCertificate(regId);
        downloadBlob(res, 'certificate.pdf');
      }
      toast.success('Download started!');
    } catch {
      toast.error('Download failed');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  if (!qrData) {
    return (
      <div className="text-center py-16">
        <HiQrCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500">QR code not available. Please register for this event first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Your QR Code</h1>
          <p className="text-gray-400">{eventData?.title}</p>
        </div>

        {/* QR Card */}
        <div className="glass-card p-8 text-center mb-8">
          <QRDisplay
            value={qrData.qr_data}
            title={userData?.name}
            subtitle={userData?.email}
            size={250}
          />

          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              qrData.is_active && !qrData.is_expired
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {qrData.is_active && !qrData.is_expired ? '● Active' : '● Inactive'}
            </span>
            <span className="text-xs text-gray-500">
              Expires: {new Date(qrData.expires_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => handleDownload('badge')} className="btn-primary flex items-center justify-center gap-2">
            <HiArrowDownTray className="w-4 h-4" />
            Event Badge
          </button>
          <button onClick={() => handleDownload('pass')} className="btn-secondary flex items-center justify-center gap-2">
            <HiArrowDownTray className="w-4 h-4" />
            Entry Pass
          </button>
          <button onClick={() => handleDownload('cert')} className="btn-secondary flex items-center justify-center gap-2">
            <HiArrowDownTray className="w-4 h-4" />
            Certificate
          </button>
        </div>
      </motion.div>
    </div>
  );
}
