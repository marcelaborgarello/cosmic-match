'use client';

import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coins } from 'lucide-react';


export const GameHeader: React.FC = () => {
    const { level, score, combo, coins } = useGameStore();

    const progress = Math.min(100, (score / level.targetCount) * 100);

    return (
        <div className="w-full flex items-center justify-between gap-2 bg-slate-900/50 p-3 rounded-2xl border border-white/10 backdrop-blur-sm relative">

            {/* Currency Badge (Absolute Top-Center-ish or floating?) Let's put it in layout. */}


            {/* Level Badge & Home */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={() => useGameStore.getState().goToMenu()}
                    className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center justify-center bg-purple-600/20 px-3 py-1 rounded-xl border border-purple-500/30">
                        <span className="text-[8px] text-purple-200 uppercase font-bold tracking-widest">Nivel</span>
                        <span className="text-lg font-black text-white">{level.id}</span>
                    </div>

                    {/* Coins Badge (Integrated) */}
                    <div className="flex flex-col items-center justify-center bg-slate-900 px-3 py-1 rounded-xl border border-yellow-500/30 shadow-sm min-w-[50px]">
                        <Coins size={12} className="text-yellow-400 mb-[2px]" />
                        <span className="text-sm font-bold text-yellow-100 leading-none">{coins}</span>
                    </div>
                </div>
            </div>



            {/* Score / Progress */}
            <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between items-end px-1">
                    <span className="text-xs text-slate-400 font-medium">Puntaje</span>
                    <span className="text-lg font-bold text-white tabular-nums tracking-wide">{score} <span className="text-slate-500 text-xs">/ {level.targetCount}</span></span>
                </div>
                {/* Progress Bar */}
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 relative">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', stiffness: 50 }}
                    />
                    {/* Gloss effect */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-full" />
                </div>
            </div>

            {/* Combo Badge (Only show if > 0) */}
            <AnimatePresence>
                {combo > 1 && (
                    <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        className="flex flex-col items-center justify-center bg-orange-500/20 px-3 py-1 rounded-xl border border-orange-500/30 min-w-[60px]"
                    >
                        <div className="text-orange-400 font-black text-xs">COMBO</div>
                        <div className="text-xl font-black text-white animate-pulse">x{combo}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
