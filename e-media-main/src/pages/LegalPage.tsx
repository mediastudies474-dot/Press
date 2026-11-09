import { ArrowLeft, Shield, FileText } from 'lucide-react';
import { useState } from 'react';
import logoImg from '@/assets/e-media-logo.png';

type LegalTab = 'privacy' | 'terms' | 'disclaimer';

const LegalPage = ({ onBack }: { onBack: () => void }) => {
  const [tab, setTab] = useState<LegalTab>('privacy');

  return (
    <div className="px-4 pt-4 pb-24">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <TabBtn active={tab === 'privacy'} onClick={() => setTab('privacy')} icon={<Shield size={12} />} label="Privacy" />
        <TabBtn active={tab === 'terms'} onClick={() => setTab('terms')} icon={<FileText size={12} />} label="Terms" />
        <TabBtn active={tab === 'disclaimer'} onClick={() => setTab('disclaimer')} icon={<Shield size={12} />} label="Disclaimer" />
      </div>

      <div className="bg-card rounded-xl p-5 border border-border/50 shadow-sm">
        {tab === 'privacy' && <PrivacyContent />}
        {tab === 'terms' && <TermsContent />}
        {tab === 'disclaimer' && <DisclaimerContent />}
      </div>

      <div className="mt-8 text-center">
        <img src={logoImg} alt="ES-PRESS" className="w-10 h-10 rounded-lg mx-auto mb-2 opacity-60" />
        <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} Imvelo Tech Group. All rights reserved.</p>
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className={`py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${active ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border'}`}
  >
    {icon} {label}
  </button>
);

const PrivacyContent = () => (
  <div className="space-y-4 text-sm text-card-foreground">
    <h2 className="text-lg font-bold text-foreground">Privacy Policy</h2>
    <p className="text-muted-foreground text-xs">Last updated: May 2026</p>

    <p>ES-PRESS, operated by Imvelo Tech Group ("we", "us", "our"), is the Eswatini Media Hub mobile and web application (the "Service"). This page explains what data we collect and how we use it.</p>

    <h3 className="font-bold text-foreground">1. Information We Collect</h3>
    <p><strong>Account:</strong> email address, display name and (optional) avatar.</p>
    <p><strong>Usage:</strong> publications you view, time spent (dwell time), favourites, topics, clicks and play events — used for personalisation and aggregated media research.</p>
    <p><strong>Device & Location:</strong> approximate country/city derived from IP, plus device and browser type.</p>

    <h3 className="font-bold text-foreground">2. How We Use Your Information</h3>
    <ul className="list-disc pl-5 space-y-1">
      <li>Run and maintain the Service</li>
      <li>Personalise your "For You" feed and recommendations</li>
      <li>Send notifications about new articles, breaking news and videos</li>
      <li>Produce aggregated, anonymised insights for Eswatini media research</li>
    </ul>

    <h3 className="font-bold text-foreground">3. Data Storage & Security</h3>
    <p>Data is stored on our managed cloud backend with Row-Level Security so each account can only access its own data. We never sell your personal information.</p>

    <h3 className="font-bold text-foreground">4. Third-Party Content</h3>
    <p>ES-PRESS aggregates content from independent Eswatini media outlets. Tapping an article may take you to the publisher's site, which is governed by their own privacy policy.</p>

    <h3 className="font-bold text-foreground">5. Your Rights</h3>
    <ul className="list-disc pl-5 space-y-1">
      <li>Edit or delete your profile from Settings → Profile</li>
      <li>Disable push notifications at any time in Settings</li>
      <li>Request a full data export or account deletion via email</li>
    </ul>

    <h3 className="font-bold text-foreground">6. Contact</h3>
    <p>Privacy enquiries: <span className="text-primary font-semibold">privacy@imvelotech.com</span></p>
  </div>
);

const TermsContent = () => (
  <div className="space-y-4 text-sm text-card-foreground">
    <h2 className="text-lg font-bold text-foreground">Terms of Use</h2>
    <p className="text-muted-foreground text-xs">Last updated: May 2026</p>

    <p>By using ES-PRESS you agree to these Terms.</p>

    <h3 className="font-bold text-foreground">1. The Service</h3>
    <p>ES-PRESS is a media aggregation platform built by Imvelo Tech Group that links to Eswatini's TV, radio, newspaper, magazine, podcast and investigative outlets. We do not produce the underlying content.</p>

    <h3 className="font-bold text-foreground">2. Accounts</h3>
    <ul className="list-disc pl-5 space-y-1">
      <li>Provide accurate information when registering</li>
      <li>You are responsible for activity on your account</li>
      <li>No unlawful, abusive or automated/scraping use</li>
    </ul>

    <h3 className="font-bold text-foreground">3. Intellectual Property</h3>
    <p>The ES-PRESS app, branding, design and code belong to Imvelo Tech Group. All third-party media (articles, videos, audio, images) belong to their respective publishers and broadcasters.</p>

    <h3 className="font-bold text-foreground">4. Acceptable Use</h3>
    <p>You may use ES-PRESS for personal, non-commercial discovery of Eswatini media. Redistribution or republication of third-party content via the app is not permitted.</p>

    <h3 className="font-bold text-foreground">5. Limitation of Liability</h3>
    <p>The Service is provided "as is". Imvelo Tech Group is not liable for stream availability, content accuracy, or any direct or indirect damages arising from use of the Service.</p>

    <h3 className="font-bold text-foreground">6. Governing Law</h3>
    <p>Governed by the laws of the Kingdom of Eswatini.</p>

    <h3 className="font-bold text-foreground">7. Contact</h3>
    <p>Legal enquiries: <span className="text-primary font-semibold">legal@imvelotech.com</span></p>
  </div>
);

const DisclaimerContent = () => (
  <div className="space-y-4 text-sm text-card-foreground">
    <h2 className="text-lg font-bold text-foreground">Content Disclaimer</h2>
    <p className="text-muted-foreground text-xs">Last updated: May 2026</p>

    <p className="font-semibold text-foreground">All material in ES-PRESS belongs to its original creators — not to us.</p>

    <p>ES-PRESS aggregates publicly available articles, videos, radio streams, images and other content from independent Eswatini media houses, including but not limited to: Eswatini Observer, Times of Eswatini, Swaziland News, Eswatini TV, Channel YemaSwati, EBIS, UNESWA FM, VOC FM, Eswatini Positive News, Eswatini Daily News, Independent News, The Eswatini Times, News Eswatini, Swazi Newsweek, The Nation Magazine, Inhlase Centre for Investigative Journalism, Africa Uncensored, and others.</p>

    <ul className="list-disc pl-5 space-y-2">
      <li>All copyright, trademarks, logos and intellectual property remain the sole property of their respective owners and publishers.</li>
      <li>ES-PRESS does not produce, edit or own any third-party article, video, audio stream or image displayed in the app.</li>
      <li>Views, opinions and editorial choices expressed in third-party content are those of the respective publishers and do not represent ES-PRESS or Imvelo Tech Group.</li>
      <li>Where possible, full credit and a direct link to the original publisher is provided. Tapping "Read original" will take you to the source.</li>
      <li>If you are a rights holder and wish to request removal or correction of how your content is presented, contact us at <span className="text-primary font-semibold">copyright@imvelotech.com</span> and we will respond promptly.</li>
    </ul>

    <p className="text-xs text-muted-foreground italic">ES-PRESS is built to support — not replace — Eswatini's media houses. We encourage readers to subscribe to and support their favourite publishers directly.</p>
  </div>
);

export default LegalPage;
