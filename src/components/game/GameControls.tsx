'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { RotateCcw, Lightbulb, Plus, Pause } from 'lucide-react';
import clsx from 'clsx';

export const GameControls: React.FC = () => {
    const { undo, getHint, addRows, history, grid, isPaused, togglePause, highlightAddRows, addsCount, coins } = useGameStore();

    // Limit check
    const MAX_ADDS = 10;
    const remainingAdds = Math.max(0, MAX_ADDS - addsCount);

    // Purchase check
    const isOut = remainingAdds === 0;
    const canAfford = coins >= 50;

    const canAddRows = !isPaused && (remainingAdds > 0 || (isOut && canAfford));
    const canUndo = !isPaused && history.length > 0;

    return (
        <div className="flex items-center justify-center gap-4 py-4 px-2">
            <ControlButton
                onClick={undo}
                disabled={!canUndo}
                icon={<RotateCcw size={20} />}
                label="Deshacer"
            />
            <ControlButton
                onClick={getHint}
                icon={<Lightbulb size={20} />}
                label="Pista"
            />
            <ControlButton
                onClick={() => addRows()}
                disabled={!canAddRows}
                icon={isOut && canAfford ? <CoinsIcon size={20} /> : <Plus size={20} />}
                label={isOut ? (canAfford ? "Comprar (50)" : "Sin filas") : `Más filas (${remainingAdds})`}
                className={clsx(
                    highlightAddRows && "animate-bounce ring-4 ring-pink-500/50 rounded-full",
                    isOut && canAfford && "!bg-amber-500 !from-amber-500 !to-orange-500 ring-2 ring-yellow-300"
                )}
            />
        </div>
    );
};

const CoinsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
        <path d="M7 6h1v4" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    </svg>
);

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    label: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ icon, label, className, disabled, ...props }) => {
    return (
        <button
            disabled={disabled}
            className={clsx(
                "flex flex-col items-center gap-1 p-2 transition-all active:scale-90",
                "relative group",
                "disabled:opacity-40 disabled:pointer-events-none disabled:grayscale",
                className
            )}
            {...props}
        >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:from-indigo-400 group-hover:to-purple-500 border border-white/20 text-white">
                {icon}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">{label}</span>
        </button>
    );
};
