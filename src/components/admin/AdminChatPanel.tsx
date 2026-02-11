import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, ImagePlus, Loader2, X, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Conversation {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
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

const AdminChatPanel = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversations
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (data) setConversations(data as Conversation[]);

      // Get unread counts
      if (data) {
        const counts: Record<string, number> = {};
        for (const conv of data) {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('sender_type', 'user')
            .eq('is_read', false);
          if (count && count > 0) counts[conv.id] = count;
        }
        setUnreadCounts(counts);
      }
      setLoading(false);
    };
    load();

    // Subscribe to new conversations
    const channel = supabase
      .channel('admin-chat-conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_conversations',
      }, () => { load(); })
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

      // Mark user messages as read
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', selectedConv.id)
        .eq('sender_type', 'user')
        .eq('is_read', false);

      setUnreadCounts(prev => {
        const next = { ...prev };
        delete next[selectedConv.id];
        return next;
      });
    };

    loadMessages();

    const channel = supabase
      .channel(`admin-chat-${selectedConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${selectedConv.id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
        // Mark as read immediately
        if ((payload.new as ChatMessage).sender_type === 'user') {
          supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('id', (payload.new as ChatMessage).id)
            .then(() => {});
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendReply = async () => {
    if (!reply.trim() || !selectedConv || sending) return;
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: selectedConv.id,
        sender_type: 'admin',
        sender_id: user?.id,
        message: reply.trim(),
      });

      if (error) throw error;

      await supabase.from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConv.id);

      setReply('');
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConv || uploading) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const ext = file.name.split('.').pop();
      const path = `admin/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-images')
        .getPublicUrl(path);

      await supabase.from('chat_messages').insert({
        conversation_id: selectedConv.id,
        sender_type: 'admin',
        sender_id: user?.id,
        image_url: urlData.publicUrl,
      });

      await supabase.from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConv.id);
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden animate-fade-in" style={{ height: '600px' }}>
      <div className="flex h-full">
        {/* Conversations List */}
        <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-slate-700`}>
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-electric-blue" />
              Chat Messages
              {totalUnread > 0 && (
                <span className="bg-tesla-red text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {totalUnread}
                </span>
              )}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No chat messages yet
              </div>
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
                        <p className="text-white font-medium text-sm truncate">
                          {conv.user_name || 'User'}
                        </p>
                        <p className="text-slate-400 text-xs truncate">
                          {conv.user_email || 'No email'}
                        </p>
                      </div>
                    </div>
                    {unreadCounts[conv.id] && (
                      <span className="bg-tesla-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {unreadCounts[conv.id]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 ml-12">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-500 text-[10px]">{formatTime(conv.last_message_at)}</span>
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
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="md:hidden text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-electric-blue/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-electric-blue" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{selectedConv.user_name || 'User'}</p>
                    <p className="text-slate-400 text-xs">{selectedConv.user_email}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
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
                          className="rounded-lg max-w-full max-h-48 mb-1 cursor-pointer"
                          onClick={() => window.open(msg.image_url!, '_blank')}
                        />
                      )}
                      {msg.message && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      )}
                      <p className="text-[10px] mt-1 text-white/50">{formatTime(msg.created_at)}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <div className="p-3 border-t border-slate-700">
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
                    className="p-2 text-slate-400 hover:text-electric-blue transition-colors"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                  </button>
                  <Input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                    placeholder="Type a reply..."
                    className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                  />
                  <Button
                    onClick={sendReply}
                    disabled={!reply.trim() || sending}
                    size="sm"
                    className="bg-electric-blue hover:bg-electric-blue/90"
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
  );
};

export default AdminChatPanel;
