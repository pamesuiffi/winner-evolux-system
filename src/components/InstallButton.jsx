import React, { useState, useEffect } from 'react';
import { Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  if (isInstalled) {
    return (
      <Button disabled className="gap-2 bg-success/20 text-success border-success/30 hover:bg-success/20">
        <Check className="w-4 h-4" />
        Instalada
      </Button>
    );
  }

  if (!installPrompt) {
    return null;
  }

  return (
    <Button onClick={handleInstall} className="bg-primary hover:bg-primary/90 gap-2">
      <Download className="w-4 h-4" />
      Instalar App
    </Button>
  );
}