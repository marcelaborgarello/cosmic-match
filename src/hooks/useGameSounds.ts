'use client';

import { useCallback, useEffect, useRef } from 'react';

// Singleton AudioContext instance (lazy init)
let audioContextInstance: AudioContext | null = null;

export const useGameSounds = () => {

    // Initialize/Get context safely
    const getContext = useCallback(() => {
        if (typeof window === 'undefined') return null;

        if (!audioContextInstance) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                audioContextInstance = new AudioCtx();
            }
        }
        return audioContextInstance;
    }, []);

    const playTone = useCallback((freq: number, type: OscillatorType, duration: number, vol = 0.1) => {
        const ctx = getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(vol * 3, ctx.currentTime); // 3x volume boost
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);


        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    }, [getContext]);

    const playSelect = useCallback(() => {
        playTone(440, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(660, 'sine', 0.1, 0.05), 50);
    }, [playTone]);

    const playMatch = useCallback(() => {
        // Happy arpeggio
        playTone(523.25, 'triangle', 0.2, 0.1); // C
        setTimeout(() => playTone(659.25, 'triangle', 0.2, 0.1), 80); // E
        setTimeout(() => playTone(783.99, 'triangle', 0.3, 0.1), 160); // G
        setTimeout(() => playTone(1046.50, 'sine', 0.4, 0.05), 240); // High C
    }, [playTone]);

    const playError = useCallback(() => {
        playTone(150, 'sawtooth', 0.15, 0.1);
    }, [playTone]);

    const playLevelUp = useCallback(() => {
        playTone(400, 'square', 0.1, 0.1);
        setTimeout(() => playTone(500, 'square', 0.1, 0.1), 100);
        setTimeout(() => playTone(600, 'square', 0.1, 0.1), 200);
        setTimeout(() => playTone(800, 'square', 0.4, 0.1), 300);
    }, [playTone]);

    const playRowClear = useCallback(() => {
        // Laser sweep sound
        const ctx = getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    }, [getContext]);

    const playGameOver = useCallback(() => {
        const ctx = getContext();
        if (!ctx) return;

        const playNote = (freq: number, startTime: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
            gain.gain.setValueAtTime(0.3, ctx.currentTime + startTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + startTime);
            osc.stop(ctx.currentTime + startTime + duration);
        };

        playNote(400, 0, 0.4);
        playNote(300, 0.4, 0.4);
        playNote(200, 0.8, 0.6);
        playNote(150, 1.4, 1.0);
    }, [getContext]);

    const initAudio = useCallback(() => {
        const ctx = getContext();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    }, [getContext]);

    return { playSelect, playMatch, playError, playLevelUp, playRowClear, playGameOver, initAudio };
};
