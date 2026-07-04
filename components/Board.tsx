import React from 'react';
import Tile from './Tile';
import { getSolvedState } from '../utils/gameLogic';
import { TileStyle, ThemeColor } from '../utils/formatters';

interface BoardProps {
    tiles: number[];
    rows: number;
    cols: number;
    onTileClick: (index: number) => void;
    isSolved: boolean;
    tileStyle: TileStyle;
    themeColor: ThemeColor;
}

// Upgraded to look like a recessed physical tray with deep inset shadows
const boardThemeClasses: Record<ThemeColor, string> = {
    indigo: 'bg-indigo-900/10 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-900 shadow-[inset_2px_4px_12px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[inset_2px_4px_16px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.4)]',
    rose: 'bg-rose-900/10 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 shadow-[inset_2px_4px_12px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[inset_2px_4px_16px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.4)]',
    emerald: 'bg-emerald-900/10 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 shadow-[inset_2px_4px_12px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[inset_2px_4px_16px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.4)]',
    amber: 'bg-amber-900/10 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 shadow-[inset_2px_4px_12px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[inset_2px_4px_16px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.4)]',
};

const Board: React.FC<BoardProps> = ({ tiles, rows, cols, onTileClick, isSolved, tileStyle, themeColor }) => {
    // We map over the *solved* state values to ensure each tile has a stable React key
    // based on its value (1 to N-1), rather than its current index.
    const tileValues = getSolvedState(rows, cols).filter(v => v !== 0);

    return (
        <div 
            className={`
                relative rounded-xl p-1 border-2 sm:border-4
                transition-colors duration-500 overflow-hidden
                ${isSolved ? 'bg-emerald-900/10 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-800 shadow-[inset_2px_4px_12px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[inset_2px_4px_16px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.4)]' : boardThemeClasses[themeColor]}
            `}
            style={{
                aspectRatio: `${cols} / ${rows}`,
                maxHeight: '100%',
                maxWidth: '100%',
                // Ensure it scales correctly depending on orientation
                height: cols / rows < 1 ? '100%' : 'auto',
                width: cols / rows >= 1 ? '100%' : 'auto',
            }}
        >
            {/* Tactile Noise Overlay for the Board */}
            <div className="material-texture"></div>

            {tileValues.map((value) => {
                const currentIndex = tiles.indexOf(value);
                return (
                    <Tile
                        key={value}
                        value={value}
                        index={currentIndex}
                        rows={rows}
                        cols={cols}
                        onClick={() => onTileClick(currentIndex)}
                        isSolved={isSolved}
                        tileStyle={tileStyle}
                        themeColor={themeColor}
                    />
                );
            })}
        </div>
    );
};

export default Board;
