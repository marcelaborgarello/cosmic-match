'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameCell } from './GameCell';
import { BOARD_COLS } from '@/lib/gameLogic';
import { AnimatePresence } from 'framer-motion';
import { useGameSounds } from '@/hooks/useGameSounds';

export const GameBoard: React.FC = () => {
    const { grid, initGame, score, isLevelComplete, isGameOver } = useGameStore();
    const { playMatch, playLevelUp, playRowClear, playGameOver, initAudio } = useGameSounds();

    // Play sound on score change (implies match)
    const prevScore = React.useRef(score);
    // Track previous clearing cells to detect when clearing starts
    const prevClearingCount = React.useRef(0);

    // Game Over Sound
    useEffect(() => {
        if (isGameOver) {
            playGameOver();
        }
    }, [isGameOver, playGameOver]);


    useEffect(() => {
        const clearingCount = grid.filter(c => c.status === 'clearing').length;
        if (clearingCount > 0 && prevClearingCount.current === 0) {
            playRowClear();
        }
        prevClearingCount.current = clearingCount;
    }, [grid, playRowClear]);

    useEffect(() => {
        if (score > prevScore.current) {
            playMatch();
        }
        prevScore.current = score;
    }, [score, playMatch]);

    useEffect(() => {
        if (isLevelComplete) {
            playLevelUp();
        }
    }, [isLevelComplete, playLevelUp]);


    useEffect(() => {
        initGame();
    }, [initGame]);

    return (
        <div
            className="grid gap-px w-full max-w-[400px] mx-auto content-start border-2 border-white/10 rounded-xl overflow-hidden bg-slate-900/80 shadow-2xl flex-1 h-full min-h-[60vh]"
            onClick={initAudio}
            style={{
                gridTemplateColumns: `repeat(${BOARD_COLS}, minmax(0, 1fr))`,
                backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '20px 20px' // Subtle grid pattern
            }}
        >
            <AnimatePresence mode="popLayout">
                {grid.map((cell) => (
                    <GameCell key={cell.id} cell={cell} />
                ))}
            </AnimatePresence>
        </div>
    );
};
