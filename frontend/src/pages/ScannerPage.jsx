import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiQrCode, HiCheckCircle, HiXCircle, HiShieldExclamation } from 'react-icons/hi2';
import { scanEntry } from '../services/attendanceService';
import { scanMeal, scanWelcomeKit } from '../services/attendanceService';
import { getEvent } from '../services/eventService';
import { connectSocket, joinEventRoom, emitScanUpdate, emitFraudAlert } from '../services/socketService';
import QRScanner from '../components/QRScanner';
import toast from 'react-hot-toast';

export default function ScannerPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [scanMode, setScanMode] = useState('entry'); // entry, meal, kit
  const [mealType, setMealType] = useState('breakfast');
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchEvent();
    const socket = connectSocket();
    joinEventRoom(eventId);
    return () => {};
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await getEvent(eventId);
      setEvent(res.data.event);
    } catch { toast.error('Event not found'); }
  };

  const handleScan = useCallback(async (qr_data) => {
    setScanning(false);
    try {
      let res;
      if (scanMode === 'entry') {
        res = await scanEntry({ qr_data, event_id: parseInt(eventId) });
      } else if (scanMode === 'meal') {
        res = await scanMeal({ qr_data, event_id: parseInt(eventId), meal_type: mealType });
      } else {
        res = await scanWelcomeKit({ qr_data, event_id: parseInt(eventId) });
      }

      const data = res.data;
      setResult(data);

      // Add to logs
      setLogs((prev) => [{
        id: Date.now(),
        success: data.success,
        message: data.message,
        time: new Date().toLocaleTimeString(),
        user: data.user?.name || 'Unknown',
      }, ...prev].slice(0, 50));

      // Emit socket event
      if (data.success) {
        emitScanUpdate({ event_id: eventId, ...data });
      } else {
        emitFraudAlert({ event_id: eventId, message: data.message, qr_data });
      }

      // Play sound
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = data.success ? 800 : 300;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(audioCtx.currentTime + (data.success ? 0.15 : 0.4));

    } catch (err) {
      setResult({ success: false, message: 'Scan error' });
    }

    // Resume scanning after delay
    setTimeout(() => {
      setResult(null);
      setScanning(true);
    }, 3000);
  }, [scanMode, mealType, eventId]);

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-white mb-2">QR Scanner</h1>
      <p className="text-gray-400 mb-6">{event?.title || 'Loading...'}</p>

      {/* Scan Mode Toggle */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['entry', 'meal', 'kit'].map((mode) => (
          <button
            key={mode}
            onClick={() => { setScanMode(mode); setResult(null); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
              scanMode === mode ? 'bg-primary-500 text-white' : 'glass text-gray-400 hover:text-white'
            }`}
          >
            {mode === 'kit' ? 'Welcome Kit' : mode}
          </button>
        ))}
      </div>

      {/* Meal type selector */}
      {scanMode === 'meal' && (
        <div className="flex gap-2 mb-6">
          {['breakfast', 'lunch', 'dinner'].map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                mealType === type ? 'bg-cyan-500 text-white' : 'glass text-gray-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner */}
        <div>
          <QRScanner onScan={handleScan} scanning={scanning} />

          {/* Result popup */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`mt-6 p-6 rounded-2xl text-center ${
                  result.success ? 'scan-success bg-emerald-500/10 border border-emerald-500/30' : 'scan-denied bg-red-500/10 border border-red-500/30'
                }`}
              >
                {result.success ? (
                  <HiCheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
                ) : (
                  <HiXCircle className="w-16 h-16 text-red-400 mx-auto mb-3" />
                )}
                <h3 className={`text-xl font-bold ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.success ? 'ALLOWED' : 'DENIED'}
                </h3>
                <p className="text-gray-400 mt-1">{result.message}</p>
                {result.user && (
                  <p className="text-white font-medium mt-2">{result.user.name}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scan Logs */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <HiQrCode className="w-5 h-5 text-primary-400" />
            Scan Log
          </h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No scans yet. Point camera at a QR code.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className={`p-3 rounded-xl border ${
                  log.success ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {log.success ? (
                        <HiCheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <HiXCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm font-medium text-white">{log.user}</span>
                    </div>
                    <span className="text-xs text-gray-500">{log.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
