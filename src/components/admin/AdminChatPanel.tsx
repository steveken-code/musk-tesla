import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, Plus, Loader2, X, User, Clock, Camera, Image as ImageIcon, Paperclip, UserPlus, XCircle, Sparkles, Settings, Save, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
  guest_name?: string | null;
  specialist_joined?: boolean;
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

interface TeamMember {
  name: string;
  imageUrl: string;
  role: string;
}

interface SpecialistSettings {
  specialistName: string;
  specialistImageUrl: string;
  joinGreeting: string;
  teamMembers?: TeamMember[];
  vipPersonaName?: string;
  vipPersonaImage?: string;
}

const AdminChatPanel = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [userTyping, setUserTyping] = useState(false);
  const [stagedImage, setStagedImage] = useState<{ file: File; preview: string } | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  
  const [specialistSettings, setSpecialistSettings] = useState<SpecialistSettings>({ 
    specialistName: 'Support Specialist', 
    specialistImageUrl: '',
    joinGreeting: 'Hello! My name is {{name}}, your dedicated support specialist. How can I assist you today?',
    teamMembers: [],
    vipPersonaName: 'Elon Musk',
    vipPersonaImage: '',
  });
  const [teamMemberDraft, setTeamMemberDraft] = useState<TeamMember>({ name: '', imageUrl: '', role: '' });
  const [uploadingTeamAvatar, setUploadingTeamAvatar] = useState<number | 'new' | null>(null);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(15);
  const [timeoutDraft, setTimeoutDraft] = useState('15');
  const [savingTimeout, setSavingTimeout] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [showGreetingSettings, setShowGreetingSettings] = useState(false);
  const [greetingDraft, setGreetingDraft] = useState('');
  const [savingGreeting, setSavingGreeting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});
  const lastProcessedMsgRef = useRef<string | null>(null);

  // Load specialist settings + timeout config
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['specialist_settings', 'session_timeout_settings']);
      if (data) {
        for (const row of data) {
          if (row.setting_key === 'specialist_settings' && row.setting_value) {
            const val = row.setting_value as any;
            setSpecialistSettings({
              specialistName: val.specialistName || 'Support Specialist',
              specialistImageUrl: val.specialistImageUrl || '',
              joinGreeting: val.joinGreeting || 'Hello! My name is {{name}}, your dedicated support specialist. How can I assist you today?',
              teamMembers: val.teamMembers || [],
              vipPersonaName: val.vipPersonaName || 'Elon Musk',
              vipPersonaImage: val.vipPersonaImage || '',
            });
          }
          if (row.setting_key === 'session_timeout_settings' && row.setting_value) {
            const val = row.setting_value as any;
            const mins = val.timeoutMinutes || 15;
            setSessionTimeoutMinutes(mins);
            setTimeoutDraft(String(mins));
          }
        }
      }
    };
    load();
  }, []);

  // Load conversations
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (data) setConversations(data as Conversation[]);

      if (data && data.length > 0) {
        const convIds = data.map(c => c.id);

        // Batch fetch all unread user messages in one query
        const { data: unreadMsgs } = await supabase
          .from('chat_messages')
          .select('conversation_id')
          .in('conversation_id', convIds)
          .eq('sender_type', 'user')
          .eq('is_read', false);

        const counts: Record<string, number> = {};
        if (unreadMsgs) {
          for (const msg of unreadMsgs) {
            counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1;
          }
        }
        setUnreadCounts(counts);

        // Batch fetch latest messages across all conversations in one query
        const { data: recentMsgs } = await supabase
          .from('chat_messages')
          .select('conversation_id, message, sender_type, image_url, created_at')
          .in('conversation_id', convIds)
          .order('created_at', { ascending: false })
          .limit(convIds.length * 2);

        const previews: Record<string, string> = {};
        if (recentMsgs) {
          for (const msg of recentMsgs) {
            if (!previews[msg.conversation_id]) {
              const prefix = msg.sender_type === 'admin' ? 'You: ' : '';
              previews[msg.conversation_id] = msg.message 
                ? `${prefix}${msg.message}` 
                : `${prefix}📷 Photo`;
            }
          }
        }
        setLastMessages(previews);
      }
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel('admin-chat-conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => { load(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // AI suggestion function
  const fetchAiSuggestion = useCallback(async (convMessages: ChatMessage[], latestMsg: string) => {
    setAiSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-suggest', {
        body: {
          messages: convMessages.filter(m => m.sender_type !== 'system').map(m => ({
            sender_type: m.sender_type,
            message: m.message,
          })),
          latestMessage: latestMsg,
        },
      });
      if (error) throw error;
      if (data?.suggestion) {
        setReply(data.suggestion);
      }
    } catch (err) {
      console.error('AI suggestion error:', err);
      // Retry once on failure
      try {
        const { data: retryData, error: retryError } = await supabase.functions.invoke('ai-chat-suggest', {
          body: {
            messages: convMessages.filter(m => m.sender_type !== 'system').map(m => ({
              sender_type: m.sender_type,
              message: m.message,
            })),
            latestMessage: latestMsg,
          },
        });
        if (!retryError && retryData?.suggestion) {
          setReply(retryData.suggestion);
        }
      } catch (retryErr) {
        console.error('AI suggestion retry failed:', retryErr);
      }
    } finally {
      setAiSuggesting(false);
    }
  }, []);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConv) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', selectedConv.id)
        .order('created_at', { ascending: true });
      if (data) {
        setMessages(data as ChatMessage[]);

        // Auto-suggest AI reply if the last message is from a user
        const lastMsg = data[data.length - 1] as ChatMessage | undefined;
        if (lastMsg && lastMsg.sender_type === 'user' && lastMsg.id !== lastProcessedMsgRef.current) {
          lastProcessedMsgRef.current = lastMsg.id;
          fetchAiSuggestion(data as ChatMessage[], lastMsg.message || '');
        }
      }

      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', selectedConv.id)
        .eq('sender_type', 'user')
        .eq('is_read', false);

      setUnreadCounts(prev => { const next = { ...prev }; delete next[selectedConv.id]; return next; });
    };
    loadMessages();

    const channel = supabase
      .channel(`admin-chat-${selectedConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `conversation_id=eq.${selectedConv.id}`,
      }, (payload) => {
        const newMsg = payload.new as ChatMessage;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        if (newMsg.sender_type === 'user') {
          supabase.from('chat_messages').update({ is_read: true }).eq('id', newMsg.id).then(() => {});
          // Trigger AI suggestion for new user messages
          if (newMsg.id !== lastProcessedMsgRef.current) {
            lastProcessedMsgRef.current = newMsg.id;
            setMessages(prev => {
              // Use latest messages for context
              fetchAiSuggestion(prev, newMsg.message || '');
              return prev;
            });
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv, fetchAiSuggestion]);

  // Subscribe to user typing
  useEffect(() => {
    if (!selectedConv) return;
    const channel = supabase
      .channel(`admin-typing-${selectedConv.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'chat_typing_status',
        filter: `conversation_id=eq.${selectedConv.id}`,
      }, async (payload) => {
        const row = payload.new as any;
        const { data: { user: adminUser } } = await supabase.auth.getUser();
        if (adminUser && row.user_id !== adminUser.id) {
          setUserTyping(row.is_typing || false);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [reply]);

  const broadcastTyping = useCallback(async (isTyping: boolean) => {
    if (!selectedConv) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('chat_typing_status').upsert({
      conversation_id: selectedConv.id,
      user_id: user.id,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'conversation_id,user_id' }).then(() => {});
  }, [selectedConv]);

  const handleTyping = () => {
    broadcastTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => broadcastTyping(false), 3000);
  };

  // Join conversation as specialist — pre-fill greeting
  const handleJoinConversation = async () => {
    if (!selectedConv) return;
    try {
      await supabase.from('chat_messages').insert({
        conversation_id: selectedConv.id,
        sender_type: 'system',
        message: `${specialistSettings.specialistName} joined the conversation`,
      });

      await supabase.from('chat_conversations').update({
        specialist_joined: true,
        specialist_joined_at: new Date().toISOString(),
      }).eq('id', selectedConv.id);

      setSelectedConv({ ...selectedConv, specialist_joined: true });
      
      // Pre-fill greeting
      const greeting = specialistSettings.joinGreeting.replace(/\{\{name\}\}/g, specialistSettings.specialistName);
      setReply(greeting);
      
      toast.success('Joined conversation — greeting ready to send');
    } catch (err) {
      console.error('Error joining conversation:', err);
      toast.error('Failed to join conversation');
    }
  };

  // Join conversation as VIP persona
  const handleJoinAsVip = async () => {
    if (!selectedConv) return;
    const vipName = specialistSettings.vipPersonaName || 'Elon Musk';
    try {
      await supabase.from('chat_messages').insert({
        conversation_id: selectedConv.id,
        sender_type: 'system',
        message: `${vipName} has joined the conversation`,
      });

      await supabase.from('chat_conversations').update({
        specialist_joined: true,
        specialist_joined_at: new Date().toISOString(),
        vip_mode: true,
        vip_persona_name: vipName,
        vip_persona_image: specialistSettings.vipPersonaImage || null,
      }).eq('id', selectedConv.id);

      setSelectedConv({ ...selectedConv, specialist_joined: true });
      
      const greeting = `Hello! This is ${vipName}. I understand you wanted to speak with me directly. How can I help you today?`;
      setReply(greeting);
      
      toast.success(`Joined as ${vipName} — greeting ready to send`);
    } catch (err) {
      console.error('Error joining as VIP:', err);
      toast.error('Failed to join as VIP');
    }
  };

  // Close conversation
  const handleCloseConversation = async () => {
    if (!selectedConv) return;
    try {
      await supabase.from('chat_conversations').update({
        status: 'closed',
      }).eq('id', selectedConv.id);

      // Notify admin via email that chat was closed
      supabase.functions.invoke('send-chat-notification', {
        body: {
          userName: getDisplayName(selectedConv),
          userEmail: selectedConv.user_email || 'Unknown',
          message: `📋 Chat session with ${getDisplayName(selectedConv)} has been closed by admin.`,
        },
      }).catch(() => {});

      setSelectedConv(null);
      setMessages([]);
      toast.success('Chat closed');
    } catch (err) {
      console.error('Error closing conversation:', err);
      toast.error('Failed to close conversation');
    }
  };

  const handleSaveGreeting = async () => {
    setSavingGreeting(true);
    try {
      const updatedSettings = { ...specialistSettings, joinGreeting: greetingDraft };
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'specialist_settings',
          setting_value: updatedSettings as any,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'setting_key' });
      if (error) throw error;
      setSpecialistSettings(updatedSettings);
      toast.success('Join greeting saved');
      setShowGreetingSettings(false);
    } catch (err) {
      console.error('Error saving greeting:', err);
      toast.error('Failed to save greeting');
    } finally {
      setSavingGreeting(false);
    }
  };

  const handleSaveTimeout = async () => {
    setSavingTimeout(true);
    try {
      const mins = Math.max(5, Math.min(60, parseInt(timeoutDraft) || 15));
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'session_timeout_settings',
          setting_value: { timeoutMinutes: mins } as any,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'setting_key' });
      if (error) throw error;
      setSessionTimeoutMinutes(mins);
      setTimeoutDraft(String(mins));
      toast.success(`Session timeout set to ${mins} minutes`);
    } catch (err) {
      console.error('Error saving timeout:', err);
      toast.error('Failed to save timeout');
    } finally {
      setSavingTimeout(false);
    }
  };

  const sendReply = async () => {
    if ((!reply.trim() && !stagedImage) || !selectedConv || sending) return;
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      let imageUrl: string | null = null;
      if (stagedImage) {
        const ext = stagedImage.file.name.split('.').pop();
        const path = `admin/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('chat-images').upload(path, stagedImage.file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('chat-images').getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: selectedConv.id,
        sender_type: 'admin',
        sender_id: user?.id,
        message: reply.trim() || null,
        image_url: imageUrl,
      });
      if (error) throw error;

      await supabase.from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConv.id);

      setReply('');
      setStagedImage(null);
      broadcastTyping(false);
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setStagedImage({ file, preview });
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (dateStr: string) => {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getDisplayName = (conv: Conversation) => {
    return conv.guest_name || conv.user_name || 'User';
  };

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-electric-blue mr-2" />
        <span className="text-muted-foreground">Loading chats...</span>
      </div>
    );
  }

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

      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden animate-fade-in h-[calc(100vh-200px)] sm:h-[600px]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-slate-700`}>
             <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-electric-blue" />
                  Chat Messages
                  {totalUnread > 0 && (
                    <span className="bg-tesla-red text-white text-xs px-2 py-0.5 rounded-full font-bold">{totalUnread}</span>
                  )}
                </h3>
                <button
                  onClick={() => { setGreetingDraft(specialistSettings.joinGreeting); setShowGreetingSettings(!showGreetingSettings); }}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
                  title="Greeting Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Join Greeting Settings Panel */}
              {showGreetingSettings && (
                <div className="mt-3 bg-slate-800 border border-slate-600 rounded-lg p-2.5 sm:p-3 space-y-2.5 sm:space-y-3 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs text-white font-semibold block" style={{ opacity: 1 }}>Join Greeting Message</label>
                    <p className="text-[10px] text-slate-300 leading-tight" style={{ opacity: 1 }}>Use {'{{name}}'} for specialist name</p>
                    <textarea
                      value={greetingDraft}
                      onChange={(e) => setGreetingDraft(e.target.value)}
                      rows={3}
                      className="w-full bg-white border border-slate-400 rounded-lg px-2.5 sm:px-3 py-2 text-xs text-black placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-electric-blue resize-none"
                      style={{ color: '#000', opacity: 1, WebkitTextFillColor: '#000' }}
                      placeholder="Hello! My name is {{name}}, your support specialist..."
                    />
                    <button
                      onClick={handleSaveGreeting}
                      disabled={savingGreeting}
                      className="w-full flex items-center justify-center gap-1.5 bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-semibold py-2 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {savingGreeting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save Greeting
                    </button>
                  </div>

                  <div className="border-t border-slate-600 pt-2.5 sm:pt-3 space-y-1.5 sm:space-y-2">
                    <label className="text-xs text-white font-semibold block" style={{ opacity: 1 }}>Session Timeout (minutes)</label>
                    <p className="text-[10px] text-slate-300 leading-tight" style={{ opacity: 1 }}>Inactive sessions auto-close after this duration (5–60 min)</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={60}
                        value={timeoutDraft}
                        onChange={(e) => setTimeoutDraft(e.target.value)}
                        className="w-20 bg-white border border-slate-400 rounded-lg px-2.5 sm:px-3 py-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-electric-blue"
                        style={{ color: '#000', opacity: 1, WebkitTextFillColor: '#000' }}
                      />
                      <span className="text-white text-xs font-semibold" style={{ opacity: 1 }}>min</span>
                    </div>
                    <button
                      onClick={handleSaveTimeout}
                      disabled={savingTimeout}
                      className="w-full flex items-center justify-center gap-1.5 bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-semibold py-2 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {savingTimeout ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save Timeout
                    </button>
                  </div>

                  {/* Support Team Management */}
                  <div className="border-t border-slate-600 pt-2.5 sm:pt-3 space-y-2">
                    <label className="text-xs text-white font-semibold block" style={{ opacity: 1 }}>Support Team Avatars</label>
                    <p className="text-[10px] text-slate-300 leading-tight" style={{ opacity: 1 }}>Add up to 5 specialists. First one is the primary who joins chats.</p>
                    
                    {/* Existing team members */}
                    <div className="space-y-2">
                      {(specialistSettings.teamMembers || []).map((member, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-700 rounded-lg p-2">
                          <div className="relative flex-shrink-0 group">
                            {member.imageUrl ? (
                              <img src={member.imageUrl} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-300" width={48} height={48} loading="eager" style={{ imageRendering: 'auto' }} />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-electric-blue/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-electric-blue" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <Camera className="w-4 h-4 text-white" />
                            </div>
                            <label className="absolute inset-0 cursor-pointer rounded-full">
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setUploadingTeamAvatar(idx);
                                  try {
                                    const ext = file.name.split('.').pop();
                                    const path = `team/${Date.now()}-${idx}.${ext}`;
                                    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
                                    if (error) throw error;
                                    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
                                    const updated = { ...specialistSettings };
                                    const members = [...(updated.teamMembers || [])];
                                    members[idx] = { ...members[idx], imageUrl: urlData.publicUrl };
                                    // Also sync primary specialist if first member
                                    if (idx === 0) {
                                      updated.specialistImageUrl = urlData.publicUrl;
                                      updated.specialistName = members[0].name;
                                    }
                                    updated.teamMembers = members;
                                    await supabase.from('admin_settings').upsert({
                                      setting_key: 'specialist_settings',
                                      setting_value: updated as any,
                                      updated_at: new Date().toISOString(),
                                    }, { onConflict: 'setting_key' });
                                    setSpecialistSettings(updated);
                                    toast.success('Avatar updated');
                                  } catch (err) {
                                    toast.error('Failed to upload avatar');
                                  } finally {
                                    setUploadingTeamAvatar(null);
                                  }
                                }}
                              />
                            </label>
                            {uploadingTeamAvatar === idx && (
                              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate" style={{ opacity: 1 }}>{member.name}</p>
                            <p className="text-[10px] text-slate-400 truncate" style={{ opacity: 1 }}>{member.role || 'Support Agent'}</p>
                            <p className="text-[9px] text-slate-500 mt-0.5" style={{ opacity: 1 }}>Click photo to change</p>
                          </div>
                          {idx === 0 && (
                            <span className="text-[8px] px-1.5 py-0.5 bg-electric-blue/20 text-electric-blue rounded-full font-bold flex-shrink-0">PRIMARY</span>
                          )}
                          <button
                            onClick={async () => {
                              const updated = { ...specialistSettings };
                              const members = [...(updated.teamMembers || [])];
                              members.splice(idx, 1);
                              updated.teamMembers = members;
                              if (members.length > 0) {
                                updated.specialistName = members[0].name;
                                updated.specialistImageUrl = members[0].imageUrl;
                              }
                              await supabase.from('admin_settings').upsert({
                                setting_key: 'specialist_settings',
                                setting_value: updated as any,
                                updated_at: new Date().toISOString(),
                              }, { onConflict: 'setting_key' });
                              setSpecialistSettings(updated);
                              toast.success('Specialist removed');
                            }}
                            className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 p-1"
                            title="Remove"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add new member form */}
                    {(specialistSettings.teamMembers || []).length < 5 && (
                      <div className="bg-slate-700 rounded-lg p-2 space-y-1.5">
                        <input
                          value={teamMemberDraft.name}
                          onChange={(e) => setTeamMemberDraft(d => ({ ...d, name: e.target.value }))}
                          placeholder="Name (e.g. Sarah Mitchell)"
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-electric-blue"
                          style={{ color: '#000', opacity: 1, WebkitTextFillColor: '#000' }}
                        />
                        <input
                          value={teamMemberDraft.role}
                          onChange={(e) => setTeamMemberDraft(d => ({ ...d, role: e.target.value }))}
                          placeholder="Role (e.g. Senior Support Agent)"
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-electric-blue"
                          style={{ color: '#000', opacity: 1, WebkitTextFillColor: '#000' }}
                        />
                        <button
                          onClick={async () => {
                            if (!teamMemberDraft.name.trim()) return;
                            const updated = { ...specialistSettings };
                            const members = [...(updated.teamMembers || [])];
                            members.push({ name: teamMemberDraft.name.trim(), imageUrl: '', role: teamMemberDraft.role.trim() || 'Support Agent' });
                            updated.teamMembers = members;
                            if (members.length === 1) {
                              updated.specialistName = members[0].name;
                            }
                            await supabase.from('admin_settings').upsert({
                              setting_key: 'specialist_settings',
                              setting_value: updated as any,
                              updated_at: new Date().toISOString(),
                            }, { onConflict: 'setting_key' });
                            setSpecialistSettings(updated);
                            setTeamMemberDraft({ name: '', imageUrl: '', role: '' });
                            toast.success('Specialist added');
                          }}
                          disabled={!teamMemberDraft.name.trim()}
                          className="w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg disabled:opacity-50 transition-colors"
                        >
                          <UserPlus className="w-3 h-3" />
                          Add Specialist
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>



            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No chat messages yet</div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full text-left p-4 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors ${
                      selectedConv?.id === conv.id ? 'bg-slate-700/70' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-electric-blue/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-electric-blue" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-white font-medium text-sm truncate">{getDisplayName(conv)}</p>
                            {conv.specialist_joined && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full font-medium">Joined</span>
                            )}
                            {conv.status === 'closed' && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-slate-500/20 text-slate-400 rounded-full font-medium">Closed</span>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs truncate">{conv.user_email || 'No email'}</p>
                        </div>
                      </div>
                      {unreadCounts[conv.id] && (
                        <span className="bg-tesla-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {unreadCounts[conv.id]}
                        </span>
                      )}
                    </div>
                    {lastMessages[conv.id] && (
                      <p className="text-slate-400 text-xs truncate mt-1 ml-12 max-w-[200px]">{lastMessages[conv.id]}</p>
                    )}
                    <div className="flex items-center gap-1 mt-0.5 ml-12">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-500 text-[10px]">{formatRelativeTime(conv.last_message_at)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${selectedConv ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
            {selectedConv ? (
              <>
                <div className="p-3 sm:p-4 border-b border-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <button onClick={() => setSelectedConv(null)} className="md:hidden text-slate-400 hover:text-white flex-shrink-0">
                        <X className="w-5 h-5" />
                      </button>
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-electric-blue/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-electric-blue" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{getDisplayName(selectedConv)}</p>
                        <p className="text-slate-400 text-[10px] sm:text-xs truncate">{selectedConv.user_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      {selectedConv.status === 'open' && !selectedConv.specialist_joined && (
                        <Button
                          size="sm"
                          onClick={handleJoinConversation}
                          className="bg-green-600 hover:bg-green-700 text-[10px] sm:text-xs px-2 sm:px-3 h-7 sm:h-8"
                        >
                          <UserPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                          Join
                        </Button>
                      )}
                      {selectedConv.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCloseConversation}
                          className="border-red-500 text-red-400 hover:bg-red-500/10 text-[10px] sm:text-xs px-2 sm:px-3 h-7 sm:h-8"
                        >
                          <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                          <span className="hidden sm:inline">Close Chat</span>
                          <span className="sm:hidden">Close</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto chat-scrollbar p-4 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : msg.sender_type === 'system' ? 'justify-center' : 'justify-start'}`}>
                      {msg.sender_type === 'system' ? (
                        <div className="w-full py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-px bg-slate-600" />
                            <span className="text-xs text-slate-400 font-medium px-2">New</span>
                            <div className="flex-1 h-px bg-slate-600" />
                          </div>
                          <p className="text-xs text-slate-400 text-center mt-1">{msg.message}</p>
                        </div>
                      ) : (
                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 overflow-hidden ${
                          msg.sender_type === 'admin'
                            ? 'bg-electric-blue text-white rounded-br-md'
                            : 'bg-slate-700 text-white rounded-bl-md'
                        }`}>
                          {msg.sender_type === 'admin' && (
                            <p className="text-[10px] font-semibold text-white/70 mb-1">You</p>
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
                          <p className="text-[10px] mt-1 text-white/50">{formatTime(msg.created_at)}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {userTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-electric-blue/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-3.5 h-3.5 text-electric-blue" />
                        </div>
                        <div className="bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="w-[6px] h-[6px] bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-[6px] h-[6px] bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-[6px] h-[6px] bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                <div className="border-t border-slate-700">
                  {/* AI suggesting indicator */}
                  {aiSuggesting && (
                    <div className="px-4 py-2 flex items-center gap-2 bg-slate-700/50 border-b border-slate-600">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span className="text-xs text-amber-300">AI is drafting a suggestion...</span>
                    </div>
                  )}

                  {stagedImage && (
                    <div className="px-3 pt-3 pb-1">
                      <div className="relative inline-block">
                        <img src={stagedImage.preview} alt="Preview" className="h-20 rounded-lg border border-slate-600" />
                        <button
                          onClick={() => { URL.revokeObjectURL(stagedImage.preview); setStagedImage(null); }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-3 flex items-end gap-2">
                    <div className="relative flex-shrink-0">
                      <input ref={galleryInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileSelect} tabIndex={-1} />
                      <button
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2 text-slate-400 hover:text-electric-blue transition-colors"
                        title="Attach photo"
                      >
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                      </button>
                    </div>

                    <textarea
                      ref={textareaRef}
                      value={reply}
                      onChange={(e) => { setReply(e.target.value); handleTyping(); }}
                      onKeyDown={() => {}}
                      placeholder="Type a reply..."
                      rows={2}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-electric-blue resize-none overflow-y-auto max-h-[150px] min-h-[52px]"
                      style={{ color: '#000000', WebkitTextFillColor: '#000000', opacity: 1 }}
                    />
                    <Button
                      onClick={sendReply}
                      disabled={(!reply.trim() && !stagedImage) || sending}
                      size="sm"
                      className="bg-electric-blue hover:bg-electric-blue/90 flex-shrink-0"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a conversation to reply</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
};

export default AdminChatPanel;
