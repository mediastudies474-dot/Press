import { ArrowLeft, Newspaper, Radio, Tv, Globe, Shield, Mail } from 'lucide-react';
import logoImg from '@/assets/e-media-logo.png';

const AboutPage = ({ onBack }: { onBack: () => void }) => (
  <div className="px-4 pt-4 pb-24">
    <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
      <ArrowLeft size={18} />
      <span className="text-sm font-medium">Back</span>
    </button>

    <div className="text-center mb-6">
      <img src={logoImg} alt="ES-PRESS" className="w-24 h-24 rounded-2xl mx-auto mb-3 shadow-lg" />
      <h1 className="text-2xl font-extrabold text-foreground">ES-PRESS</h1>
      <p className="text-sm text-muted-foreground">Eswatini Media Hub</p>
      <p className="text-[11px] text-muted-foreground mt-1">Version 1.0.0</p>
    </div>

    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm space-y-4 mb-4">
      <p className="text-sm text-card-foreground leading-relaxed">
        ES-PRESS is the Kingdom of Eswatini's all-in-one media hub. We bring together TV, radio, newspapers,
        magazines, podcasts and investigative journalism from trusted Eswatini sources into a single, simple app.
      </p>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Feature icon={<Tv size={18} />} label="Live TV" />
        <Feature icon={<Radio size={18} />} label="Radio Streams" />
        <Feature icon={<Newspaper size={18} />} label="Newspapers" />
        <Feature icon={<Globe size={18} />} label="Online Media" />
      </div>
    </div>

    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-4">
      <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
        <Shield size={16} className="text-primary" /> Content Disclaimer
      </h2>
      <p className="text-xs text-muted-foreground leading-relaxed">
        All articles, videos, audio streams, images and other materials displayed in ES-PRESS belong to their
        respective creators, broadcasters and publishers. ES-PRESS is an aggregator — we do not own, produce, or
        claim authorship of any third-party content. All rights, copyright and intellectual property remain with
        the original media houses. Tap any article to be taken to the source for full credit.
      </p>
    </div>

    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-4">
      <h2 className="text-sm font-bold text-foreground mb-2">Built by</h2>
      <p className="text-sm text-card-foreground font-semibold">Imvelo Tech Group</p>
      <p className="text-xs text-muted-foreground mt-1">
        Building Eswatini-first digital products that connect, inform and empower.
      </p>
      <a
        href="mailto:hello@imvelotech.com"
        className="mt-3 inline-flex items-center gap-2 text-xs text-primary font-semibold"
      >
        <Mail size={14} /> hello@imvelotech.com
      </a>
    </div>

    <p className="text-center text-[10px] text-muted-foreground mt-6">
      © {new Date().getFullYear()} Imvelo Tech Group. All rights reserved.
    </p>
  </div>
);

const Feature = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2 bg-background/50 rounded-xl p-2.5 border border-border/40">
    <span className="text-primary">{icon}</span>
    <span className="text-xs font-semibold text-foreground">{label}</span>
  </div>
);

export default AboutPage;
