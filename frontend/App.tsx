import React, { useState, useEffect, useCallback } from 'react';
import { Timer, RotateCcw, Settings2, ChevronRight, X, Sun, Moon, Hash, Type, Palette, History } from 'lucide-react';
import Board from './components/Board';
import { shuffleTiles, checkWin, canMove } from './utils/gameLogic';
import { TileStyle, ThemeColor } from './utils/formatters';

const titleGradients: Record<ThemeColor, string> = {
    indigo: 'from-indigo-500 via-purple-500 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400',
    rose: 'from-rose-500 via-pink-500 to-orange-500 dark:from-rose-400 dark:via-pink-400 dark:to-orange-400',
    emerald: 'from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400',
    amber: 'from-amber-500 via-orange-500 to-yellow-500 dark:from-amber-400 dark:via-orange-400 dark:to-yellow-400',
};

const statsThemeClasses: Record<ThemeColor, string> = {
    indigo: 'bg-indigo-50/80 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50',
    rose: 'bg-rose-50/80 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50',
    emerald: 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50',
    amber: 'bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50',
};

const buttonThemeClasses: Record<ThemeColor, string> = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800',
    rose: 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-800',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800',
    amber: 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800',
};

// Improved Web Audio API thud sound for realistic wooden tactile feedback
const playThud = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Triangle wave sounds slightly more "hollow/woody" than sine
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
        
        // Quick drop in volume for a sharp "clack"
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        // Ignore audio errors (e.g., if user hasn't interacted with document yet)
    }
};

const App: React.FC = () => {
    // Game State
    const [gridMode, setGridMode] = useState<string>('4x4');
    const [customRows, setCustomRows] = useState<number>(4);
    const [customCols, setCustomCols] = useState<number>(4);
    
    const [tiles, setTiles] = useState<number[]>([]);
    const [history, setHistory] = useState<number[][]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);
    
    const [isSolved, setIsSolved] = useState<boolean>(false);
    const [timeElapsed, setTimeElapsed] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    
    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
    const [tileStyle, setTileStyle] = useState<TileStyle>('standard');
    const [themeColor, setThemeColor] = useState<ThemeColor>('indigo');

    const activeRows = gridMode === 'custom' ? customRows : parseInt(gridMode.split('x')[0]);
    const activeCols = gridMode === 'custom' ? customCols : parseInt(gridMode.split('x')[1]);

    // Theme Management
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Initialize game
    const initGame = useCallback((r: number, c: number) => {
        const shuffled = shuffleTiles(r, c);
        setTiles(shuffled);
        setHistory([shuffled]);
        setHistoryIndex(0);
        setIsSolved(false);
        setTimeElapsed(0);
        setIsPlaying(false);
    }, []);

    // Initial load and grid size changes
    useEffect(() => {
        initGame(activeRows, activeCols);
    }, [activeRows, activeCols, initGame]);

    // Timer logic
    useEffect(() => {
        let timerId: number;
        if (isPlaying && !isSolved) {
            timerId = window.setInterval(() => {
                setTimeElapsed((prev) => prev + 1);
            }, 1000);
        }
        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [isPlaying, isSolved]);

    const handleTileClick = useCallback((index: number) => {
        if (isSolved) return;

        // Use the current state from history to allow branching if user scrubbed back
        const currentTiles = history[historyIndex];
        const emptyIndex = currentTiles.indexOf(0);
        
        if (canMove(index, emptyIndex, activeRows, activeCols)) {
            if (!isPlaying) setIsPlaying(true);
            
            // Play tactile sound effect
            playThud();

            const newTiles = [...currentTiles];
            [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
            
            // Slice history to current index to support branching (undo -> new move)
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newTiles);
            
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
            setTiles(newTiles);
            
            if (checkWin(newTiles, activeRows, activeCols)) {
                setIsSolved(true);
                setIsPlaying(false);
            }
        }
    }, [history, historyIndex, activeRows, activeCols, isSolved, isPlaying]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleCustomRowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (val > 0) setCustomRows(val);
    };

    const handleCustomColChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (val > 0) setCustomCols(val);
    };

    return (
        <div className="h-full w-full flex flex-col p-3 sm:p-6 box-border max-w-5xl mx-auto relative">
            
            {/* Floating Sidebar Toggle Button */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className={`fixed left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-r-xl shadow-lg border-y border-r border-slate-200 dark:border-slate-700 z-30 transition-transform duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 ${isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}
                title="Open Settings"
            >
                <ChevronRight className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Sidebar Panel (No popup overlay, acts as a drawer) */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <Settings2 className="w-5 h-5" /> Settings
                    </h2>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4 space-y-6 flex-grow overflow-y-auto">
                    {/* Grid Size Option */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                            <Hash className="w-4 h-4" /> Grid Size
                        </label>
                        <select 
                            value={gridMode}
                            onChange={(e) => setGridMode(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors cursor-pointer"
                            disabled={isPlaying && !isSolved}
                        >
                            <option value="2x2">2 x 2</option>
                            <option value="3x3">3 x 3</option>
                            <option value="4x4">4 x 4</option>
                            <option value="5x5">5 x 5</option>
                            <option value="custom">Custom</option>
                        </select>

                        {gridMode === 'custom' && (
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-300 dark:border-slate-700">
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="20" 
                                    value={customRows} 
                                    onChange={handleCustomRowChange}
                                    disabled={isPlaying && !isSolved}
                                    className="w-full bg-transparent text-slate-800 dark:text-slate-200 text-sm text-center outline-none disabled:opacity-50"
                                />
                                <span className="text-slate-400 text-xs font-bold">X</span>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="20" 
                                    value={customCols} 
                                    onChange={handleCustomColChange}
                                    disabled={isPlaying && !isSolved}
                                    className="w-full bg-transparent text-slate-800 dark:text-slate-200 text-sm text-center outline-none disabled:opacity-50"
                                />
                            </div>
                        )}
                    </div>

                    {/* Tile Style Option */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                            <Type className="w-4 h-4" /> Numeral Style
                        </label>
                        <select 
                            value={tileStyle}
                            onChange={(e) => setTileStyle(e.target.value as TileStyle)}
                            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors cursor-pointer"
                        >
                            <option value="standard">Standard (1, 2, 3...)</option>
                            <option value="roman">Roman (I, II, III...)</option>
                            <option value="armenian">Armenian (Ա, Բ, Գ...)</option>
                        </select>
                    </div>

                    {/* Board Style Option */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                            <Palette className="w-4 h-4" /> Board Style
                        </label>
                        <div className="flex gap-3">
                            {(['indigo', 'rose', 'emerald', 'amber'] as ThemeColor[]).map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setThemeColor(color)}
                                    className={`w-8 h-8 rounded-full shadow-sm transition-transform ${themeColor === color ? 'scale-110 ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 dark:ring-offset-slate-900' : 'hover:scale-105'} ${
                                        color === 'indigo' ? 'bg-indigo-500' :
                                        color === 'rose' ? 'bg-rose-500' :
                                        color === 'emerald' ? 'bg-emerald-500' :
                                        'bg-amber-500'
                                    }`}
                                    title={color.charAt(0).toUpperCase() + color.slice(1)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Bar: Theme Toggle */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 shadow-sm backdrop-blur-sm transition-all"
                    title="Toggle Theme"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            {/* Header - Animated with Restart Button */}
            <div className="flex-none flex flex-col items-center justify-center mb-4 animate-slide-down pt-2">
                <div className="flex items-center justify-center gap-3 sm:gap-4">
                    <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${titleGradients[themeColor]} animate-gradient-x pb-1 transition-all duration-500`}>
                        Sliding Puzzle
                    </h1>
                    <button
                        onClick={() => initGame(activeRows, activeCols)}
                        className={`p-2 sm:p-2.5 rounded-full transition-all active:scale-95 shadow-sm ${buttonThemeClasses[themeColor]}`}
                        title="Restart Game"
                    >
                        <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium animate-pulse mt-1">
                    Order the tiles from 1 to {activeRows * activeCols - 1}
                </p>
            </div>

            {/* Stats & Inline Win Message */}
            <div className={`flex-none flex justify-between items-center px-4 py-3 mb-4 rounded-xl border transition-colors duration-500 backdrop-blur-sm ${isSolved ? 'bg-emerald-100/50 dark:bg-emerald-900/20 border-emerald-400/50 dark:border-emerald-500/30' : statsThemeClasses[themeColor]}`}>
                <div className="flex flex-col">
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Moves</span>
                    <span className="text-lg sm:text-xl font-mono font-bold text-slate-700 dark:text-slate-300 leading-none">{historyIndex}</span>
                </div>
                
                <div className="flex-grow flex justify-center items-center px-2">
                    {isSolved ? (
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold text-base sm:text-lg animate-bounce text-center drop-shadow-sm">
                            🎉 Puzzle Solved! 🎉
                        </div>
                    ) : (
                        <div className="text-slate-500 dark:text-slate-500 text-xs sm:text-sm text-center font-medium">
                            {isPlaying ? 'Playing...' : 'Ready'}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                        <Timer className="w-3 h-3" /> Time
                    </span>
                    <span className="text-lg sm:text-xl font-mono font-bold text-slate-700 dark:text-slate-300 leading-none">{formatTime(timeElapsed)}</span>
                </div>
            </div>

            {/* Game Board Container - Takes remaining space without scrolling */}
            <div className="flex-grow min-h-0 w-full flex items-center justify-center overflow-hidden pb-2">
                {tiles.length > 0 && (
                    <Board 
                        tiles={tiles} 
                        rows={activeRows} 
                        cols={activeCols} 
                        onTileClick={handleTileClick} 
                        isSolved={isSolved} 
                        tileStyle={tileStyle}
                        themeColor={themeColor}
                    />
                )}
            </div>

            {/* Replay History Slider */}
            {history.length > 1 && (
                <div className={`flex-none w-full max-w-md mx-auto mt-2 p-3 rounded-xl border transition-colors duration-500 backdrop-blur-sm flex flex-col gap-2 animate-slide-down ${statsThemeClasses[themeColor]}`}>
                    <div className="flex justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1"><History className="w-3 h-3"/> Start</span>
                        <span>Move {historyIndex} / {history.length - 1}</span>
                        <span>Current</span>
                    </div>
                    <input 
                        type="range" 
                        min={0} 
                        max={history.length - 1} 
                        value={historyIndex}
                        onChange={(e) => {
                            const idx = parseInt(e.target.value);
                            setHistoryIndex(idx);
                            setTiles(history[idx]);
                            // Play a softer tick when scrubbing
                            try {
                                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                                if (AudioContext) {
                                    const ctx = new AudioContext();
                                    const osc = ctx.createOscillator();
                                    const gain = ctx.createGain();
                                    osc.connect(gain);
                                    gain.connect(ctx.destination);
                                    osc.frequency.setValueAtTime(400, ctx.currentTime);
                                    gain.gain.setValueAtTime(0.05, ctx.currentTime);
                                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                                    osc.start();
                                    osc.stop(ctx.currentTime + 0.05);
                                }
                            } catch(err) {}
                        }}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-300 dark:bg-slate-700 ${
                            themeColor === 'indigo' ? 'accent-indigo-500' :
                            themeColor === 'rose' ? 'accent-rose-500' :
                            themeColor === 'emerald' ? 'accent-emerald-500' :
                            'accent-amber-500'
                        }`}
                    />
                </div>
            )}

        </div>
    );
};

export default App;
