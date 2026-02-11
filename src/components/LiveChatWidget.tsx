import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, ImagePlus, Loader2, Camera, Image as ImageIcon, Paperclip } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import liveSupportIcon from '@/assets/live-support-icon.png';

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'admin';
  message: string | null;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Load or create conversation
  const getOrCreateConversation = useCallback(async () => {
    if (!user) return null;
    const { data: existing } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      setConversationId(existing.id);
      return existing.id;
    }

    const { data: newConv, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        user_name: profileData?.full_name || user.email?.split('@')[0] || 'User',
        user_email: profileData?.email || user.email,
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
    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_typing_status',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const row = payload.new as any;
        if (row.user_id !== user?.id) {
          setAdminTyping(row.is_typing || false);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user?.id]);

  // Check for existing conversation on mount
  useEffect(() => {
    if (!user) return;
    const init = async () => {
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

  const broadcastTyping = useCallback(async (isTyping: boolean) => {
    if (!conversationId || !user) return;
    await supabase.from('chat_typing_status').upsert({
      conversation_id: conversationId,
      user_id: user.id,
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
      if (!convId) { convId = await getOrCreateConversation(); if (!convId) return; }

      let imageUrl: string | null = null;
      if (stagedImage) {
        const ext = stagedImage.file.name.split('.').pop();
        const path = `${user?.id}/${Date.now()}.${ext}`;
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
          userName: profileData?.full_name || user?.email?.split('@')[0],
          userEmail: profileData?.email || user?.email,
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

      {/* Chat Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[88px] right-4 sm:right-6 z-[60] w-14 h-14 rounded-full shadow-lg shadow-black/20 flex items-center justify-center transition-transform hover:scale-110 overflow-hidden bg-white"
            aria-label="Open live chat"
          >
            <img src={liveSupportIcon} alt="Live Support" className="w-14 h-14 object-cover" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-tesla-red text-white text-xs font-bold rounded-full flex items-center justify-center">
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
            className="fixed bottom-4 right-4 sm:right-6 z-[60] w-[calc(100vw-32px)] sm:w-[380px] h-[min(520px,calc(100vh-80px))] flex flex-col bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-electric-blue to-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/30">
                  <img src={liveSupportIcon} alt="Support" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">Live Support</h3>
                  <p className="text-white/70 text-[11px] truncate">Tesla Stock Platform</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto chat-scrollbar p-3 sm:p-4 space-y-3 bg-muted/30" style={{ WebkitOverflowScrolling: 'touch' as any }}>
              {!user && (
                <div className="text-center py-8">
                  <img src={liveSupportIcon} alt="Support" className="w-16 h-16 mx-auto mb-3 rounded-full" />
                  <p className="text-foreground font-medium text-sm">Hello! 👋</p>
                  <p className="text-muted-foreground text-xs mt-1 mb-4">Please log in to start a conversation</p>
                </div>
              )}

              {user && messages.length === 0 && (
                <div className="text-center py-8">
                  <img src={liveSupportIcon} alt="Support" className="w-16 h-16 mx-auto mb-3 rounded-full" />
                  <p className="text-foreground font-medium text-sm">Hello! 👋</p>
                  <p className="text-muted-foreground text-xs mt-1">How can we help you today?</p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 overflow-hidden ${
                    msg.sender_type === 'user'
                      ? 'bg-electric-blue text-white rounded-br-md'
                      : 'bg-card border border-border text-foreground rounded-bl-md'
                  }`}>
                    {msg.sender_type === 'admin' && (
                      <p className="text-[10px] font-semibold text-electric-blue mb-1">Support</p>
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
                    <p className={`text-[10px] mt-1 ${msg.sender_type === 'user' ? 'text-white/60' : 'text-muted-foreground'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Admin typing indicator */}
              {adminTyping && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {user ? (
              <div className="border-t border-border bg-background flex-shrink-0">
                {/* Staged Image Preview */}
                {stagedImage && (
                  <div className="px-3 pt-3 pb-1">
                    <div className="relative inline-block">
                      <img src={stagedImage.preview} alt="Preview" className="h-20 rounded-lg border border-border" />
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
                  <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
                    <button
                      onClick={() => setShowFilePicker(!showFilePicker)}
                      disabled={uploading}
                      className="p-2 text-muted-foreground hover:text-electric-blue transition-colors rounded-lg hover:bg-muted/50"
                      aria-label="Attach image"
                    >
                      {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                    </button>

                    <AnimatePresence>
                      {showFilePicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute bottom-12 left-0 bg-popover border border-border rounded-xl shadow-xl py-1 min-w-[160px] z-10"
                        >
                          <button
                            onClick={() => { galleryInputRef.current?.click(); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <ImageIcon className="w-4 h-4 text-electric-blue" />
                            Photo Library
                          </button>
                          <button
                            onClick={() => { cameraInputRef.current?.click(); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <Camera className="w-4 h-4 text-green-500" />
                            Take a Photo
                          </button>
                          <button
                            onClick={() => { fileInputRef.current?.click(); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <Paperclip className="w-4 h-4 text-amber-500" />
                            Choose File
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
                    className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-electric-blue resize-none overflow-y-auto max-h-[120px] min-h-[40px]"
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
            ) : (
              <div className="p-4 border-t border-border bg-background text-center">
                <p className="text-muted-foreground text-sm">Log in to start chatting</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close file picker when clicking outside - covers entire screen */}
      {showFilePicker && (
        <div className="fixed inset-0 z-[59]" onClick={() => setShowFilePicker(false)} onTouchEnd={() => setShowFilePicker(false)} />
      )}
    </>
  );
};

export default LiveChatWidget;
