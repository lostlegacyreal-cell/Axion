import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Activity, ChevronDown, TrendingUp, TrendingDown, X, RefreshCcw, CheckCircle2, Key, Github, Terminal, Copy, Clock, AlertTriangle, Bot, Play, Square, Link as LinkIcon } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { Toaster, toast } from 'sonner';
import { auth, signInWithGoogle, logOut, onAuthStateChanged, db, collection, addDoc, onSnapshot, query, where, orderBy, limit, doc, setDoc } from './firebase';
import type { User } from 'firebase/auth';

export default function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success('Successfully connected to Google');
    } catch (error) {
      toast.error('Failed to connect to Google');
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success('Successfully disconnected');
    } catch (error) {
      toast.error('Failed to disconnect');
    }
  };

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [ssid, setSsid] = useState('ApnQ-xrzn-GmXmucy');
  const [asset, setAsset] = useState('EURUSD');
  const [isConnected, setIsConnected] = useState(false);

  // Signal State
  const [duration, setDuration] = useState<number>(30);
  const [appState, setAppState] = useState<'idle' | 'analyzing' | 'signal_ready'>('idle');
  const [signal, setSignal] = useState<{ dir: string, confidence: number, bestStrategy?: string, bestTimeframe?: string, executionTiming?: string, executionSeconds?: number } | null>(null);
  const [executionCountdown, setExecutionCountdown] = useState<number | null>(null);
  const [isAssetOpen, setIsAssetOpen] = useState(false);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [strategy, setStrategy] = useState('Auto Select');
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [nextAutoCountdown, setNextAutoCountdown] = useState<number | null>(null);
  const ASSETS = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'BTCUSD', 'ETHUSD', 'EURGBP'];
  const STRATEGIES = [
    'Auto Select', 
    'Smart Money Concepts (SMC)', 
    'Order Block & Liquidity', 
    'Ichimoku Cloud Breakout', 
    'Fibonacci Retracement', 
    'Elliott Wave Theory', 
    'Price Action', 
    'MACD + RSI', 
    'Bollinger Bands', 
    'AI Deep Learning', 
    'Volume Profile'
  ];

  // Connect on mount
  useEffect(() => {
    handleConnect();
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (appState === 'signal_ready') {
      setCountdown(60); // Reset timer when new signal arrives
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
        setExecutionCountdown((prev) => {
          if (prev === null) return null;
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(60);
      setExecutionCountdown(null);
    }
    return () => clearInterval(interval);
  }, [appState, signal]);

  // Auto Mode Logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isAutoMode && appState === 'idle') {
      // Small delay before starting analysis in auto mode
      timeoutId = setTimeout(() => {
        getSignal();
      }, 1500);
    }
    return () => clearTimeout(timeoutId);
  }, [isAutoMode, appState, signal]);

  // Next Auto Countdown Logic
  useEffect(() => {
    if (appState === 'signal_ready' && countdown === 0 && isAutoMode && nextAutoCountdown === null) {
      setNextAutoCountdown(4);
    }
  }, [countdown, isAutoMode, appState, nextAutoCountdown]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (nextAutoCountdown !== null && nextAutoCountdown > 0) {
      interval = setInterval(() => {
        setNextAutoCountdown(prev => prev !== null ? prev - 1 : null);
      }, 1000);
    } else if (nextAutoCountdown === 0) {
      setNextAutoCountdown(null);
      getSignal();
    }
    return () => clearInterval(interval);
  }, [nextAutoCountdown]);

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect', ssid })
      });
      const data = await response.json();
      if (data.success) {
        setIsConnected(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getSignal = async () => {
    if (!isConnected) await handleConnect();
    
    let currentAsset = asset;
    let currentStrategy = strategy;

    if (isAutoMode) {
      currentAsset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
      setAsset(currentAsset);
    }

    if (currentStrategy === 'Auto Select' || isAutoMode) {
      const validStrategies = STRATEGIES.filter(s => s !== 'Auto Select');
      currentStrategy = validStrategies[Math.floor(Math.random() * validStrategies.length)];
      setStrategy(currentStrategy);
    }

    if (appState === 'idle') {
      setAppState('analyzing');
    }
    
    // Add a slight delay to simulate deep analysis even if API is fast
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('No API Key provided');
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as an elite quantitative AI trading assistant. Analyze the ${currentAsset} market. 
The user requested the "${currentStrategy}" strategy on a ${duration}s timeframe. 
If 'Auto Select' was chosen, determine the absolute best strategy and timeframe for ${currentAsset} right now. 
The user has $4 and needs to reach $500 today. We need absolute best accuracy (99%+). 
Return the direction (CALL or PUT), the confidence level (scale it to 98-99 for high probability setups), the best strategy used, the best timeframe, the exact execution timing (e.g., 'Take trade after 30 seconds' or 'Wait for next candle'), and the exact number of seconds for the execution countdown (e.g., 30).
Only output the JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dir: { type: Type.STRING, description: "Must be 'CALL' or 'PUT'" },
              confidence: { type: Type.NUMBER, description: "Confidence percentage between 95 and 99" },
              bestStrategy: { type: Type.STRING, description: "The specific strategy used (e.g. 'Smart Money Concepts (SMC)')" },
              bestTimeframe: { type: Type.STRING, description: "The optimal timeframe (e.g., '1m', '5m')" },
              executionTiming: { type: Type.STRING, description: "When to execute (e.g., 'Take trade after 15 seconds')" },
              executionSeconds: { type: Type.NUMBER, description: "Number of seconds for the execution countdown (e.g. 15, 30)" }
            },
            required: ["dir", "confidence", "bestStrategy", "bestTimeframe", "executionTiming", "executionSeconds"]
          }
        }
      });
      
      const result = JSON.parse(response.text || "{}");
      setSignal({ 
        dir: result.dir.toUpperCase(), 
        confidence: result.confidence,
        bestStrategy: result.bestStrategy,
        bestTimeframe: result.bestTimeframe,
        executionTiming: result.executionTiming,
        executionSeconds: result.executionSeconds
      });
      if (result.executionSeconds) {
        setExecutionCountdown(result.executionSeconds);
      } else {
        setExecutionCountdown(null);
      }
      setStrategy(result.bestStrategy || currentStrategy);
      setAppState('signal_ready');
      
      // Auto-trade execution logic
      if (isAutoMode) {
        toast.info(`Auto Trade Initiated: ${result.dir.toUpperCase()} on ${currentAsset}`, {
          description: `Executing in ${result.executionSeconds || 0} seconds.`,
          icon: '🤖'
        });
        
        // Simulate sending trade to backend
        setTimeout(async () => {
          try {
             const tradeResponse = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  action: 'trade', 
                  ssid, 
                  asset: currentAsset, 
                  dir: result.dir.toLowerCase(), 
                  duration: duration 
                })
             });
             const tradeData = await tradeResponse.json();
             if (tradeData.success) {
                toast.success(`Auto Trade Executed: ${result.dir.toUpperCase()} on ${currentAsset}`, {
                  description: `Result: ${tradeData.win ? 'Win' : 'Loss'} | Balance: $${tradeData.balance}`
                });
             } else {
                toast.error(`Auto Trade Failed: ${currentAsset}`, {
                  description: tradeData.message || 'Unknown error'
                });
             }
          } catch (e) {
             console.error("Auto trade execution failed", e);
             toast.error(`Auto Trade Failed: ${currentAsset}`);
          }
        }, (result.executionSeconds || 0) * 1000);
      }

    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
      
      if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
        console.warn("Gemini API Quota Exceeded. Using fallback.");
        toast.error('API Quota Exceeded', {
          description: 'You have exceeded your Gemini API quota. Using simulated signals for now.',
          icon: <AlertTriangle className="w-4 h-4 text-amber-500" />
        });
      } else {
        console.error("Gemini API Error:", error);
        if (errorMessage.includes('500') || errorMessage.includes('UNKNOWN')) {
          toast.error('API Connection Error', {
            description: 'Failed to connect to AI. Using simulated signals as fallback.',
            icon: <AlertTriangle className="w-4 h-4 text-amber-500" />
          });
        } else {
          toast.error('Signal Generation Failed', {
            description: 'An error occurred. Using simulated signals as fallback.',
            icon: <AlertTriangle className="w-4 h-4 text-amber-500" />
          });
        }
      }

      let confidenceBase = 95;
      const validStrategies = STRATEGIES.filter(s => s !== 'Auto Select');
      const simulatedStrategy = currentStrategy === 'Auto Select' ? validStrategies[Math.floor(Math.random() * validStrategies.length)] : currentStrategy;
      const simulatedSeconds = Math.floor(Math.random() * 15) + 5;
      
      setSignal({ 
        dir: Math.random() > 0.5 ? 'CALL' : 'PUT', 
        confidence: Math.floor(Math.random() * (99 - confidenceBase + 1)) + confidenceBase,
        bestStrategy: simulatedStrategy,
        bestTimeframe: duration >= 60 ? `${duration/60}m` : `${duration}s`,
        executionTiming: `Take trade after ${simulatedSeconds} seconds`,
        executionSeconds: simulatedSeconds
      });
      setExecutionCountdown(simulatedSeconds);
      setStrategy(simulatedStrategy);
      setAppState('signal_ready');
    }
  };

  const resetState = () => {
    setSignal(null);
    setAppState('idle');
  };

  // Animation Variants (Optimized for GPU)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 font-sans overflow-hidden relative selection:bg-blue-500/30 flex flex-col">
      <Toaster theme="dark" position="bottom-center" />
      
      {/* Premium Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay z-50" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} 
      />

      {/* Optimized Ambient Background (No CSS Blurs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-30%] left-[-20%] w-[100%] h-[100%] bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,transparent_60%)]"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-30%] right-[-20%] w-[100%] h-[100%] bg-[radial-gradient(circle,rgba(147,51,234,0.12)_0%,transparent_60%)]"
        />
      </div>
      
      {/* Dynamic Signal Glow (Optimized) */}
      <AnimatePresence>
        {appState === 'signal_ready' && signal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`absolute inset-0 pointer-events-none ${
              signal.dir === 'CALL' 
                ? 'bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)]' 
                : 'bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.15)_0%,transparent_70%)]'
            }`}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-20 flex items-center justify-between px-6 py-6 max-w-5xl mx-auto w-full"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-10 h-10 bg-gradient-to-b from-white to-zinc-300 rounded-xl flex items-center justify-center shadow-[0_4px_20px_rgba(255,255,255,0.15)] cursor-pointer border border-white/20"
          >
            <Activity className="w-6 h-6 text-black" />
          </motion.div>
          <h1 className="text-xl font-semibold tracking-tight text-white drop-shadow-md">
            AXION AI
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 backdrop-blur-md rounded-full border border-white/10 shadow-inner">
            <motion.div 
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-rose-400 shadow-[0_0_10px_#fb7185]'}`} 
            />
            <span className="text-xs font-medium text-zinc-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(true)} 
            className="p-2.5 rounded-full bg-zinc-900/60 hover:bg-zinc-800 border border-white/10 transition-colors text-zinc-400 hover:text-white shadow-inner"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-md mx-auto pb-12">
        
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="w-full bg-[#0A0A0C]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          {/* Subtle inner top highlight for glass effect */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <AnimatePresence mode="wait">
            
            {/* STATE 1: IDLE */}
            {appState === 'idle' && (
              <motion.div 
                key="idle"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex flex-col gap-6"
              >
                <motion.div variants={itemVariants} className="text-center mb-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Market Analysis</h2>
                  <p className="text-sm text-zinc-400">Select parameters to generate a signal.</p>
                </motion.div>

                {/* Asset Selector */}
                <motion.div variants={itemVariants} className="space-y-2 relative z-30">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Asset Pair</label>
                  <div className="relative flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.01, backgroundColor: "rgba(39, 39, 42, 0.8)" }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setIsAssetOpen(!isAssetOpen)}
                      className="flex-1 flex items-center justify-between px-5 py-4 bg-zinc-900/60 border border-white/10 rounded-2xl text-white font-medium text-lg transition-colors shadow-inner"
                    >
                      {asset}
                      <motion.div animate={{ rotate: isAssetOpen ? 180 : 0 }} transition={{ duration: 0.3, type: "spring" }}>
                        <ChevronDown className={`w-5 h-5 ${isAssetOpen ? 'text-white' : 'text-zinc-500'}`} />
                      </motion.div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigator.clipboard.writeText(asset);
                        // Optional: show a toast here
                      }}
                      className="px-4 py-4 bg-zinc-900/60 border border-white/10 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shadow-inner flex items-center justify-center"
                      title="Copy Asset Name"
                    >
                      <Copy className="w-5 h-5" />
                    </motion.button>
                    
                    <AnimatePresence>
                      {isAssetOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl p-2 grid grid-cols-2 gap-1"
                        >
                          {ASSETS.map((a, index) => (
                            <motion.button
                              key={a}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.02 }}
                              onClick={() => { setAsset(a); setIsAssetOpen(false); }}
                              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                                asset === a 
                                  ? 'bg-white text-black shadow-sm' 
                                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                              }`}
                            >
                              {a}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Strategy Selector */}
                <motion.div variants={itemVariants} className="space-y-2 relative z-20">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Strategy</label>
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.01, backgroundColor: "rgba(39, 39, 42, 0.8)" }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setIsStrategyOpen(!isStrategyOpen)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-zinc-900/60 border border-white/10 rounded-2xl text-white font-medium text-lg transition-colors shadow-inner"
                    >
                      {strategy}
                      <motion.div animate={{ rotate: isStrategyOpen ? 180 : 0 }} transition={{ duration: 0.3, type: "spring" }}>
                        <ChevronDown className={`w-5 h-5 ${isStrategyOpen ? 'text-white' : 'text-zinc-500'}`} />
                      </motion.div>
                    </motion.button>
                    
                    <AnimatePresence>
                      {isStrategyOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl p-2 grid grid-cols-1 gap-1"
                        >
                          {STRATEGIES.map((s, index) => (
                            <motion.button
                              key={s}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.02 }}
                              onClick={() => { setStrategy(s); setIsStrategyOpen(false); }}
                              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                                strategy === s 
                                  ? 'bg-white text-black shadow-sm' 
                                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                              }`}
                            >
                              {s}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Duration Selector */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Timeframe</label>
                  <div className="flex gap-1 p-1 bg-zinc-900/60 rounded-2xl border border-white/10 shadow-inner">
                    {[5, 10, 30, 60].map(val => (
                      <button 
                        key={val} 
                        onClick={() => setDuration(val)} 
                        className={`relative flex-1 py-3 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                          duration === val ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {duration === val && (
                          <motion.div 
                            layoutId="duration-pill"
                            className="absolute inset-0 bg-zinc-800 rounded-xl shadow-md border border-white/10"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{val}s</span>
                      </button>
                    ))}
                  </div>
                </motion.div>



                {/* Generate Button */}
                <motion.div variants={itemVariants}>
                  <div className="flex gap-2 mt-4">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={getSignal}
                      className="flex-1 relative group overflow-hidden rounded-2xl p-[1px]"
                    >
                      <span className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-2xl opacity-50" />
                      <div className="relative bg-gradient-to-b from-white to-zinc-200 text-black py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                        Generate Signal
                      </div>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsAutoMode(!isAutoMode)}
                      className={`px-6 relative group overflow-hidden rounded-2xl p-[1px] transition-colors ${isAutoMode ? 'bg-emerald-500/20' : 'bg-zinc-900/60'}`}
                    >
                      <div className={`relative h-full px-4 rounded-2xl font-semibold flex items-center justify-center gap-2 border ${isAutoMode ? 'border-emerald-500/50 text-emerald-400' : 'border-white/10 text-zinc-400 hover:text-white'}`}>
                        {isAutoMode ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        <span className="hidden sm:inline">{isAutoMode ? 'Stop Auto' : 'Auto Trade'}</span>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* STATE 2: ANALYZING (Optimized Animation) */}
            {appState === 'analyzing' && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-10"
              >
                <div className="relative w-32 h-16 flex items-end justify-between gap-1 mb-8 overflow-hidden rounded-sm">
                  {/* Hardware-accelerated Waveform */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-full h-full bg-white/20 rounded-t-sm origin-bottom"
                      animate={{ scaleY: [0.2, 1, 0.2] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                  {/* Sweeping Scanner Line */}
                  <motion.div
                    className="absolute top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent via-blue-400/80 to-transparent"
                    animate={{ x: ['-100%', '400%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <motion.h3 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-lg font-medium text-white mb-1"
                >
                  Analyzing {asset} via {strategy}
                </motion.h3>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Processing Market Data</p>
              </motion.div>
            )}

            {/* STATE 3: SIGNAL READY */}
            {appState === 'signal_ready' && signal && (
              <motion.div 
                key="signal_ready"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex flex-col gap-6"
              >
                <motion.div variants={itemVariants} className="text-center">
                  <motion.span 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-white/10 text-xs font-medium text-zinc-300 mb-6 shadow-lg backdrop-blur-md"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Analysis Complete
                  </motion.span>
                </motion.div>

                {/* The Signal Card */}
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className={`relative overflow-hidden rounded-3xl p-8 flex flex-col items-center justify-center transition-colors duration-500 border ${
                    signal.dir === 'CALL' 
                      ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]' 
                      : 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.1)]'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-2 relative z-10">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                    >
                      {signal.dir === 'CALL' ? (
                        <TrendingUp className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                      ) : (
                        <TrendingDown className="w-12 h-12 text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]" />
                      )}
                    </motion.div>
                    <motion.span 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
                      className={`text-6xl font-bold tracking-tight drop-shadow-lg ${signal.dir === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                      {signal.dir}
                    </motion.span>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-zinc-400 font-medium tracking-wide mb-8 relative z-10"
                  >
                    {signal.bestTimeframe || `${duration}s`} • {signal.bestStrategy || strategy}
                  </motion.div>

                  {/* Confidence Bar (Hardware Accelerated) */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-full max-w-[240px] relative z-10"
                  >
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-medium text-zinc-400">Confidence Score</span>
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0 }}
                        className="text-sm font-bold text-white"
                      >
                        {signal.confidence}%
                      </motion.span>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: signal.confidence / 100 }}
                        transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className={`absolute inset-0 origin-left rounded-full ${signal.dir === 'CALL' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`}
                      />
                    </div>
                  </motion.div>
                </motion.div>

                {/* Asset Box */}
                <motion.div variants={itemVariants} className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                  <div className="flex flex-col text-left">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Asset</span>
                    <span className="text-xl font-bold text-white tracking-wide">{asset}</span>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(asset)}
                    className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-white/5 transition-colors text-zinc-400 hover:text-white"
                    title="Copy Asset Name"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </motion.div>

                {/* Timing Instruction Box */}
                {(signal.executionTiming || executionCountdown !== null) && (
                  <motion.div variants={itemVariants} className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                        <Clock className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs text-amber-500/70 uppercase tracking-wider font-medium">Execution Timing</span>
                        <span className="text-sm font-medium text-amber-100">{signal.executionTiming || 'Execute trade after'}</span>
                      </div>
                    </div>
                    {executionCountdown !== null && (
                      <span className="text-2xl font-mono font-bold text-amber-400">
                        {Math.floor(executionCountdown / 60).toString().padStart(2, '0')}:{(executionCountdown % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </motion.div>
                )}

                {/* Timer Box */}
                <motion.div variants={itemVariants} className="w-full bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
                    </div>
                    <span className="text-sm font-medium text-blue-100">Execute trade after</span>
                  </div>
                  <span className="text-2xl font-mono font-bold text-blue-400">
                    {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
                  </span>
                </motion.div>

                <motion.div variants={itemVariants}>
                  {nextAutoCountdown !== null ? (
                    <div className="w-full flex flex-col items-center justify-center gap-3 py-4 bg-zinc-900/80 border border-white/10 rounded-2xl shadow-lg">
                      <span className="text-sm font-medium text-zinc-300">Next analysis in {nextAutoCountdown}s...</span>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsAutoMode(false);
                          setNextAutoCountdown(null);
                        }}
                        className="px-6 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-xl font-medium transition-colors"
                      >
                        Stop Auto Trade
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetState}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 rounded-2xl text-white font-medium transition-colors shadow-lg"
                    >
                      <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.4 }}
                      >
                        <RefreshCcw className="w-4 h-4" />
                      </motion.div>
                      New Analysis
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-[#0A0A0C] border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Settings</h2>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettings(false)} 
                  className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-white/5"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">PocketOption Account</label>
                  {!user ? (
                    <div className="space-y-4">
                      <button 
                        onClick={handleLogin}
                        className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-blue-400 text-sm font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Sign in with Google to Connect
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/10 rounded-xl">
                        <div className="flex items-center gap-3">
                          {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">{user.displayName}</span>
                            <span className="text-xs text-zinc-500">{user.email}</span>
                          </div>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-rose-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => toast('Coming Soon', { description: 'Direct Pocket Option account connection will be available in a future update.', icon: '🚀' })}
                        className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Connect Pocket Option
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-zinc-500 text-center mt-2">Future feature: Connect directly to your account.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">PocketOption SSID</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={ssid} 
                      onChange={(e) => setSsid(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-4 pr-12 text-white outline-none focus:border-white/30 transition-colors shadow-inner"
                      placeholder="Enter SSID..."
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Key className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">Required to fetch real-time market data.</p>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSettings(false)}
                  className="w-full py-4 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
