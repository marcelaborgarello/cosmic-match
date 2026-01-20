'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { ArrowLeft, Coins, Hammer, Lock, CheckCircle, Trees, Waves, Armchair, IceCream, Gamepad2, Construction } from 'lucide-react';
import { Building } from '@/types/game';
import clsx from 'clsx';
import { useGameSounds } from '@/hooks/useGameSounds';

// Icon mapper
const IconMap: Record<string, React.ReactNode> = {
    'fountain': <Waves size={24} />,
    'armchair': <Armchair size={24} />,
    'ice-cream': <IceCream size={24} />,
    'rocking-horse': <Gamepad2 size={24} />,
    'trees': <Trees size={24} />,
    'default': <Construction size={24} />
};

export const WorldScreen: React.FC = () => {
    const { worlds, activeWorldId, coins, goToMenu, buildBuilding } = useGameStore();
    const { playSelect, playLevelUp } = useGameSounds(); // Reuse sounds for now

    // Find active world
    const world = worlds.find(w => w.id === activeWorldId) || worlds[0];

    return (
        <div className="w-full h-full relative bg-[#4ade80] overflow-hidden flex flex-col font-sans select-none">

            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20 pointer-events-none">

                {/* Back Button */}
                <button
                    onClick={goToMenu}
                    className="pointer-events-auto p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-all shadow-lg active:scale-95"
                >
                    <ArrowLeft size={24} />
                </button>

                {/* World Title & Coins */}
                <div className="flex flex-col items-end gap-2">
                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
                        <h1 className="text-white font-black uppercase tracking-widest text-xs drop-shadow-md">{world.name}</h1>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-yellow-500/30 shadow-xl">
                        <Coins className="text-yellow-400" size={18} />
                        <span className="text-lg font-bold text-yellow-100">{coins}</span>
                        {/* Cheat Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); useGameStore.getState().cheatAddCoins(); }}
                            className="ml-2 w-6 h-6 flex items-center justify-center bg-green-500 rounded-full text-white font-bold text-xs hover:bg-green-400 shadow-md"
                            title="Dame Monedas"
                        >
                            +
                        </button>
                    </div>
                </div>

            </div>

            {/* World Area (Canvas) */}
            <div className="flex-1 relative w-full h-full overflow-hidden">

                {/* Grass Texture Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/ag-square.png')]" />

                {/* Water Feature (Pond) */}
                <div className="absolute top-[15%] right-[-10%] w-64 h-64 bg-blue-400 rounded-full blur-xl opacity-80" />
                <div className="absolute top-[20%] right-[-5%] w-40 h-40 bg-blue-300 rounded-full blur-md opacity-90 animate-pulse" />

                {/* Park Path (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Path Border */}
                    <path
                        d="M 50,110 C 50,80 20,80 20,60 C 20,40 80,40 80,20 C 80,10 50,0 50,-10"
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="18"
                        strokeLinecap="round"
                    />
                    {/* Path Inner */}
                    <path
                        d="M 50,110 C 50,80 20,80 20,60 C 20,40 80,40 80,20 C 80,10 50,0 50,-10"
                        fill="none"
                        stroke="#fcd34d"
                        strokeWidth="14"
                        strokeLinecap="round"
                        className="drop-shadow-sm"
                        strokeDasharray="1 2"
                    />
                </svg>

                {/* Decorative Trees */}
                <Trees size={40} className="absolute top-[10%] left-[10%] text-green-800/20 fill-green-900/20" />
                <Trees size={50} className="absolute top-[40%] right-[85%] text-green-800/10 fill-green-900/10" />
                <Trees size={30} className="absolute bottom-[20%] left-[15%] text-green-800/20 fill-green-900/20" />
                <Trees size={60} className="absolute bottom-[5%] right-[20%] text-green-800/15 fill-green-900/15" />
                <div className="absolute top-20 left-10 w-32 h-12 bg-white/10 rounded-full blur-2xl opacity-50" />

                {/* Buildings Layer */}
                {world.buildings.map((building) => (

                    <BuildingNode
                        key={building.id}
                        building={building}
                        onBuild={() => buildBuilding(world.id, building.id)}
                        canAfford={coins >= (building.baseCost * (building.currentStage + 1))}
                        currentCoins={coins}
                    />
                ))}
            </div>

            {/* Footer / Instructions */}
            <div className="absolute bottom-6 w-full text-center pointer-events-none">
                <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Toca un edificio para construir</p>
            </div>
        </div>
    );
};

interface BuildingNodeProps {
    building: Building;
    onBuild: () => void;
    canAfford: boolean;
    currentCoins: number;
}

const BuildingNode: React.FC<BuildingNodeProps> = ({ building, onBuild, canAfford, currentCoins }) => {
    const { currentStage, maxStages, position, name, baseCost } = building;
    const isCompleted = currentStage >= maxStages;
    const nextCost = baseCost * (currentStage + 1);

    const [showTooltip, setShowTooltip] = useState(false);

    // Dynamic Position
    const style = {
        left: `${position.x}%`,
        top: `${position.y}%`,
    };

    const handleInteraction = () => {
        if (isCompleted) return;

        if (showTooltip) {
            // Confirm Build
            onBuild();
            setShowTooltip(false);
        } else {
            // Show details
            setShowTooltip(true);
        }
    };

    // Determine Icon based on stage
    const renderContent = () => {
        if (currentStage === 0) {
            // Empty Plot Image (Green background matches world)
            return (
                <div className="w-full h-full relative p-2">
                    <img
                        src="/assets/images/plot_empty.png"
                        alt="Empty Plot"
                        className="w-full h-full object-contain scale-125 drop-shadow-xl"
                    />
                </div>
            );
        }

        if (!isCompleted) {
            // Construction Image
            return (
                <div className="w-full h-full relative p-2">
                    <img
                        src="/assets/images/plot_construction.png"
                        alt="Construction Site"
                        className="w-full h-full object-contain scale-125 drop-shadow-xl"
                    />
                </div>
            )
        }

        // Completed (Still using icons for now, but wrapped to match size)
        return (
            <div className={clsx(
                "text-white transition-all scale-110 drop-shadow-md",
            )}>
                {IconMap[building.icon] || IconMap['default']}
            </div>
        );
    };

    return (
        <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
            style={style}
        >
            {/* Building Visual Container */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInteraction}
                className={clsx(
                    "relative w-32 h-32 flex items-center justify-center transition-all", // Increased size for images
                    // Remove borders/bg for images to let them pop, only transparent hit area
                    "drop-shadow-2xl"
                )}
            >
                {renderContent()}


                {/* Progress Indicators */}
                {!isCompleted && (
                    <div className="absolute bottom-2 flex gap-1">
                        {Array.from({ length: maxStages }).map((_, i) => (
                            <div
                                key={i}
                                className={clsx(
                                    "w-2 h-2 rounded-full border border-black/20",
                                    i < currentStage ? "bg-yellow-400" : "bg-black/40"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Completed Check */}
                {isCompleted && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-1 shadow-lg">
                        <CheckCircle size={16} strokeWidth={3} />
                    </div>
                )}

            </motion.button>

            {/* Label */}
            <span className="mt-2 text-xs font-bold text-white/80 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
                {name}
            </span>

            {/* Interaction Tooltip (Build Menu) */}
            <AnimatePresence>
                {showTooltip && !isCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-2 bg-slate-900 rounded-xl p-3 border border-white/10 shadow-2xl w-40 z-50 flex flex-col gap-2"
                    >
                        <div className="text-xs text-slate-400 leading-tight mb-1 text-center">{building.description}</div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (canAfford) {
                                    onBuild();
                                    setShowTooltip(false);
                                }
                            }}
                            disabled={!canAfford}
                            className={clsx(
                                "w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all",
                                canAfford
                                    ? "bg-yellow-500 hover:bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-500/20"
                                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                            )}
                        >
                            {canAfford ? (
                                <>
                                    <Hammer size={14} />
                                    <span>{nextCost}</span>
                                </>
                            ) : (
                                <>
                                    <Lock size={14} />
                                    <span>Faltan {nextCost - currentCoins}</span>
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click outside closer overlay (invisible) */}
            {showTooltip && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
                />
            )}
        </div>
    );
}

