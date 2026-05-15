import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'framer-motion';

export default function QRScanner({ onScan, scanning = true }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        rememberLastUsedCamera: true,
        aspectRatio: 1,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        // Play success sound
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          oscillator.connect(gain);
          gain.connect(audioCtx.destination);
          oscillator.frequency.value = 800;
          gain.gain.value = 0.3;
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.15);
        } catch (e) { /* ignore audio errors */ }

        onScan(decodedText);
      },
      (errorMessage) => {
        // Ignore scan errors (expected when no QR in frame)
      }
    );

    scannerRef.current = scanner;

    return () => {
      try {
        scanner.clear();
      } catch (e) { /* ignore cleanup errors */ }
    };
  }, [scanning]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card p-4 rounded-2xl overflow-hidden">
        <div id="qr-reader" className="rounded-xl overflow-hidden" />
        {error && (
          <p className="text-red-400 text-sm text-center mt-2">{error}</p>
        )}
      </div>
    </motion.div>
  );
}
