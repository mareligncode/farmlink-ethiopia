import React from 'react';
import { Bell, Package, ShoppingCart, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const typeConfig = {
  order: { icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10' },
  product: { icon: Package, color: 'text-secondary', bg: 'bg-secondary/10' },
  success: { icon: CheckCircle, color: 'text-leaf', bg: 'bg-leaf/10' },
  alert: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  general: { icon: Info, color: 'text-accent', bg: 'bg-accent/10' },
};

const Notifications: React.FC = () => {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!profile) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 safe-area-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('nav.notifications')}</h1>
            {unreadCount > 0 && (
              <p className="text-muted-foreground text-sm">
                {unreadCount} {language === 'am' ? 'ያልተነበቡ' : 'unread'}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-primary text-sm font-medium"
              disabled={markAllAsReadMutation.isPending}
            >
              {language === 'am' ? 'ሁሉንም አንብብ' : 'Mark all read'}
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const config = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.general;
              const Icon = config.icon;
              
              return (
                <button
                  key={notification.id}
                  onClick={() => !notification.is_read && markAsReadMutation.mutate(notification.id)}
                  className={cn(
                    "w-full text-left bg-card rounded-xl p-4 transition-all",
                    !notification.is_read && "ring-2 ring-primary/20 bg-primary/5"
                  )}
                >
                  <div className="flex gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", config.bg)}>
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("font-semibold text-sm", !notification.is_read && "text-primary")}>
                          {language === 'am' && notification.title_am ? notification.title_am : notification.title_en}
                        </p>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                        {language === 'am' && notification.message_am ? notification.message_am : notification.message_en}
                      </p>
                      <p className="text-muted-foreground text-xs mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-muted rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Bell className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {language === 'am' ? 'ማሳወቂያዎች የሉም' : 'No Notifications'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'am' 
                ? 'አዲስ ማሳወቂያዎች እዚህ ይታያሉ' 
                : 'New notifications will appear here'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
