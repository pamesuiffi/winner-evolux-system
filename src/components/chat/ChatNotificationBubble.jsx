import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function ChatNotificationBubble({ user }) {
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [expandedChat, setExpandedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Obtener mensajes no leídos
  const { data: allMessages = [] } = useQuery({
    queryKey: ['unread-messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const msgs = await base44.entities.ChatMessage.filter({});
      return msgs.filter(m => m.receiver_id === user.id && !m.is_read);
    },
    enabled: !!user?.id,
    refetchInterval: 2000,
  });

  useEffect(() => {
    const grouped = {};
    allMessages.forEach(msg => {
      if (!grouped[msg.sender_id]) {
        grouped[msg.sender_id] = [];
      }
      grouped[msg.sender_id].push(msg);
    });
    
    const unread = Object.entries(grouped).map(([senderId, msgs]) => ({
      senderId,
      senderName: msgs[0].sender_id ? msgs[0].sender_id.split('@')[0] : 'Desconocido',
      count: msgs.length,
      lastMessage: msgs[msgs.length - 1].content,
    }));
    
    setUnreadMessages(unread);
  }, [allMessages]);

  const handleOpenChat = async (senderId, senderName) => {
    const senderMessages = await base44.entities.ChatMessage.filter({});
    const chatMessages = senderMessages.filter(m =>
      (m.sender_id === senderId && m.receiver_id === user?.id) ||
      (m.sender_id === user?.id && m.receiver_id === senderId)
    ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    
    setMessages(chatMessages);
    setExpandedChat({ id: senderId, name: senderName });

    // Marcar como leído
    await Promise.all(
      chatMessages
        .filter(m => m.receiver_id === user?.id && !m.is_read)
        .map(m => base44.entities.ChatMessage.update(m.id, { is_read: true }))
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !expandedChat) return;

    await base44.entities.ChatMessage.create({
      sender_id: user?.id,
      receiver_id: expandedChat.id,
      coach_id: user?.id,
      content: newMessage,
      message_type: 'text',
      is_read: false,
    });

    setNewMessage('');
    // Recargar mensajes
    const allMsgs = await base44.entities.ChatMessage.filter({});
    const updated = allMsgs.filter(m =>
      (m.sender_id === expandedChat.id && m.receiver_id === user?.id) ||
      (m.sender_id === user?.id && m.receiver_id === expandedChat.id)
    ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    setMessages(updated);
  };

  return (
    <>
      {/* Burbujas de notificación flotantes */}
      <AnimatePresence>
        {unreadMessages.map((unread, idx) => (
          <motion.button
            key={unread.senderId}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => handleOpenChat(unread.senderId, unread.senderName)}
            className="fixed bottom-4 right-4 z-40 mb-20"
            style={{ bottom: `calc(1rem + ${idx * 90}px)` }}
          >
            <div className="bg-primary rounded-2xl shadow-lg p-4 w-72 text-left hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-primary-foreground">{unread.senderName}</p>
                  <p className="text-xs text-primary-foreground/80 truncate mt-1">{unread.lastMessage}</p>
                  {unread.count > 1 && (
                    <p className="text-xs text-primary-foreground/60 mt-1">{unread.count} mensajes</p>
                  )}
                </div>
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-accent-foreground">{unread.count}</span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Chat expandido tipo Messenger */}
      <AnimatePresence>
        {expandedChat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center justify-between">
              <p className="font-semibold">{expandedChat.name}</p>
              <button
                onClick={() => setExpandedChat(null)}
                className="p-1 hover:bg-primary-foreground/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-card/50">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Sin mensajes
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                        msg.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-secondary text-foreground rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-card flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Mensaje..."
                className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border/50 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-medium"
              >
                Enviar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}