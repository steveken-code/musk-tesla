import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

interface NotificationData {
  active: boolean;
  subject: string;
  message: string;
}

const DashboardNotification = () => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'dashboard_notification')
        .maybeSingle();

      if (!error && data) {
        const val = data.setting_value as unknown as NotificationData;
        if (val && val.subject) setNotification(val);
      }
    };

    fetchNotification();

    // Realtime subscription
    const channel = supabase
      .channel('dashboard-notification')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_settings',
          filter: 'setting_key=eq.dashboard_notification',
        },
        (payload: any) => {
          const val = payload.new?.setting_value as unknown as NotificationData;
          if (val && val.subject) {
            setNotification(val);
            setDismissed(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!notification || !notification.subject || dismissed) return null;

  const isActive = notification.active;

  return (
    <Alert
      className={`relative border-l-4 ${
        isActive
          ? 'border-l-green-500 bg-green-500/10 text-green-200'
          : 'border-l-amber-500 bg-amber-500/10 text-amber-200'
      }`}
    >
      {isActive ? (
        <CheckCircle className="h-5 w-5 text-green-400" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-amber-400" />
      )}
      <AlertTitle className={isActive ? 'text-green-300' : 'text-amber-300'}>
        {notification.subject}
      </AlertTitle>
      <AlertDescription className={isActive ? 'text-green-200/80' : 'text-amber-200/80'}>
        {notification.message}
      </AlertDescription>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
};

export default DashboardNotification;
