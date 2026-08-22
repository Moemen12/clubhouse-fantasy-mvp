"use client";

import { useRef, useState } from "react";

type StudioSound =
  | "enter"
  | "select"
  | "deselect"
  | "advance"
  | "captain"
  | "lock"
  | "reveal"
  | "back";

function playNote(
  context: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function useStudioSound() {
  const audioContext = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(true);

  function getContext() {
    if (!enabled || typeof window === "undefined" || !("AudioContext" in window)) return null;
    audioContext.current ??= new AudioContext();
    if (audioContext.current.state === "suspended") void audioContext.current.resume();
    return audioContext.current;
  }

  function play(sound: StudioSound) {
    const context = getContext();
    if (!context) return;

    const start = context.currentTime + 0.005;
    const sequences: Record<StudioSound, Array<[number, number, number, number]>> = {
      enter: [
        [261.63, 0, 0.1, 0.025],
        [392, 0.08, 0.16, 0.03],
        [523.25, 0.16, 0.24, 0.035],
      ],
      select: [[440, 0, 0.08, 0.026]],
      deselect: [[330, 0, 0.08, 0.018]],
      advance: [
        [392, 0, 0.08, 0.023],
        [587.33, 0.07, 0.12, 0.028],
      ],
      captain: [
        [349.23, 0, 0.1, 0.024],
        [698.46, 0.08, 0.18, 0.032],
      ],
      lock: [
        [392, 0, 0.09, 0.022],
        [523.25, 0.07, 0.12, 0.026],
        [783.99, 0.15, 0.24, 0.032],
      ],
      reveal: [
        [261.63, 0, 0.12, 0.02],
        [392, 0.1, 0.14, 0.024],
        [659.25, 0.2, 0.34, 0.034],
      ],
      back: [[293.66, 0, 0.1, 0.018]],
    };

    sequences[sound].forEach(([frequency, offset, duration, volume]) => {
      playNote(context, frequency, start + offset, duration, volume);
    });
  }

  function toggle() {
    setEnabled((current) => !current);
  }

  return { enabled, play, toggle };
}
