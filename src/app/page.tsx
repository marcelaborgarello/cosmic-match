'use client';

import { GameBoard } from "@/components/game/GameBoard";
import { WorldScreen } from "@/components/world/WorldScreen";


import { GameHeader } from "@/components/game/GameHeader";
import { GameControls } from "@/components/game/GameControls";
import { GameModal } from "@/components/game/GameModal";
import { MainMenu } from '@/components/menu/MainMenu';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useGameSounds } from '@/hooks/useGameSounds';
import { CollectionScreen } from '@/components/collection/CollectionScreen';
import { AVAILABLE_MASCOTS } from "@/types/game"; // Added import

// Simple Mascot Component
const MascotCompanion = () => {
  const equippedId = useGameStore(s => s.equippedMascotId);
  const mascot = AVAILABLE_MASCOTS.find(m => m.id === equippedId);

  if (!mascot) return null;

  return (
    <div className="absolute top-24 left-4 z-40 pointer-events-none">
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="w-20 h-20 rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] bg-white/10 backdrop-blur-sm border border-white/20"
      >
        <img src={mascot.image} alt="Companion" className="w-full h-full object-cover mix-blend-multiply" />
      </motion.div>
    </div>
  );
};


export default function Home() {
  const { isPaused, isGameOver, isLevelComplete, currentScreen, goToMenu } = useGameStore();
  const { initAudio } = useGameSounds();

  return (
    <main
      className="flex min-h-screen flex-col items-center bg-slate-950 relative overflow-hidden h-[100dvh]"
      onClick={initAudio}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 -z-10" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay -z-10" />

      <AnimatePresence mode="wait">

        {/* VIEW 1: MAIN MENU */}
        {currentScreen === 'MENU' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 z-20"
          >
            <MainMenu />
          </motion.div>
        )}

        {/* VIEW 2: COLLECTION (GACHA) */}
        {currentScreen === 'MAP' && (
          <motion.div
            key="collection"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-20"
          >
            <CollectionScreen />
          </motion.div>
        )}

        {/* VIEW 3: GAME */}
        {currentScreen === 'GAME' && (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full h-full flex flex-col max-w-md mx-auto relative z-10 p-2"
          >
            <GameHeader />

            {/* Mascot Companion */}
            <MascotCompanion />

            <div className="flex-1 w-full relative my-2 overflow-hidden flex flex-col justify-start">
              <div className="overflow-y-auto scrollbar-hide h-full pb-20 mask-bottom">
                <GameBoard />
              </div>

              {/* Floating Controls Layer */}
              <div className="absolute bottom-0 left-0 right-0 z-20 pb-2 pt-8 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
                <GameControls />
              </div>
            </div>

            {/* Modals Layer */}
            <GameModal />
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
