import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, ImagePlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

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

    // Subscribe to new messages
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
        // Check unread
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

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark admin messages as read when chat opens
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

  const sendMessage = async () => {
    if (!message.trim() || sending) return;
    setSending(true);

    try {
      let convId = conversationId;
      if (!convId) {
        convId = await getOrCreateConversation();
        if (!convId) return;
      }

      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: convId,
        sender_type: 'user',
        sender_id: user?.id,
        message: message.trim(),
      });

      if (error) throw error;

      // Update last_message_at
      await supabase.from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', convId);

      // Send email notification (fire and forget)
      supabase.functions.invoke('send-chat-notification', {
        body: {
          userName: profileData?.full_name || user?.email?.split('@')[0],
          userEmail: profileData?.email || user?.email,
          message: message.trim(),
        },
      }).catch(() => {});

      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;

    setUploading(true);
    try {
      let convId = conversationId;
      if (!convId) {
        convId = await getOrCreateConversation();
        if (!convId) return;
      }

      const ext = file.name.split('.').pop();
      const path = `${user?.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-images')
        .getPublicUrl(path);

      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: convId,
        sender_type: 'user',
        sender_id: user?.id,
        image_url: urlData.publicUrl,
      });

      if (error) throw error;

      await supabase.from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', convId);

      supabase.functions.invoke('send-chat-notification', {
        body: {
          userName: profileData?.full_name || user?.email?.split('@')[0],
          userEmail: profileData?.email || user?.email,
          message: '[Image sent]',
        },
      }).catch(() => {});
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 z-[60] w-14 h-14 rounded-full bg-electric-blue hover:bg-electric-blue/90 text-white shadow-lg shadow-electric-blue/30 flex items-center justify-center transition-transform hover:scale-110"
            aria-label="Open live chat"
          >
            <MessageCircle className="w-6 h-6" />
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
            className="fixed bottom-6 right-6 z-[60] w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] flex flex-col bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-electric-blue to-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Live Support</h3>
                  <p className="text-white/70 text-xs">We typically reply instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Hello! 👋</p>
                  <p className="text-muted-foreground/70 text-xs mt-1">How can we help you today?</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                      msg.sender_type === 'user'
                        ? 'bg-electric-blue text-white rounded-br-md'
                        : 'bg-card border border-border text-foreground rounded-bl-md'
                    }`}
                  >
                    {msg.sender_type === 'admin' && (
                      <p className="text-[10px] font-semibold text-electric-blue mb-1">Support</p>
                    )}
                    {msg.image_url && (
                      <img
                        src={msg.image_url}
                        alt="Shared image"
                        className="rounded-lg max-w-full max-h-48 mb-1 cursor-pointer"
                        onClick={() => window.open(msg.image_url!, '_blank')}
                      />
                    )}
                    {msg.message && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    )}
                    <p className={`text-[10px] mt-1 ${
                      msg.sender_type === 'user' ? 'text-white/60' : 'text-muted-foreground'
                    }`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-background flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-2 text-muted-foreground hover:text-electric-blue transition-colors rounded-lg hover:bg-muted/50 flex-shrink-0"
                  aria-label="Send image"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-electric-blue"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || sending}
                  className="p-2 bg-electric-blue text-white rounded-xl hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
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
