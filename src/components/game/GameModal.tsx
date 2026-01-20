'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Play, RotateCcw, Home, Coins } from 'lucide-react';


export const GameModal: React.FC = () => {
    const { isPaused, isGameOver, isLevelComplete, togglePause, restartLevel, level, score } = useGameStore();

    // Show if paused or game over
    const isVisible = isPaused || isGameOver || isLevelComplete;

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="w-full max-w-sm bg-slate-900/90 rounded-3xl p-8 shadow-2xl border border-white/10 text-center relative overflow-hidden"
                    >
                        {/* Background glow effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />

                        <h2 className="text-3xl font-black mb-2 text-white relative z-10">
                            {isGameOver ? "¡Juego Terminado!" : isLevelComplete ? "¡Nivel Completado!" : "Pausa"}
                        </h2>

                        {isLevelComplete && (
                            <div className="my-6 space-y-2 relative z-10">
                                <div className="text-6xl mb-4">⭐</div>
                                <p className="text-purple-200">¡Puntaje: <span className="text-white font-bold">{score}</span>!</p>

                                {/* Coin Reward Display */}
                                <div className="flex items-center justify-center gap-2 mt-4 bg-yellow-400/10 py-2 rounded-xl border border-yellow-400/30">
                                    <div className="flex flex-col">
                                        <span className="text-yellow-200 text-xs font-bold uppercase tracking-widest">Recompensa</span>
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="text-2xl font-black text-yellow-400">
                                                +{100 + (Math.max(0, 10 - useGameStore.getState().addsCount) * 10)}
                                            </span>
                                            <Coins size={20} className="text-yellow-400 fill-yellow-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}



                        <p className="text-slate-400 mb-8 relative z-10">
                            {isGameOver ? "No quedan movimientos posibles." : isLevelComplete ? "¿Listo para el siguiente desafío?" : "El juego está en pausa."}
                        </p>

                        <div className="space-y-3 relative z-10">
                            {isLevelComplete ? (
                                <div className="flex gap-4 w-full">
                                    <button
                                        onClick={useGameStore.getState().nextLevel}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                                    >
                                        Siguiente Nivel 🚀
                                    </button>

                                    <button
                                        onClick={() => useGameStore.getState().goToMenu()}
                                        className="px-4 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold border border-white/10 hover:bg-slate-700 active:scale-95 transition-colors"
                                    >
                                        <Home size={20} className="inline-block mr-1" /> Menú
                                    </button>
                                </div>
                            ) : (
                                !isGameOver && (
                                    <button
                                        onClick={togglePause}
                                        className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold border border-white/5 active:scale-95 transition-all"
                                    >
                                        <Play size={20} fill="currentColor" className="inline-block mr-2" />
                                        Reanudar
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => {
                                    restartLevel();
                                    if (isPaused) togglePause();
                                }}
                                className="w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <RotateCcw size={20} />
                                Reiniciar Nivel
                            </button>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
