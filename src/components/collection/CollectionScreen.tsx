import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { ArrowLeft, Coins, Lock, Star, Sparkles, Check } from 'lucide-react';
import { AVAILABLE_MASCOTS, Mascot } from '@/types/game';
import clsx from 'clsx';
// import Sound Hook later

export const CollectionScreen: React.FC = () => {
    const {
        coins,
        goToMenu,
        inventory,
        unlockMascot,
        equipMascot,
        equippedMascotId
    } = useGameStore();

    const [isOpening, setIsOpening] = useState(false);
    const [rewardMascot, setRewardMascot] = useState<Mascot | null>(null);

    const handleSummon = () => {
        if (coins < 100) return;

        setIsOpening(true);
        // Delay for suspense
        setTimeout(() => {
            const id = unlockMascot();
            if (id) {
                const mac = AVAILABLE_MASCOTS.find(m => m.id === id);
                setRewardMascot(mac || null);
            }
        }, 2000);
    };

    const closeReward = () => {
        setIsOpening(false);
        setRewardMascot(null);
    };

    return (
        <div className="w-full h-full relative bg-indigo-900 overflow-hidden flex flex-col font-sans select-none">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent scale-[2] pointer-events-none" />

            {/* Header / Stats */}
            <div className="flex justify-between items-center w-full mb-8 relative z-10">
                <button
                    onClick={goToMenu}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white/20 transition-all"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-5 py-2 rounded-full border border-amber-500/30">
                    <Coins className="text-amber-400" size={20} />
                    <span className="text-xl font-bold text-amber-100">{coins}</span>
                </div>
            </div>

            {/* Title */}
            <div className="z-10 px-6 mb-4">
                <h1 className="text-3xl font-black text-white tracking-tight">Mi Colección</h1>
                <p className="text-indigo-300 text-sm">¡Colecciónalos a todos!</p>
            </div>

            {/* Grid */}
            <div className="z-10 flex-1 overflow-y-auto px-6 pb-24">
                <div className="grid grid-cols-2 gap-4">
                    {AVAILABLE_MASCOTS.map((mascot) => {
                        const isOwned = inventory.includes(mascot.id);
                        const isEquipped = equippedMascotId === mascot.id;

                        return (
                            <motion.div
                                key={mascot.id}
                                whileHover={{ scale: isOwned ? 1.05 : 1 }}
                                whileTap={{ scale: isOwned ? 0.95 : 1 }}
                                onClick={() => isOwned && equipMascot(mascot.id)}
                                className={clsx(
                                    "relative aspect-square rounded-3xl p-3 flex flex-col items-center justify-center transition-all border-2",
                                    isOwned ? "bg-white border-white shadow-xl" : "bg-white/5 border-white/10",
                                    isEquipped && "ring-4 ring-yellow-400 ring-offset-4 ring-offset-indigo-900"
                                )}
                            >
                                <div className={clsx(
                                    "w-24 h-24 rounded-full overflow-hidden mb-2 relative",
                                    !isOwned && "grayscale opacity-20"
                                )}>
                                    <img
                                        src={mascot.image}
                                        alt={mascot.name}
                                        className="w-full h-full object-cover mix-blend-multiply"
                                    />
                                </div>

                                <div className="text-center">
                                    <div className="font-bold text-slate-900 leading-tight">
                                        {isOwned ? mascot.name : "???"}
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1">
                                        {mascot.rarity}
                                    </div>
                                </div>

                                {isEquipped && (
                                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 rounded-full p-1 shadow-sm">
                                        <Check size={14} strokeWidth={4} />
                                    </div>
                                )}

                                {!isOwned && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Lock size={32} className="text-white/20" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Summon Button (Footer) */}
            <div className="absolute bottom-6 w-full px-6 z-20 flex justify-center">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSummon}
                    disabled={isOpening}
                    className="w-full max-w-sm bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-2xl font-bold shadow-2xl border-t border-white/20 flex items-center justify-center gap-3 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                    <Sparkles size={24} className="animate-spin-slow" />
                    <div className="flex flex-col items-start leading-none relative z-10">
                        <span className="text-xs uppercase opacity-90">Huevo Sorpresa</span>
                        <span className="text-xl">Invocar (100)</span>
                    </div>
                </motion.button>
            </div>

            {/* Summon Animation Overlay */}
            <AnimatePresence>
                {(isOpening || rewardMascot) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                        onClick={rewardMascot ? closeReward : undefined}
                    >
                        {!rewardMascot ? (
                            <motion.div
                                animate={{
                                    rotate: [0, -10, 10, -10, 10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="relative w-64 h-64 rounded-full p-8" // Removed container bg
                            >
                                <img src="/assets/images/mascot_egg.png" className="w-full h-full object-contain drop-shadow-xl mix-blend-multiply" />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="bg-white rounded-[40px] p-8 flex flex-col items-center text-center max-w-sm w-full shadow-[0_0_100px_rgba(255,255,255,0.3)]"
                            >
                                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4 animate-bounce">
                                    ¡NUEVA MASCOTA!
                                </div>

                                <div className="w-48 h-48 bg-slate-100 rounded-full mb-6 p-2 border-4 border-yellow-400 border-dashed">
                                    <img src={rewardMascot.image} className="w-full h-full object-contain" />
                                </div>

                                <h2 className="text-3xl font-bold text-slate-800 mb-2">{rewardMascot.name}</h2>
                                <p className="text-slate-500 mb-6">{rewardMascot.description}</p>

                                <button
                                    onClick={closeReward}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                                >
                                    ¡Genial!
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
