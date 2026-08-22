"use client";

import { useRef, useState } from "react";

type StudioSound =
  | "enter"
  | "select"
  | "deselect"
  | "complete"
  | "advance"
  | "captain"
  | "lock"
  | "reveal"
  | "back";

const soundSources: Record<StudioSound, string> = {
  enter: "/audio/studio/forward.mp3",
  select: "/audio/studio/select.mp3",
  deselect: "/audio/studio/deselect.mp3",
  complete: "/audio/studio/complete.mp3",
  advance: "/audio/studio/forward.mp3",
  captain: "/audio/studio/captain.mp3",
  lock: "/audio/studio/complete.mp3",
  reveal: "/audio/studio/reveal.mp3",
  back: "/audio/studio/back.mp3",
};

function createAudio(source: string) {
  const audio = new Audio(source);
  audio.preload = "auto";
  audio.volume = 0.42;
  return audio;
}

export function useStudioSound() {
  const audioElements = useRef<Partial<Record<StudioSound, HTMLAudioElement>>>({});
  const [enabled, setEnabled] = useState(true);

  function play(sound: StudioSound) {
    if (!enabled || typeof window === "undefined") return;

    const audio = audioElements.current[sound] ?? createAudio(soundSources[sound]);
    audioElements.current[sound] = audio;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }

  function toggle() {
    setEnabled((current) => {
      if (current) {
        Object.values(audioElements.current).forEach((audio) => audio?.pause());
      }
      return !current;
    });
  }

  return { enabled, play, toggle };
}
