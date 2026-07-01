// Generates the solved state array for a given size (e.g., [1, 2, 3, 4, 5, 6, 7, 8, 0] for 3x3)
export const getSolvedState = (rows: number, cols: number): number[] => {
    if (rows * cols <= 1) return [0];
    return [...Array(rows * cols - 1).keys()].map(k => k + 1).concat(0);
};

// Checks if the current state matches the solved state
export const checkWin = (tiles: number[], rows: number, cols: number): boolean => {
    const solved = getSolvedState(rows, cols);
    return tiles.every((val, index) => val === solved[index]);
};

// Shuffles the board by making random valid moves from the solved state.
// This guarantees the resulting puzzle is always solvable.
export const shuffleTiles = (rows: number, cols: number, walkLength = 150): number[] => {
    if (rows * cols <= 1) return [0];
    
    let state = getSolvedState(rows, cols);
    const solvedStr = state.join(',');
    let emptyIdx = state.length - 1;

    // Scale walk length based on board size to ensure thorough shuffling
    const actualWalkLength = Math.floor(walkLength * (rows * cols) / 9);

    do {
        for (let i = 0; i < actualWalkLength; i++) {
            const neighbors = [];
            const r = Math.floor(emptyIdx / cols);
            const c = emptyIdx % cols;
            
            // Find valid adjacent positions for the empty tile
            if (r > 0) neighbors.push(emptyIdx - cols); // Up
            if (r < rows - 1) neighbors.push(emptyIdx + cols); // Down
            if (c > 0) neighbors.push(emptyIdx - 1); // Left
            if (c < cols - 1) neighbors.push(emptyIdx + 1); // Right

            // Pick a random neighbor and swap
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            [state[emptyIdx], state[randomNeighbor]] = [state[randomNeighbor], state[emptyIdx]];
            emptyIdx = randomNeighbor;
        }
    } while (state.join(',') === solvedStr && rows * cols > 2); // Ensure we don't accidentally return a solved board

    return state;
};

// Checks if a tile at a given index can move to the empty space
export const canMove = (index: number, emptyIndex: number, rows: number, cols: number): boolean => {
    const r1 = Math.floor(index / cols);
    const c1 = index % cols;
    const r2 = Math.floor(emptyIndex / cols);
    const c2 = emptyIndex % cols;

    return (
        (r1 === r2 && Math.abs(c1 - c2) === 1) ||
        (c1 === c2 && Math.abs(r1 - r2) === 1)
    );
};
