import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 flex items-center gap-3 z-50">
      <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Install Event Timeline
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Add to home screen for quick access
        </p>
      </div>
      <Button size="sm" onClick={handleInstall} className="flex-shrink-0">
        Install
      </Button>
      <Button size="sm" variant="ghost" onClick={handleDismiss} className="flex-shrink-0 p-1">
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}