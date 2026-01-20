export type CellStatus = 'active' | 'selected' | 'cleared' | 'hint' | 'clearing';

export interface Building {
    id: string;
    name: string;
    description: string;
    baseCost: number;
    currentStage: number; // 0 = not built
    maxStages: number;
    position: { x: number; y: number }; // Percentage 0-100
    icon: string; // Identificador de icono/asset
    finalImage?: string; // Optional custom image for final stage
    isLocked: boolean;
}

export interface Mascot {
    id: string;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'legendary';
    image: string;
}

export interface World {
    id: string;
    name: string;
    theme: 'park' | 'zoo' | 'countries';
    buildings: Building[];
    isUnlocked: boolean;
}

export interface Cell {

    id: string;
    value: number;
    status: CellStatus;
    // Position index in the 1D grid for easier logic validation
    index: number;
}

export type Grid = Cell[];

export type ObjectiveType = 'score' | 'clear_value' | 'clear_all';

export interface Objective {
    id: string;
    type: ObjectiveType;
    targetValue?: number; // e.g., clear all 5s
    targetCount: number; // e.g., reach 1000 score (count=1000) or clear 5 number 5s (count=5)
    currentCount: number;
    description: string;
}

export interface Level {
    id: number;
    name: string;
    gridSize: number;
    minNumber: number;
    maxNumber: number;
    currentCount: number;
    targetCount: number;
    objectives: Objective[];
}

export interface Mascot {
    id: string;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'legendary';
    image: string;
}

// Initial Mascots
export const AVAILABLE_MASCOTS: Mascot[] = [
    { id: 'm-dog', name: 'Perrito', description: 'Leal y amistoso.', rarity: 'common', image: '/assets/images/mascot_dog.png' },
    { id: 'm-cat', name: 'Gatito', description: 'Elegante y curioso.', rarity: 'common', image: '/assets/images/mascot_cat.png' },
    { id: 'm-robot', name: 'Robo-Bit', description: 'Tecnología del futuro.', rarity: 'rare', image: '/assets/images/mascot_robot.png' },
    { id: 'm-dragon', name: 'Drago', description: 'Una leyenda viviente.', rarity: 'legendary', image: '/assets/images/mascot_dragon.png' },
];

export interface GameState {
    grid: Grid;
    level: Level;
    score: number;
    combo: number;
    history: { grid: Grid; score: number }[]; // For undo functionality
    isGameOver: boolean;
    isVictory: boolean;
}
