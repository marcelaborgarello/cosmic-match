import { Grid, Cell, CellStatus } from "@/types/game";

// Basic UUID generator for insecure contexts (mobile on local network)
export const safeUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Ensure even number for pairs
// Ensure even number for pairs
export const generateGrid = (count: number = 30, min: number = 1, max: number = 9): Grid => {
    // If count is odd, make it even
    const safeCount = count % 2 === 0 ? count : count + 1;
    const TOTAL_SLOTS = 81; // 9x9 Grid full screen

    return Array.from({ length: TOTAL_SLOTS }, (_, i) => {
        if (i < safeCount) {
            return {
                id: safeUUID(),
                value: Math.floor(Math.random() * (max - min + 1)) + min,
                status: 'active',
                index: i
            };
        } else {
            return {
                id: safeUUID(),
                value: 0, // Placeholder
                status: 'empty',
                index: i
            };
        }
    });
};



export const BOARD_COLS = 9; // Standard for this type of game

// Helper to get row, col from index
export const getCoords = (index: number, cols: number = BOARD_COLS) => {
    return {
        row: Math.floor(index / cols),
        col: index % cols
    };
};

export const getIndex = (row: number, col: number, cols: number = BOARD_COLS) => {
    return row * cols + col;
};

// Check if two cells match (sum 10 or equal values)
export const isMatch = (cell1: Cell, cell2: Cell): boolean => {
    if (cell1.id === cell2.id) return false;
    return (cell1.value === cell2.value) || (cell1.value + cell2.value === 10);
};

// Main connection logic
// This function checks if there is a valid path between index1 and index2
// obeying the rules: adjacent (hor, ver, diag) or line-wrap, skipping cleared cells.
export const isValidConnection = (
    index1: number,
    index2: number,
    grid: Grid,
    cols: number = BOARD_COLS
): boolean => {
    const cell1 = grid[index1];
    const cell2 = grid[index2];

    if (!cell1 || !cell2) return false;
    if (cell1.status !== 'active' || cell2.status !== 'active') return false;
    if (!isMatch(cell1, cell2)) return false;

    // We need to check if they are "neighbors" in the context of the game.
    // "Neighbors" means they are physically adjacent OR separated ONLY by cleared cells
    // in a straight line (Hor, Ver, Diag) OR via line-wrap (end of row -> start of next).

    // Implementation strategy:
    // 1. Check direct adjacency (distance 1 in any valid direction).
    // 2. Check path with skipping logic.

    // Normalize indices: start < end for easier traversal
    const start = Math.min(index1, index2);
    const end = Math.max(index1, index2);

    // 1. Horizontal Check (same row)
    // They must be on the same row if we only walk horizontally (ignoring cleared cols?)
    // Actually, standard logic is: check if they are on the same physical row line, 
    // and all cells BETWEEN them are cleared.
    // OR check if they are effectively adjacent in the 1D list ignoring cleared cells (Line Wrap).

    // Case A: Line Wrap / Immediate Neighbor in 1D array
    // If we traverse from start+1 to end-1 and ALL are cleared, then they connect.
    // This covers: 
    // - Horizontal neighbors (index difference is small)
    // - Line wrap (end of one row connects to start of next if everything between is cleared)
    let areConnected1D = true;
    for (let i = start + 1; i < end; i++) {
        if (grid[i].status !== 'cleared') {
            areConnected1D = false;
            break;
        }
    }
    if (areConnected1D) return true;

    // Case B: Geometric Lines (Vertical, Diagonal)
    // These MUST respect the grid structure. Line wrap des NOT apply to vertical/diagonal usually.

    const coords1 = getCoords(start, cols);
    const coords2 = getCoords(end, cols);

    const dRow = coords2.row - coords1.row;
    const dCol = coords2.col - coords1.col;

    // Vertical: Same Col, different Row
    if (coords1.col === coords2.col) {
        // Check if path is clear
        let blocked = false;
        for (let r = coords1.row + 1; r < coords2.row; r++) {
            const idx = getIndex(r, coords1.col, cols);
            if (grid[idx].status !== 'cleared') {
                blocked = true;
                break;
            }
        }
        if (!blocked) return true;
    }

    // Diagonal: abs(dRow) === abs(dCol)
    if (Math.abs(dRow) === Math.abs(dCol)) {
        const colStep = dCol > 0 ? 1 : -1;
        let blocked = false;
        let c = coords1.col + colStep;
        for (let r = coords1.row + 1; r < coords2.row; r++) {
            const idx = getIndex(r, c, cols);
            if (grid[idx].status !== 'cleared') {
                blocked = true;
                break;
            }
            c += colStep;
        }
        if (!blocked) return true;
    }

    // Secondary Diagonal / "Anti-diagonal" logic is covered by the generic Diagonal check above 
    // because we use Math.abs and calculate direction.

    return false;
};

// Find a valid match hint
export const findHint = (grid: Grid, cols: number = BOARD_COLS): [number, number] | null => {
    const activeIndices = grid
        .filter(c => c.status === 'active')
        .map(c => c.index);

    for (let i = 0; i < activeIndices.length; i++) {
        for (let j = i + 1; j < activeIndices.length; j++) {
            const idx1 = activeIndices[i];
            const idx2 = activeIndices[j];
            if (isValidConnection(idx1, idx2, grid, cols)) {
                return [idx1, idx2];
            }
        }
    }
    return null;
};
