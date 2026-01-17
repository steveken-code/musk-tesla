import { useState, useEffect, useCallback } from 'react';
import { Bell, BellRing, Plus, Trash2, TrendingUp, TrendingDown, AlertTriangle, X, Settings, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface PriceAlert {
  id: string;
  type: 'above' | 'below';
  price: number;
  triggered: boolean;
  createdAt: Date;
}

interface PriceAlertsSystemProps {
  currentPrice: number;
  onAlertTriggered?: (alert: PriceAlert) => void;
}

// Storage key for alerts
const ALERTS_STORAGE_KEY = 'tesla_price_alerts';
const SOUND_ENABLED_KEY = 'tesla_alerts_sound_enabled';

// Create notification sound
const playAlertSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Alert beeps
    const playBeep = (frequency: number, startTime: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + startTime + 0.2);
      
      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + 0.25);
    };
    
    // Play three rising beeps
    playBeep(800, 0);
    playBeep(1000, 0.25);
    playBeep(1200, 0.5);
  } catch (error) {
    console.log('Audio notification not supported');
  }
};

const PriceAlertsSystem = ({ currentPrice, onAlertTriggered }: PriceAlertsSystemProps) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [newAlertType, setNewAlertType] = useState<'above' | 'below'>('above');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([]);
  const [showTriggered, setShowTriggered] = useState(false);

  // Load alerts from storage
  useEffect(() => {
    const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAlerts(parsed.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt) })));
      } catch (e) {
        console.error('Failed to parse stored alerts');
      }
    }
    
    const soundPref = localStorage.getItem(SOUND_ENABLED_KEY);
    if (soundPref !== null) {
      setSoundEnabled(soundPref === 'true');
    }
  }, []);

  // Save alerts to storage
  useEffect(() => {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts]);

  // Save sound preference
  useEffect(() => {
    localStorage.setItem(SOUND_ENABLED_KEY, String(soundEnabled));
  }, [soundEnabled]);

  // Check alerts against current price
  useEffect(() => {
    if (!currentPrice || alerts.length === 0) return;

    const newTriggered: PriceAlert[] = [];
    
    const updatedAlerts = alerts.map(alert => {
      if (alert.triggered) return alert;
      
      const shouldTrigger = 
        (alert.type === 'above' && currentPrice >= alert.price) ||
        (alert.type === 'below' && currentPrice <= alert.price);
      
      if (shouldTrigger) {
        const triggeredAlert = { ...alert, triggered: true };
        newTriggered.push(triggeredAlert);
        
        // Show notification
        const direction = alert.type === 'above' ? 'risen above' : 'fallen below';
        toast.success(
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-400" />
            <div>
              <p className="font-semibold">Price Alert Triggered!</p>
              <p className="text-sm">TSLA has {direction} ${alert.price.toFixed(2)}</p>
            </div>
          </div>,
          { duration: 8000 }
        );
        
        // Play sound
        if (soundEnabled) {
          playAlertSound();
        }
        
        // Callback
        onAlertTriggered?.(triggeredAlert);
        
        return triggeredAlert;
      }
      
      return alert;
    });

    if (newTriggered.length > 0) {
      setAlerts(updatedAlerts);
      setTriggeredAlerts(prev => [...prev, ...newTriggered]);
      setShowTriggered(true);
      
      // Auto-hide triggered notification after 5s
      setTimeout(() => setShowTriggered(false), 5000);
    }
  }, [currentPrice, alerts, soundEnabled, onAlertTriggered]);

  const addAlert = useCallback(() => {
    const price = parseFloat(newAlertPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    // Check for duplicate
    const isDuplicate = alerts.some(a => a.price === price && a.type === newAlertType && !a.triggered);
    if (isDuplicate) {
      toast.error('An alert for this price already exists');
      return;
    }

    const newAlert: PriceAlert = {
      id: crypto.randomUUID(),
      type: newAlertType,
      price,
      triggered: false,
      createdAt: new Date(),
    };

    setAlerts(prev => [...prev, newAlert]);
    setNewAlertPrice('');
    
    toast.success(
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4" />
        <span>Alert set for ${price.toFixed(2)}</span>
      </div>
    );
  }, [newAlertPrice, newAlertType, alerts]);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearTriggered = useCallback(() => {
    setAlerts(prev => prev.filter(a => !a.triggered));
    setTriggeredAlerts([]);
  }, []);

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredCount = alerts.filter(a => a.triggered).length;

  return (
    <>
      {/* Triggered alert popup */}
      {showTriggered && triggeredAlerts.length > 0 && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-full duration-300">
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-2xl shadow-amber-500/20 max-w-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 animate-pulse">
                  <BellRing className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-amber-100">Price Alert!</p>
                  <p className="text-xs text-amber-200/70">{triggeredAlerts.length} alert(s) triggered</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowTriggered(false)}
                className="h-8 w-8 p-0 text-amber-300 hover:text-amber-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {triggeredAlerts.slice(-3).map(alert => (
                <div key={alert.id} className="flex items-center gap-2 text-sm text-amber-100">
                  {alert.type === 'above' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span>
                    {alert.type === 'above' ? 'Above' : 'Below'} ${alert.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main alert button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="relative gap-2 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Alerts</span>
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-xs font-bold text-black rounded-full flex items-center justify-center">
                {activeAlerts.length}
              </span>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Price Alerts
            </DialogTitle>
            <DialogDescription>
              Get notified when TSLA reaches your target price
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Current price display */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <span className="text-sm text-muted-foreground">Current TSLA Price</span>
              <span className="text-lg font-bold text-foreground">${currentPrice.toFixed(2)}</span>
            </div>
            
            {/* Add new alert */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Create New Alert</Label>
              <div className="flex gap-2">
                <Select value={newAlertType} onValueChange={(v) => setNewAlertType(v as 'above' | 'below')}>
                  <SelectTrigger className="w-[120px] bg-background/50 border-border/50 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="above">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        Above
                      </div>
                    </SelectItem>
                    <SelectItem value="below">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-3 h-3 text-red-400" />
                        Below
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Target price"
                    value={newAlertPrice}
                    onChange={(e) => setNewAlertPrice(e.target.value)}
                    className="pl-7 bg-background/50 border-border/50 rounded-xl"
                    onKeyDown={(e) => e.key === 'Enter' && addAlert()}
                  />
                </div>
                
                <Button onClick={addAlert} size="icon" className="bg-amber-500 hover:bg-amber-600 text-black rounded-xl">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Sound toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm">Sound notifications</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={soundEnabled ? 'text-green-400' : 'text-muted-foreground'}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>
            
            {/* Active alerts list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Active Alerts ({activeAlerts.length})</Label>
                {triggeredCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearTriggered}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear {triggeredCount} triggered
                  </Button>
                )}
              </div>
              
              {activeAlerts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No active alerts
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {activeAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        alert.type === 'above' 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : 'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {alert.type === 'above' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <div>
                          <p className="font-medium">${alert.price.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.type === 'above' ? 'Rise above' : 'Fall below'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAlert(alert.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PriceAlertsSystem;
