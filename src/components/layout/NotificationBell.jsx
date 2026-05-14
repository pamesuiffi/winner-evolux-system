import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

export default function NotificationBell({ user }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Todas las notificaciones del usuario (coach_id = receiver universal)
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => base44.entities.Notification.filter(
      { coach_id: user?.id },
      '-created_date',
      20
    ),
    enabled: !!user?.id,
    refetchInterval: 5000
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (notifId) => base44.entities.Notification.update(notifId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllRead = () => {
    notifications.filter(n => !n.is_read).forEach(n => markAsReadMutation.mutate(n.id));
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      markAsReadMutation.mutate(notif.id);
    }
    if (notif.action_url) {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-96 bg-card border border-border rounded-xl shadow-xl z-50">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Notificaciones</h3>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-secondary rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Sin notificaciones
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map(notif => (
                  <Link
                    key={notif.id}
                    to={notif.action_url || '#'}
                    onClick={() => handleNotificationClick(notif)}
                    className={`block p-3 hover:bg-secondary/50 transition-colors ${!notif.is_read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{notif.title}</p>
                        {notif.message && (
                          <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notif.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}