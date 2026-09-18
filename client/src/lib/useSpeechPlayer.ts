import { useEffect, useRef, useState } from "react";

const WORDS_PER_MINUTE = 155;

function estimateDurationSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, (words / WORDS_PER_MINUTE) * 60);
}

export function useSpeechPlayer() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  function clearTimer() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function stop() {
    clearTimer();
    if (supported) window.speechSynthesis.cancel();
    setPlayingId(null);
    setElapsed(0);
    setDuration(0);
  }

  function play(id: string, text: string) {
    if (!supported) return;
    window.speechSynthesis.cancel();
    clearTimer();

    const estimated = estimateDurationSeconds(text);
    setPlayingId(id);
    setElapsed(0);
    setDuration(estimated);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;

    const startedAt = Date.now();
    intervalRef.current = window.setInterval(() => {
      const secs = (Date.now() - startedAt) / 1000;
      setElapsed(Math.min(secs, estimated));
    }, 200);

    utterance.onend = () => {
      clearTimer();
      setElapsed(estimated);
      setPlayingId(null);
    };
    utterance.onerror = () => {
      clearTimer();
      setPlayingId(null);
    };

    window.speechSynthesis.speak(utterance);
  }

  function toggle(id: string, text: string) {
    if (playingId === id) {
      stop();
    } else {
      play(id, text);
    }
  }

  useEffect(() => {
    return () => {
      clearTimer();
      if (supported) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { supported, playingId, elapsed, duration, toggle, stop };
}
