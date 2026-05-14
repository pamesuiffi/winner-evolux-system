import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, X, Send, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function EvoluxAIChat({ user }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && !conversation) {
      initConversation();
    }
  }, [open]);

  useEffect(() => {
    if (!conversation) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: 'evolux_ai',
        metadata: { name: `Chat ${user?.full_name || 'Usuario'}` },
      });
      setConversation(conv);
      // Welcome message
      await base44.agents.addMessage(conv, {
        role: 'user',
        content: `Hola, soy ${user?.full_name || 'un usuario'} con rol ${user?.role || 'usuario'}.`,
      });
    } catch (e) {
      console.error('Error init conv', e);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending || !conversation) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: text });
    } catch (e) {
      console.error('Error sending', e);
    } finally {
      setSending(false);
    }
  };

  const visibleMessages = messages.filter(m =>
    !(m.role === 'user' && m.content?.startsWith('Hola, soy '))
  );

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110"
          style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}
        >
          <Bot size={24} className="text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-2xl flex flex-col shadow-2xl transition-all"
          style={{
            width: 360,
            height: minimized ? 56 : 520,
            background: '#0D0D0D',
            border: '1px solid rgba(255,77,0,0.3)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-t-2xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(255,77,0,0.15), rgba(255,184,0,0.1))', borderBottom: '1px solid rgba(255,77,0,0.2)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}>
              <Bot size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-bold leading-tight">Evolux-AI 🏆</p>
              <p className="text-xs" style={{ color: '#00C896' }}>● En línea</p>
            </div>
            <button onClick={() => setMinimized(!minimized)} className="text-gray-500 hover:text-white transition-colors">
              {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!conversation && (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 size={20} className="animate-spin text-primary" />
                  </div>
                )}
                {visibleMessages.length === 0 && conversation && (
                  <div className="text-center space-y-2 pt-4">
                    <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}>
                      <Bot size={24} className="text-white" />
                    </div>
                    <p className="text-white text-sm font-semibold">¡Hola, soy Evolux-AI! 💪</p>
                    <p className="text-gray-400 text-xs">Tu asistente de entrenamiento, nutrición y pagos. ¿En qué te ayudo hoy?</p>
                  </div>
                )}
                {visibleMessages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Escribe aquí... 🔥"
                  disabled={!conversation || sending}
                  className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 disabled:opacity-50"
                  style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending || !conversation}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 hover:opacity-90"
                  style={{ background: '#FF4D00' }}
                >
                  {sending ? <Loader2 size={14} className="animate-spin text-white" /> : <Send size={14} className="text-white" />}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}