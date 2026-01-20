import { useCallback, useRef, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate premium professional trading notification sounds using Web Audio API
const createNotificationSound = (type: 'investment' | 'withdrawal', audioContext: AudioContext): AudioBuffer | null => {
  try {
    const sampleRate = audioContext.sampleRate;
    
    // Longer duration for richer, more satisfying sounds
    const duration = type === 'investment' ? 0.4 : 0.35;
    const bufferSize = sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, sampleRate); // Stereo for richer sound
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    if (type === 'investment') {
      // Premium trading success sound - rich ascending chime with harmonics
      // Inspired by Bloomberg terminal and high-end trading platforms
      const frequencies = [1046.5, 1318.5, 1568, 2093]; // C6, E6, G6, C7 - Major chord arpeggio
      const delays = [0, 0.04, 0.08, 0.12]; // Staggered for arpeggio effect
      
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        let sampleL = 0;
        let sampleR = 0;
        
        frequencies.forEach((freq, idx) => {
          const adjustedT = t - delays[idx];
          if (adjustedT < 0) return;
          
          // Smooth attack and exponential decay
          const attack = 1 - Math.exp(-adjustedT * 80);
          const decay = Math.exp(-adjustedT * 4);
          const envelope = attack * decay;
          
          // Rich harmonic content with slight detuning for warmth
          const fundamental = Math.sin(2 * Math.PI * freq * adjustedT);
          const octave = Math.sin(2 * Math.PI * freq * 2 * adjustedT) * 0.3;
          const fifth = Math.sin(2 * Math.PI * freq * 1.5 * adjustedT) * 0.15;
          
          // Slight stereo spread
          const pan = (idx - 1.5) * 0.2;
          const leftGain = Math.cos((pan + 1) * Math.PI / 4);
          const rightGain = Math.sin((pan + 1) * Math.PI / 4);
          
          const sample = (fundamental + octave + fifth) * envelope * 0.2;
          sampleL += sample * leftGain;
          sampleR += sample * rightGain;
        });
        
        // Add subtle shimmer/sparkle at the top
        const shimmerEnv = Math.exp(-t * 6) * 0.08;
        const shimmer = Math.sin(2 * Math.PI * 3500 * t) * shimmerEnv;
        sampleL += shimmer;
        sampleR += shimmer;
        
        leftChannel[i] = sampleL;
        rightChannel[i] = sampleR;
      }
    } else {
      // Premium withdrawal confirmation - sophisticated descending dual-tone
      // Clean, professional, slightly urgent but reassuring
      const freq1 = 784; // G5
      const freq2 = 659.25; // E5
      const freq3 = 523.25; // C5
      
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        let sampleL = 0;
        let sampleR = 0;
        
        // First tone - immediate
        const env1 = (1 - Math.exp(-t * 100)) * Math.exp(-t * 6);
        const tone1 = Math.sin(2 * Math.PI * freq1 * t) * 0.5;
        const tone1_oct = Math.sin(2 * Math.PI * freq1 * 2 * t) * 0.15;
        sampleL += (tone1 + tone1_oct) * env1;
        sampleR += (tone1 + tone1_oct) * env1;
        
        // Second tone - delayed
        if (t > 0.06) {
          const t2 = t - 0.06;
          const env2 = (1 - Math.exp(-t2 * 100)) * Math.exp(-t2 * 5);
          const tone2 = Math.sin(2 * Math.PI * freq2 * t2) * 0.4;
          const tone2_oct = Math.sin(2 * Math.PI * freq2 * 2 * t2) * 0.12;
          sampleL += (tone2 + tone2_oct) * env2 * 0.9;
          sampleR += (tone2 + tone2_oct) * env2 * 1.1;
        }
        
        // Third tone - resolution
        if (t > 0.12) {
          const t3 = t - 0.12;
          const env3 = (1 - Math.exp(-t3 * 100)) * Math.exp(-t3 * 4);
          const tone3 = Math.sin(2 * Math.PI * freq3 * t3) * 0.35;
          sampleL += tone3 * env3 * 1.1;
          sampleR += tone3 * env3 * 0.9;
        }
        
        leftChannel[i] = sampleL * 0.25;
        rightChannel[i] = sampleR * 0.25;
      }
    }
    
    return buffer;
  } catch (error) {
    console.warn('Failed to create notification sound:', error);
    return null;
  }
};

interface SoundSettings {
  enabled: boolean;
  volume: number;
}

export const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const investmentBufferRef = useRef<AudioBuffer | null>(null);
  const withdrawalBufferRef = useRef<AudioBuffer | null>(null);
  const isInitializedRef = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const soundEnabledRef = useRef(true);
  const volumeRef = useRef(0.5);

  // Load sound settings from database
  useEffect(() => {
    const loadSoundSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', 'sound_settings')
          .maybeSingle();

        if (!error && data?.setting_value) {
          const settings = data.setting_value as unknown as SoundSettings;
          setSoundEnabled(settings.enabled ?? true);
          soundEnabledRef.current = settings.enabled ?? true;
          setVolume(settings.volume ?? 0.5);
          volumeRef.current = settings.volume ?? 0.5;
        }
      } catch (err) {
        console.warn('Failed to load sound settings:', err);
      }
    };

    loadSoundSettings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('sound-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_settings',
          filter: 'setting_key=eq.sound_settings'
        },
        (payload) => {
          if (payload.new && 'setting_value' in payload.new) {
            const settings = payload.new.setting_value as unknown as SoundSettings;
            setSoundEnabled(settings.enabled ?? true);
            soundEnabledRef.current = settings.enabled ?? true;
            setVolume(settings.volume ?? 0.5);
            volumeRef.current = settings.volume ?? 0.5;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const initializeAudio = useCallback(() => {
    if (isInitializedRef.current) return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      investmentBufferRef.current = createNotificationSound('investment', audioContextRef.current);
      withdrawalBufferRef.current = createNotificationSound('withdrawal', audioContextRef.current);
      isInitializedRef.current = true;
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }, []);

  const playSound = useCallback((type: 'investment' | 'withdrawal', forcePlay = false) => {
    // Check if sounds are enabled (skip check if forcePlay for preview)
    if (!forcePlay && !soundEnabledRef.current) return;

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
      // Use current volume setting (0-1 range, multiply by base volume)
      gainNode.gain.value = volumeRef.current * 0.7;
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.start(0);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [initializeAudio]);

  return { playSound, initializeAudio, soundEnabled, volume };
};
