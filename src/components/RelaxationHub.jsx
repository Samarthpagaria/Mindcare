import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Howl, Howler } from "howler";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Flower2,
  Headphones,
  BookOpen,
  Settings,
  Waves,
  Wind,
  TreePine,
  Cloud,
  Moon,
  Brain,
  Activity,
  Target,
  Music,
  Layers,
  ExternalLink,
  ChevronRight,
  Flame,
  Droplets,
  Bird,
  Clock,
  X,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";

// ── Real ambient sounds (authentic looping field recordings) ────────────────
const AUDIO_TRACKS = [
  {
    id: "ocean",
    title: "Ocean Waves",
    description: "Gentle rhythmic ocean surf rolling onto the shore for deep relaxation",
    duration: "∞ Loop",
    category: "Nature",
    icon: Waves,
    color: "from-blue-400 to-cyan-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    src: [
      "/sounds/ocean.mp3",
      "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/waves.mp3",
    ],
  },
  {
    id: "forest",
    title: "Forest Ambience",
    description: "Birds, gentle breeze and rustling leaves in an untouched natural forest",
    duration: "∞ Loop",
    category: "Nature",
    icon: TreePine,
    color: "from-green-400 to-emerald-500",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    src: [
      "/sounds/forest.mp3",
      "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/jungle.mp3",
    ],
  },
  {
    id: "rain",
    title: "Rain Sounds",
    description: "Soft calming rainfall, perfect for focus, deep sleep & stress relief",
    duration: "∞ Loop",
    category: "Nature",
    icon: Droplets,
    color: "from-slate-400 to-blue-500",
    bgColor: "bg-slate-50",
    iconColor: "text-slate-600",
    src: [
      "/sounds/rain.mp3",
      "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/rain/light-rain.mp3",
    ],
  },
  {
    id: "fire",
    title: "Crackling Fire",
    description: "Cozy campfire embers & crackles for gentle warmth & comforting focus",
    duration: "∞ Loop",
    category: "Cozy",
    icon: Flame,
    color: "from-orange-400 to-red-500",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    src: [
      "/sounds/fire.mp3",
      "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/campfire.mp3",
    ],
  },
  {
    id: "birds",
    title: "Morning Birds",
    description: "Dawn chorus of cheerful songbirds to lift mood and refresh your spirit",
    duration: "∞ Loop",
    category: "Nature",
    icon: Bird,
    color: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    src: [
      "/sounds/birds.mp3",
      "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/animals/birds.mp3",
    ],
  },
  {
    id: "wind",
    title: "Gentle Wind",
    description: "Soft breeze blowing through open fields and branches",
    duration: "∞ Loop",
    category: "Nature",
    icon: Wind,
    color: "from-teal-400 to-cyan-500",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600",
    src: [
      "/sounds/wind.mp3",
      "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/wind.mp3",
    ],
  },
];

const VIDEO_ITEMS = [
  {
    id: "1",
    title: "5-Minute Morning Meditation",
    description: "A calming start to your day with guided breathwork",
    duration: "5 min",
    category: "Meditation",
    youtubeId: "inpok4MKVLM",
  },
  {
    id: "2",
    title: "10-Minute Yoga for Stress Relief",
    description: "Gentle stretches to release tension from your body",
    duration: "10 min",
    category: "Movement",
    youtubeId: "hJbRpHZr_d0",
  },
  {
    id: "3",
    title: "Box Breathing Technique",
    description: "Navy SEAL breathing technique for calm & focus",
    duration: "4 min",
    category: "Breathing",
    youtubeId: "tEmt1Znux58",
  },
  {
    id: "4",
    title: "Progressive Muscle Relaxation",
    description: "Full body tension release for better sleep",
    duration: "15 min",
    category: "Sleep",
    youtubeId: "86HUcX8ZtAk",
  },
  {
    id: "5",
    title: "Mindfulness for Anxiety",
    description: "Evidence-based techniques to manage anxiety",
    duration: "12 min",
    category: "Mindfulness",
    youtubeId: "O-6f5wQXSu8",
  },
  {
    id: "6",
    title: "Sleep Hypnosis",
    description: "Guided meditation for deep, restful sleep",
    duration: "20 min",
    category: "Sleep",
    youtubeId: "1vx8iUvfyCY",
  },
];

const ARTICLES = [
  {
    id: "1",
    title: "Understanding Anxiety: A Comprehensive Guide",
    excerpt: "Learn about the science behind anxiety and effective coping strategies that are evidence-based and practical.",
    readTime: "8 min read",
    category: "Mental Health",
    author: "Dr. Sarah Johnson",
    url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
    color: "border-l-blue-500",
  },
  {
    id: "2",
    title: "The Power of Mindfulness in Daily Life",
    excerpt: "Discover how just 10 minutes of mindfulness each day can fundamentally change how you experience stress.",
    readTime: "6 min read",
    category: "Mindfulness",
    author: "Mark Chen",
    url: "https://www.mindful.org/what-is-mindfulness/",
    color: "border-l-green-500",
  },
  {
    id: "3",
    title: "Sleep Hygiene: Building Better Sleep Habits",
    excerpt: "Essential tips for improving your sleep quality — backed by sleep science and easy to implement tonight.",
    readTime: "10 min read",
    category: "Sleep",
    author: "Dr. Emily Rodriguez",
    url: "https://www.sleepfoundation.org/sleep-hygiene",
    color: "border-l-purple-500",
  },
  {
    id: "4",
    title: "Breathing Techniques for Instant Stress Relief",
    excerpt: "Learn 4 science-backed breathing exercises that activate your body's parasympathetic nervous system.",
    readTime: "5 min read",
    category: "Techniques",
    author: "Lisa Thompson",
    url: "https://www.healthline.com/health/breathing-exercises-for-anxiety",
    color: "border-l-orange-500",
  },
];

// ─── Breathing sound (short chime) using Web Audio API ─────────────────────
function playBreathingChime(audioCtx) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(528, audioCtx.currentTime); // 528Hz solfeggio
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 1.5);
}

function playExhaleChime(audioCtx) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(396, audioCtx.currentTime);
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 2.0);
}

// ─────────────────────────────────────────────────────────────────────────────

export function RelaxationHub() {
  const [activeTab, setActiveTab] = useState("audio");

  // ── Audio State ──
  const [activeSounds, setActiveSounds] = useState({}); // { id: Howl }
  const [volumes, setVolumes] = useState(
    Object.fromEntries(AUDIO_TRACKS.map((t) => [t.id, 70]))
  );
  const [masterVolume, setMasterVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [errorIds, setErrorIds] = useState(new Set());

  // ── Breathing State ──
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("ready");
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [breathingCycles, setBreathingCycles] = useState(0);
  const [breathingPattern, setBreathingPattern] = useState("478"); // '478' or 'box' or '4-4'
  const breathingIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const prevPhaseRef = useRef("ready");

  // ── Video State ──
  const [activeVideo, setActiveVideo] = useState(null);

  // ── Mixer mode ──
  const [mixerMode, setMixerMode] = useState(false);

  // Initialize Web Audio Context lazily
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Master volume
  useEffect(() => {
    Howler.volume(isMuted ? 0 : masterVolume / 100);
  }, [masterVolume, isMuted]);

  // Cleanup all sounds on unmount
  useEffect(() => {
    return () => {
      Object.values(activeSounds).forEach((h) => h.unload());
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    };
  }, []);

  // ── Play / Pause a sound track ──
  const toggleSound = useCallback(
    (track) => {
      getAudioCtx(); // Unlock AudioContext on user gesture

      // Reset any previous load error for this track so the user can re-trigger
      setErrorIds((prev) => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });

      if (activeSounds[track.id]) {
        // Already loaded — toggle play/pause
        const howl = activeSounds[track.id];
        if (howl.playing()) {
          howl.pause();
        } else {
          howl.play();
        }
        setActiveSounds((prev) => ({ ...prev })); // trigger re-render
        return;
      }

      // Load & play
      setLoadingIds((prev) => new Set(prev).add(track.id));

      const srcList = Array.isArray(track.src) ? track.src : [track.src];

      const howl = new Howl({
        src: srcList,
        loop: true,
        volume: volumes[track.id] / 100,
        html5: true,
        onload: () => {
          setLoadingIds((prev) => {
            const next = new Set(prev);
            next.delete(track.id);
            return next;
          });
          setErrorIds((prev) => {
            const next = new Set(prev);
            next.delete(track.id);
            return next;
          });
          howl.play();
          setActiveSounds((prev) => ({ ...prev, [track.id]: howl }));
        },
        onloaderror: (_id, err) => {
          console.error("Audio load error:", track.id, err);
          setLoadingIds((prev) => {
            const next = new Set(prev);
            next.delete(track.id);
            return next;
          });
          setErrorIds((prev) => new Set(prev).add(track.id));
          setActiveSounds((prev) => {
            const next = { ...prev };
            delete next[track.id];
            return next;
          });
        },
        onplayerror: (_id, err) => {
          console.warn("Audio play error:", track.id, err);
          howl.once("unlock", () => {
            howl.play();
          });
        },
      });

      setActiveSounds((prev) => ({ ...prev, [track.id]: howl }));
    },
    [activeSounds, volumes, getAudioCtx]
  );

  const stopSound = useCallback(
    (trackId) => {
      if (activeSounds[trackId]) {
        activeSounds[trackId].unload();
        setActiveSounds((prev) => {
          const next = { ...prev };
          delete next[trackId];
          return next;
        });
      }
    },
    [activeSounds]
  );

  const handleVolumeChange = useCallback(
    (trackId, val) => {
      const v = val[0];
      setVolumes((prev) => ({ ...prev, [trackId]: v }));
      if (activeSounds[trackId]) {
        activeSounds[trackId].volume(v / 100);
      }
    },
    [activeSounds]
  );

  const isPlaying = (trackId) =>
    activeSounds[trackId]?.playing?.() ?? false;
  const isLoaded = (trackId) => !!activeSounds[trackId];

  // ── Breathing patterns ──
  const patterns = {
    "478": { inhale: 4, hold: 7, exhale: 8, name: "4-7-8 Sleep" },
    box: { inhale: 4, hold: 4, exhale: 4, name: "Box Breathing" },
    "4-4": { inhale: 4, hold: 0, exhale: 4, name: "Simple 4-4" },
  };
  const currentPattern = patterns[breathingPattern];
  const cycleLength =
    currentPattern.inhale + currentPattern.hold + currentPattern.exhale;

  const startBreathingExercise = () => {
    const ctx = getAudioCtx();
    setBreathingActive(true);
    setBreathingPhase("inhale");
    setBreathingTimer(0);
    setBreathingCycles(0);
    prevPhaseRef.current = "inhale";
    playBreathingChime(ctx);

    breathingIntervalRef.current = setInterval(() => {
      setBreathingTimer((prev) => {
        const t = prev + 1;
        const { inhale, hold, exhale } = currentPattern;
        let phase;
        const pos = t % cycleLength;
        if (pos < inhale) phase = "inhale";
        else if (pos < inhale + hold) phase = "hold";
        else phase = "exhale";

        setBreathingPhase(phase);

        // Sound cues on phase change
        if (phase !== prevPhaseRef.current) {
          if (phase === "inhale") {
            playBreathingChime(ctx);
            setBreathingCycles((c) => c + 1);
          } else if (phase === "exhale") {
            playExhaleChime(ctx);
          }
          prevPhaseRef.current = phase;
        }
        return t;
      });
    }, 1000);
  };

  const stopBreathingExercise = () => {
    setBreathingActive(false);
    if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    setBreathingTimer(0);
    setBreathingPhase("ready");
    setBreathingCycles(0);
    prevPhaseRef.current = "ready";
  };

  // Phase count within current phase
  const getPhaseCount = () => {
    const { inhale, hold } = currentPattern;
    const pos = breathingTimer % cycleLength;
    if (breathingPhase === "inhale") return pos + 1;
    if (breathingPhase === "hold") return pos - inhale + 1;
    return pos - inhale - hold + 1;
  };

  const getPhaseTotal = () => {
    if (breathingPhase === "inhale") return currentPattern.inhale;
    if (breathingPhase === "hold") return currentPattern.hold;
    return currentPattern.exhale;
  };

  const phaseColors = {
    ready: "border-gray-300 bg-gray-50",
    inhale: "border-teal-400 bg-teal-50 shadow-teal-200 shadow-lg",
    hold: "border-amber-400 bg-amber-50 shadow-amber-200 shadow-lg",
    exhale: "border-blue-400 bg-blue-50 shadow-blue-200 shadow-lg",
  };

  const phaseLabels = {
    ready: "Ready",
    inhale: "Breathe In",
    hold: "Hold",
    exhale: "Breathe Out",
  };

  const phaseInstructions = {
    ready: "Press Start to begin your breathing exercise",
    inhale: "Slowly fill your lungs completely with air…",
    hold: "Gently hold your breath, stay calm…",
    exhale: "Slowly release all the air from your lungs…",
  };

  const activeSoundCount = Object.keys(activeSounds).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* ── Header ── */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex justify-center"
          >
            <div className="p-4 bg-gradient-to-br from-blue-100 to-green-100 rounded-full shadow-inner">
              <Flower2 className="h-12 w-12 text-teal-600" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900">Relaxation Hub</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Your personal sanctuary for mindfulness, ambient sounds, and mental wellness
          </p>
        </div>

        {/* ── Now Playing Bar ── */}
        <AnimatePresence>
          {activeSoundCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="sticky top-0 z-10"
            >
              <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 shadow-md">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [8, 20, 8] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.8,
                              delay: i * 0.2,
                              ease: "easeInOut",
                            }}
                            className="w-1 bg-teal-500 rounded-full"
                            style={{ height: 8 }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-teal-800">
                        {activeSoundCount} sound{activeSoundCount > 1 ? "s" : ""} playing
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        {AUDIO_TRACKS.filter((t) => isLoaded(t.id)).map((t) => (
                          <Badge
                            key={t.id}
                            variant="secondary"
                            className="text-xs cursor-pointer"
                            onClick={() => stopSound(t.id)}
                          >
                            {t.title} <X className="h-2.5 w-2.5 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 min-w-[160px]">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-teal-600 hover:text-teal-800"
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>
                      <Slider
                        value={[masterVolume]}
                        onValueChange={(v) => setMasterVolume(v[0])}
                        max={100}
                        step={1}
                        className="w-24"
                      />
                      <span className="text-xs text-teal-600 w-8">
                        {masterVolume}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Breathing Exercise Card ── */}
        <Card className="bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 border-teal-100">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center space-x-2 text-teal-800">
                  <Activity className="h-5 w-5" />
                  <span>Breathing Exercise</span>
                </CardTitle>
                <CardDescription className="text-teal-600">
                  Guided breathing with gentle audio cues
                </CardDescription>
              </div>
              {/* Pattern Selector */}
              <div className="flex gap-2 flex-wrap">
                {Object.entries(patterns).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (breathingActive) stopBreathingExercise();
                      setBreathingPattern(key);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      breathingPattern === key
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white text-teal-700 border-teal-300 hover:bg-teal-50"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Animated Circle */}
              <div className="flex flex-col items-center space-y-4">
                <motion.div
                  animate={{
                    scale: breathingActive
                      ? breathingPhase === "inhale"
                        ? 1.35
                        : breathingPhase === "hold"
                        ? 1.35
                        : 1
                      : 1,
                  }}
                  transition={{
                    duration:
                      breathingPhase === "inhale"
                        ? currentPattern.inhale
                        : breathingPhase === "exhale"
                        ? currentPattern.exhale
                        : 0.3,
                    ease:
                      breathingPhase === "inhale"
                        ? "easeIn"
                        : breathingPhase === "exhale"
                        ? "easeOut"
                        : "linear",
                  }}
                  className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-colors duration-700 ${phaseColors[breathingPhase]}`}
                >
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600">
                      {phaseLabels[breathingPhase]}
                    </p>
                    {breathingActive && (
                      <motion.p
                        key={getPhaseCount()}
                        initial={{ scale: 1.4, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-bold text-teal-700 mt-1"
                      >
                        {getPhaseCount()}
                        <span className="text-lg text-gray-400">
                          /{getPhaseTotal()}
                        </span>
                      </motion.p>
                    )}
                    {!breathingActive && (
                      <Flower2 className="h-8 w-8 text-teal-300 mx-auto mt-2" />
                    )}
                  </div>
                </motion.div>

                {/* Instruction text */}
                <p className="text-sm text-center text-gray-500 max-w-[180px]">
                  {phaseInstructions[breathingPhase]}
                </p>

                {/* Controls */}
                <div className="flex items-center space-x-4">
                  {!breathingActive ? (
                    <Button
                      onClick={startBreathingExercise}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button
                      onClick={stopBreathingExercise}
                      variant="outline"
                      className="border-teal-400 text-teal-700"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats & Pattern info */}
              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/70 rounded-xl p-4 text-center border border-teal-100">
                    <p className="text-2xl font-bold text-teal-700">{breathingCycles}</p>
                    <p className="text-xs text-gray-500 mt-1">Cycles completed</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 text-center border border-teal-100">
                    <p className="text-2xl font-bold text-teal-700">
                      {Math.floor(breathingTimer / 60)}:{String(breathingTimer % 60).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Time elapsed</p>
                  </div>
                </div>
                <div className="bg-white/70 rounded-xl p-4 border border-teal-100">
                  <p className="text-sm font-semibold text-teal-800 mb-2">
                    {currentPattern.name} Pattern
                  </p>
                  <div className="flex gap-2">
                    {[
                      { label: "Inhale", s: currentPattern.inhale, color: "bg-teal-100 text-teal-800" },
                      ...(currentPattern.hold > 0
                        ? [{ label: "Hold", s: currentPattern.hold, color: "bg-amber-100 text-amber-800" }]
                        : []),
                      { label: "Exhale", s: currentPattern.exhale, color: "bg-blue-100 text-blue-800" },
                    ].map((p) => (
                      <div key={p.label} className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium ${p.color}`}>
                        <div className="font-bold text-lg">{p.s}s</div>
                        {p.label}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    🔊 Soft audio chimes guide each phase transition
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Main Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="audio" className="flex items-center space-x-2">
              <Headphones className="h-4 w-4" />
              <span>Sounds</span>
            </TabsTrigger>
            <TabsTrigger value="mixer" className="flex items-center space-x-2">
              <Layers className="h-4 w-4" />
              <span>Mixer</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>Videos</span>
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Articles</span>
            </TabsTrigger>
          </TabsList>

          {/* ══ AUDIO TAB ══ */}
          <TabsContent value="audio" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {AUDIO_TRACKS.map((track, index) => {
                const Icon = track.icon;
                const playing = isPlaying(track.id);
                const loaded = isLoaded(track.id);
                const loading = loadingIds.has(track.id);
                const hasError = errorIds.has(track.id);

                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.07 }}
                  >
                    <Card
                      className={`h-full transition-all duration-300 ${
                        playing
                          ? "ring-2 ring-teal-400 shadow-lg shadow-teal-100"
                          : "hover:shadow-md"
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2.5 rounded-xl bg-gradient-to-br ${track.color} shadow-sm`}
                            >
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{track.title}</CardTitle>
                              <Badge variant="secondary" className="text-xs mt-0.5">
                                {track.category}
                              </Badge>
                            </div>
                          </div>
                          {playing && (
                            <div className="flex space-x-0.5">
                              {[0, 1, 2, 3].map((i) => (
                                <motion.div
                                  key={i}
                                  animate={{ height: [4, 16, 4] }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 0.6,
                                    delay: i * 0.15,
                                    ease: "easeInOut",
                                  }}
                                  className="w-1 rounded-full bg-teal-500"
                                  style={{ height: 4 }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-500">{track.description}</p>

                        {hasError && (
                          <p className="text-xs text-red-500">
                            ⚠ Could not load audio. Check connection.
                          </p>
                        )}

                        {/* Volume slider (shown when loaded) */}
                        {loaded && (
                          <div className="flex items-center space-x-2">
                            <Volume2 className="h-3.5 w-3.5 text-gray-400" />
                            <Slider
                              value={[volumes[track.id]]}
                              onValueChange={(v) => handleVolumeChange(track.id, v)}
                              max={100}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-xs text-gray-400 w-7">
                              {volumes[track.id]}%
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={hasError ? "outline" : playing ? "secondary" : "default"}
                            onClick={() => toggleSound(track)}
                            disabled={loading}
                            className={`flex-1 ${
                              hasError
                                ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                                : playing
                                ? "bg-teal-100 text-teal-800 hover:bg-teal-200"
                                : ""
                            }`}
                          >
                            {loading ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1 }}
                                  className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full mr-2"
                                />
                                Loading…
                              </>
                            ) : hasError ? (
                              <>
                                <Play className="h-3.5 w-3.5 mr-1.5" />
                                Retry
                              </>
                            ) : playing ? (
                              <>
                                <Pause className="h-3.5 w-3.5 mr-1.5" /> Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5 mr-1.5" />
                                {loaded ? "Resume" : "Play"}
                              </>
                            )}
                          </Button>
                          {loaded && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => stopSound(track.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* ══ MIXER TAB ══ */}
          <TabsContent value="mixer" className="space-y-6">
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-xl font-bold text-gray-800">🎛 Sound Mixer</h2>
              <p className="text-sm text-gray-500">
                Layer multiple ambient sounds together to create your perfect soundscape
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {AUDIO_TRACKS.map((track) => {
                    const Icon = track.icon;
                    const playing = isPlaying(track.id);
                    const loaded = isLoaded(track.id);
                    const loading = loadingIds.has(track.id);

                    return (
                      <div key={track.id} className="flex items-center gap-4">
                        {/* Toggle */}
                        <button
                          onClick={() =>
                            loaded && playing
                              ? toggleSound(track)
                              : loaded && !playing
                              ? toggleSound(track)
                              : toggleSound(track)
                          }
                          disabled={loading}
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${
                            playing
                              ? `border-transparent bg-gradient-to-br ${track.color} shadow-md`
                              : "border-gray-200 bg-gray-50 hover:border-gray-300"
                          }`}
                        >
                          {loading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1 }}
                              className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                            />
                          ) : (
                            <Icon
                              className={`h-4 w-4 ${
                                playing ? "text-white" : "text-gray-400"
                              }`}
                            />
                          )}
                        </button>

                        {/* Name */}
                        <div className="w-32 flex-shrink-0">
                          <p
                            className={`text-sm font-medium ${
                              playing ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {track.title}
                          </p>
                        </div>

                        {/* Volume slider */}
                        <div className="flex-1 flex items-center gap-3">
                          <VolumeX className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                          <Slider
                            value={[volumes[track.id]]}
                            onValueChange={(v) => handleVolumeChange(track.id, v)}
                            max={100}
                            step={1}
                            disabled={!loaded}
                            className="flex-1"
                          />
                          <Volume2 className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                          <span className="text-xs text-gray-400 w-8 text-right">
                            {loaded ? `${volumes[track.id]}%` : "–"}
                          </span>
                        </div>

                        {/* Stop button */}
                        {loaded && (
                          <button
                            onClick={() => stopSound(track.id)}
                            className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Presets */}
                <div className="mt-8 pt-6 border-t">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    🎵 Quick Presets
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        name: "Deep Focus",
                        sounds: ["rain", "forest"],
                        emoji: "🧠",
                      },
                      {
                        name: "Sleep Time",
                        sounds: ["rain", "wind"],
                        emoji: "🌙",
                      },
                      {
                        name: "Morning Energy",
                        sounds: ["birds", "forest"],
                        emoji: "🌅",
                      },
                      {
                        name: "Cozy Corner",
                        sounds: ["fire", "rain"],
                        emoji: "🔥",
                      },
                      {
                        name: "Ocean Calm",
                        sounds: ["ocean", "birds"],
                        emoji: "🌊",
                      },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          // Stop all first
                          Object.keys(activeSounds).forEach((id) =>
                            stopSound(id)
                          );
                          // Then play preset sounds after a short delay
                          setTimeout(() => {
                            preset.sounds.forEach((id) => {
                              const track = AUDIO_TRACKS.find(
                                (t) => t.id === id
                              );
                              if (track) toggleSound(track);
                            });
                          }, 100);
                        }}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 text-teal-700 text-sm font-medium hover:from-teal-100 hover:to-cyan-100 transition-all"
                      >
                        {preset.emoji} {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══ VIDEO TAB ══ */}
          <TabsContent value="video" className="space-y-6">
            {activeVideo ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <Button
                  variant="ghost"
                  onClick={() => setActiveVideo(null)}
                  className="text-gray-500"
                >
                  ← Back to videos
                </Button>
                <Card>
                  <CardContent className="p-0">
                    <div className="aspect-video w-full">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                        title={activeVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </CardContent>
                </Card>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {activeVideo.title}
                  </h2>
                  <p className="text-gray-500 mt-1">{activeVideo.description}</p>
                </div>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {VIDEO_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.07 }}
                  >
                    <Card
                      className="h-full hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                      onClick={() => setActiveVideo(item)}
                    >
                      <div className="relative">
                        {/* YouTube thumbnail */}
                        <img
                          src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`}
                          alt={item.title}
                          className="w-full h-44 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-3 shadow-lg">
                            <Play className="h-7 w-7 text-teal-700 fill-teal-700" />
                          </div>
                        </div>
                        <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.duration}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2 pt-3">
                        <CardTitle className="text-base leading-snug">
                          {item.title}
                        </CardTitle>
                        <Badge variant="secondary" className="w-fit text-xs">
                          {item.category}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          {item.description}
                        </p>
                        <p className="text-xs text-teal-600 mt-2 flex items-center">
                          <Play className="h-3 w-3 mr-1" /> Click to watch
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ══ ARTICLES TAB ══ */}
          <TabsContent value="articles" className="space-y-4">
            {ARTICLES.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card
                  className={`hover:shadow-md transition-all border-l-4 ${article.color} cursor-pointer`}
                  onClick={() => window.open(article.url, "_blank")}
                >
                  <CardContent className="py-4 px-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {article.category}
                          </Badge>
                          <span className="text-xs text-gray-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {article.readTime}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {article.excerpt}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          By {article.author}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-300 flex-shrink-0 mt-1 group-hover:text-teal-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>

        {/* ── Assessment Tools ── */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            Mental Health Assessments
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                to: "/phq-9-assessment",
                icon: Brain,
                label: "PHQ-9",
                sub: "Depression screening",
                color: "bg-blue-50 border-blue-200 text-blue-700",
                btn: "bg-blue-600 hover:bg-blue-700 text-white",
              },
              {
                to: "/gad-7-assessment",
                icon: Activity,
                label: "GAD-7",
                sub: "Anxiety assessment",
                color: "bg-green-50 border-green-200 text-green-700",
                btn: "bg-green-600 hover:bg-green-700 text-white",
              },
              {
                to: "/ghq-12-assessment",
                icon: Target,
                label: "GHQ-12",
                sub: "General health questionnaire",
                color: "bg-purple-50 border-purple-200 text-purple-700",
                btn: "bg-purple-600 hover:bg-purple-700 text-white",
              },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.to} to={tool.to}>
                  <Card className={`border ${tool.color} hover:shadow-md transition-all`}>
                    <CardContent className="py-5 px-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6" />
                        <div>
                          <p className="font-semibold">{tool.label}</p>
                          <p className="text-xs opacity-70">{tool.sub}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-60" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
