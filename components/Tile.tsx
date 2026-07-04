import React from 'react';
import { TileStyle, ThemeColor, formatTileValue } from '../utils/formatters';

interface TileProps {
    value: number;
    index: number;
    rows: number;
    cols: number;
    onClick: () => void;
    isSolved: boolean;
    tileStyle: TileStyle;
    themeColor: ThemeColor;
}

// Deep 3D tactile material design with gradients and complex shadows
const correctTileColors: Record<ThemeColor, string> = {
    indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-[2px_4px_8px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.3),inset_-2px_-2px_6px_rgba(0,0,0,0.3)] border-indigo-800',
    rose: 'bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-[2px_4px_8px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.3),inset_-2px_-2px_6px_rgba(0,0,0,0.3)] border-rose-800',
    emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[2px_4px_8px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.3),inset_-2px_-2px_6px_rgba(0,0,0,0.3)] border-emerald-800',
    amber: 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-[2px_4px_8px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.3),inset_-2px_-2px_6px_rgba(0,0,0,0.3)] border-amber-800',
};

const Tile: React.FC<TileProps> = ({ value, index, rows, cols, onClick, isSolved, tileStyle, themeColor }) => {
    // Calculate current row and column based on index
    const r = Math.floor(index / cols);
    const c = index % cols;

    // Calculate percentage-based position for absolute positioning
    const x = c * 100;
    const y = r * 100;

    // The empty tile (value 0) is not rendered visibly, but takes up space logically
    if (value === 0) {
        return null;
    }

    // Determine if the tile is in its correct solved position
    const correctIndex = value - 1;
    const isCorrectPosition = index === correctIndex;

    // Dynamic font size based on grid density and style to prevent overflow
    const maxDim = Math.max(rows, cols);
    let fontSizeClass = maxDim > 10 ? 'text-xs sm:text-sm' 
                      : maxDim > 6 ? 'text-sm sm:text-base' 
                      : maxDim > 4 ? 'text-lg sm:text-xl' 
                      : 'text-2xl sm:text-3xl md:text-4xl';
                      
    // Roman numerals can get long, so reduce font size slightly if using them
    if (tileStyle === 'roman' && maxDim <= 6) {
        fontSizeClass = maxDim > 4 ? 'text-sm sm:text-base' : 'text-lg sm:text-xl';
    }

    const displayValue = formatTileValue(value, tileStyle);

    return (
        <div
            onClick={onClick}
            className="absolute p-0.5 sm:p-1 cursor-pointer group"
            style={{
                width: `${100 / cols}%`,
                height: `${100 / rows}%`,
                transform: `translate(${x}%, ${y}%)`,
                // Bouncy cubic-bezier for realistic physical movement
                transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                zIndex: value, // Ensure tiles stack correctly during fast moves
            }}
        >
            <div
                className={`
                    relative w-full h-full rounded-md sm:rounded-lg flex items-center justify-center text-center
                    ${fontSizeClass} font-bold animate-tile-drop
                    transition-all duration-200 active:scale-95 active:brightness-90
                    ${isSolved 
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[2px_4px_8px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.3),inset_-2px_-2px_6px_rgba(0,0,0,0.3)] border-emerald-800' 
                        : isCorrectPosition
                            ? correctTileColors[themeColor]
                            : 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 text-slate-800 dark:text-slate-100 shadow-[2px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.2)] dark:shadow-[2px_4px_8px_rgba(0,0,0,0.5),inset_2px_2px_4px_rgba(255,255,255,0.2),inset_-2px_-2px_6px_rgba(0,0,0,0.4)] border-slate-400 dark:border-slate-800 group-hover:brightness-105'
                    }
                    border
                `}
                style={{ animationDelay: `${(r + c) * 30}ms` }}
            >
                {/* Tactile Noise Overlay */}
                <div className="material-texture"></div>
                
                {/* Text Content */}
                <span className="relative z-20 drop-shadow-md">{displayValue}</span>
            </div>
        </div>
    );
};

export default Tile;
