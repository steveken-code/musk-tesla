import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Plus, Loader2, Image as ImageIcon, TrendingUp, Wallet, ShieldCheck, MessageSquare } from 'lucide-react';
import whatsappIcon from '@/assets/whatsapp-icon.png';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import supportAvatar from '@/assets/support-avatar.png';
import chatSupportIcon from '@/assets/chat-support-icon.png';
import chatBubbleIcon from '@/assets/chat-bubble-icon.png';
import elonAvatar from '@/assets/elon-ceo.jpeg';
import { Input } from '@/components/ui/input';

const NOTIFICATION_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/12/12/audio_e8c1ae0edd.mp3';
const notificationAudio = typeof window !== 'undefined' ? new Audio(NOTIFICATION_SOUND_URL) : null;
if (notificationAudio) {
  notificationAudio.volume = 0.4;
  notificationAudio.preload = 'auto';
}

const DEFAULT_SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_OFFSET_MS = 3 * 60 * 1000; // warn 3 min before timeout

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'admin' | 'system';
  message: string | null;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface SupportProfile {
  supportName: string;
  replyTime: string;
  avatarUrl: string;
}

interface TeamMember {
  name: string;
  imageUrl: string;
  role: string;
}

interface SpecialistProfile {
  specialistName: string;
  specialistImageUrl: string;
  teamMembers?: TeamMember[];
}

const DEFAULT_SUPPORT_PROFILE: SupportProfile = {
  supportName: 'Tesla Stock Platform',
  replyTime: '30 minutes',
  avatarUrl: '',
};

const DEFAULT_SPECIALIST: SpecialistProfile = {
  specialistName: 'Support Specialist',
  specialistImageUrl: '',
};

type ChatStep = 'landing' | 'compose' | 'name_email' | 'verifying' | 'waiting' | 'chatting';

const getGreeting = () => {
  const lang = navigator.language.split('-')[0];
  const translations: Record<string, string> = {
    en: "Hi there! 👋 How can we help you today?",
    es: "¡Hola! 👋 ¿En qué podemos ayudarte?",
    fr: "Bonjour ! 👋 Comment pouvons-nous vous aider ?",
    de: "Hallo! 👋 Wie können wir Ihnen helfen?",
    zh: "你好！👋 我们能为您提供什么帮助？",
  };
  return translations[lang] || translations['en'];
};

const getGuestId = () => {
  let guestId = localStorage.getItem('chat-guest-id');
  if (!guestId) {
    guestId = 'guest-' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('chat-guest-id', guestId);
  }
  return guestId;
};

const LiveChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(() => {
    // Restore conversationId from localStorage for persistence across page navigations
    return localStorage.getItem('chat-active-conversation') || null;
  });
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileData, setProfileData] = useState<{ full_name: string | null; email: string | null } | null>(null);
  const [adminTyping, setAdminTyping] = useState(false);
  const [stagedImage, setStagedImage] = useState<{ file: File; preview: string } | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [proactiveTyping, setProactiveTyping] = useState(false);
  const [proactiveMessage, setProactiveMessage] = useState<string | null>(null);
  const [customGreeting, setCustomGreeting] = useState<{ mode: string; guestGreeting: string; userGreeting: string } | null>(null);
  const [supportProfile, setSupportProfile] = useState<SupportProfile>(DEFAULT_SUPPORT_PROFILE);
  const [specialistProfile, setSpecialistProfile] = useState<SpecialistProfile>(DEFAULT_SPECIALIST);
  const [chatStep, setChatStep] = useState<ChatStep>('landing');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [specialistJoined, setSpecialistJoined] = useState(false);
  const [elonMode, setElonMode] = useState(false);
  const [vipRequested, setVipRequested] = useState(false);
  const [vipPersonaName, setVipPersonaName] = useState('');
  const [vipPersonaImage, setVipPersonaImage] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const [sessionTimeoutMs, setSessionTimeoutMs] = useState(DEFAULT_SESSION_TIMEOUT_MS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeSpecialistName = elonMode ? (vipPersonaName || 'Elon Musk') : specialistProfile.specialistName;
  const activeSpecialistImage = elonMode ? (vipPersonaImage || elonAvatar) : specialistProfile.specialistImageUrl;

  const avatarSrc = specialistJoined && activeSpecialistImage
    ? activeSpecialistImage
    : (supportProfile.avatarUrl || supportAvatar);
  const displayName = specialistJoined
    ? activeSpecialistName
    : (supportProfile.supportName || 'Tesla Stock Platform');

  // Detect if a message is asking to talk to Elon Musk
  const isElonMuskRequest = (text: string) => {
    const lower = text.toLowerCase();
    const patterns = [
      'elon musk', 'talk to elon', 'speak to elon', 'connect me to elon',
      'want to chat with elon', 'can i talk to elon', 'speak with elon',
      'connect me with elon', 'i want elon', 'let me talk to elon',
      'elon', 'mr musk', 'mr. musk',
    ];
    return patterns.some(p => lower.includes(p));
  };

  // Request VIP connection - shows hold message and notifies admin (no auto-join)
  const requestVipConnection = useCallback(async (convId: string, userName: string, userEmail: string) => {
    if (elonMode) return;
    
    // Show "Please hold" system message
    const holdMsg: ChatMessage = {
      id: 'elon-hold-' + Date.now(),
      conversation_id: convId,
      sender_type: 'system',
      message: `Please hold while we connect you to ${vipPersonaName || 'Elon Musk'}...`,
      image_url: null,
      is_read: true,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, holdMsg]);
    setVipRequested(true);

    // Notify admin via email about VIP request
    supabase.functions.invoke('send-chat-notification', {
      body: {
        userName: userName,
        userEmail: userEmail || 'Anonymous',
        message: `⚡ VIP REQUEST: User wants to speak with ${vipPersonaName || 'Elon Musk'}. Please join as VIP from the admin panel.`,
      },
    }).catch(() => {});
  }, [elonMode, vipPersonaName]);

  // --- Body scroll lock when chat is open ---
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // --- Session timeout logic ---
  const resetActivityTimers = useCallback(() => {
    if (sessionTimedOut) return;
    lastActivityRef.current = Date.now();
    setTimeoutWarning(false);

    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);

    const warningAt = Math.max(sessionTimeoutMs - WARNING_OFFSET_MS, 0);
    warningTimerRef.current = setTimeout(() => {
      setTimeoutWarning(true);
      // Notify admin that session is about to expire (3 min left)
      if (conversationId) {
        const uName = user ? (profileData?.full_name || user?.email?.split('@')[0] || 'User') : guestName.trim();
        const uEmail = user ? (profileData?.email || user?.email || '') : guestEmail.trim();
        supabase.functions.invoke('send-chat-notification', {
          body: {
            userName: uName,
            userEmail: uEmail || 'Anonymous',
            message: '⏰ Chat session expiring in 3 minutes — please respond if needed.',
            conversationId,
          },
        }).catch(() => {});
      }
    }, warningAt);

    timeoutTimerRef.current = setTimeout(async () => {
      setSessionTimedOut(true);
      setTimeoutWarning(false);
      // Insert system message
      if (conversationId) {
        await supabase.from('chat_messages').insert({
          conversation_id: conversationId,
          sender_type: 'system',
          message: 'Session timed out due to inactivity.',
        });
        await supabase.from('chat_conversations').update({ status: 'closed' }).eq('id', conversationId);
        // Notify admin that chat session closed
        const uName = user ? (profileData?.full_name || user?.email?.split('@')[0] || 'User') : guestName.trim();
        const uEmail = user ? (profileData?.email || user?.email || '') : guestEmail.trim();
        supabase.functions.invoke('send-chat-notification', {
          body: {
            userName: uName,
            userEmail: uEmail || 'Anonymous',
            message: '🔴 Chat session has been closed due to inactivity.',
            conversationId,
          },
        }).catch(() => {});
      }
    }, sessionTimeoutMs);
  }, [conversationId, sessionTimedOut, sessionTimeoutMs]);

  // Start timers when conversation is active
  useEffect(() => {
    if (conversationId && (chatStep === 'waiting' || chatStep === 'chatting') && !sessionTimedOut) {
      resetActivityTimers();
    }
    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, [conversationId, chatStep, sessionTimedOut, resetActivityTimers]);

  // Reset timers on activity
  const trackActivity = useCallback(() => {
    if (conversationId && !sessionTimedOut) {
      resetActivityTimers();
    }
  }, [conversationId, sessionTimedOut, resetActivityTimers]);

  // Load profile data
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setProfileData(data);
    };
    loadProfile();
  }, [user]);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['chat_greeting_settings', 'support_profile_settings', 'specialist_settings', 'session_timeout_settings', 'vip_persona_settings']);
      if (data) {
        for (const row of data) {
          if (row.setting_key === 'chat_greeting_settings' && row.setting_value) {
            setCustomGreeting(row.setting_value as any);
          }
          if (row.setting_key === 'support_profile_settings' && row.setting_value) {
            const val = row.setting_value as any;
            setSupportProfile({
              supportName: val.supportName || DEFAULT_SUPPORT_PROFILE.supportName,
              replyTime: val.replyTime || DEFAULT_SUPPORT_PROFILE.replyTime,
              avatarUrl: val.avatarUrl || '',
            });
          }
          if (row.setting_key === 'specialist_settings' && row.setting_value) {
            const val = row.setting_value as any;
            setSpecialistProfile({
              specialistName: val.specialistName || DEFAULT_SPECIALIST.specialistName,
              specialistImageUrl: val.specialistImageUrl || '',
              teamMembers: val.teamMembers || [],
            });
            // Load VIP persona from specialist_settings if present
            if (val.vipPersonaName) setVipPersonaName(val.vipPersonaName);
            if (val.vipPersonaImage) setVipPersonaImage(val.vipPersonaImage);
          }
          if (row.setting_key === 'session_timeout_settings' && row.setting_value) {
            const val = row.setting_value as any;
            const mins = val.timeoutMinutes || 15;
            setSessionTimeoutMs(mins * 60 * 1000);
          }
        }
      }
    };
    fetchSettings();
  }, []);

  // Sync conversationId to localStorage
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem('chat-active-conversation', conversationId);
    } else {
      localStorage.removeItem('chat-active-conversation');
    }
  }, [conversationId]);

  // Check for existing conversation on mount
  useEffect(() => {
    const init = async () => {
      // First check if we have a stored conversationId
      const storedConvId = localStorage.getItem('chat-active-conversation');
      
      let convData: any = null;
      
      if (storedConvId) {
        // Verify the stored conversation is still open
        const { data } = await supabase
          .from('chat_conversations')
          .select('id, specialist_joined, status, vip_mode, vip_persona_name, vip_persona_image')
          .eq('id', storedConvId)
          .maybeSingle();
        
        if (data && data.status === 'open') {
          convData = data;
        } else {
          // Conversation is closed or doesn't exist, clear storage
          localStorage.removeItem('chat-active-conversation');
        }
      }
      
      // If no stored conversation found, search for any open one
      if (!convData) {
        if (user) {
          const { data } = await supabase
            .from('chat_conversations')
            .select('id, specialist_joined, status, vip_mode, vip_persona_name, vip_persona_image')
            .eq('user_id', user.id)
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          convData = data;
        } else {
          const guestId = getGuestId();
          const { data } = await supabase
            .from('chat_conversations')
            .select('id, specialist_joined, status, vip_mode, vip_persona_name, vip_persona_image')
            .eq('user_name', guestId)
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          convData = data;
        }
      }
      
      if (convData) {
        setConversationId(convData.id);
        if (convData.vip_mode) {
          setElonMode(true);
          if (convData.vip_persona_name) setVipPersonaName(convData.vip_persona_name);
          if (convData.vip_persona_image) setVipPersonaImage(convData.vip_persona_image);
        }
        if (convData.specialist_joined) {
          setSpecialistJoined(true);
          setChatStep('chatting');
        } else {
          setChatStep('waiting');
        }
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', convData.id)
          .eq('sender_type', 'admin')
          .eq('is_read', false);
        if (count) setUnreadCount(count);
      }
    };
    init();
  }, [user]);

  // Load messages + realtime (with duplicate fix)
  useEffect(() => {
    if (!conversationId) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data as ChatMessage[]);
    };
    loadMessages();

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const newMsg = payload.new as ChatMessage;
        trackActivity();
        setMessages(prev => {
          // Check if exact id already exists
          if (prev.some(m => m.id === newMsg.id)) return prev;
          
          // Replace optimistic temp message if it matches
          const tempIdx = prev.findIndex(m => 
            m.id.startsWith('temp-') && 
            m.sender_type === newMsg.sender_type && 
            m.message === newMsg.message
          );
          if (tempIdx !== -1) {
            const updated = [...prev];
            updated[tempIdx] = newMsg;
            return updated;
          }
          
          return [...prev, newMsg];
        });
        if (newMsg.sender_type === 'admin' && !isOpen) {
          setUnreadCount(prev => prev + 1);
        }
        if (newMsg.sender_type === 'system' && newMsg.message?.includes('joined the conversation')) {
          setSpecialistJoined(true);
          setChatStep('chatting');
        }
      })
      .subscribe();

    const convChannel = supabase
      .channel(`conv-status-${conversationId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_conversations',
        filter: `id=eq.${conversationId}`,
      }, (payload) => {
        const updated = payload.new as any;
        if (updated.specialist_joined && !specialistJoined) {
          setSpecialistJoined(true);
          setChatStep('chatting');
        }
        // Detect VIP mode activated by admin
        if (updated.vip_mode && !elonMode) {
          setElonMode(true);
          if (updated.vip_persona_name) setVipPersonaName(updated.vip_persona_name);
          if (updated.vip_persona_image) setVipPersonaImage(updated.vip_persona_image);
          setSpecialistJoined(true);
          setChatStep('chatting');
          if (notificationAudio) notificationAudio.play().catch(() => {});
        }
        if (updated.status === 'closed') {
          setConversationId(null);
          setMessages([]);
          setSpecialistJoined(false);
          setElonMode(false);
          setChatStep('landing');
          setProactiveMessage(null);
          setSessionTimedOut(false);
          setTimeoutWarning(false);
          sessionStorage.removeItem('chat-greeted');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(convChannel);
    };
  }, [conversationId, isOpen, specialistJoined, trackActivity]);

  // Subscribe to admin typing
  useEffect(() => {
    if (!conversationId) return;
    const currentUserId = user?.id || getGuestId();
    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_typing_status',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const row = payload.new as any;
        if (row.user_id !== currentUserId) {
          setAdminTyping(row.is_typing || false);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && conversationId) {
      setUnreadCount(0);
      supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'admin')
        .eq('is_read', false)
        .then(() => {});
    }
  }, [isOpen, conversationId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Generate greeting text (reusable)
  const getGreetingText = useCallback(() => {
    if (customGreeting && customGreeting.mode === 'custom') {
      if (user && customGreeting.userGreeting) {
        return customGreeting.userGreeting.replace(
          /\{\{user_name\}\}/g,
          profileData?.full_name || 'there'
        );
      } else {
        return customGreeting.guestGreeting;
      }
    } else {
      return getGreeting();
    }
  }, [customGreeting, user, profileData]);

  const broadcastTyping = useCallback(async (isTyping: boolean) => {
    if (!conversationId) return;
    const typingUserId = user?.id || getGuestId();
    await supabase.from('chat_typing_status').upsert({
      conversation_id: conversationId,
      user_id: typingUserId,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'conversation_id,user_id' }).then(() => {});
  }, [conversationId, user]);

  const handleTyping = () => {
    broadcastTyping(true);
    trackActivity();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => broadcastTyping(false), 3000);
  };

  // Handle first message from landing -- go to compose step (greeting first, then type)
  const handleLandingMessage = () => {
    if (user) {
      setChatStep('compose');
    } else {
      setChatStep('name_email');
    }
  };

  // Send verification code
  const handleSendVerification = async () => {
    if (!guestName.trim() || !guestEmail.trim()) return;
    setVerificationSending(true);
    setVerificationError('');
    try {
      const { error } = await supabase.functions.invoke('send-chat-verification', {
        body: { email: guestEmail.trim() }
      });
      if (error) throw error;
      setChatStep('verifying');
    } catch (err) {
      setVerificationError('Failed to send verification code. Please try again.');
    } finally {
      setVerificationSending(false);
    }
  };

  // Verify code
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 4) return;
    setVerificationSending(true);
    setVerificationError('');
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('verify-chat-code', {
        body: { email: guestEmail.trim(), code: verificationCode },
      });

      if (fnError || !fnData?.success) {
        setVerificationError(fnData?.error || 'Invalid code. Please try again.');
        setVerificationSending(false);
        return;
      }

      // After verification, go to compose step so greeting shows first
      setChatStep('compose');
    } catch (err) {
      setVerificationError('Verification failed. Please try again.');
    } finally {
      setVerificationSending(false);
    }
  };

  // Create conversation and send first message
  const handleCreateConversationAndSend = async (msg: string) => {
    setChatStep('waiting');
    
    const guestId = getGuestId();
    const userName = user ? (profileData?.full_name || user.email?.split('@')[0] || 'User') : guestName.trim();
    const userEmail = user ? (profileData?.email || user.email) : guestEmail.trim();

    const { data: newConv, error: convError } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user?.id || null,
        user_name: user ? userName : guestId,
        user_email: userEmail,
        guest_name: user ? null : guestName.trim(),
        guest_verified: !user,
      })
      .select('id')
      .single();

    if (convError || !newConv) {
      console.error('Error creating conversation:', convError);
      return;
    }

    setConversationId(newConv.id);

    // Inject greeting as first admin-style message bubble (local only, not saved to DB)
    const greetingText = getGreetingText();
    const greetingMsg: ChatMessage = {
      id: 'greeting-' + Date.now(),
      conversation_id: newConv.id,
      sender_type: 'admin',
      message: greetingText,
      image_url: null,
      is_read: true,
      created_at: new Date(Date.now() - 1000).toISOString(), // slightly before user msg
    };

    const optimisticMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      conversation_id: newConv.id,
      sender_type: 'user',
      message: msg.trim() || null,
      image_url: null,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages([greetingMsg, optimisticMsg]);

    const { error: msgError } = await supabase.from('chat_messages').insert({
      conversation_id: newConv.id,
      sender_type: 'user',
      sender_id: user?.id,
      message: msg.trim() || null,
    });
    if (msgError) console.error('Error sending first message:', msgError);

    await supabase.from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', newConv.id);

    // Send email notification only for the FIRST message of a new conversation
    supabase.functions.invoke('send-chat-notification', {
      body: {
        userName: userName,
        userEmail: userEmail || 'Anonymous',
        message: msg.trim() || '[Image sent]',
        conversationId: newConv.id,
      },
    }).catch(() => {});

    // Check if user is asking to talk to VIP persona
    if (isElonMuskRequest(msg)) {
      requestVipConnection(newConv.id, userName, userEmail || '');
    }
  };

  const sendMessage = async () => {
    if ((!message.trim() && !stagedImage) || sending || sessionTimedOut) return;

    if (chatStep === 'landing') {
      handleLandingMessage();
      setMessage('');
      return;
    }

    // In compose step, create conversation with the user's actual first message
    if (chatStep === 'compose') {
      if (!message.trim()) return;
      setSending(true);
      await handleCreateConversationAndSend(message.trim());
      setMessage('');
      setSending(false);
      return;
    }

    setSending(true);
    trackActivity();
    try {
      let convId = conversationId;
      if (!convId) {
        setSending(false);
        return;
      }

      let imageUrl: string | null = null;
      if (stagedImage) {
        const ext = stagedImage.file.name.split('.').pop();
        const uploadId = user?.id || getGuestId();
        const path = `${uploadId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('chat-images').upload(path, stagedImage.file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('chat-images').getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const optimisticMsg: ChatMessage = {
        id: 'temp-' + Date.now(),
        conversation_id: convId,
        sender_type: 'user',
        message: message.trim() || null,
        image_url: imageUrl,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimisticMsg]);

      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: convId,
        sender_type: 'user',
        sender_id: user?.id,
        message: message.trim() || null,
        image_url: imageUrl,
      });
      if (error) throw error;

      await supabase.from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', convId);

      const sentText = message.trim();
      setMessage('');
      setStagedImage(null);
      broadcastTyping(false);

      // Email notifications are sent only on: first message, 3-min warning, and session close
      // No per-message notifications to avoid Resend quota issues

      // Check if user is asking to talk to VIP persona
      if (sentText && isElonMuskRequest(sentText) && convId && !elonMode) {
        const uName = user ? (profileData?.full_name || user.email?.split('@')[0] || 'User') : guestName.trim();
        const uEmail = user ? (profileData?.email || user.email || '') : guestEmail.trim();
        requestVipConnection(convId, uName, uEmail);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setSessionTimedOut(false);
    setTimeoutWarning(false);
    setSpecialistJoined(false);
    setElonMode(false);
    setGuestName('');
    setGuestEmail('');
    setVerificationCode('');
    setVerificationError('');
    setFirstMessage('');
    setChatStep('landing');
    setProactiveMessage(null);
    sessionStorage.removeItem('chat-greeted');
    localStorage.removeItem('chat-guest-id');
    localStorage.removeItem('chat-active-conversation');
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setStagedImage({ file, preview });
    setShowFilePicker(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Build display avatars from team members (up to 3)
  const teamAvatars = (() => {
    const members = specialistProfile.teamMembers || [];
    const fallbackGradients = [
      'from-blue-400 to-blue-600',
      'from-pink-400 to-pink-600',
      'from-teal-400 to-teal-600',
    ];
    const fallbackEmojis = ['👨', '👩', '👨‍💼'];
    const avatars: { imageUrl?: string; name: string; fallbackGradient: string; fallbackEmoji: string }[] = [];
    for (let i = 0; i < 3; i++) {
      if (members[i]) {
        avatars.push({ imageUrl: members[i].imageUrl, name: members[i].name, fallbackGradient: fallbackGradients[i], fallbackEmoji: fallbackEmojis[i] });
      } else {
        avatars.push({ name: '', fallbackGradient: fallbackGradients[i], fallbackEmoji: fallbackEmojis[i] });
      }
    }
    return avatars;
  })();

  const totalSpecialists = (specialistProfile.teamMembers || []).length;

  // FAQ items for helpful resources
  const faqItems = [
    { iconType: 'trending' as const, label: 'How do I make an investment?', question: 'Hi, I would like to know how to make an investment. Can you help me?', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', hoverAccent: 'hover:border-l-blue-500' },
    { iconType: 'wallet' as const, label: 'How do I withdraw funds?', question: 'Hi, I need help withdrawing my funds. Can you guide me through the process?', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', hoverAccent: 'hover:border-l-purple-500' },
    { iconType: 'shield' as const, label: 'Account verification help', question: 'Hi, I need help with verifying my account/identity. What documents do I need?', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', hoverAccent: 'hover:border-l-amber-500' },
    
  ];

  // State for recent conversations
  const [recentConversations, setRecentConversations] = useState<Array<{
    id: string;
    lastMessage: string;
    date: string;
    status: string;
  }>>([]);

  // Fetch recent closed conversations
  useEffect(() => {
    const fetchRecentConversations = async () => {
      try {
        let convs: any[] = [];
        if (user) {
          const { data } = await supabase
            .from('chat_conversations')
            .select('id, status, updated_at, last_message_at')
            .eq('user_id', user.id)
            .eq('status', 'closed')
            .order('updated_at', { ascending: false })
            .limit(3);
          convs = data || [];
        } else {
          const guestId = getGuestId();
          const { data } = await supabase
            .from('chat_conversations')
            .select('id, status, updated_at, last_message_at')
            .eq('user_name', guestId)
            .eq('status', 'closed')
            .order('updated_at', { ascending: false })
            .limit(3);
          convs = data || [];
        }

        if (convs.length > 0) {
          const convIds = convs.map(c => c.id);
          // Fetch last message for each conversation
          const results = await Promise.all(
            convIds.map(async (cid) => {
              const { data: msgs } = await supabase
                .from('chat_messages')
                .select('message, sender_type')
                .eq('conversation_id', cid)
                .order('created_at', { ascending: false })
                .limit(1);
              return { convId: cid, lastMsg: msgs?.[0] };
            })
          );

          const formatted = convs.map((conv) => {
            const match = results.find(r => r.convId === conv.id);
            const preview = match?.lastMsg?.message || 'No messages';
            const timeAgo = getTimeAgo(new Date(conv.updated_at));
            return {
              id: conv.id,
              lastMessage: preview.length > 40 ? preview.substring(0, 40) + '...' : preview,
              date: timeAgo,
              status: conv.status,
            };
          });
          setRecentConversations(formatted);
        }
      } catch (err) {
        console.log('Could not fetch recent conversations:', err);
      }
    };
    fetchRecentConversations();
  }, [user]);

  // Helper: time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks}w ago`;
  };

  // Handle FAQ click - pre-fill message and go to compose
  const handleFaqClick = (question: string) => {
    setFirstMessage(question);
    setMessage(question);
    if (user) {
      setChatStep('compose');
    } else {
      setChatStep('name_email');
    }
  };

  // Get WhatsApp URL for FAQ item
  const getWhatsAppUrl = () => {
    const phone = supportProfile.supportName ? '' : '';
    // Use admin settings phone if available
    return `https://wa.me/`;
  };

  // Render the landing/support center screen (Intercom-style)
  const renderLanding = () => (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Blue hero section - extends from header */}
      <div className="bg-gradient-to-b from-electric-blue to-blue-600 px-6 pt-6 pb-12 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white text-2xl font-bold"
        >
          Hi there 👋
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/80 text-sm mt-1"
        >
          How can we help?
        </motion.p>
      </div>

      {/* White card section */}
      <div className="px-4 -mt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5"
        >
          <h4 className="text-gray-900 font-semibold text-base mb-4">Let's have a conversation</h4>
          
          {/* Team avatars + reply time row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center -space-x-2 flex-shrink-0">
              {teamAvatars.map((avatar, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 + 0.08 * i, type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative"
                  style={{ zIndex: 3 - i }}
                >
                  {avatar.imageUrl ? (
                    <img
                      src={avatar.imageUrl}
                      alt={avatar.name}
                      width={72}
                      height={72}
                      loading="eager"
                      style={{ imageRendering: 'auto' }}
                      className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                  ) : (
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatar.fallbackGradient} border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                      {avatar.fallbackEmoji}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-gray-500 text-xs leading-tight">Our usual reply time</p>
              <div className="flex items-center gap-1 mt-0.5">
                <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-gray-700 text-xs font-medium">{supportProfile.replyTime}</span>
              </div>
            </div>
          </div>

          {/* Send us a message button */}
          <button
            onClick={() => handleLandingMessage()}
            className="w-full flex items-center justify-between bg-gradient-to-r from-electric-blue to-blue-600 text-white rounded-xl px-4 py-3 hover:from-blue-600 hover:to-blue-700 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Send className="w-4 h-4" />
              <span className="text-sm font-medium">Send us a message</span>
            </div>
            <svg className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </motion.div>
      </div>

      {/* Recent Conversations */}
      {recentConversations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-4 pb-3"
        >
          <h5 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">Recent conversations</h5>
          <div className="space-y-1.5">
            {recentConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  // Start a new conversation instead of reopening closed ones
                  handleLandingMessage();
                }}
                className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50 hover:border-gray-200 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm font-medium truncate">{conv.lastMessage}</p>
                  <p className="text-gray-400 text-xs">{conv.date}</p>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Helpful Resources */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: recentConversations.length > 0 ? 0.6 : 0.5 }}
        className="px-4 pb-3"
      >
        <h5 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">Helpful resources</h5>
        <div className="space-y-1.5">
          {faqItems.map((item, i) => {
            const iconElement = item.iconType === 'trending' ? (
              <TrendingUp className={`w-4 h-4 ${item.iconColor}`} />
            ) : item.iconType === 'wallet' ? (
              <Wallet className={`w-4 h-4 ${item.iconColor}`} />
            ) : (
              <ShieldCheck className={`w-4 h-4 ${item.iconColor}`} />
            );

            return (
              <button
                key={i}
                onClick={() => handleFaqClick(item.question!)}
                className={`w-full flex items-center gap-3 bg-white border border-gray-100 border-l-2 border-l-transparent rounded-xl px-4 py-3 hover:bg-gray-50 hover:border-gray-200 ${item.hoverAccent} transition-all text-left group`}
              >
                <div className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                  {iconElement}
                </div>
                <span className="text-gray-900 text-sm font-medium flex-1">{item.label}</span>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Footer Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="px-4 pb-4 pt-1 mt-auto"
      >
        <div className="flex items-center justify-center gap-1.5 py-2">
          <svg className="w-3 h-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>
          <span className="text-gray-400 text-[10px] font-medium">Powered by Tesla Stock Platform</span>
        </div>
      </motion.div>
    </div>
  );

  // Render compose step -- greeting shown, user types first real message
  const renderCompose = () => (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages area with greeting bubble */}
      <div className="flex-1 overflow-y-auto chat-scrollbar p-3 sm:p-4 space-y-3 bg-white" style={{ overscrollBehavior: 'contain' }}>
        {/* Admin greeting bubble */}
        <div className="flex justify-start">
          <div className="flex items-start gap-2">
            <img src={chatBubbleIcon} alt="Support" width={32} height={32} loading="eager" className="w-8 h-8 rounded-full flex-shrink-0 mt-1 object-contain" />
            <div className="max-w-[75%] rounded-2xl rounded-bl-md px-3.5 py-2.5 bg-gray-100 text-gray-900">
              <p className="text-[10px] font-semibold text-blue-600 mb-1">{displayName}</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>{getGreetingText()}</p>
            </div>
          </div>
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white flex-shrink-0 p-3">
        <div className="flex items-end gap-2">
          <div className="relative flex-shrink-0">
            <input ref={galleryInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileSelect} tabIndex={-1} />
            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploading}
              className="p-2 text-gray-500 hover:text-electric-blue transition-colors rounded-lg hover:bg-gray-100"
              aria-label="Attach image"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={() => {}}
            placeholder="Type your message..."
            rows={2}
            className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-electric-blue resize-none min-h-[48px] max-h-[100px]"
            style={{ color: '#111827', WebkitTextFillColor: '#111827', opacity: 1 }}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || sending}
            className="p-2.5 bg-electric-blue text-white rounded-xl hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );

  // Render name/email form
  const renderNameEmailForm = () => (
    <div className="flex flex-col items-center justify-center py-8 px-6 flex-1">
      <img src={chatSupportIcon} alt="Support" className="w-12 h-12 object-contain mb-4" />
      <h4 className="text-gray-900 font-bold text-base mb-1">Let's get started</h4>
      <p className="text-gray-500 text-sm mb-5 text-center">Please provide your details so we can assist you better.</p>
      
      <div className="w-full space-y-3 max-w-[300px]">
        <div>
          <label className="text-gray-700 text-xs font-medium mb-1 block">Your Name</label>
          <Input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter your name"
            className="h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm"
          />
        </div>
        <div>
          <label className="text-gray-700 text-xs font-medium mb-1 block">Email Address</label>
          <Input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="your@email.com"
            className="h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm"
          />
        </div>
        {verificationError && (
          <p className="text-red-500 text-xs">{verificationError}</p>
        )}
        <button
          onClick={handleSendVerification}
          disabled={!guestName.trim() || !guestEmail.trim() || verificationSending}
          className="w-full h-10 bg-electric-blue text-white rounded-lg text-sm font-semibold hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {verificationSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Continue
        </button>
      </div>
    </div>
  );

  // Render verification step
  const renderVerification = () => (
    <div className="flex flex-col items-center justify-center py-8 px-6 flex-1">
      <div className="w-14 h-14 rounded-full bg-electric-blue/10 flex items-center justify-center mb-4">
        <span className="text-2xl">📧</span>
      </div>
      <h4 className="text-gray-900 font-bold text-base mb-1">Verify Your Email</h4>
      <p className="text-gray-500 text-sm mb-2 text-center">
        We sent a 4-digit code to <span className="font-medium text-gray-700">{guestEmail}</span>
      </p>
      <p className="text-gray-400 text-xs mb-5 text-center">
        If you do not see the email in your inbox, please check your spam folder.
      </p>
      
      <div className="flex gap-2 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            value={verificationCode[i] || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              const newCode = verificationCode.split('');
              newCode[i] = val;
              setVerificationCode(newCode.join(''));
              if (val && e.target.nextElementSibling) {
                (e.target.nextElementSibling as HTMLInputElement).focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !verificationCode[i] && e.currentTarget.previousElementSibling) {
                (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
              }
            }}
            className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:border-electric-blue focus:outline-none transition-colors"
          />
        ))}
      </div>

      {verificationError && (
        <p className="text-red-500 text-xs mb-3">{verificationError}</p>
      )}
      
      <button
        onClick={handleVerifyCode}
        disabled={verificationCode.length !== 4 || verificationSending}
        className="w-full max-w-[200px] h-10 bg-electric-blue text-white rounded-lg text-sm font-semibold hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {verificationSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Verify
      </button>
    </div>
  );

  // Render waiting screen
  const renderWaiting = () => (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto chat-scrollbar p-3 sm:p-4 space-y-3 bg-white" style={{ overscrollBehavior: 'contain' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : msg.sender_type === 'system' ? 'justify-center' : 'justify-start'}`}>
            {msg.sender_type === 'system' ? (
              msg.message?.includes('joined the conversation') ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-[300px] border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={activeSpecialistImage || supportAvatar}
                      alt={activeSpecialistName}
                      width={80}
                      height={80}
                      loading="eager"
                      className="w-10 h-10 rounded-full border-2 border-teal-400 object-cover"
                      style={{ imageRendering: 'auto' }}
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-800">{activeSpecialistName}</p>
                      {(() => {
                        if (elonMode) return <p className="text-[10px] text-teal-700 font-medium">CEO of Tesla</p>;
                        const member = (specialistProfile.teamMembers || []).find(m => m.name === specialistProfile.specialistName);
                        return member?.role ? (
                          <p className="text-[10px] text-teal-700 font-medium">{member.role}</p>
                        ) : null;
                      })()}
                      <p className="text-xs text-teal-600 font-medium">has joined the conversation</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="px-3 py-1.5 bg-gray-100 rounded-full">
                  <p className="text-xs text-gray-500 font-medium">{msg.message}</p>
                </div>
              )
            ) : (
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 overflow-hidden ${
                msg.sender_type === 'user'
                  ? 'bg-electric-blue text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}>
                {msg.message && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>{msg.message}</p>
                )}
                <p className={`text-[10px] mt-1 ${msg.sender_type === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            )}
          </div>
        ))}
        
        {!specialistJoined && !sessionTimedOut && (
          <div className="flex justify-center">
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-electric-blue mx-auto mb-2" />
              <p className="text-gray-600 text-sm font-medium">
                {vipRequested 
                  ? `Please hold while we connect you to ${vipPersonaName || 'Elon Musk'}...`
                  : 'Please hold while we connect you to our customer support specialist.'}
              </p>
              <p className="text-gray-400 text-xs mt-1">This usually takes a few minutes.</p>
            </div>
          </div>
        )}

        {/* Timeout warning */}
        {timeoutWarning && !sessionTimedOut && (
          <div className="flex justify-center">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 max-w-[300px]">
              <p className="text-amber-700 text-xs font-medium text-center">⚠️ Your session will time out in 3 minutes due to inactivity.</p>
            </div>
          </div>
        )}

        {/* Session timed out */}
        {sessionTimedOut && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-[300px]">
              <p className="text-red-700 text-sm font-semibold text-center mb-1">Session Timed Out</p>
              <p className="text-red-600 text-xs text-center">Your session has timed out due to inactivity. For your security, please start a new chat to continue.</p>
              <button
                onClick={handleStartNewChat}
                className="mt-3 w-full h-9 bg-electric-blue text-white rounded-lg text-sm font-semibold hover:bg-electric-blue/90 transition-colors"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!sessionTimedOut && (
        <div className="border-t border-gray-200 bg-white flex-shrink-0 p-3">
          <div className="flex items-end gap-2">
            <div className="relative flex-shrink-0">
              <input ref={galleryInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileSelect} tabIndex={-1} />
              <button
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploading}
                className="p-2 text-gray-500 hover:text-electric-blue transition-colors rounded-lg hover:bg-gray-100"
                aria-label="Attach image"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
              onKeyDown={() => {}}
              placeholder="Type a message..."
              rows={2}
              className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-electric-blue resize-none min-h-[48px] max-h-[100px]"
              style={{ color: '#111827', WebkitTextFillColor: '#111827', opacity: 1 }}
            />
            <button
              onClick={sendMessage}
              disabled={(!message.trim() && !stagedImage) || sending}
              className="p-2.5 bg-electric-blue text-white rounded-xl hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Render active chat
  const renderChat = () => (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto chat-scrollbar p-3 sm:p-4 space-y-3 bg-white" style={{ overscrollBehavior: 'contain' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : msg.sender_type === 'system' ? 'justify-center' : 'justify-start'}`}>
            {msg.sender_type === 'system' ? (
              msg.message?.includes('joined the conversation') ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-[300px] border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={activeSpecialistImage || supportAvatar}
                      alt={activeSpecialistName}
                      width={80}
                      height={80}
                      loading="eager"
                      className="w-10 h-10 rounded-full border-2 border-teal-400 object-cover"
                      style={{ imageRendering: 'auto' }}
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-800">{activeSpecialistName}</p>
                      {(() => {
                        if (elonMode) return <p className="text-[10px] text-teal-700 font-medium">CEO of Tesla</p>;
                        const member = (specialistProfile.teamMembers || []).find(m => m.name === specialistProfile.specialistName);
                        return member?.role ? (
                          <p className="text-[10px] text-teal-700 font-medium">{member.role}</p>
                        ) : null;
                      })()}
                      <p className="text-xs text-teal-600 font-medium">has joined the conversation</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium px-2">New</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">{msg.message}</p>
                </div>
              )
            ) : (
              <>
                {msg.sender_type === 'admin' && (
                  <img src={activeSpecialistImage || avatarSrc} alt="Support" width={64} height={64} loading="eager" className="w-8 h-8 rounded-full flex-shrink-0 mt-1 mr-2 border border-gray-200 object-cover" style={{ imageRendering: 'auto' }} />
                )}
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 overflow-hidden ${
                  msg.sender_type === 'user'
                    ? 'bg-electric-blue text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                  {msg.sender_type === 'admin' && (
                    <p className="text-[10px] font-semibold text-blue-600 mb-1">{activeSpecialistName}</p>
                  )}
                  {msg.image_url && (
                    <img
                      src={msg.image_url}
                      alt="Shared"
                      className="rounded-lg max-w-full max-h-48 mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setLightboxUrl(msg.image_url!)}
                    />
                  )}
                  {msg.message && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>{msg.message}</p>
                  )}
                  <p className={`text-[10px] mt-1 ${msg.sender_type === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Admin typing indicator */}
        {adminTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <img src={activeSpecialistImage || avatarSrc} alt="Support" width={64} height={64} loading="eager" className="w-8 h-8 rounded-full flex-shrink-0 mt-1 border border-gray-200 object-cover" style={{ imageRendering: 'auto' }} />
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="w-[6px] h-[6px] bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-[6px] h-[6px] bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-[6px] h-[6px] bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeout warning */}
        {timeoutWarning && !sessionTimedOut && (
          <div className="flex justify-center">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 max-w-[300px]">
              <p className="text-amber-700 text-xs font-medium text-center">⚠️ Your session will time out in 3 minutes due to inactivity.</p>
            </div>
          </div>
        )}

        {sessionTimedOut && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-[300px]">
              <p className="text-red-700 text-sm font-semibold text-center mb-1">Session Timed Out</p>
              <p className="text-red-600 text-xs text-center">Your session has timed out due to inactivity. For your security, please start a new chat to continue.</p>
              <button
                onClick={handleStartNewChat}
                className="mt-3 w-full h-9 bg-electric-blue text-white rounded-lg text-sm font-semibold hover:bg-electric-blue/90 transition-colors"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!sessionTimedOut && (
        <div className="border-t border-gray-200 bg-white flex-shrink-0">
          {stagedImage && (
            <div className="px-3 pt-3 pb-1">
              <div className="relative inline-block">
                <img src={stagedImage.preview} alt="Preview" className="h-20 rounded-lg border border-gray-200" />
                <button
                  onClick={() => { URL.revokeObjectURL(stagedImage.preview); setStagedImage(null); }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs hover:bg-destructive/90"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div className="p-3 flex items-end gap-2">
            <div className="relative flex-shrink-0">
              <input ref={galleryInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileSelect} tabIndex={-1} />
              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" className="sr-only" onChange={handleFileSelect} tabIndex={-1} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleFileSelect} tabIndex={-1} />
              <button
                onClick={(e) => { e.stopPropagation(); setShowFilePicker(!showFilePicker); }}
                disabled={uploading}
                className="p-2 text-gray-500 hover:text-electric-blue transition-colors rounded-lg hover:bg-gray-100"
                aria-label="Attach image"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className={`w-5 h-5 transition-transform duration-200 ${showFilePicker ? 'rotate-45' : ''}`} />}
              </button>

              <AnimatePresence>
                {showFilePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[160px] z-10 will-change-transform"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        galleryInputRef.current?.click();
                        setShowFilePicker(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-electric-blue" />
                      Photo Library
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
              onKeyDown={() => {}}
              placeholder="Type a message..."
              rows={2}
              className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-electric-blue resize-none overflow-y-auto max-h-[120px] min-h-[48px] transition-[height] duration-200 ease-in-out"
              style={{ color: '#111827', WebkitTextFillColor: '#111827', opacity: 1 }}
            />
            <button
              onClick={sendMessage}
              disabled={(!message.trim() && !stagedImage) || sending}
              className="p-2.5 bg-electric-blue text-white rounded-xl hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Determine what shows in header based on step
  const headerTitle = specialistJoined ? activeSpecialistName : 'Support Center';
  const headerSubtitle = specialistJoined ? 'Active' : `We typically reply under ${supportProfile.replyTime}`;
  const showHeaderTeamAvatars = !specialistJoined;

  return (
    <>
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <button onClick={() => setLightboxUrl(null)} className="absolute top-4 right-4 text-white/80 hover:text-white z-10">
              <X className="w-8 h-8" />
            </button>
            <img src={lightboxUrl} alt="Full view" className="max-w-full max-h-full object-contain rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ y: 60, opacity: 0, scale: 0.8 }}
            animate={unreadCount > 0 
              ? { y: 0, opacity: 1, scale: [1, 1.08, 1], transition: { scale: { duration: 0.4, repeat: Infinity, repeatDelay: 3 }, y: { type: "spring", stiffness: 100, damping: 15, delay: typeof window !== 'undefined' && localStorage.getItem('chat-avatar-visited') ? 0 : 3 }, opacity: { delay: typeof window !== 'undefined' && localStorage.getItem('chat-avatar-visited') ? 0 : 3 } } }
              : { y: [0, -4, 0], opacity: 1, scale: 1, transition: { y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: typeof window !== 'undefined' && localStorage.getItem('chat-avatar-visited') ? 0 : 3 }, opacity: { duration: 0.4, delay: typeof window !== 'undefined' && localStorage.getItem('chat-avatar-visited') ? 0 : 3 }, scale: { type: "spring", stiffness: 100, damping: 15, delay: typeof window !== 'undefined' && localStorage.getItem('chat-avatar-visited') ? 0 : 3 } } }
            }
            exit={{ scale: 0, opacity: 0 }}
            onAnimationComplete={() => localStorage.setItem('chat-avatar-visited', 'true')}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[88px] right-4 sm:right-6 z-[60] w-14 h-14 rounded-full shadow-lg shadow-black/20 flex items-center justify-center bg-white border-2 border-electric-blue/30 p-1.5 hover:scale-105 active:scale-95 transition-transform"
            aria-label="Open live chat"
          >
            <img src={chatSupportIcon} alt="Support Center" className="w-full h-full object-contain" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-tesla-red text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 sm:bottom-4 sm:right-6 sm:left-auto sm:top-auto sm:inset-auto z-[60] w-full h-full sm:w-[380px] sm:h-[min(520px,calc(100vh-80px))] flex flex-col bg-white sm:border sm:border-gray-200 border-0 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => { if (showFilePicker) { setShowFilePicker(false); } }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-electric-blue to-blue-600 px-4 py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {showHeaderTeamAvatars ? (
                    <div className="flex items-center -space-x-2 flex-shrink-0">
                      {teamAvatars.map((avatar, i) => (
                        <div key={i} className="relative" style={{ zIndex: 3 - i }}>
                          {avatar.imageUrl ? (
                            <img
                              src={avatar.imageUrl}
                              alt={avatar.name}
                              width={56}
                              height={56}
                              loading="eager"
                              style={{ imageRendering: 'auto' }}
                              className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover"
                            />
                          ) : (
                            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatar.fallbackGradient} border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                              {avatar.fallbackEmoji}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/30 bg-white">
                      <img 
                        src={activeSpecialistImage || supportAvatar} 
                        alt={activeSpecialistName}
                        width={80}
                        height={80}
                        loading="eager"
                        className="w-full h-full object-cover" 
                        style={{ imageRendering: 'auto' }}
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{headerTitle}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 animate-pulse" />
                      <p className="text-white/80 text-[11px] truncate">{headerSubtitle}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content based on step */}
            {chatStep === 'landing' && renderLanding()}
            {chatStep === 'compose' && renderCompose()}
            {chatStep === 'name_email' && renderNameEmailForm()}
            {chatStep === 'verifying' && renderVerification()}
            {chatStep === 'waiting' && renderWaiting()}
            {chatStep === 'chatting' && renderChat()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChatWidget;
