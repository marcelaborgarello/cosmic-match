'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Play, Coins, Map, Settings } from 'lucide-react';
import { useGameSounds } from '@/hooks/useGameSounds';

export const MainMenu: React.FC = () => {
    const { startGame, coins, level } = useGameStore();
    const { initAudio } = useGameSounds();

    const handleStart = () => {
        initAudio(); // Resume context
        startGame();
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full relative p-6">

            {/* Currency Header */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-500/20 shadow-lg">
                <Coins className="text-yellow-400" size={20} />
                <span className="text-xl font-bold text-yellow-100">{coins}</span>
            </div>

            {/* Title Section */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center mb-16"
            >
                <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] text-center tracking-tighter">
                    COSMIC<br />MATCH
                </h1>
                <span className="text-purple-300 tracking-[0.5em] text-sm font-bold mt-4 uppercase">Puzzle Adventure</span>
            </motion.div>

            {/* Main Action */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="group relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.5)] border-4 border-white/20 mb-8"
            >
                <div className="absolute inset-0 rounded-full border border-white/30 animate-[spin_8s_linear_infinite]" />
                <Play className="text-white fill-white translate-x-1" size={40} />

                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/40 animate-ping" />
            </motion.button>
            <span className="text-white/60 font-medium tracking-wide mb-12">NIVEL {level.id}</span>

            {/* Secondary Menu (Village/Map) */}
            <div className="flex gap-4">
                <MenuButton
                    icon={<Play size={24} />} // Changed icon to distinguish
                    label="Colección"
                    onClick={() => useGameStore.getState().goToWorld()}
                />
                <MenuButton icon={<Settings size={24} />} label="Ajustes" disabled />
            </div>


        </div>
    );
};

const MenuButton = ({ icon, label, disabled = false, onClick }: { icon: React.ReactNode, label: string, disabled?: boolean, onClick?: () => void }) => (

    <motion.button
        whileTap={{ scale: 0.95 }}
        disabled={disabled}
        onClick={onClick}
        className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-white/10 backdrop-blur-sm min-w-[80px] ${disabled ? 'opacity-50 grayscale' : 'hover:bg-slate-700/50'}`}
    >

        <div className="text-purple-300">{icon}</div>
        <span className="text-xs font-bold text-slate-400 uppercase">{label}</span>
    </motion.button>
);
