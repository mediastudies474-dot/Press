import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const KEY = 'emedia-privacy-accepted-v1';

const PrivacyGate = ({ children }: { children: React.ReactNode }) => {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    setAccepted(localStorage.getItem(KEY) === '1');
  }, []);

  if (accepted === null) return null;

  if (!accepted) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
        <div className="bg-card text-card-foreground w-full max-w-md rounded-2xl border border-border shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center">
              <ShieldCheck className="text-primary" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Privacy & Terms</h2>
              <p className="text-xs text-muted-foreground">Please review before continuing</p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-3 mb-5 leading-relaxed">
            <p>
              <strong className="text-foreground">e-Media</strong> aggregates Eswatini news, radio, TV and articles. By
              continuing you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Storage of your preferences (favorites, topics, settings) on your device and our backend.</li>
              <li>Anonymous usage analytics to improve recommendations.</li>
              <li>Optional browser notifications for new stories (you can opt out anytime).</li>
              <li>External content opens in embedded readers; third-party sites have their own policies.</li>
            </ul>
            <p>
              We never sell your data. Read the full{' '}
              <a href="/legal" className="text-primary underline">privacy policy & terms</a>.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                localStorage.removeItem(KEY);
                window.location.href = 'about:blank';
              }}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted active:scale-[0.98]"
            >
              Decline
            </button>
            <button
              onClick={() => {
                localStorage.setItem(KEY, '1');
                setAccepted(true);
              }}
              className="flex-[2] py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98]"
            >
              I Agree & Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PrivacyGate;
