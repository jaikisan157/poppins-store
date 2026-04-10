import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';

// Detect iOS
const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !(window.navigator as any).standalone;


export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Don't show if dismissed recently
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return; // dismissed within last 7 days
    }

    // Android: capture beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 3 seconds on page
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler as any);

    // iOS: show guide after 5 seconds
    if (isIOS()) {
      setTimeout(() => setShowBanner(true), 5000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler as any);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android — trigger native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS()) {
      // iOS — show manual guide
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  if (installed || (!showBanner && !showIOSGuide)) return null;

  return (
    <>
      {/* Install Banner */}
      {showBanner && !showIOSGuide && (
        <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 animate-fade-in-up">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-border p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0">
              <img src="/icons/icon-192.png" alt="sourceLabs" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans font-semibold text-sm text-foreground">Install sourceLabs</p>
              <p className="text-xs text-muted-foreground">
                {isIOS()
                  ? 'Add to Home Screen for the best experience'
                  : 'Shop faster • Works offline • No app store needed'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                {isIOS() ? (
                  <><Share className="h-3.5 w-3.5" /> How</>
                ) : (
                  <><Download className="h-3.5 w-3.5" /> Install</>
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-medium">Install sourceLabs</h3>
              <button onClick={() => { setShowIOSGuide(false); handleDismiss(); }}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <div>
                  <p className="text-sm font-medium">Tap the Share button</p>
                  <p className="text-xs text-muted-foreground">The square with an arrow at the bottom of Safari</p>
                  <span className="text-2xl">⬆️</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <div>
                  <p className="text-sm font-medium">Scroll down and tap</p>
                  <p className="text-xs text-muted-foreground font-medium text-foreground">"Add to Home Screen"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <div>
                  <p className="text-sm font-medium">Tap "Add" to confirm</p>
                  <p className="text-xs text-muted-foreground">sourceLabs will appear on your home screen!</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setShowIOSGuide(false); handleDismiss(); }}
              className="mt-5 w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
