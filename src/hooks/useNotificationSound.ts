import { useCallback, useRef, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate modern professional trading notification sounds using Web Audio API
const createNotificationSound = (type: 'investment' | 'withdrawal', audioContext: AudioContext): AudioBuffer | null => {
  try {
    const sampleRate = audioContext.sampleRate;
    
    // Slightly longer for richer sound
    const duration = type === 'investment' ? 0.25 : 0.2;
    const bufferSize = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    if (type === 'investment') {
      // Modern professional trading "ding" - clean bell-like tone with harmonics
      // Base frequency with rich harmonics for a sophisticated trading terminal feel
      const baseFreq = 880; // A5 - crisp, professional
      const harmonics = [1, 2, 3, 4]; // Fundamental + overtones
      const harmonicGains = [1, 0.4, 0.2, 0.1]; // Decreasing amplitude for natural sound
      
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        
        // Quick attack, smooth decay envelope (professional feel)
        const attack = 1 - Math.exp(-t * 200);
        const decay = Math.exp(-t * 8);
        const envelope = attack * decay;
        
        let sample = 0;
        harmonics.forEach((harmonic, idx) => {
          // Add slight detuning for richness
          const detune = 1 + (idx * 0.002);
          sample += Math.sin(2 * Math.PI * baseFreq * harmonic * detune * t) * harmonicGains[idx];
        });
        
        // Add subtle high-frequency shimmer
        sample += Math.sin(2 * Math.PI * 2400 * t) * 0.08 * Math.exp(-t * 20);
        
        data[i] = sample * envelope * 0.25;
      }
    } else {
      // Professional trading withdrawal/sell sound - subtle descending dual tone
      const freq1 = 660; // E5
      const freq2 = 550; // C#5 (slightly lower for subtle descent)
      
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        
        // Quick attack, faster decay for withdrawal
        const attack = 1 - Math.exp(-t * 250);
        const decay = Math.exp(-t * 12);
        const envelope = attack * decay;
        
        // Two-tone blend for professional feel
        let sample = 0;
        
        // First tone (immediate)
        sample += Math.sin(2 * Math.PI * freq1 * t) * 0.6;
        sample += Math.sin(2 * Math.PI * freq1 * 2 * t) * 0.2; // Octave harmonic
        
        // Second tone (slightly delayed for smoothness)
        if (t > 0.03) {
          const t2 = t - 0.03;
          sample += Math.sin(2 * Math.PI * freq2 * t2) * 0.4 * Math.exp(-t2 * 15);
        }
        
        data[i] = sample * envelope * 0.2;
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
}

export const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const investmentBufferRef = useRef<AudioBuffer | null>(null);
  const withdrawalBufferRef = useRef<AudioBuffer | null>(null);
  const isInitializedRef = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);

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

  const playSound = useCallback((type: 'investment' | 'withdrawal') => {
    // Check if sounds are enabled
    if (!soundEnabledRef.current) return;

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
      gainNode.gain.value = 0.35; // Subtle but audible volume
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.start(0);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [initializeAudio]);

  return { playSound, initializeAudio, soundEnabled };
};
