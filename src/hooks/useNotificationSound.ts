import { useCallback, useRef } from 'react';

// Generate notification sounds using Web Audio API
const createNotificationSound = (type: 'investment' | 'withdrawal'): AudioBuffer | null => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    
    // Sound duration in seconds
    const duration = type === 'investment' ? 0.15 : 0.12;
    const bufferSize = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    if (type === 'investment') {
      // Pleasant ascending chime for investments (positive tone)
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 15) * (1 - Math.exp(-t * 100));
        let sample = 0;
        frequencies.forEach((freq, idx) => {
          const delay = idx * 0.02;
          if (t > delay) {
            sample += Math.sin(2 * Math.PI * freq * (t - delay)) * Math.exp(-(t - delay) * 20);
          }
        });
        data[i] = sample * envelope * 0.3;
      }
    } else {
      // Soft descending tone for withdrawals (neutral tone)
      const frequencies = [659.25, 523.25]; // E5, C5
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 18) * (1 - Math.exp(-t * 80));
        let sample = 0;
        frequencies.forEach((freq, idx) => {
          const delay = idx * 0.03;
          if (t > delay) {
            sample += Math.sin(2 * Math.PI * freq * (t - delay)) * Math.exp(-(t - delay) * 25);
          }
        });
        data[i] = sample * envelope * 0.25;
      }
    }
    
    return buffer;
  } catch (error) {
    console.warn('Failed to create notification sound:', error);
    return null;
  }
};

export const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const investmentBufferRef = useRef<AudioBuffer | null>(null);
  const withdrawalBufferRef = useRef<AudioBuffer | null>(null);
  const isInitializedRef = useRef(false);

  const initializeAudio = useCallback(() => {
    if (isInitializedRef.current) return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      investmentBufferRef.current = createNotificationSound('investment');
      withdrawalBufferRef.current = createNotificationSound('withdrawal');
      isInitializedRef.current = true;
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }, []);

  const playSound = useCallback((type: 'investment' | 'withdrawal') => {
    // Initialize on first user interaction
    if (!isInitializedRef.current) {
      initializeAudio();
    }

    const audioContext = audioContextRef.current;
    const buffer = type === 'investment' ? investmentBufferRef.current : withdrawalBufferRef.current;

    if (!audioContext || !buffer) return;

    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    try {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = 0.4; // Subtle volume
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.start(0);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [initializeAudio]);

  return { playSound, initializeAudio };
};
