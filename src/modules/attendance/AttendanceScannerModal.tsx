import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  Volume2,
  VolumeX,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  Users,
  Clock,
  RefreshCw,
  Upload,
  Search,
  Sliders,
  Flashlight,
  SwitchCamera,
  Play,
  Printer,
  Check,
  Send,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus } from '../../types';
import { recordBulkAttendance } from '../../services/firebaseService';
import { useSettings } from '../../contexts/SettingsContext';

interface AttendanceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onAttendanceRecorded?: (record: AttendanceRecord) => void;
}

type GreetingStyle = 'time_aware' | 'enthusiastic' | 'swahili' | 'concise';

export const AttendanceScannerModal: React.FC<AttendanceScannerModalProps> = ({
  isOpen,
  onClose,
  students,
  onAttendanceRecorded,
}) => {
  const { settings } = useSettings();
  const schoolName = settings?.schoolName || 'Uwezo Elite School';

  // Video & Canvas Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const currentStreamRef = useRef<MediaStream | null>(null);

  // Active View Tabs
  const [activeTab, setActiveTab] = useState<'scanner' | 'badges' | 'settings'>('scanner');

  // Camera & Device State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);

  // Voice & Audio Customization State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [greetingStyle, setGreetingStyle] = useState<GreetingStyle>('time_aware');
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [speechPitch, setSpeechPitch] = useState<number>(1.05);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  // Scanning & Detection State
  const [lastScannedStudent, setLastScannedStudent] = useState<Student | null>(null);
  const [lastSpokenGreeting, setLastSpokenGreeting] = useState<string>('');
  const [lastScannedTime, setLastScannedTime] = useState<string>('');
  const [recentScans, setRecentScans] = useState<
    { student: Student; time: string; status: 'SUCCESS' | 'ALREADY_RECORDED'; attendanceStatus: AttendanceStatus }[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanCooldownStudentId, setScanCooldownStudentId] = useState<string | null>(null);

  // Badge Generator Filter & Search
  const [badgeSearch, setBadgeSearch] = useState('');
  const [badgeGradeFilter, setBadgeGradeFilter] = useState('ALL');
  const [simulatedAdmInput, setSimulatedAdmInput] = useState('');

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && !selectedVoiceURI) {
          const naturalVoice = voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('Karen') ||
                v.name.includes('Female'))
          );
          if (naturalVoice) {
            setSelectedVoiceURI(naturalVoice.voiceURI);
          } else {
            const firstEn = voices.find((v) => v.lang.startsWith('en'));
            if (firstEn) setSelectedVoiceURI(firstEn.voiceURI);
          }
        }
      }
    };

    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Enumerate Camera Devices
  const updateCameraDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        // Prefer back / environment camera on mobile
        const backCamera = videoInputs.find(
          (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment')
        );
        setSelectedDeviceId(backCamera ? backCamera.deviceId : videoInputs[0].deviceId);
      }
    } catch (e) {
      console.warn('Error enumerating devices:', e);
    }
  };

  // Play Harmonic Melodic Chime with Web Audio API
  const playHarmonicChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // 3-note upbeat arpeggio (C5 -> E5 -> G5)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.36);
      });
    } catch (e) {
      console.warn('AudioContext error:', e);
    }
  };

  // Formulate Friendly Greeting Message based on learner's first name & time of day
  const buildGreetingMessage = (firstName: string): string => {
    const currentHour = new Date().getHours();
    const cleanName = firstName.trim();

    switch (greetingStyle) {
      case 'time_aware': {
        if (currentHour < 12) {
          return `Good morning, ${cleanName}! Welcome to ${schoolName}. Your attendance has been recorded.`;
        } else if (currentHour < 17) {
          return `Good afternoon, ${cleanName}! Welcome to ${schoolName}. Attendance recorded.`;
        } else {
          return `Good evening, ${cleanName}! Attendance logged for ${schoolName}.`;
        }
      }
      case 'enthusiastic': {
        return `Hello ${cleanName}! Great to see you today. Have a wonderful and inspired day of learning!`;
      }
      case 'swahili': {
        if (currentHour < 12) {
          return `Habari ya asubuhi, ${cleanName}! Karibu ${schoolName}. Mahudhurio yako yamerekodiwa.`;
        } else {
          return `Habari ya mchana, ${cleanName}! Karibu ${schoolName}. Mahudhurio yako yamerekodiwa vyema.`;
        }
      }
      case 'concise': {
        return `Welcome, ${cleanName}. Attendance verified.`;
      }
      default:
        return `Welcome, ${cleanName}! Attendance recorded at ${schoolName}.`;
    }
  };

  // Speak Audio Message via SpeechSynthesis
  const speakLearnerGreeting = (firstName: string) => {
    if (!soundEnabled) return;
    playHarmonicChime();

    const greetingText = buildGreetingMessage(firstName);
    setLastSpokenGreeting(greetingText);

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // cancel previous utterance

        const utterance = new SpeechSynthesisUtterance(greetingText);
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;
        utterance.volume = 1.0;

        if (selectedVoiceURI) {
          const matchedVoice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI);
          if (matchedVoice) utterance.voice = matchedVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        // Small delay so melodic chime rings first
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 150);
      }
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsSpeaking(false);
    }
  };

  // Process a Scanned QR Code Data String
  const handleProcessScan = async (rawData: string) => {
    if (isProcessing) return;

    const clean = rawData.trim();
    if (!clean) return;

    // Search student by Admission Number, ID, UPI NEMIS, or JSON payload
    let matched: Student | undefined;

    // 1. Check if JSON payload
    if (clean.startsWith('{') && clean.endsWith('}')) {
      try {
        const parsed = JSON.parse(clean);
        const adm = parsed.admissionNumber || parsed.adm || parsed.id || parsed.studentId;
        if (adm) {
          matched = students.find(
            (s) =>
              s.admissionNumber.toLowerCase() === adm.toString().toLowerCase() ||
              s.id.toLowerCase() === adm.toString().toLowerCase()
          );
        }
      } catch {
        // not JSON
      }
    }

    // 2. Direct exact / substring match
    if (!matched) {
      matched = students.find((s) => {
        if (s.admissionNumber && s.admissionNumber.toLowerCase() === clean.toLowerCase()) return true;
        if (s.id && s.id.toLowerCase() === clean.toLowerCase()) return true;
        if (s.upiNemisNo && s.upiNemisNo.toLowerCase() === clean.toLowerCase()) return true;
        if (clean.includes(s.admissionNumber)) return true;
        return false;
      });
    }

    if (!matched) {
      console.log('Unrecognized QR payload:', clean);
      return;
    }

    // Anti-duplicate cooldown: ignore if same student scanned within 4 seconds
    if (scanCooldownStudentId === matched.id) {
      return;
    }

    setIsProcessing(true);
    setScanCooldownStudentId(matched.id);

    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const nowTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Determine on-time vs late status (after 08:00 AM considered late)
      const isLateArrival = currentHour > 8 || (currentHour === 8 && currentMinute > 15);
      const computedStatus: AttendanceStatus = isLateArrival ? 'LATE' : 'PRESENT';

      const alreadyLogged = recentScans.some((r) => r.student.id === matched.id);

      // Create attendance record for Firestore
      const record: Omit<AttendanceRecord, 'id' | 'createdAt'> = {
        studentId: matched.id,
        studentName: `${matched.firstName} ${matched.lastName}`,
        admissionNumber: matched.admissionNumber,
        grade: matched.grade || matched.currentClass,
        stream: matched.stream,
        date: todayStr,
        status: computedStatus,
        remarks: `QR Biometric Kiosk Scan (${nowTimeStr}) - ${isLateArrival ? 'Late Arrival' : 'On-Time'}`,
        recordedBy: 'QR Biometric Gate Kiosk',
      };

      // Save to Firebase
      await recordBulkAttendance([record]);

      // Update local state
      setLastScannedStudent(matched);
      setLastScannedTime(nowTimeStr);
      setRecentScans((prev) => [
        {
          student: matched!,
          time: nowTimeStr,
          status: alreadyLogged ? 'ALREADY_RECORDED' : 'SUCCESS',
          attendanceStatus: computedStatus,
        },
        ...prev.slice(0, 24),
      ]);

      // Trigger Friendly Audio Greeting
      speakLearnerGreeting(matched.firstName);

      // Notify parent attendance module
      if (onAttendanceRecorded) {
        onAttendanceRecorded(record as AttendanceRecord);
      }
    } catch (err) {
      console.error('Error saving QR attendance record:', err);
    } finally {
      // Cooldown reset after 2.5s
      setTimeout(() => {
        setIsProcessing(false);
      }, 1500);

      setTimeout(() => {
        setScanCooldownStudentId(null);
      }, 4000);
    }
  };

  // Start Camera Stream
  const startCamera = async (deviceId?: string) => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not supported in this browser or iframe container.');
        return;
      }

      await updateCameraDevices();

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
        audio: false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (errFallback) {
        // Fallback to basic video constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      currentStreamRef.current = stream;

      // Check Torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && typeof (videoTrack.getCapabilities as any) === 'function') {
        const capabilities = (videoTrack.getCapabilities as any)();
        setHasTorchSupport(Boolean(capabilities?.torch));
      } else {
        setHasTorchSupport(false);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        scanFrameLoop();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        'Camera permission was denied or camera is in use by another app. You can switch cameras, upload a QR card photo, or test with the Badge Simulator below.'
      );
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach((track) => track.stop());
      currentStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  // Toggle Torch / Flashlight
  const toggleTorch = async () => {
    if (!currentStreamRef.current) return;
    const track = currentStreamRef.current.getVideoTracks()[0];
    if (track && hasTorchSupport) {
      try {
        const newTorchState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: newTorchState }],
        });
        setTorchOn(newTorchState);
      } catch (e) {
        console.warn('Torch constraint error:', e);
      }
    }
  };

  // Main QR Detection Loop
  const scanFrameLoop = () => {
    if (!videoRef.current || !canvasRef.current || !overlayCanvasRef.current) {
      animationFrameId.current = requestAnimationFrame(scanFrameLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const overlayCtx = overlay.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx && overlayCtx) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      overlay.height = video.videoHeight;
      overlay.width = video.videoWidth;

      // Draw current video frame to processing canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Clear previous overlay
      overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

      try {
        const code = (jsQR as any)(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.location) {
          // Draw Glowing Green Polygon around detected QR Code
          const loc = code.location;
          overlayCtx.beginPath();
          overlayCtx.moveTo(loc.topLeftCorner.x, loc.topLeftCorner.y);
          overlayCtx.lineTo(loc.topRightCorner.x, loc.topRightCorner.y);
          overlayCtx.lineTo(loc.bottomRightCorner.x, loc.bottomRightCorner.y);
          overlayCtx.lineTo(loc.bottomLeftCorner.x, loc.bottomLeftCorner.y);
          overlayCtx.closePath();

          overlayCtx.lineWidth = 4;
          overlayCtx.strokeStyle = '#10b981';
          overlayCtx.fillStyle = 'rgba(16, 185, 129, 0.25)';
          overlayCtx.fill();
          overlayCtx.stroke();

          // Process QR code string
          if (code.data) {
            handleProcessScan(code.data);
          }
        }
      } catch (e) {
        // ignore scan calculation exceptions
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrameLoop);
  };

  // Handle Modal Open / Close
  useEffect(() => {
    if (isOpen) {
      startCamera(selectedDeviceId);
    } else {
      stopCamera();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Handle Camera Device Change
  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedDeviceId(newId);
    startCamera(newId);
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
            alert('No readable QR code found in the uploaded image. Please ensure the QR badge is well lit and clearly visible.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Filtered Students for Badge Directory
  const filteredBadgeStudents = students.filter((s) => {
    const matchesSearch =
      badgeSearch === '' ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(badgeSearch.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(badgeSearch.toLowerCase());
    const matchesGrade =
      badgeGradeFilter === 'ALL' ||
      s.grade === badgeGradeFilter ||
      s.currentClass === badgeGradeFilter;
    return matchesSearch && matchesGrade;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl text-white">
        {/* Header with Live Status & Audio Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-serif tracking-tight flex items-center gap-2">
                QR Attendance Camera Scanner
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI VOICE GREETING ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automatic biometric gate scanner with personalized first-name voice greetings & real-time roll call logging.
              </p>
            </div>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('scanner')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'scanner' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Live Scanner</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('badges')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'badges' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>QR Badges ({students.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'settings' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Voice Settings</span>
              </button>
            </div>

            {/* Mute Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) speakLearnerGreeting('Zawadi');
              }}
              title={soundEnabled ? 'Mute Voice' : 'Enable Voice'}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
              <span className="hidden md:inline">{soundEnabled ? 'Voice ON' : 'Muted'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Live Scanner Viewfinder & Live Session Log */}
        {activeTab === 'scanner' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Video Camera Viewfinder */}
            <div className="lg:col-span-7 space-y-4">
              {/* Viewfinder Frame */}
              <div className="relative rounded-2xl bg-black border-2 border-slate-800 aspect-4/3 overflow-hidden flex items-center justify-center shadow-inner">
                {/* Hidden Processing Canvas */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Main Video Camera Stream */}
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  autoPlay
                  muted
                  playsInline
                />

                {/* Overlaid QR Detection Canvas with Corner Highlighting */}
                <canvas
                  ref={overlayCanvasRef}
                  className={`absolute inset-0 w-full h-full pointer-events-none ${
                    cameraActive ? 'block' : 'hidden'
                  }`}
                />

                {/* Viewfinder Target Framing & Scan Line */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="w-64 h-64 border-2 border-emerald-400/40 rounded-3xl relative shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                      {/* Corner Accents */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl -mt-1 -ml-1" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl -mt-1 -mr-1" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl -mb-1 -ml-1" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl -mb-1 -mr-1" />

                      {/* Animated Laser Scanning Bar */}
                      <div className="w-full h-0.5 bg-linear-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce opacity-90 shadow-[0_0_12px_#10b981]" />
                    </div>

                    <div className="absolute bottom-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Aim camera at student QR badge</span>
                    </div>
                  </div>
                )}

                {/* Camera Offline Fallback */}
                {!cameraActive && (
                  <div className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">Device Camera Offline</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                        {cameraError || 'Tap below to activate device camera or use the quick badge simulator.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => startCamera(selectedDeviceId)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Start Camera</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls Bar: Switch Camera, Flashlight, Upload */}
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Camera Device Switcher */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <SwitchCamera className="w-4 h-4 text-emerald-400 shrink-0" />
                  <select
                    value={selectedDeviceId}
                    onChange={handleDeviceChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-semibold focus:outline-hidden"
                  >
                    {videoDevices.length > 0 ? (
                      videoDevices.map((d, i) => (
                        <option key={d.deviceId || i} value={d.deviceId}>
                          {d.label || `Camera ${i + 1}`}
                        </option>
                      ))
                    ) : (
                      <option value="">Default System Camera</option>
                    )}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {/* Flashlight Torch Toggle */}
                  {hasTorchSupport && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        torchOn
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Flashlight className="w-3.5 h-3.5" />
                      <span>{torchOn ? 'Torch ON' : 'Torch'}</span>
                    </button>
                  )}

                  {/* Upload QR Image File */}
                  <label className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Badge Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Quick Simulation & Badge Tap Bar */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Simulate QR Badge Tap (Test Audio Greeting)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Voice says: <strong className="text-amber-300">"{buildGreetingMessage('[First Name]')}"</strong>
                  </span>
                </div>

                <div className="flex gap-2">
                  <select
                    value={simulatedAdmInput}
                    onChange={(e) => {
                      setSimulatedAdmInput(e.target.value);
                      if (e.target.value) handleProcessScan(e.target.value);
                    }}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Click any student badge to simulate instant scan & audio --</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.admissionNumber}>
                        {st.admissionNumber} — {st.firstName} {st.lastName} ({(st.grade || st.currentClass || '').replace('_', ' ')})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const sample = students[Math.floor(Math.random() * students.length)];
                      if (sample) handleProcessScan(sample.admissionNumber);
                    }}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer whitespace-nowrap shadow-sm"
                  >
                    🎲 Random Tap
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Verified Scan Greeting Card & Live Timeline */}
            <div className="lg:col-span-5 space-y-4 flex flex-col">
              {/* Active Audio Greeting Card */}
              {lastScannedStudent ? (
                <div className="bg-linear-to-br from-emerald-950 via-slate-900 to-slate-950 p-5 rounded-3xl border-2 border-emerald-500/60 shadow-xl space-y-3.5 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5" />
                      ROLL CALL RECORDED
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{lastScannedTime}</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-400/90 shrink-0 shadow-md">
                      <img
                        src={
                          lastScannedStudent.photoUrl ||
                          'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={lastScannedStudent.firstName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <p className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                        Learner Identified
                      </p>
                      <h3 className="font-black text-lg text-white truncate leading-tight">
                        {lastScannedStudent.firstName} {lastScannedStudent.lastName}
                      </h3>
                      <p className="text-xs text-slate-300 font-mono font-semibold">
                        {lastScannedStudent.admissionNumber} • {(lastScannedStudent.grade || lastScannedStudent.currentClass || '').replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Audio Utterance Spoken Wave Bar */}
                  <div className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-500/40 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>Voice Greeting:</span>
                      </div>
                      {isSpeaking && (
                        <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300 font-mono animate-pulse">
                          🔊 Speaking Now...
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-100 italic leading-relaxed">
                      "{lastSpokenGreeting || buildGreetingMessage(lastScannedStudent.firstName)}"
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => speakLearnerGreeting(lastScannedStudent.firstName)}
                        className="text-[11px] text-amber-300 hover:text-amber-200 font-bold underline flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>Replay Voice Greeting</span>
                      </button>
                      <span className="text-[10px] text-emerald-400 font-mono">Synced to Firestore</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-800 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center mx-auto">
                    <QrCode className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">Awaiting QR Scan</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Present student ID badge to the camera or click any learner from the simulation dropdown to trigger instant attendance verification and personalized voice greeting.
                  </p>
                </div>
              )}

              {/* Live Session Log List */}
              <div className="bg-slate-800/60 rounded-3xl border border-slate-800 p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    Kiosk Session Timeline ({recentScans.length} Scanned)
                  </h4>
                  {recentScans.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setRecentScans([])}
                      className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Clear Timeline
                    </button>
                  )}
                </div>

                <div className="space-y-2 overflow-y-auto max-h-64 flex-1 pr-1 custom-scrollbar">
                  {recentScans.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-700/50 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                          {item.student.firstName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">
                            {item.student.firstName} {item.student.lastName}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.student.admissionNumber} • {(item.student.grade || item.student.currentClass || '').replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-emerald-400 block">{item.time}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-sm font-black ${
                              item.attendanceStatus === 'LATE'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {item.attendanceStatus}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => speakLearnerGreeting(item.student.firstName)}
                          title="Play greeting audio"
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-300 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {recentScans.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No learners scanned during this session yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Learner QR Badges Studio & Test Cards */}
        {activeTab === 'badges' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Printer className="w-4 h-4 text-emerald-400" />
                  Printable & Scannable Learner QR Badges
                </h3>
                <p className="text-xs text-slate-400">
                  Display these barcodes on screen or print them to test the live camera scanner.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search learner..."
                    value={badgeSearch}
                    onChange={(e) => setBadgeSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden"
                  />
                </div>

                <select
                  value={badgeGradeFilter}
                  onChange={(e) => setBadgeGradeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden"
                >
                  <option value="ALL">All Grades</option>
                  <option value="PLAYGROUP">Playgroup</option>
                  <option value="PP1">PP1</option>
                  <option value="PP2">PP2</option>
                  <option value="GRADE_1">Grade 1</option>
                  <option value="GRADE_2">Grade 2</option>
                  <option value="GRADE_3">Grade 3</option>
                  <option value="GRADE_4">Grade 4</option>
                  <option value="GRADE_5">Grade 5</option>
                  <option value="GRADE_6">Grade 6</option>
                  <option value="GRADE_7">Grade 7 (JSS)</option>
                  <option value="GRADE_8">Grade 8 (JSS)</option>
                  <option value="GRADE_9">Grade 9 (JSS)</option>
                </select>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBadgeStudents.map((st) => {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  st.admissionNumber
                )}`;

                return (
                  <div
                    key={st.id}
                    className="bg-white text-slate-900 p-4 rounded-2xl border border-slate-300 shadow-md flex flex-col items-center text-center relative group"
                  >
                    {/* Header */}
                    <div className="w-full pb-2 mb-2 border-b border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="font-extrabold text-emerald-800 uppercase tracking-wider font-serif">
                        {schoolName}
                      </span>
                      <span className="font-mono text-slate-500 font-bold">{st.admissionNumber}</span>
                    </div>

                    {/* QR Code */}
                    <div className="w-32 h-32 p-1.5 bg-slate-50 border border-slate-200 rounded-xl mb-3 shadow-inner flex items-center justify-center">
                      <img
                        src={qrUrl}
                        alt={`QR code for ${st.admissionNumber}`}
                        className="w-full h-full object-contain"
                        crossOrigin="anonymous"
                      />
                    </div>

                    {/* Student Info */}
                    <h4 className="font-black text-xs text-slate-900 truncate w-full">
                      {st.firstName} {st.lastName}
                    </h4>
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      {(st.grade || st.currentClass || '').replace('_', ' ')} • Stream {st.stream}
                    </p>

                    {/* Test Audio / Scan Button */}
                    <div className="w-full mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('scanner');
                          handleProcessScan(st.admissionNumber);
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Scan Badge</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => speakLearnerGreeting(st.firstName)}
                        title="Test greeting audio"
                        className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Voice Greeting Settings & Audio Customizer */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  Voice Greeting & Speech Synthesis Preferences
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Customize the audio greeting phrase, voice dialect, speech pitch, and rate for learner check-in.
                </p>
              </div>

              {/* Greeting Preset Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Greeting Message Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGreetingStyle('time_aware')}
                    className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                      greetingStyle === 'time_aware'
                        ? 'bg-emerald-950/80 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-bold text-xs text-emerald-400">🌅 Time-Aware (Morning/Afternoon)</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      "Good morning, [Name]! Welcome to Uwezo Elite School. Your attendance has been recorded."
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGreetingStyle('enthusiastic')}
                    className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                      greetingStyle === 'enthusiastic'
                        ? 'bg-emerald-950/80 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-bold text-xs text-amber-400">✨ Enthusiastic & Inspiring</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      "Hello [Name]! Great to see you today. Have a wonderful and inspired day of learning!"
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGreetingStyle('swahili')}
                    className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                      greetingStyle === 'swahili'
                        ? 'bg-emerald-950/80 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-bold text-xs text-blue-400">🇰🇪 Swahili / Kiswahili</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      "Habari ya asubuhi, [Name]! Karibu Uwezo Elite School. Mahudhurio yako yamerekodiwa."
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGreetingStyle('concise')}
                    className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                      greetingStyle === 'concise'
                        ? 'bg-emerald-950/80 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-bold text-xs text-purple-400">⚡ Concise Fast-Gate</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      "Welcome, [Name]. Attendance verified."
                    </p>
                  </button>
                </div>
              </div>

              {/* Voice Synthesizer Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">System Voice Selector</label>
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden"
                >
                  {availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sliders: Speech Rate & Pitch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Speech Rate (Speed)</span>
                    <span className="text-emerald-400">{speechRate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.3"
                    step="0.05"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Voice Pitch</span>
                    <span className="text-emerald-400">{speechPitch.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              {/* Test Audio Button */}
              <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Sample Learner: Zawadi Mwangi</span>
                <button
                  type="button"
                  onClick={() => speakLearnerGreeting('Zawadi')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Test Voice Greeting Now 🔊</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Connected to Cloud Firestore & Uwezo Attendance Database</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
          >
            Close Kiosk
          </button>
        </div>
      </div>
    </div>
  );
};
