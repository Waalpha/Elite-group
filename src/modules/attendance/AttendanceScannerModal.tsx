import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  Volume2,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  Users,
  Clock,
  RefreshCw,
  Upload,
  Search,
} from 'lucide-react';
import { Student, AttendanceRecord } from '../../types';
import { recordBulkAttendance } from '../../services/firebaseService';
import { useSettings } from '../../contexts/SettingsContext';

interface AttendanceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onAttendanceRecorded?: (record: AttendanceRecord) => void;
}

export const AttendanceScannerModal: React.FC<AttendanceScannerModalProps> = ({
  isOpen,
  onClose,
  students,
  onAttendanceRecorded,
}) => {
  const { settings } = useSettings();
  const schoolName = settings?.schoolName || 'Uwezo Elite';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedStudent, setLastScannedStudent] = useState<Student | null>(null);
  const [recentScans, setRecentScans] = useState<
    { student: Student; time: string; status: 'SUCCESS' | 'ALREADY_RECORDED' }[]
  >([]);
  const [simulatedAdmInput, setSimulatedAdmInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play auditory chime
  const playChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      console.warn('AudioContext error:', e);
    }
  };

  // Speak Welcome audio using Web Speech API
  const speakWelcomeAudio = (firstName: string) => {
    if (!soundEnabled) return;
    playChime();

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // cancel previous speech
        const text = `Welcome to ${schoolName}, ${firstName}!`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const engVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Karen') ||
              v.name.includes('Female'))
        );
        if (engVoice) utterance.voice = engVoice;

        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // Process a scanned raw string (e.g. "UES-2025-0101" or JSON)
  const handleProcessScan = async (rawData: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const clean = rawData.trim();
    // Search student by admission number, nemis upi, id, or phone
    const matched = students.find((s) => {
      if (s.admissionNumber && s.admissionNumber.toLowerCase() === clean.toLowerCase()) return true;
      if (s.id && s.id.toLowerCase() === clean.toLowerCase()) return true;
      if (s.nemisUpi && s.nemisUpi.toLowerCase() === clean.toLowerCase()) return true;
      if (clean.includes(s.admissionNumber)) return true;
      return false;
    });

    if (!matched) {
      setIsProcessing(false);
      return;
    }

    // Check if already in recent scans within current minute
    const already = recentScans.some((r) => r.student.id === matched.id);

    try {
      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Save to Firebase
      const record: Omit<AttendanceRecord, 'id' | 'createdAt'> = {
        studentId: matched.id,
        studentName: `${matched.firstName} ${matched.lastName}`,
        admissionNumber: matched.admissionNumber,
        grade: matched.grade,
        stream: matched.stream,
        date: today,
        status: 'PRESENT',
        remarks: `QR Biometric Kiosk Scan (${nowTime})`,
        recordedBy: 'Biometric QR Kiosk',
      };

      await recordBulkAttendance([record]);

      setLastScannedStudent(matched);
      setRecentScans((prev) => [
        {
          student: matched,
          time: nowTime,
          status: already ? 'ALREADY_RECORDED' : 'SUCCESS',
        },
        ...prev.slice(0, 19),
      ]);

      // Speak Welcome
      speakWelcomeAudio(matched.firstName);

      if (onAttendanceRecorded) {
        onAttendanceRecorded(record as AttendanceRecord);
      }
    } catch (err) {
      console.error('Error saving QR attendance:', err);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000); // 2 second debounce before next scan
    }
  };

  // Camera start / stop lifecycle
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not supported in this browser environment.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        scanFrame();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        'Camera permission was denied or is unavailable in iframe preview. You can use the Quick Scan simulator or upload an ID card below!'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      try {
        const code = (jsQR as any)(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleProcessScan(code.data);
        }
      } catch (e) {
        // ignore scan exceptions
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  // Image Upload Scanner
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = (jsQR as any)(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            handleProcessScan(code.data);
          } else {
            alert('No readable QR code found in the uploaded image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-serif tracking-tight flex items-center gap-2">
                Smart QR Attendance Kiosk
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  VOICE ENABLED
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Scan student ID badges or barcodes to instantly record daily roll call with personalized voice greetings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) speakWelcomeAudio('Learner');
              }}
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">{soundEnabled ? 'Voice Active' : 'Muted'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Camera Viewfinder & Scanner */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-2xl bg-black border-2 border-slate-800 aspect-4/3 overflow-hidden flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                autoPlay
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Crosshair Overlay */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                  <div className="w-56 h-56 border-2 border-emerald-400 rounded-2xl relative animate-pulse">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1" />
                    <div className="w-full h-0.5 bg-linear-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce" />
                  </div>
                </div>
              )}

              {/* Camera Offline / Notice */}
              {!cameraActive && (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">Camera Viewfinder</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      {cameraError || 'Allow camera permission in browser or use the quick scan simulator below.'}
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Start Web Camera
                  </button>
                </div>
              )}
            </div>

            {/* Quick Simulation & Badge Tap Bar */}
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Simulate QR Scanner / Badge Tap
                </span>
                <label className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1 text-[11px]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Scan QR Image</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              {/* Quick Select Student */}
              <div className="flex gap-2">
                <select
                  value={simulatedAdmInput}
                  onChange={(e) => {
                    setSimulatedAdmInput(e.target.value);
                    if (e.target.value) handleProcessScan(e.target.value);
                  }}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Tap / Select Student Badge to Simulate Scan --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.admissionNumber}>
                      {st.admissionNumber} — {st.firstName} {st.lastName} ({(st.grade || '').replace('_', ' ')})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    const sample = students[Math.floor(Math.random() * students.length)];
                    if (sample) handleProcessScan(sample.admissionNumber);
                  }}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer whitespace-nowrap"
                >
                  Random Tap
                </button>
              </div>

              {/* Test voice utterance */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span>Voice phrase: "Welcome to {schoolName}, [First Name]!"</span>
                <button
                  type="button"
                  onClick={() => speakWelcomeAudio('Ethan')}
                  className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Test Voice Now 🔊
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Verified Scan & Live Session Log */}
          <div className="lg:col-span-5 space-y-4 flex flex-col">
            {/* Active greeting banner */}
            {lastScannedStudent ? (
              <div className="bg-linear-to-br from-emerald-950 to-slate-900 p-4 rounded-2xl border-2 border-emerald-500/50 shadow-lg space-y-3 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    ATTENDANCE RECORDED
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">Just Now</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-400/80 shrink-0">
                    <img
                      src={
                        lastScannedStudent.photoUrl ||
                        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=60'
                      }
                      alt={lastScannedStudent.firstName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-base text-white">
                      {lastScannedStudent.firstName} {lastScannedStudent.lastName}
                    </h3>
                    <p className="text-xs text-amber-300 font-mono font-bold">
                      {lastScannedStudent.admissionNumber}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {(lastScannedStudent.grade || '').replace('_', ' ')} • Stream {lastScannedStudent.stream}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/30 text-emerald-200 text-xs font-serif italic text-center">
                  "Welcome to {schoolName}, {lastScannedStudent.firstName}!"
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                <QrCode className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Awaiting QR Scan</h4>
                <p className="text-xs text-slate-500">
                  Hold a student ID badge in front of the camera or click a sample student badge to begin roll call.
                </p>
              </div>
            )}

            {/* Live session log */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-800 p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Kiosk Session Scans ({recentScans.length})
                </h4>
                {recentScans.length > 0 && (
                  <button
                    onClick={() => setRecentScans([])}
                    className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Clear Log
                  </button>
                )}
              </div>

              <div className="space-y-2 overflow-y-auto max-h-64 flex-1 pr-1">
                {recentScans.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-200">
                        {item.student.firstName} {item.student.lastName}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.student.admissionNumber} • {(item.student.grade || '').replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-emerald-400 block">{item.time}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 font-bold">
                        PRESENT
                      </span>
                    </div>
                  </div>
                ))}

                {recentScans.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No learners scanned yet during this session.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>Synced with Firebase Firestore & Uwezo Elite Database</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
          >
            Done Scanning
          </button>
        </div>
      </div>
    </div>
  );
};
