import logoImg from '@/assets/e-media-logo.png';

const Footer = () => (
  <footer className="px-4 pt-6 pb-4 text-center border-t border-border/50 mt-6">
    <img src={logoImg} alt="ES-PRESS" className="w-10 h-10 rounded-lg mx-auto mb-2 opacity-70" />
    <p className="text-[11px] font-semibold text-foreground">ES-PRESS — Eswatini Media Hub</p>
    <p className="text-[10px] text-muted-foreground mt-1">
      © {new Date().getFullYear()} <span className="font-semibold">Imvelo Tech Group</span>. All rights reserved.
    </p>
  </footer>
);

export default Footer;
