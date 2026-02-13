import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, Plus, Loader2, X, User, Clock, Camera, Image as ImageIcon, Paperclip, UserPlus, XCircle } from 'lucide-react';
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

interface SpecialistSettings {
  specialistName: string;
  specialistImageUrl: string;
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
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [specialistSettings, setSpecialistSettings] = useState<SpecialistSettings>({ specialistName: 'Support Specialist', specialistImageUrl: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});

  // Load specialist settings
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'specialist_settings')
        .maybeSingle();
      if (data?.setting_value) {
        const val = data.setting_value as any;
        setSpecialistSettings({
          specialistName: val.specialistName || 'Support Specialist',
          specialistImageUrl: val.specialistImageUrl || '',
        });
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

      if (data) {
        const counts: Record<string, number> = {};
        const previews: Record<string, string> = {};
        for (const conv of data) {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('sender_type', 'user')
            .eq('is_read', false);
          if (count && count > 0) counts[conv.id] = count;

          const { data: lastMsg } = await supabase
            .from('chat_messages')
            .select('message, sender_type, image_url')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (lastMsg) {
            const prefix = lastMsg.sender_type === 'admin' ? 'You: ' : '';
            previews[conv.id] = lastMsg.message 
              ? `${prefix}${lastMsg.message}` 
              : `${prefix}📷 Photo`;
          }
        }
        setUnreadCounts(counts);
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

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConv) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', selectedConv.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data as ChatMessage[]);

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
        setMessages(prev => [...prev, payload.new as ChatMessage]);
        if ((payload.new as ChatMessage).sender_type === 'user') {
          supabase.from('chat_messages').update({ is_read: true }).eq('id', (payload.new as ChatMessage).id).then(() => {});
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv]);

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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
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

  // Join conversation as specialist
  const handleJoinConversation = async () => {
    if (!selectedConv) return;
    try {
      // Insert system message
      await supabase.from('chat_messages').insert({
        conversation_id: selectedConv.id,
        sender_type: 'system',
        message: `${specialistSettings.specialistName} joined the conversation`,
      });

      // Update conversation
      await supabase.from('chat_conversations').update({
        specialist_joined: true,
        specialist_joined_at: new Date().toISOString(),
      }).eq('id', selectedConv.id);

      setSelectedConv({ ...selectedConv, specialist_joined: true });
      toast.success('Joined conversation as specialist');
    } catch (err) {
      console.error('Error joining conversation:', err);
      toast.error('Failed to join conversation');
    }
  };

  // Close conversation
  const handleCloseConversation = async () => {
    if (!selectedConv) return;
    try {
      await supabase.from('chat_conversations').update({
        status: 'closed',
      }).eq('id', selectedConv.id);

      setSelectedConv(null);
      setMessages([]);
      toast.success('Chat closed');
    } catch (err) {
      console.error('Error closing conversation:', err);
      toast.error('Failed to close conversation');
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
    setShowFilePicker(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
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

      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden animate-fade-in" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-slate-700`}>
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-electric-blue" />
                Chat Messages
                {totalUnread > 0 && (
                  <span className="bg-tesla-red text-white text-xs px-2 py-0.5 rounded-full font-bold">{totalUnread}</span>
                )}
              </h3>
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
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedConv(null)} className="md:hidden text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-electric-blue/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-electric-blue" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{getDisplayName(selectedConv)}</p>
                      <p className="text-slate-400 text-xs">{selectedConv.user_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConv.status === 'open' && !selectedConv.specialist_joined && (
                      <Button
                        size="sm"
                        onClick={handleJoinConversation}
                        className="bg-green-600 hover:bg-green-700 text-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                        Join
                      </Button>
                    )}
                    {selectedConv.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCloseConversation}
                        className="border-red-500 text-red-400 hover:bg-red-500/10 text-xs"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Close Chat
                      </Button>
                    )}
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
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" className="sr-only" onChange={handleFileSelect} tabIndex={-1} />
                      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleFileSelect} tabIndex={-1} />
                      <button
                        onClick={() => setShowFilePicker(!showFilePicker)}
                        disabled={uploading}
                        className="p-2 text-slate-400 hover:text-electric-blue transition-colors"
                      >
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className={`w-5 h-5 transition-transform duration-200 ${showFilePicker ? 'rotate-45' : ''}`} />}
                      </button>

                      <AnimatePresence>
                        {showFilePicker && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute bottom-12 left-0 bg-slate-700 border border-slate-600 rounded-xl shadow-xl py-1 min-w-[160px] z-10 will-change-transform"
                          >
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                galleryInputRef.current?.click();
                                setShowFilePicker(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors"
                            >
                              <ImageIcon className="w-4 h-4 text-electric-blue" /> Photo Library
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                cameraInputRef.current?.click();
                                setShowFilePicker(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors"
                            >
                              <Camera className="w-4 h-4 text-green-400" /> Take a Photo
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                fileInputRef.current?.click();
                                setShowFilePicker(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors"
                            >
                              <Paperclip className="w-4 h-4 text-amber-400" /> Choose File
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <textarea
                      ref={textareaRef}
                      value={reply}
                      onChange={(e) => { setReply(e.target.value); handleTyping(); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
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

      {showFilePicker && (
        <div className="fixed inset-0 z-[9]" onClick={() => setShowFilePicker(false)} />
      )}
    </>
  );
};

export default AdminChatPanel;
