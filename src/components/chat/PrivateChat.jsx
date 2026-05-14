import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Send, X, Loader2, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrivateChat({ currentUser, selectedUser, onClose }) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // selectedUser.id ya es el User ID real (ambos lados usan User entity)
  const senderId = currentUser?.id;
  const receiverId = selectedUser?.id;

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['private-messages', senderId, receiverId],
    queryFn: async () => {
      if (!senderId || !receiverId) return [];
      const res = await base44.functions.invoke('getChatMessages', { sender_id: senderId, receiver_id: receiverId });
      return res.data?.messages || [];
    },
    enabled: !!senderId && !!receiverId,
    refetchInterval: 3000,
  });

  // Marcar mensajes recibidos como leídos (solo los que son para el usuario actual)
  useEffect(() => {
    const unread = messages.filter(m => m.receiver_id === senderId && !m.is_read);
    if (unread.length > 0) {
      unread.forEach(m =>
        base44.functions.invoke('markMessageRead', { message_id: m.id })
      );
    }
  }, [messages, senderId]);

  const sendMutation = useMutation({
    mutationFn: (content) =>
      base44.functions.invoke('sendChatMessage', { receiver_id: receiverId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['private-messages'] });
      setMessage('');
    },
  });

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed) sendMutation.mutate(trimmed);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessage('');
  }, [selectedUser?.id]);

  if (!selectedUser) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
          {selectedUser.full_name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{selectedUser.full_name}</h3>
          <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <MessageCircle className="w-10 h-10 opacity-20" />
            <p className="text-sm">No hay mensajes aún</p>
            <p className="text-xs opacity-60">¡Escribe el primer mensaje!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender_id === senderId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender_id === senderId
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-secondary text-foreground rounded-bl-none border border-border/50'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 opacity-60 ${msg.sender_id === senderId ? 'text-right' : ''}`}>
                    {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50 flex gap-2">
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Escribe un mensaje..."
          className="bg-secondary/60 border-border/50"
          autoFocus
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sendMutation.isPending}
          className="bg-primary hover:bg-primary/90"
        >
          {sendMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}