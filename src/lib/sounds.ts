"use client";

let audioContext: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume: number = 0.3) {
  const ctx = getAudioContext();
  if (!ctx || !soundEnabled) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, volume: number = 0.2) {
  const ctx = getAudioContext();
  if (!ctx || !soundEnabled) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  noise.buffer = buffer;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1000, ctx.currentTime);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + duration);
}

const SOUNDS = {
  click: () => playTone(800, 0.05, "square", 0.15),
  score: () => {
    playTone(523, 0.1, "sine", 0.25);
    setTimeout(() => playTone(659, 0.1, "sine", 0.25), 50);
    setTimeout(() => playTone(784, 0.15, "sine", 0.25), 100);
  },
  gameOver: () => {
    playTone(392, 0.2, "sawtooth", 0.2);
    setTimeout(() => playTone(330, 0.2, "sawtooth", 0.2), 150);
    setTimeout(() => playTone(262, 0.4, "sawtooth", 0.2), 300);
  },
  jump: () => {
    const ctx = getAudioContext();
    if (!ctx || !soundEnabled) return;
    if (ctx.state === "suspended") ctx.resume();
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  },
  type: () => playTone(600 + Math.random() * 200, 0.03, "square", 0.08),
  success: () => {
    playTone(523, 0.1, "sine", 0.2);
    setTimeout(() => playTone(659, 0.1, "sine", 0.2), 80);
    setTimeout(() => playTone(784, 0.1, "sine", 0.2), 160);
    setTimeout(() => playTone(1047, 0.2, "sine", 0.25), 240);
  },
  error: () => playNoise(0.15, 0.15),
  flap: () => {
    const ctx = getAudioContext();
    if (!ctx || !soundEnabled) return;
    if (ctx.state === "suspended") ctx.resume();
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  },
} as const;

type SoundName = keyof typeof SOUNDS;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (typeof window !== "undefined") {
    localStorage.setItem("soundEnabled", String(enabled));
  }
}

export function getSoundEnabled(): boolean {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("soundEnabled");
    if (stored !== null) {
      soundEnabled = stored === "true";
    }
  }
  return soundEnabled;
}

export function playSound(name: SoundName) {
  if (!soundEnabled) return;
  
  const soundFn = SOUNDS[name];
  if (soundFn) {
    try {
      soundFn();
    } catch {
      // Silently fail if audio context is not available
    }
  }
}

export function preloadSounds() {
  getAudioContext();
}
