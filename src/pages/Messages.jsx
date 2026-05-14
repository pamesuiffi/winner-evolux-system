import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PrivateChat from '@/components/chat/PrivateChat';
import { MessageCircle, Search, Users, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function Messages() {
  const { user } = useOutletContext();
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Todos los usuarios registrados en la app (via backend function para evitar restricciones de seguridad)
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['chat-contacts', user?.id],
    queryFn: async () => {
      const res = await base44.functions.invoke('getChatContacts', {});
      return res.data?.contacts || [];
    },
    enabled: !!user?.id,
    refetchInterval: 10000,
  });

  const filteredContacts = useMemo(() => contacts.filter(c =>
    (c.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ), [contacts, searchTerm]);

  return (
    <div className="max-w-6xl h-[calc(100vh-120px)] flex gap-4">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 border border-border rounded-xl bg-card flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold">Mensajes</h2>
            <span className="ml-auto text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
              {filteredContacts.length}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-secondary/60 rounded-lg px-3 py-2.5 border border-border/30">
            <Search size={14} className="text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar usuario..."
              className="bg-transparent border-0 text-sm placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2 h-full justify-center">
              <MessageCircle className="w-10 h-10 opacity-30" />
              <p>{searchTerm ? 'Sin resultados' : 'Sin usuarios disponibles'}</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredContacts.map((contact, idx) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  idx={idx}
                  isSelected={selectedContact?.id === contact.id}
                  onClick={() => setSelectedContact(contact)}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Chat */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 border border-border rounded-xl bg-card flex flex-col overflow-hidden"
      >
        {selectedContact ? (
          <PrivateChat
            currentUser={user}
            selectedUser={selectedContact}
            onClose={() => setSelectedContact(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="font-semibold mb-1">Selecciona un contacto</p>
              <p className="text-sm text-muted-foreground/70">Abre un chat para comunicarte</p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ContactItem({ contact, idx, isSelected, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      onClick={onClick}
      className={`w-full p-3 text-left rounded-lg transition-all duration-200 flex items-center gap-3 ${
        isSelected
          ? 'bg-primary/15 border-l-2 border-primary shadow-sm'
          : 'hover:bg-secondary/50 border-l-2 border-transparent'
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
        {contact.full_name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-sm text-foreground truncate">{contact.full_name}</p>
          {contact.role === 'admin' && (
            <Shield className="w-3 h-3 text-accent flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground/80 truncate">{contact.email}</p>
      </div>
    </motion.button>
  );
}