'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell } from '@/types/game';
import { clsx } from 'clsx';
import { useGameStore } from '@/store/gameStore';
import { useGameSounds } from '@/hooks/useGameSounds';


interface GameCellProps {

    cell: Cell;
}

const getNumberColor = (num: number) => {
    const colors = [
        'text-cyan-400', // 0 (unused)
        'text-cyan-400', // 1
        'text-green-400', // 2
        'text-emerald-400', // 3
        'text-yellow-400', // 4
        'text-amber-500', // 5
        'text-orange-500', // 6
        'text-rose-500', // 7
        'text-pink-500', // 8
        'text-purple-400', // 9
    ];
    return colors[num] || 'text-white';
};

export const GameCell: React.FC<GameCellProps> = ({ cell }) => {
    const { selectCell, selectedId, hintIds } = useGameStore();
    const { playSelect } = useGameSounds();
    const isSelected = selectedId === cell.id;
    const isHint = hintIds.includes(cell.id);

    const isCleared = cell.status === 'cleared';
    const isClearing = cell.status === 'clearing';
    const isEmpty = cell.status === 'empty';

    const handleClick = () => {
        if (!isCleared && !isClearing && !isEmpty) { // Block interaction
            playSelect();
            selectCell(cell.index);
        }
    };


    return (
        <div className="relative aspect-square flex items-center justify-center p-[2px]">
            <AnimatePresence mode="popLayout">
                {isEmpty ? (
                    <div className="w-full h-full border border-white/5 bg-transparent" />
                ) : !isCleared ? (
                    <motion.button
                        layout
                        layoutId={cell.id}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={
                            isClearing
                                ? {
                                    scaleX: 50, // Massive horizontal expansion
                                    scaleY: 0.1, // Thin line
                                    opacity: 1,
                                    backgroundColor: '#ffffff',
                                    boxShadow: '0 0 40px 20px rgba(255,255,255,0.9)', // Intense glow
                                    color: 'transparent',
                                    borderRadius: 0,
                                    zIndex: 100 // Top of everything
                                }
                                : {
                                    scale: isSelected ? 1.15 : isHint ? 1.1 : 1,
                                    scaleX: 1, // Reset
                                    scaleY: 1, // Reset
                                    borderRadius: '0.375rem', // Reset (rounded-md)
                                    opacity: 1,
                                    backgroundColor: isSelected ? 'var(--color-select-bg)' : isHint ? 'var(--color-hint-bg)' : 'rgba(30, 41, 59, 0.4)',
                                    // Removed color animation to allow class names to take precedence
                                    boxShadow: isSelected
                                        ? '0 0 20px 4px rgba(251, 146, 60, 0.8), inset 0 0 10px rgba(255,255,255,0.5)'
                                        : isHint
                                            ? '0 0 20px 4px rgba(236, 72, 153, 0.8), inset 0 0 10px rgba(255,255,255,0.5)'
                                            : 'none',
                                    zIndex: isSelected || isHint ? 20 : 1
                                }
                        }
                        transition={isClearing ? { duration: 0.4, ease: "easeInOut" } : { type: "spring", stiffness: 300, damping: 20 }}

                        exit={{
                            scale: 2,
                            opacity: 0,
                            filter: "brightness(2) blur(4px)",
                            transition: { duration: 0.3 }
                        }}
                        whileHover={{ scale: 1.1, zIndex: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleClick}
                        className={clsx(
                            "w-full h-full flex items-center justify-center text-3xl font-black transition-colors border touch-manipulation cursor-pointer select-none", // removed rounded-md for gap-0
                            "border-white/40", // High visibility
                            isSelected && "border-orange-400 bg-orange-500/20 z-10",
                            !isSelected && getNumberColor(cell.value)
                        )}
                    >
                        <span className={clsx(
                            "drop-shadow-[0_0_8px_currentColor] filter",
                            isSelected && "drop-shadow-none text-white",
                            "pointer-events-none" // prevent span clicks
                        )}>{cell.value > 0 ? cell.value : ''}</span>
                    </motion.button>
                ) : (
                    <div className="w-full h-full border border-white/10 bg-white/5" />
                )}
            </AnimatePresence>

        </div>
    );
};
