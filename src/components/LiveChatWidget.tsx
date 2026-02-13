import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import supportAvatar from '@/assets/support-avatar.png';
import chatSupportIcon from '@/assets/chat-support-icon.png';
import { Input } from '@/components/ui/input';

const NOTIFICATION_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/12/12/audio_e8c1ae0edd.mp3';
const notificationAudio = typeof window !== 'undefined' ? new Audio(NOTIFICATION_SOUND_URL) : null;
if (notificationAudio) {
  notificationAudio.volume = 0.4;
  notificationAudio.preload = 'auto';
}

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

interface SpecialistProfile {
  specialistName: string;
  specialistImageUrl: string;
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

type ChatStep = 'landing' | 'name_email' | 'verifying' | 'waiting' | 'chatting';

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
  const [conversationId, setConversationId] = useState<string | null>(null);
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
  const [firstMessage, setFirstMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const avatarSrc = specialistJoined && specialistProfile.specialistImageUrl
    ? specialistProfile.specialistImageUrl
    : (supportProfile.avatarUrl || supportAvatar);
  const displayName = specialistJoined
    ? specialistProfile.specialistName
    : (supportProfile.supportName || 'Tesla Stock Platform');

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
        .in('setting_key', ['chat_greeting_settings', 'support_profile_settings', 'specialist_settings']);
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
            });
          }
        }
      }
    };
    fetchSettings();
  }, []);

  // Check for existing conversation on mount
  useEffect(() => {
    const init = async () => {
      let convData: any = null;
      if (user) {
        const { data } = await supabase
          .from('chat_conversations')
          .select('id, specialist_joined, status')
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
          .select('id, specialist_joined, status')
          .eq('user_name', guestId)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        convData = data;
      }
      
      if (convData) {
        setConversationId(convData.id);
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

  // Load messages
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
        setMessages(prev => {
          // Prevent duplicates (optimistic update)
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        if (newMsg.sender_type === 'admin' && !isOpen) {
          setUnreadCount(prev => prev + 1);
        }
        // If system message about specialist joining
        if (newMsg.sender_type === 'system' && newMsg.message?.includes('joined the conversation')) {
          setSpecialistJoined(true);
          setChatStep('chatting');
        }
      })
      .subscribe();

    // Also listen for conversation status changes
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
        if (updated.status === 'closed') {
          // Chat was closed, reset
          setConversationId(null);
          setMessages([]);
          setSpecialistJoined(false);
          setChatStep('landing');
          setProactiveMessage(null);
          sessionStorage.removeItem('chat-greeted');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(convChannel);
    };
  }, [conversationId, isOpen, specialistJoined]);

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

  // Proactive greeting
  useEffect(() => {
    if (!isOpen) return;
    if (chatStep !== 'landing') return;
    if (sessionStorage.getItem('chat-greeted')) return;
    if (proactiveMessage) return;

    sessionStorage.setItem('chat-greeted', 'true');

    let greetingText: string;
    if (customGreeting && customGreeting.mode === 'custom') {
      if (user && customGreeting.userGreeting) {
        greetingText = customGreeting.userGreeting.replace(
          /\{\{user_name\}\}/g,
          profileData?.full_name || 'there'
        );
      } else {
        greetingText = customGreeting.guestGreeting;
      }
    } else {
      greetingText = getGreeting();
    }

    // Show greeting immediately when chat opens
    setProactiveMessage(greetingText);
    notificationAudio?.play().catch(() => {});
    const typingTimer: ReturnType<typeof setTimeout> | null = null;
    const messageTimer: ReturnType<typeof setTimeout> | null = null;

    return () => { clearTimeout(typingTimer); clearTimeout(messageTimer); };
  }, [isOpen, proactiveMessage, customGreeting, user, profileData, chatStep]);

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
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => broadcastTyping(false), 3000);
  };

  // Handle first message from landing — show name/email form for guests, skip for logged-in users
  const handleLandingMessage = (msg: string) => {
    setFirstMessage(msg);
    if (user) {
      // Logged-in users skip verification
      handleCreateConversationAndSend(msg);
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
      const { data, error } = await supabase
        .from('chat_verification_codes')
        .select('*')
        .eq('email', guestEmail.trim())
        .eq('code', verificationCode)
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        setVerificationError('Invalid code. Please try again.');
        setVerificationSending(false);
        return;
      }

      // Check expiry
      if (new Date(data.expires_at) < new Date()) {
        setVerificationError('Code has expired. Please request a new one.');
        setVerificationSending(false);
        return;
      }

      // Mark as verified
      await supabase
        .from('chat_verification_codes')
        .update({ verified: true })
        .eq('id', data.id);

      // Now create conversation and send first message
      await handleCreateConversationAndSend(firstMessage);
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

    // Send the first message with optimistic update
    const optimisticMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      conversation_id: newConv.id,
      sender_type: 'user',
      message: msg.trim() || null,
      image_url: null,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages([optimisticMsg]);

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

    // Notify admin
    supabase.functions.invoke('send-chat-notification', {
      body: {
        userName: userName,
        userEmail: userEmail || 'Anonymous',
        message: msg.trim() || '[Image sent]',
      },
    }).catch(() => {});
  };

  const sendMessage = async () => {
    if ((!message.trim() && !stagedImage) || sending) return;

    // If still on landing, trigger the flow
    if (chatStep === 'landing') {
      handleLandingMessage(message.trim());
      setMessage('');
      return;
    }

    setSending(true);
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

      // Optimistic update
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

      setMessage('');
      setStagedImage(null);
      broadcastTyping(false);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

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

  // Render the landing/support center screen
  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 flex-1">
      {/* Support Center Header */}
      <div className="relative mb-4">
        <img src={chatSupportIcon} alt="Support Center" className="w-16 h-16 object-contain" />
      </div>
      
      {/* Stacked Avatars (male/female placeholders) */}
      <div className="flex items-center -space-x-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-sm font-bold shadow-md">
          👨
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white flex items-center justify-center text-white text-sm font-bold shadow-md">
          👩
        </div>
      </div>

      <h4 className="text-gray-900 font-bold text-lg">Support Center</h4>
      <p className="text-gray-600 text-sm mt-0.5">Questions? Chat with us.</p>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <p className="text-gray-500 text-xs">Typically replies under {supportProfile.replyTime}</p>
      </div>

      {/* Greeting bubble */}
      {proactiveTyping && (
        <div className="mt-5 bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-[260px]">
          <div className="flex items-center gap-1">
            <span className="w-[6px] h-[6px] bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-[6px] h-[6px] bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-[6px] h-[6px] bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
      {proactiveMessage && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="mt-5 bg-gray-100 border border-gray-200 rounded-2xl px-5 py-3 max-w-[280px]"
        >
          <p className="text-gray-700 text-sm text-center leading-relaxed">{proactiveMessage}</p>
        </motion.div>
      )}
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
      {/* Messages area for waiting state (shows user's first message) */}
      <div className="flex-1 overflow-y-auto chat-scrollbar p-3 sm:p-4 space-y-3 bg-white">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : msg.sender_type === 'system' ? 'justify-center' : 'justify-start'}`}>
            {msg.sender_type === 'system' ? (
              <div className="px-3 py-1.5 bg-gray-100 rounded-full">
                <p className="text-xs text-gray-500 font-medium">{msg.message}</p>
              </div>
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
        
        {/* Waiting message */}
        {!specialistJoined && (
          <div className="flex justify-center">
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-electric-blue mx-auto mb-2" />
              <p className="text-gray-600 text-sm font-medium">Please hold while we connect you to our customer support specialist.</p>
              <p className="text-gray-400 text-xs mt-1">This usually takes a few minutes.</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area so user can send more messages while waiting */}
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
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-electric-blue resize-none min-h-[40px] max-h-[80px]"
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
    </div>
  );

  // Render active chat
  const renderChat = () => (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scrollbar p-3 sm:p-4 space-y-3 bg-white">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : msg.sender_type === 'system' ? 'justify-center' : 'justify-start'}`}>
            {msg.sender_type === 'system' ? (
              <div className="w-full py-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium px-2">New</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">{msg.message}</p>
              </div>
            ) : (
              <>
                {msg.sender_type === 'admin' && (
                  <img src={specialistProfile.specialistImageUrl || avatarSrc} alt="Support" className="w-7 h-7 rounded-full flex-shrink-0 mt-1 mr-2 border border-gray-200 object-cover" />
                )}
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 overflow-hidden ${
                  msg.sender_type === 'user'
                    ? 'bg-electric-blue text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                  {msg.sender_type === 'admin' && (
                    <p className="text-[10px] font-semibold text-blue-600 mb-1">{specialistProfile.specialistName}</p>
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
              <img src={specialistProfile.specialistImageUrl || avatarSrc} alt="Support" className="w-7 h-7 rounded-full flex-shrink-0 mt-1 border border-gray-200 object-cover" />
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
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
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-electric-blue resize-none overflow-y-auto max-h-[120px] min-h-[40px] transition-[height] duration-200 ease-in-out"
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
    </div>
  );

  // Determine what shows in header based on step
  const headerTitle = specialistJoined ? specialistProfile.specialistName : 'Support Center';
  const headerSubtitle = specialistJoined ? 'Active' : `Typically replies under ${supportProfile.replyTime}`;
  const headerAvatar = specialistJoined && specialistProfile.specialistImageUrl
    ? specialistProfile.specialistImageUrl
    : chatSupportIcon;

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
            className="fixed bottom-[88px] right-4 sm:right-6 z-[60] w-14 h-14 rounded-full shadow-lg shadow-black/20 flex items-center justify-center overflow-hidden bg-white border-2 border-electric-blue/30 p-1.5 hover:scale-105 active:scale-95 transition-transform"
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
                  <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border border-white/20 bg-white">
                    <img src={headerAvatar} alt="Support" className="w-full h-full object-cover" />
                  </div>
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
            {chatStep === 'landing' && (
              <>
                {renderLanding()}
                {/* Input at bottom for landing */}
                <div className="border-t border-gray-200 bg-white flex-shrink-0 p-3">
                  <div className="flex items-end gap-2">
                    <div className="relative flex-shrink-0">
                      <input ref={galleryInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileSelect} tabIndex={-1} />
                      <button
                        onClick={() => galleryInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:text-electric-blue transition-colors rounded-lg hover:bg-gray-100"
                        aria-label="Attach image"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-electric-blue resize-none min-h-[40px] max-h-[80px]"
                      style={{ color: '#111827', WebkitTextFillColor: '#111827', opacity: 1 }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim()}
                      className="p-2.5 bg-electric-blue text-white rounded-xl hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
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
