import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, Grid, World, Building } from '@/types/game';


import { generateGrid, isValidConnection, findHint, getCoords, BOARD_COLS, safeUUID } from '@/lib/gameLogic';

interface GameActions {
    initGame: () => void;
    selectCell: (index: number) => void;
    checkLevelComplete: () => void;
    undo: () => void;
    addRows: (auto?: boolean) => void;
    getHint: () => void;
    togglePause: () => void;
    restartLevel: () => void;
    nextLevel: () => void;
    finalizeRemoval: (rowsToRemove: number[]) => void;
}

interface GameStore extends GameState, GameActions {
    selectedId: string | null;
    isPaused: boolean;
    isLevelComplete: boolean;
    hintIds: string[];
    highlightAddRows: boolean;
    addsCount: number;
    // Phase 2: Navigation & Economy
    // World & Economy
    currentScreen: 'MENU' | 'GAME' | 'MAP';
    coins: number;
    worlds: World[];
    activeWorldId: string;
    // Collection
    inventory: string[]; // List of unlocked mascot IDs
    equippedMascotId: string | null;
    unlockMascot: () => string | null; // Returns the ID of unlocked mascot or null if fail
    equipMascot: (id: string) => void;

    goToMenu: () => void;
    startGame: () => void;
    goToWorld: () => void;
    buildBuilding: (worldId: string, buildingId: string) => void;
}




export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({

            grid: [],
            level: {
                id: 1,
                name: "Nivel 1",
                targetCount: 1000, // Reduced from 1500
                currentCount: 0,
                objectives: [],

                gridSize: 27,
                minNumber: 1,
                maxNumber: 9
            },
            score: 0,
            combo: 0,
            history: [],
            isGameOver: false,
            isVictory: false,
            isLevelComplete: false,
            isPaused: false,
            selectedId: null,
            hintIds: [],
            highlightAddRows: false,
            addsCount: 0,
            currentScreen: 'MENU',
            coins: 5000,
            activeWorldId: 'world-1',
            worlds: [
                {
                    id: 'world-1',
                    name: 'Parque Urbano',
                    theme: 'park',
                    isUnlocked: true,
                    buildings: [
                        { id: 'b-fountain', name: 'Fuente Central', description: 'El corazón del parque.', baseCost: 150, currentStage: 0, maxStages: 3, position: { x: 50, y: 50 }, icon: 'fountain', finalImage: '/assets/images/fountain_final.png', isLocked: false },
                        { id: 'b-bench', name: 'Banco de Plaza', description: 'Para descansar.', baseCost: 50, currentStage: 0, maxStages: 2, position: { x: 20, y: 70 }, icon: 'armchair', isLocked: false },
                        { id: 'b-icecream', name: 'Puesto de Helados', description: '¡Delicioso!', baseCost: 300, currentStage: 0, maxStages: 3, position: { x: 80, y: 60 }, icon: 'ice-cream', finalImage: '/assets/images/icecream_final.png', isLocked: false },
                        { id: 'b-playground', name: 'Juegos', description: 'Diversión para todos.', baseCost: 500, currentStage: 0, maxStages: 3, position: { x: 30, y: 30 }, icon: 'rocking-horse', finalImage: '/assets/images/playground_final.png', isLocked: false },
                        { id: 'b-trees', name: 'Árboles', description: 'Naturaleza.', baseCost: 25, currentStage: 0, maxStages: 1, position: { x: 70, y: 20 }, icon: 'trees', isLocked: false },
                    ]
                }
            ],

            // Collection Init
            inventory: [],
            equippedMascotId: null,

            // Navigation Actions
            goToMenu: () => set({ currentScreen: 'MENU', isPaused: true }),
            goToWorld: () => set({ currentScreen: 'MAP', isPaused: true }),

            buildBuilding: (worldId: string, buildingId: string) => {
                const state = get();
                const worldIndex = state.worlds.findIndex(w => w.id === worldId);
                if (worldIndex === -1) return;

                const world = state.worlds[worldIndex];
                const buildingIndex = world.buildings.findIndex(b => b.id === buildingId);
                if (buildingIndex === -1) return;

                const building = world.buildings[buildingIndex];

                // Check cost
                // Cost formula: baseCost * (currentStage + 1)
                const cost = building.baseCost * (building.currentStage + 1);

                if (state.coins >= cost && building.currentStage < building.maxStages) {
                    // Purchase
                    const newBuildings = [...world.buildings];
                    newBuildings[buildingIndex] = {
                        ...building,
                        currentStage: building.currentStage + 1
                    };

                    const newWorlds = [...state.worlds];
                    newWorlds[worldIndex] = { ...world, buildings: newBuildings };

                    set({
                        coins: state.coins - cost,
                        worlds: newWorlds
                    });

                    // TODO: Play construction sound here?
                }
            },



            // Collection Actions
            unlockMascot: () => {
                const { coins, inventory } = get();

                // Gacha Logic

                const cost = 100;
                if (coins < cost) return null;

                // Simple logic: Pick a random ID from known ones
                const allIds = ['m-dog', 'm-cat', 'm-robot', 'm-dragon'];
                const unowned = allIds.filter(id => !inventory.includes(id));

                let pickedId = null;
                if (unowned.length > 0) {
                    pickedId = unowned[Math.floor(Math.random() * unowned.length)];
                } else {
                    pickedId = allIds[Math.floor(Math.random() * allIds.length)];
                }

                if (pickedId && !inventory.includes(pickedId)) {
                    set({
                        coins: coins - cost,
                        inventory: [...inventory, pickedId]
                    });
                } else {
                    set({ coins: coins - cost });
                }

                return pickedId;
            },

            equipMascot: (id: string) => set({ equippedMascotId: id }),

            startGame: () => {

                const state = get();

                // Dev Migration: Ensure user has coins for testing
                if (state.coins < 5000) {
                    set({ coins: 5000 });
                }

                // Only init if not already playing or resuming? 
                // For now, new game every time we hit play from menu? 
                // Or Resume? Let's assume Resume if grid exists, else Init.
                const { grid } = get();
                if (grid.length === 0) {
                    get().initGame();
                }
                set({ currentScreen: 'GAME', isPaused: false });
            },


            initGame: () => {


                const { level } = get();
                const newGrid = generateGrid(level.gridSize || 27, level.minNumber, level.maxNumber);
                set({
                    grid: newGrid,
                    score: 0,
                    combo: 0,
                    selectedId: null,
                    isVictory: false,
                    isGameOver: false,
                    isLevelComplete: false,
                    isPaused: false,
                    history: [],
                    hintIds: [],
                    highlightAddRows: false
                });
            },

            selectCell: (index: number) => {
                const { grid, selectedId, score, combo, isPaused } = get();
                if (isPaused) return;

                const clickedCell = grid[index];
                if (!clickedCell || clickedCell.status !== 'active') return;

                // Deselect
                if (selectedId === clickedCell.id) {
                    set({ selectedId: null });
                    return;
                }

                if (!selectedId) {
                    set({ selectedId: clickedCell.id, hintIds: [] });
                    return;
                }

                const selectedIndex = grid.findIndex(c => c.id === selectedId);
                if (selectedIndex === -1) {
                    set({ selectedId: clickedCell.id });
                    return;
                }

                const selectedCell = grid[selectedIndex];

                if (isValidConnection(selectedIndex, index, grid)) {
                    // Valid Match
                    const currentHistory = get().history;
                    const historyState = { grid: [...grid], score };
                    const newHistory = [...currentHistory, historyState];
                    if (newHistory.length > 20) newHistory.shift();

                    let newGrid = [...grid];
                    newGrid[selectedIndex] = { ...newGrid[selectedIndex], status: 'cleared' };
                    newGrid[index] = { ...newGrid[index], status: 'cleared' };

                    const points = (selectedCell.value + clickedCell.value) * (1 + combo * 0.1);

                    // MOTIVATION: Coins per match!
                    // Simple formula: 1 Coin per 10 points, min 1.
                    const coinsEarned = Math.max(1, Math.floor(points / 5));

                    // Update state properly
                    // We need to get current coins first
                    const currentCoins = get().coins;

                    // Check for empty rows to remove
                    const rowsToRemove: number[] = [];
                    const totalRows = Math.ceil(newGrid.length / BOARD_COLS);

                    // Identify empty rows
                    for (let r = 0; r < totalRows; r++) {
                        const start = r * BOARD_COLS;
                        let isRowEmpty = true;
                        // Check all cells in this row (up to grid length)
                        for (let c = 0; c < BOARD_COLS; c++) {
                            if (start + c >= newGrid.length) break; // End of grid
                            if (newGrid[start + c].status !== 'cleared') {
                                isRowEmpty = false;
                                break;
                            }
                        }
                        if (isRowEmpty) {
                            rowsToRemove.push(r);
                        }
                    }

                    // If rows to remove -> Animation Phase
                    if (rowsToRemove.length > 0) {
                        // Mark cells as clearing
                        rowsToRemove.forEach(r => {
                            const start = r * BOARD_COLS;
                            for (let c = 0; c < BOARD_COLS; c++) {
                                if (start + c < newGrid.length) {
                                    newGrid[start + c] = { ...newGrid[start + c], status: 'clearing' };
                                }
                            }
                        });

                        set({
                            grid: newGrid,
                            score: Math.floor(score + points),
                            coins: currentCoins + coinsEarned, // Add coins
                            selectedId: null,
                            combo: combo + 1,
                            history: newHistory,
                            hintIds: [],
                            highlightAddRows: false
                        });

                        // Delay removal
                        setTimeout(() => {
                            get().finalizeRemoval(rowsToRemove);
                        }, 600);
                    } else {
                        // Instant Update (No rows cleared)
                        set({
                            grid: newGrid,
                            score: Math.floor(score + points),
                            coins: currentCoins + coinsEarned, // Add coins
                            selectedId: null,
                            combo: combo + 1,
                            history: newHistory,
                            hintIds: [],
                            highlightAddRows: false
                        });

                        const currentLevel = get().level;
                        if ((score + points) >= currentLevel.targetCount) {
                            set({ isLevelComplete: true });
                        }
                    }

                } else {
                    set({ selectedId: clickedCell.id, combo: 0, hintIds: [] });
                }
            },

            finalizeRemoval: (rowsToRemove: number[]) => {
                // Actually remove the rows
                const { grid } = get();
                const totalRows = Math.ceil(grid.length / BOARD_COLS);
                const finalGrid: Grid = [];

                for (let r = 0; r < totalRows; r++) {
                    const rowStart = r * BOARD_COLS;
                    const rowEnd = rowStart + BOARD_COLS;
                    if (!rowsToRemove.includes(r)) {
                        finalGrid.push(...grid.slice(rowStart, Math.min(rowEnd, grid.length)));
                    }
                }

                const newGrid = finalGrid.map((c, i) => ({ ...c, index: i }));

                // Logic Check (Win/Level)
                const { score, level, isLevelComplete } = get();

                // Respawn if empty
                const activeCells = newGrid.filter(c => c.status === 'active');
                if (activeCells.length === 0 && !isLevelComplete && score < level.targetCount) {
                    // Generate fresh rows if board is empty but level not done
                    get().addRows(true); // Will handle generation
                    return;
                }


                if (score >= level.targetCount) {
                    set({ isLevelComplete: true });
                }

                // Check Win (Clear All condition - though we respawn... so this is tricky. 
                // If targetCount reached, level complete takes precedence.
                // If cleared all but target NOT reached, we respawned above.
                // So mostly we just update grid here.

                set({ grid: newGrid });
            },

            checkLevelComplete: () => { },

            undo: () => {
                const { history, isPaused } = get();
                if (isPaused || history.length === 0) return;

                const previousState = history[history.length - 1];
                const newHistory = history.slice(0, -1);

                set({
                    grid: previousState.grid,
                    score: previousState.score,
                    history: newHistory,
                    selectedId: null,
                    combo: 0,
                    hintIds: [],
                    highlightAddRows: false
                });
            },

            addRows: (auto = false) => {
                const { grid, isPaused, addsCount, level } = get();
                if (isPaused) return;

                // MAX ADDS LIMIT (Difficulty)
                const MAX_ADDS = 10; // Increased from 5

                // If grid is NOT empty (manual add), check limit

                const activeCells = grid.filter(c => c.status === 'active');
                const isEmpty = activeCells.length === 0;

                if (!isEmpty && addsCount >= MAX_ADDS) {
                    // Cannot add more -> Check if game over? 
                    // Usually Game Over is when no moves AND cannot add.
                    // We just return here, getHint will handle the GameOver trigger if no moves.
                    return;
                }

                if (grid.length >= 200) { // Hard cap for size
                    set({ isGameOver: true });
                    return;
                }

                // If empty grid, we do a FULL RESET of the grid (Respawn)
                // This fixes the visual glitch of "ni cuadrículas"
                if (isEmpty) {
                    const newGrid = generateGrid(level.gridSize || 27, level.minNumber, level.maxNumber);

                    // Respawn might cost a life/add too? User said: "llegue un punto que si no logró el objetivo, ya no pueda agregar"
                    // Let's make Respawn cost an add too to be strict.
                    set({
                        grid: newGrid,
                        selectedId: null,
                        addsCount: addsCount + 1,
                        history: [], // Clear history on respawn to avoid weird undos
                        hintIds: [],
                        highlightAddRows: false
                    });
                    return;
                }

                // Normal Add Rows logic
                const newCells = activeCells.map(c => ({
                    ...c,
                    id: safeUUID(),
                    status: 'active' as const,
                    index: 0
                }));

                const currentGrid = [...grid];
                const combinedGrid = [...currentGrid, ...newCells];
                const reIndexedGrid = combinedGrid.map((c, i) => ({ ...c, index: i }));

                const currentHistory = get().history;
                const historyState = { grid: [...grid], score: get().score };

                set({
                    grid: reIndexedGrid,
                    selectedId: null,
                    history: [...currentHistory, historyState],
                    addsCount: addsCount + 1,
                    hintIds: [],
                    highlightAddRows: false
                });
            },

            getHint: () => {
                const { grid, isPaused, addsCount } = get();
                if (isPaused) return;

                const MAX_ADDS = 10;

                const hint = findHint(grid);
                if (hint) {
                    const id1 = grid[hint[0]].id;
                    const id2 = grid[hint[1]].id;
                    set({ hintIds: [id1, id2], highlightAddRows: false });
                } else {
                    // No matches found

                    // Check if can add rows
                    if (addsCount >= MAX_ADDS) {
                        set({ isGameOver: true });
                    } else {
                        set({ hintIds: [], highlightAddRows: true });
                        setTimeout(() => {
                            set({ highlightAddRows: false });
                        }, 2000);
                    }
                }
            },

            togglePause: () => {
                set(state => ({ isPaused: !state.isPaused }));
            },

            restartLevel: () => {
                get().initGame();
            },

            nextLevel: () => {
                const state = get();
                const nextLevelId = state.level.id + 1;
                const nextGridSize = Math.min(81, 27 + Math.floor(nextLevelId / 2) * 9);

                // Calculate Rewards
                const MAX_ADDS = 10;
                const remainingLives = Math.max(0, MAX_ADDS - state.addsCount);
                const baseReward = 100;
                const bonusReward = remainingLives * 10;
                const totalReward = baseReward + bonusReward;

                set({
                    coins: state.coins + totalReward, // Award coins
                    level: {
                        ...state.level,
                        id: nextLevelId,
                        gridSize: nextGridSize,
                        currentCount: 0,
                        targetCount: Math.floor(state.level.targetCount * 1.5), // Score scales up
                        maxNumber: Math.min(9, 9 + Math.floor(nextLevelId / 10))
                    },
                    grid: generateGrid(nextGridSize, state.level.minNumber, state.level.maxNumber),
                    isVictory: false,
                    isLevelComplete: false,
                    selectedId: null,
                    history: [],
                    hintIds: [],
                    highlightAddRows: false,
                    addsCount: 0 // Reset lives for next level
                });
            },


            // Actions that don't need distinct implementation but are part of interface
            // checkLevelComplete is already defined above
        }),
        {
            name: 'cosmic-match-storage-v2', // Unique name
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist essential data
                coins: state.coins,
                level: state.level,
                worlds: state.worlds, // Persist world progress
                activeWorldId: state.activeWorldId,
                inventory: state.inventory,
                equippedMascotId: state.equippedMascotId
                // currentScreen? Maybe let it reset to MENU

                // grid? Maybe persist grid to resume game?
                // For now let's persist coins and level progression (ID)
            }),
        }
    ));
