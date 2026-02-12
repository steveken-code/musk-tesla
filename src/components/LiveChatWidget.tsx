import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import supportAvatar from '@/assets/support-avatar.png';
import chat247Icon from '@/assets/chat-247-icon.png';

// Preload notification sound
const NOTIFICATION_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/12/12/audio_e8c1ae0edd.mp3';
const notificationAudio = typeof window !== 'undefined' ? new Audio(NOTIFICATION_SOUND_URL) : null;
if (notificationAudio) {
  notificationAudio.volume = 0.4;
  notificationAudio.preload = 'auto';
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'admin';
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

const DEFAULT_SUPPORT_PROFILE: SupportProfile = {
  supportName: 'Tesla Stock Platform',
  replyTime: '30 minutes',
  avatarUrl: '',
};

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const avatarSrc = supportProfile.avatarUrl || supportAvatar;
  const displayName = supportProfile.supportName || 'Tesla Stock Platform';

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

  // Fetch custom greeting & support profile settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['chat_greeting_settings', 'support_profile_settings']);
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
        }
      }
    };
    fetchSettings();
  }, []);

  // Load or create conversation - guests persist via localStorage guest ID
  const getOrCreateConversation = useCallback(async () => {
    const guestId = getGuestId();
    
    if (user) {
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing) { setConversationId(existing.id); return existing.id; }
    } else {
      // Guest: find by user_name matching guest ID - never wipe
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_name', guestId)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing) { setConversationId(existing.id); return existing.id; }
    }

    const { data: newConv, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user?.id || null,
        user_name: user ? (profileData?.full_name || user.email?.split('@')[0] || 'User') : guestId,
        user_email: user ? (profileData?.email || user.email) : null,
      })
      .select('id')
      .single();

    if (error) { console.error('Error creating conversation:', error); return null; }
    setConversationId(newConv.id);
    return newConv.id;
  }, [user, profileData]);

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
        setMessages(prev => [...prev, newMsg]);
        if (newMsg.sender_type === 'admin' && !isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, isOpen]);

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

  // Check for existing conversation on mount - guests persist
  useEffect(() => {
    const init = async () => {
      if (user) {
        const { data } = await supabase
          .from('chat_conversations')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) {
          setConversationId(data.id);
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', data.id)
            .eq('sender_type', 'admin')
            .eq('is_read', false);
          if (count) setUnreadCount(count);
        }
      } else {
        const guestId = getGuestId();
        const { data } = await supabase
          .from('chat_conversations')
          .select('id')
          .eq('user_name', guestId)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) {
          setConversationId(data.id);
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', data.id)
            .eq('sender_type', 'admin')
            .eq('is_read', false);
          if (count) setUnreadCount(count);
        }
      }
    };
    init();
  }, [user]);

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

    const typingTimer = setTimeout(() => { setProactiveTyping(true); }, 800);
    const messageTimer = setTimeout(() => {
      setProactiveTyping(false);
      setProactiveMessage(greetingText);
      notificationAudio?.play().catch(() => {});
    }, 2600);

    return () => { clearTimeout(typingTimer); clearTimeout(messageTimer); };
  }, [isOpen, proactiveMessage, customGreeting, user, profileData]);

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

  const sendMessage = async () => {
    if ((!message.trim() && !stagedImage) || sending) return;
    setSending(true);
    try {
      let convId = conversationId;
      if (!convId) {
        convId = await getOrCreateConversation();
        if (!convId) { setSending(false); return; }
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

      supabase.functions.invoke('send-chat-notification', {
        body: {
          userName: user ? (profileData?.full_name || user.email?.split('@')[0]) : 'Guest',
          userEmail: user ? (profileData?.email || user.email) : 'Anonymous',
          message: message.trim() || '[Image sent]',
        },
      }).catch(() => {});

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

      {/* Chat Bubble - 24/7 support avatar */}
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
            className="fixed bottom-[88px] right-4 sm:right-6 z-[60] w-14 h-14 rounded-full shadow-lg shadow-black/20 flex items-center justify-center overflow-hidden bg-white border-2 border-electric-blue/30 p-1"
            aria-label="Open live chat"
          >
            <img src={chat247Icon} alt="24/7 Live Support" className="w-full h-full object-contain" />
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
                  <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/40 bg-white">
                    <img src={avatarSrc} alt="Support" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{displayName}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 animate-pulse" />
                      <p className="text-white/80 text-[11px] truncate">Typically replies under {supportProfile.replyTime}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto chat-scrollbar p-3 sm:p-4 space-y-3 bg-white" style={{ 
              WebkitOverflowScrolling: 'touch' as any,
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
            }}>
              {!proactiveTyping && !proactiveMessage && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <div className="relative mb-4">
                    <img src={chat247Icon} alt="24/7 Support" className="w-20 h-20 object-contain" />
                  </div>
                  <h4 className="text-gray-900 font-semibold text-base">{displayName}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <p className="text-gray-500 text-xs">Typically replies under {supportProfile.replyTime}</p>
                  </div>
                  <div className="mt-5 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 max-w-[260px]">
                    <p className="text-gray-600 text-sm text-center leading-relaxed">
                      👋 Start a conversation — we're here to help!
                    </p>
                  </div>
                </div>
              )}

              {/* Proactive typing indicator */}
              {proactiveTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <img src={chat247Icon} alt="24/7 Support" className="w-7 h-7 rounded-full flex-shrink-0 mt-1" />
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

              {/* Proactive greeting message */}
              {proactiveMessage && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <img src={chat247Icon} alt="24/7 Support" className="w-7 h-7 rounded-full flex-shrink-0 mt-1" />
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="max-w-[80%] bg-gray-100 rounded-2xl rounded-bl-md px-3.5 py-2.5"
                    >
                      <p className="text-[10px] font-semibold text-blue-600 mb-1">{displayName}</p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-900">{proactiveMessage}</p>
                    </motion.div>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender_type === 'admin' && (
                    <img src={avatarSrc} alt="Support" className="w-7 h-7 rounded-full flex-shrink-0 mt-1 mr-2 border border-gray-200" />
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 overflow-hidden ${
                    msg.sender_type === 'user'
                      ? 'bg-electric-blue text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    {msg.sender_type === 'admin' && (
                      <p className="text-[10px] font-semibold text-blue-600 mb-1">{displayName}</p>
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
                </div>
              ))}

              {/* Admin typing indicator */}
              {adminTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <img src={avatarSrc} alt="Support" className="w-7 h-7 rounded-full flex-shrink-0 mt-1 border border-gray-200" />
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
                {/* Staged Image Preview */}
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
                  {/* File picker */}
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
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export default LiveChatWidget;
