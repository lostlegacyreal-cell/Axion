import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Activity, ChevronDown, TrendingUp, TrendingDown, X, RefreshCcw, CheckCircle2, Key, Download, Github, Terminal, Copy, Clock, AlertTriangle } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { Toaster, toast } from 'sonner';

export default function App() {
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [ssid, setSsid] = useState('ApnQ-xrzn-GmXmucy');
  const [geminiKey, setGeminiKey] = useState('');
  const [asset, setAsset] = useState('EURUSD');
  const [isConnected, setIsConnected] = useState(false);

  // Signal State
  const [duration, setDuration] = useState<number>(30);
  const [appState, setAppState] = useState<'idle' | 'analyzing' | 'signal_ready'>('idle');
  const [signal, setSignal] = useState<{ dir: string, confidence: number } | null>(null);
  const [isAssetOpen, setIsAssetOpen] = useState(false);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [strategy, setStrategy] = useState('Auto Select');
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const ASSETS = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'BTCUSD', 'ETHUSD', 'EURGBP'];
  const STRATEGIES = ['Auto Select', 'Price Action', 'MACD + RSI', 'Bollinger Bands', 'AI Deep Learning', 'Volume Profile'];

  const downloadProject = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AXION AI - PocketOption</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body { background-color: #050507; color: #f4f4f5; font-family: system-ui, -apple-system, sans-serif; overflow-x: hidden; }
        
        /* Noise */
        .noise-bg {
            position: fixed; inset: 0; opacity: 0.04; pointer-events: none; mix-blend-mode: overlay; z-index: 50;
            background-image: url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E");
        }

        /* Ambient Orbs */
        .orb-1 { position: fixed; top: -30%; left: -20%; width: 100%; height: 100%; background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 60%); animation: pulse-orb 8s infinite ease-in-out; pointer-events: none; }
        .orb-2 { position: fixed; bottom: -30%; right: -20%; width: 100%; height: 100%; background: radial-gradient(circle, rgba(147,51,234,0.12) 0%, transparent 60%); animation: pulse-orb 10s infinite ease-in-out 1s; pointer-events: none; }
        
        @keyframes pulse-orb { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.5; } }

        /* Glass Card */
        .glass-card {
            background: rgba(10, 10, 12, 0.8);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 32px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            position: relative;
            overflow: hidden;
        }
        .glass-highlight {
            position: absolute; top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }

        /* Animations */
        .fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .fade-out { animation: fadeOut 0.3s ease-in forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); } }

        /* Waveform */
        .waveform-bar { width: 100%; height: 100%; background: rgba(255,255,255,0.2); border-radius: 2px 2px 0 0; transform-origin: bottom; animation: wave 1.2s infinite ease-in-out; }
        @keyframes wave { 0%, 100% { transform: scaleY(0.2); } 50% { transform: scaleY(1); } }
        .scanner { position: absolute; top: 0; bottom: 0; width: 25%; background: linear-gradient(90deg, transparent, rgba(96,165,250,0.8), transparent); animation: scan 1.5s infinite linear; }
        @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }

        /* Custom Select */
        select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1.2em; }

        /* Progress Bar */
        .progress-fill { transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1); width: 0%; }

        /* Signal Glow */
        .signal-glow-call { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at center, rgba(16,185,129,0.15) 0%, transparent 70%); animation: fadeInGlow 1.5s ease-out forwards; }
        .signal-glow-put { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at center, rgba(244,63,94,0.15) 0%, transparent 70%); animation: fadeInGlow 1.5s ease-out forwards; }
        @keyframes fadeInGlow { from { opacity: 0; } to { opacity: 1; } }

        /* Toast Notifications */
        #toast-container { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 100; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .toast { background: rgba(24, 24, 27, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 12px 16px; color: white; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: toastEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; pointer-events: auto; max-width: 90vw; width: max-content; }
        .toast.hiding { animation: toastExit 0.3s ease-in forwards; }
        .toast-icon { display: flex; align-items: center; justify-content: center; color: #f59e0b; }
        .toast-content { display: flex; flex-direction: column; }
        .toast-title { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
        .toast-desc { font-size: 12px; color: #a1a1aa; }
        @keyframes toastEnter { from { opacity: 0; transform: translateY(20px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes toastExit { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
    </style>
</head>
<body class="min-h-screen flex flex-col relative selection:bg-blue-500/30">
    <div id="toast-container"></div>
    <div class="noise-bg"></div>
    <div class="orb-1"></div>
    <div class="orb-2"></div>
    <div id="signal-bg-glow"></div>

    <!-- Header -->
    <header class="relative z-20 flex items-center justify-between px-6 py-6 max-w-5xl mx-auto w-full fade-in">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-b from-white to-zinc-300 rounded-xl flex items-center justify-center shadow-[0_4px_20px_rgba(255,255,255,0.15)] border border-white/20 hover:rotate-180 hover:scale-105 transition-all duration-500 cursor-pointer">
                <i data-lucide="activity" class="w-6 h-6 text-black"></i>
            </div>
            <h1 class="text-xl font-semibold tracking-tight text-white drop-shadow-md">AXION AI</h1>
        </div>
        <div class="flex items-center gap-4">
            <button id="auto-trade-btn" onclick="toggleAutoMode()" class="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-inner transition-colors bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800">
                <i data-lucide="terminal" class="w-4 h-4"></i>
                <span id="auto-trade-text" class="text-xs font-medium uppercase tracking-wider">Auto Trade</span>
            </button>
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 backdrop-blur-md rounded-full border border-white/10 shadow-inner">
                <div class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse"></div>
                <span class="text-xs font-medium text-zinc-300">Connected</span>
            </div>
            <button onclick="toggleSettings(true)" class="p-2.5 rounded-full bg-zinc-900/60 hover:bg-zinc-800 border border-white/10 transition-all text-zinc-400 hover:text-white shadow-inner hover:scale-110 hover:rotate-90">
                <i data-lucide="settings" class="w-5 h-5"></i>
            </button>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-md mx-auto pb-12">
        <div class="w-full glass-card p-6 fade-in" id="main-card">
            <div class="glass-highlight"></div>

            <!-- STATE 1: IDLE -->
            <div id="state-idle" class="flex flex-col gap-6">
                <div class="text-center mb-2">
                    <h2 class="text-2xl font-semibold tracking-tight text-white mb-1">Market Analysis</h2>
                    <p class="text-sm text-zinc-400">Select parameters to generate a signal.</p>
                </div>

                    <div class="space-y-2 relative z-30">
                        <label class="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Asset Pair</label>
                        <div class="flex gap-2">
                            <select id="asset-select" class="flex-1 px-5 py-4 bg-zinc-900/60 border border-white/10 rounded-2xl text-white font-medium text-lg transition-colors shadow-inner outline-none focus:border-white/30 cursor-pointer">
                                <option value="EURUSD">EURUSD</option>
                                <option value="GBPUSD">GBPUSD</option>
                                <option value="USDJPY">USDJPY</option>
                                <option value="AUDUSD">AUDUSD</option>
                                <option value="USDCAD">USDCAD</option>
                                <option value="BTCUSD">BTCUSD</option>
                                <option value="ETHUSD">ETHUSD</option>
                            </select>
                            <button onclick="copyAsset()" class="px-4 py-4 bg-zinc-900/60 border border-white/10 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shadow-inner flex items-center justify-center" title="Copy Asset Name">
                                <i data-lucide="copy" class="w-5 h-5"></i>
                            </button>
                        </div>
                    </div>

                    <div class="space-y-2 relative z-20">
                        <label class="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Strategy</label>
                        <select id="strategy-select" class="w-full px-5 py-4 bg-zinc-900/60 border border-white/10 rounded-2xl text-white font-medium text-lg transition-colors shadow-inner outline-none focus:border-white/30 cursor-pointer">
                            <option value="Auto Select">Auto Select</option>
                            <option value="Price Action">Price Action</option>
                            <option value="MACD + RSI">MACD + RSI</option>
                            <option value="Bollinger Bands">Bollinger Bands</option>
                            <option value="AI Deep Learning">AI Deep Learning</option>
                            <option value="Volume Profile">Volume Profile</option>
                        </select>
                    </div>

                    <div class="space-y-2">
                    <label class="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Timeframe</label>
                    <div class="flex gap-1 p-1 bg-zinc-900/60 rounded-2xl border border-white/10 shadow-inner relative" id="timeframe-container">
                        <div id="timeframe-pill" class="absolute top-1 bottom-1 w-[25%] bg-zinc-800 rounded-xl shadow-md border border-white/10 transition-all duration-300 ease-out left-1"></div>
                        <button onclick="setTimeframe(5, 0)" class="relative z-10 flex-1 py-3 text-sm font-semibold text-white transition-colors tf-btn">5s</button>
                        <button onclick="setTimeframe(10, 1)" class="relative z-10 flex-1 py-3 text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition-colors tf-btn">10s</button>
                        <button onclick="setTimeframe(30, 2)" class="relative z-10 flex-1 py-3 text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition-colors tf-btn">30s</button>
                        <button onclick="setTimeframe(60, 3)" class="relative z-10 flex-1 py-3 text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition-colors tf-btn">60s</button>
                    </div>
                </div>

                <button onclick="startAnalysis()" class="w-full mt-4 relative group overflow-hidden rounded-2xl p-[1px] hover:scale-[1.02] active:scale-[0.98] transition-transform">
                    <span class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-2xl opacity-50"></span>
                    <div class="relative bg-gradient-to-b from-white to-zinc-200 text-black py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                        Generate Signal
                    </div>
                </button>
            </div>

            <!-- STATE 2: ANALYZING -->
            <div id="state-analyzing" class="hidden flex-col items-center justify-center py-10">
                <div class="relative w-32 h-16 flex items-end justify-between gap-1 mb-8 overflow-hidden rounded-sm">
                    <div class="waveform-bar" style="animation-delay: 0.0s"></div>
                    <div class="waveform-bar" style="animation-delay: 0.1s"></div>
                    <div class="waveform-bar" style="animation-delay: 0.2s"></div>
                    <div class="waveform-bar" style="animation-delay: 0.3s"></div>
                    <div class="waveform-bar" style="animation-delay: 0.4s"></div>
                    <div class="waveform-bar" style="animation-delay: 0.5s"></div>
                    <div class="waveform-bar" style="animation-delay: 0.6s"></div>
                    <div class="waveform-bar" style="animation-delay: 0.7s"></div>
                    <div class="waveform-bar" style="animation-delay: 0.8s"></div>
                    <div class="waveform-bar" style="animation-delay: 0.9s"></div>
                    <div class="waveform-bar" style="animation-delay: 1.0s"></div>
                    <div class="waveform-bar" style="animation-delay: 1.1s"></div>
                    <div class="scanner"></div>
                </div>
                <h3 class="text-lg font-medium text-white mb-1 animate-pulse">Analyzing <span id="analyzing-asset">EURUSD</span></h3>
                <p class="text-xs text-zinc-500 uppercase tracking-widest">Processing Market Data</p>
            </div>

            <!-- STATE 3: SIGNAL READY -->
            <div id="state-ready" class="hidden flex-col gap-6">
                <div class="text-center">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-white/10 text-xs font-medium text-zinc-300 mb-6 shadow-lg backdrop-blur-md">
                        <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400"></i>
                        Analysis Complete
                    </span>
                </div>

                <div id="signal-box" class="relative overflow-hidden rounded-3xl p-8 flex flex-col items-center justify-center transition-colors duration-500 border bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)] hover:scale-[1.02] transform transition-transform">
                    <div class="flex items-center gap-4 mb-2 relative z-10">
                        <div id="signal-icon-container">
                            <i data-lucide="trending-up" id="signal-icon" class="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"></i>
                        </div>
                        <span id="signal-text" class="text-6xl font-bold tracking-tight drop-shadow-lg text-emerald-400">CALL</span>
                    </div>
                    
                    <div class="text-zinc-400 font-medium tracking-wide mb-8 relative z-10">
                        <span id="ready-asset">EURUSD</span> • <span id="ready-time">5</span>s
                    </div>

                    <div class="w-full max-w-[240px] relative z-10">
                        <div class="flex justify-between items-end mb-2">
                            <span class="text-xs font-medium text-zinc-400">Confidence Score</span>
                            <span id="confidence-text" class="text-sm font-bold text-white">0%</span>
                        </div>
                        <div class="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                            <div id="confidence-bar" class="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 progress-fill"></div>
                        </div>
                    </div>
                </div>

                <!-- Asset Box -->
                <div class="w-full bg-zinc-900/60 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                  <div class="flex flex-col text-left">
                    <span class="text-xs text-zinc-500 uppercase tracking-wider font-medium">Asset</span>
                    <span id="ready-asset-box" class="text-xl font-bold text-white tracking-wide">EURUSD</span>
                  </div>
                  <button 
                    onclick="copyAssetReady()"
                    class="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-white/5 transition-colors text-zinc-400 hover:text-white"
                    title="Copy Asset Name"
                  >
                    <i data-lucide="copy" class="w-5 h-5"></i>
                  </button>
                </div>

                <!-- Timer Box -->
                <div class="w-full bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-blue-500/20 rounded-lg">
                      <i data-lucide="clock" class="w-5 h-5 text-blue-400 animate-pulse"></i>
                    </div>
                    <span class="text-sm font-medium text-blue-100">Execute trade within</span>
                  </div>
                  <span id="countdown-timer" class="text-2xl font-mono font-bold text-blue-400">01:00</span>
                </div>

                <button onclick="resetApp()" class="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 rounded-2xl text-white font-medium transition-colors shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                    <i data-lucide="refresh-ccw" class="w-4 h-4"></i>
                    New Analysis
                </button>
            </div>
        </div>
    </main>

    <!-- Settings Modal -->
    <div id="settings-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md hidden opacity-0 transition-opacity duration-300">
        <div class="w-full max-w-sm bg-[#0A0A0C] border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden transform scale-95 transition-transform duration-300" id="settings-content">
            <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-white">Settings</h2>
                <button onclick="toggleSettings(false)" class="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all border border-white/5 hover:scale-110 hover:rotate-90">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <div class="space-y-6">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-zinc-400">Gemini API Key</label>
                    <div class="relative">
                        <input type="password" id="gemini-key-input" class="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-4 pr-12 text-white outline-none focus:border-white/30 transition-colors shadow-inner" placeholder="Enter Gemini API Key...">
                        <div class="absolute right-4 top-1/2 -translate-y-1/2">
                            <i data-lucide="key" class="w-4 h-4 text-emerald-400"></i>
                        </div>
                    </div>
                    <p class="text-xs text-zinc-500">Required for AI signal generation.</p>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-zinc-400">PocketOption SSID</label>
                    <div class="relative">
                        <input type="text" id="ssid-input" value="${ssid}" oninput="updatePythonCode()" class="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-4 pr-12 text-white outline-none focus:border-white/30 transition-colors shadow-inner" placeholder="Enter SSID...">
                        <div class="absolute right-4 top-1/2 -translate-y-1/2">
                            <i data-lucide="key" class="w-4 h-4 text-emerald-400"></i>
                        </div>
                    </div>
                    <p class="text-xs text-zinc-500">Required to fetch real-time market data.</p>
                </div>

                <div class="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 space-y-3">
                    <h3 class="text-xs font-semibold text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                        <i data-lucide="terminal" class="w-3.5 h-3.5 text-emerald-400"></i>
                        Python Bot Code
                    </h3>
                    <p class="text-[11px] text-zinc-500 leading-relaxed">
                        Save this code as <code>bot.py</code> and run it locally to execute trades.
                    </p>
                    <textarea id="python-code" class="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-3 text-[10px] font-mono text-emerald-400 outline-none resize-none" readonly></textarea>
                    <button onclick="downloadProject()" class="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-all">
                        <i data-lucide="download" class="w-3.5 h-3.5"></i>
                        Download Full App (HTML)
                    </button>
                </div>
                
                <button onclick="toggleSettings(false)" class="w-full py-4 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] transform">
                    Done
                </button>
            </div>
        </div>
    </div>

    <script>
        // Initialize Icons
        lucide.createIcons();

        function showToast(title, description) {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = \`
                <div class="toast-icon">
                    <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-500"></i>
                </div>
                <div class="toast-content">
                    <div class="toast-title">\${title}</div>
                    <div class="toast-desc">\${description}</div>
                </div>
            \`;
            container.appendChild(toast);
            lucide.createIcons();
            
            setTimeout(() => {
                toast.classList.add('hiding');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3000);
        }

        let currentTimeframe = 5;

        function setTimeframe(val, index) {
            currentTimeframe = val;
            const pill = document.getElementById('timeframe-pill');
            // Calculate left position based on index (4 buttons, so 25% each)
            pill.style.left = \`calc(\${index * 25}% + 4px)\`;
            
            // Update text colors
            const btns = document.querySelectorAll('.tf-btn');
            btns.forEach((btn, i) => {
                if(i === index) {
                    btn.classList.remove('text-zinc-500');
                    btn.classList.add('text-white');
                } else {
                    btn.classList.add('text-zinc-500');
                    btn.classList.remove('text-white');
                }
            });
        }

        function toggleSettings(show) {
            const modal = document.getElementById('settings-modal');
            const content = document.getElementById('settings-content');
            if (show) {
                modal.classList.remove('hidden');
                // Trigger reflow
                void modal.offsetWidth;
                modal.classList.remove('opacity-0');
                content.classList.remove('scale-95');
            } else {
                modal.classList.add('opacity-0');
                content.classList.add('scale-95');
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 300);
            }
        }

        function switchState(hideId, showId) {
            const hideEl = document.getElementById(hideId);
            const showEl = document.getElementById(showId);
            
            hideEl.classList.remove('fade-in');
            hideEl.classList.add('fade-out');
            
            setTimeout(() => {
                hideEl.classList.add('hidden');
                hideEl.classList.remove('flex', 'fade-out');
                
                showEl.classList.remove('hidden');
                showEl.classList.add('flex', 'fade-in');
            }, 300);
        }

        async function startAnalysis(overrideStrategy, isAuto = false) {
            if (!isAuto && isAutoMode) {
                toggleAutoMode(); // Turn off auto mode if manual analysis is started
            }
            clearInterval(countdownInterval);
            
            const asset = document.getElementById('asset-select').value;
            let strategy = document.getElementById('strategy-select').value;
            
            if (overrideStrategy) {
                strategy = overrideStrategy;
            } else if (strategy === 'Auto Select' || isAuto) {
                const strategies = ['Price Action', 'MACD + RSI', 'Bollinger Bands', 'AI Deep Learning', 'Volume Profile'];
                strategy = strategies[Math.floor(Math.random() * strategies.length)];
            }

            document.getElementById('analyzing-asset').innerText = asset + ' (' + strategy + ')';
            document.getElementById('ready-asset').innerText = asset;
            document.getElementById('ready-time').innerText = currentTimeframe;
            
            const isIdle = !document.getElementById('state-idle').classList.contains('hidden');
            
            if (isIdle) {
                switchState('state-idle', 'state-analyzing');
                await new Promise(resolve => {
                    setTimeout(async () => {
                        await generateSignalResult(strategy);
                        switchState('state-analyzing', 'state-ready');
                        resolve();
                    }, 2500);
                });
            } else {
                // Skip analyzing page in auto mode if already running
                await generateSignalResult(strategy);
            }
        }

        async function generateSignalResult(strategy) {
            const apiKey = document.getElementById('gemini-key-input').value;
            const asset = document.getElementById('asset-select').value;
            
            let isCall = Math.random() > 0.5;
            let confidenceBase = 75;
            if (strategy === 'AI Deep Learning') confidenceBase = 85;
            if (strategy === 'MACD + RSI') confidenceBase = 80;
            let confidence = Math.floor(Math.random() * (99 - confidenceBase)) + confidenceBase;

            if (apiKey) {
                try {
                    const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=\${apiKey}\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: \`Act as an expert quantitative day trader. I am analyzing the \${asset} pair on a \${currentTimeframe}s timeframe. Apply the "\${strategy}" trading strategy. Consider current market volatility, micro-trends, and typical price action for this asset. Provide a highly accurate prediction for the next immediate move: CALL (UP) or PUT (DOWN). Only output the JSON.\` }] }],
                            generationConfig: {
                                responseMimeType: "application/json",
                                responseSchema: {
                                    type: "OBJECT",
                                    properties: {
                                        dir: { type: "STRING", description: "Must be 'CALL' or 'PUT'" },
                                        confidence: { type: "NUMBER", description: "Confidence percentage between 60 and 99" }
                                    },
                                    required: ["dir", "confidence"]
                                }
                            }
                        })
                    });
                    
                    if (!response.ok) {
                        if (response.status === 429) throw new Error('429');
                        throw new Error('API Error');
                    }
                    
                    const data = await response.json();
                    const result = JSON.parse(data.candidates[0].content.parts[0].text);
                    isCall = result.dir.toUpperCase() === 'CALL';
                    confidence = result.confidence;
                } catch (error) {
                    if (error.message === '429') {
                        showToast('API Quota Exceeded', 'You have exceeded your Gemini API quota. Using simulated signals for now.');
                    } else {
                        showToast('API Connection Error', 'Failed to connect to AI. Using simulated signals as fallback.');
                    }
                }
            }
            
            const box = document.getElementById('signal-box');
            const text = document.getElementById('signal-text');
            const iconContainer = document.getElementById('signal-icon-container');
            const confText = document.getElementById('confidence-text');
            const confBar = document.getElementById('confidence-bar');
            const bgGlow = document.getElementById('signal-bg-glow');
            
            // Set asset box
            document.getElementById('ready-asset-box').innerText = asset;
            
            // Reset bar
            confBar.style.width = '0%';
            
            if (isCall) {
                text.innerText = 'CALL';
                text.className = 'text-6xl font-bold tracking-tight drop-shadow-lg text-emerald-400';
                box.className = 'relative overflow-hidden rounded-3xl p-8 flex flex-col items-center justify-center transition-colors duration-500 border bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)] hover:scale-[1.02] transform transition-transform';
                iconContainer.innerHTML = '<i data-lucide="trending-up" class="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"></i>';
                confBar.className = 'absolute inset-0 origin-left rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 progress-fill';
                bgGlow.className = 'signal-glow-call';
            } else {
                text.innerText = 'PUT';
                text.className = 'text-6xl font-bold tracking-tight drop-shadow-lg text-rose-400';
                box.className = 'relative overflow-hidden rounded-3xl p-8 flex flex-col items-center justify-center transition-colors duration-500 border bg-rose-500/5 border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.1)] hover:scale-[1.02] transform transition-transform';
                iconContainer.innerHTML = '<i data-lucide="trending-down" class="w-12 h-12 text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]"></i>';
                confBar.className = 'absolute inset-0 origin-left rounded-full bg-gradient-to-r from-rose-600 to-rose-400 progress-fill';
                bgGlow.className = 'signal-glow-put';
            }
            
            lucide.createIcons();
            
            // Animate confidence
            setTimeout(() => {
                confText.innerText = confidence + '%';
                confBar.style.width = confidence + '%';
            }, 500);
            
            startCountdown();
        }

        let countdownInterval = null;
        
        function startCountdown() {
            clearInterval(countdownInterval);
            let timeLeft = 60;
            const timerEl = document.getElementById('countdown-timer');
            
            const updateDisplay = () => {
                const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                const s = (timeLeft % 60).toString().padStart(2, '0');
                timerEl.innerText = m + ':' + s;
            };
            
            updateDisplay();
            countdownInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft < 0) {
                    clearInterval(countdownInterval);
                    timerEl.innerText = '00:00';
                } else {
                    updateDisplay();
                }
            }, 1000);
        }

        function resetApp() {
            document.getElementById('signal-bg-glow').className = '';
            switchState('state-ready', 'state-idle');
            clearInterval(countdownInterval);
            document.getElementById('countdown-timer').innerText = '01:00';
        }

        let isAutoMode = false;
        let autoModeInterval = null;

        function toggleAutoMode() {
            isAutoMode = !isAutoMode;
            const btn = document.getElementById('auto-trade-btn');
            const text = document.getElementById('auto-trade-text');
            
            if (isAutoMode) {
                btn.className = 'hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-inner transition-colors bg-blue-500/20 border-blue-500/50 text-blue-400';
                text.innerText = 'Auto Active';
                
                // Start auto loop
                autoModeLoop();
            } else {
                btn.className = 'hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-inner transition-colors bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800';
                text.innerText = 'Auto Trade';
                clearTimeout(autoModeInterval);
            }
        }

        async function autoModeLoop() {
            if (!isAutoMode) return;
            
            // Randomly select asset
            const assets = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'BTCUSD', 'ETHUSD', 'EURGBP'];
            const randomAsset = assets[Math.floor(Math.random() * assets.length)];
            document.getElementById('asset-select').value = randomAsset;
            
            await startAnalysis(null, true);
            
            // Wait for 60s timer, then loop
            autoModeInterval = setTimeout(() => {
                if (isAutoMode) {
                    autoModeLoop();
                }
            }, 60000); // 60s timer
        }

        function copyAsset() {
            const asset = document.getElementById('asset-select').value;
            navigator.clipboard.writeText(asset);
            // Optional visual feedback
        }

        function copyAssetReady() {
            const asset = document.getElementById('ready-asset-box').innerText;
            navigator.clipboard.writeText(asset);
        }

        function updatePythonCode() {
            const ssidVal = document.getElementById('ssid-input').value;
            const pythonCode = \`import logging
logging.basicConfig(level=logging.DEBUG,format='%(asctime)s %(message)s')

from pocketoptionapi.stable_api import PocketOption
ssid=r"""\${ssidVal}"""
account=PocketOption(ssid)
check_connect,message=account.connect()
if check_connect:
    account.change_balance("PRACTICE")#"REAL"
    asset="EURUSD"
    amount=1
    dir="call"#"call"/"put"
    duration=30#sec
    print("Balance: ",account.get_balance())
    buy_info=account.buy(asset,amount,dir,duration)
    #need this to close the connect
    print("----Trade----")
    print("Get: ",account.check_win(buy_info["id"]))
    print("----Trade----")
    print("Balance: ",account.get_balance())
    #need close ping server thread\`;
            document.getElementById('python-code').value = pythonCode;
        }
        
        // Initialize python code
        updatePythonCode();

        function downloadProject() {
            const htmlContent = document.documentElement.outerHTML;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'axion-ai-app.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'axion-ai-app.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
      }, 1000);
    } else {
      setCountdown(60);
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
    } else if (isAutoMode && appState === 'signal_ready') {
      // Wait for 60 seconds (timer duration), then generate next signal directly
      timeoutId = setTimeout(() => {
        getSignal();
      }, 60000);
    }
    return () => clearTimeout(timeoutId);
  }, [isAutoMode, appState, signal]);

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
    
    try {
      const apiKey = geminiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('No API Key provided');
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as an expert quantitative day trader. I am analyzing the ${currentAsset} pair on a ${duration}s timeframe. 
Apply the "${currentStrategy}" trading strategy. 
Consider current market volatility, micro-trends, and typical price action for this asset.
Provide a highly accurate prediction for the next immediate move: CALL (UP) or PUT (DOWN).
Only output the JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dir: { type: Type.STRING, description: "Must be 'CALL' or 'PUT'" },
              confidence: { type: Type.NUMBER, description: "Confidence percentage between 60 and 99" }
            },
            required: ["dir", "confidence"]
          }
        }
      });
      
      const result = JSON.parse(response.text || "{}");
      setSignal({ dir: result.dir.toUpperCase(), confidence: result.confidence });
      setAppState('signal_ready');
    } catch (error: any) {
      console.error(error);
      
      const errorMessage = error?.message || '';
      if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        toast.error('API Quota Exceeded', {
          description: 'You have exceeded your Gemini API quota. Using simulated signals for now.',
          icon: <AlertTriangle className="w-4 h-4 text-amber-500" />
        });
      } else if (errorMessage.includes('500') || errorMessage.includes('UNKNOWN')) {
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

      let confidenceBase = 75;
      if (currentStrategy === 'AI Deep Learning') confidenceBase = 85;
      if (currentStrategy === 'MACD + RSI') confidenceBase = 80;
      setSignal({ dir: Math.random() > 0.5 ? 'CALL' : 'PUT', confidence: Math.floor(Math.random() * (99 - confidenceBase)) + confidenceBase });
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAutoMode(!isAutoMode)}
            className={`hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-inner transition-colors ${
              isAutoMode 
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                : 'bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">{isAutoMode ? 'Auto Active' : 'Auto Trade'}</span>
          </motion.button>
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
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={getSignal}
                    className="w-full mt-4 relative group overflow-hidden rounded-2xl p-[1px]"
                  >
                    <span className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-2xl opacity-50" />
                    <div className="relative bg-gradient-to-b from-white to-zinc-200 text-black py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                      Generate Signal
                    </div>
                  </motion.button>
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
                    {asset} • {duration}s
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

                {/* Timer Box */}
                <motion.div variants={itemVariants} className="w-full bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
                    </div>
                    <span className="text-sm font-medium text-blue-100">Execute trade within</span>
                  </div>
                  <span className="text-2xl font-mono font-bold text-blue-400">
                    {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
                  </span>
                </motion.div>

                <motion.div variants={itemVariants}>
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
                  <label className="text-sm font-medium text-zinc-400">Gemini API Key</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      id="gemini-key-input-react"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-4 pr-12 text-white outline-none focus:border-white/30 transition-colors shadow-inner"
                      placeholder="Enter Gemini API Key..."
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Key className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">Required for AI signal generation.</p>
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

                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 space-y-3">
                  <h3 className="text-xs font-semibold text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    Python Bot Code
                  </h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Save this code as <code>bot.py</code> and run it locally to execute trades.
                  </p>
                  <textarea 
                    className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-3 text-[10px] font-mono text-emerald-400 outline-none resize-none" 
                    readOnly
                    value={`import logging
logging.basicConfig(level=logging.DEBUG,format='%(asctime)s %(message)s')

from pocketoptionapi.stable_api import PocketOption
ssid=r"""${ssid}"""
account=PocketOption(ssid)
check_connect,message=account.connect()
if check_connect:
    account.change_balance("PRACTICE")#"REAL"
    asset="EURUSD"
    amount=1
    dir="call"#"call"/"put"
    duration=30#sec
    print("Balance: ",account.get_balance())
    buy_info=account.buy(asset,amount,dir,duration)
    #need this to close the connect
    print("----Trade----")
    print("Get: ",account.check_win(buy_info["id"]))
    print("----Trade----")
    print("Balance: ",account.get_balance())
    #need close ping server thread`}
                  />
                  <button
                    onClick={downloadProject}
                    className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Full App (HTML)
                  </button>
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
