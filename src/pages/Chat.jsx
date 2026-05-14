import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Send, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export default function Chat() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  const { data: students = [] } = useQuery({
    queryKey: ['students', user?.email],
    queryFn: () => base44.entities.Student.filter({ coach_id: user?.email }),
    enabled: !!user,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', selectedChat?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ 
      coach_id: user?.email,
    }, 'created_date', 100),
    enabled: !!user,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['chat-messages'] }); setMessage(''); },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChat]);

  const chatMessages = selectedChat 
    ? messages.filter(m => 
        (m.sender_id === user?.email && m.receiver_id === selectedChat.email) ||
        (m.receiver_id === user?.email && m.sender_id === selectedChat.email)
      )
    : [];

  const handleSend = () => {
    if (!message.trim() || !selectedChat) return;
    sendMutation.mutate({
      sender_id: user.email,
      receiver_id: selectedChat.email || selectedChat.id,
      coach_id: user.email,
      content: message,
      message_type: 'text',
    });
  };

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-6rem)] rounded-xl border border-border bg-card overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full sm:w-80 border-r border-border flex flex-col ${selectedChat ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-bold text-lg mb-3">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary border-border h-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredStudents.map(student => {
            const lastMsg = messages.find(m => 
              m.sender_id === student.email || m.receiver_id === student.email
            );
            return (
              <button
                key={student.id}
                onClick={() => setSelectedChat(student)}
                className={`w-full flex items-center gap-3 p-3 px-4 hover:bg-secondary/50 transition-colors text-left ${
                  selectedChat?.id === student.id ? 'bg-secondary' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{student.full_name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{student.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{lastMsg?.content || 'Sin mensajes'}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden sm:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setSelectedChat(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{selectedChat.full_name?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <p className="font-display font-semibold text-sm">{selectedChat.full_name}</p>
                <p className="text-xs text-muted-foreground">Alumno</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => {
                const isMe = msg.sender_id === user?.email;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary rounded-bl-sm'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {msg.created_date ? format(new Date(msg.created_date), 'HH:mm') : ''}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="bg-secondary border-border"
                />
                <Button onClick={handleSend} disabled={!message.trim()} className="bg-primary hover:bg-primary/90">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">Selecciona un alumno para chatear</p>
          </div>
        )}
      </div>
    </div>
  );
}