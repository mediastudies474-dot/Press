import { useState } from 'react';
import { Play, ChevronDown, ChevronUp, Star, ExternalLink, Globe, Radio } from 'lucide-react';
import { MediaItem } from '@/data/media';

interface MediaCategoryProps {
  title: string;
  icon: React.ReactNode;
  items: MediaItem[];
  favorites: { isFavorite: (id: string) => boolean; toggle: (id: string) => void };
  onRadioPlay?: (item: MediaItem) => void;
  onArticleOpen?: (item: MediaItem) => void;
}

const MediaCategory = ({ title, icon, items, favorites, onRadioPlay, onArticleOpen }: MediaCategoryProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleAction = (item: MediaItem) => {
    if (item.category === 'radio' && item.streamUrl && onRadioPlay) {
      onRadioPlay(item);
      return;
    }
    if ((item.category === 'newspaper' || item.category === 'online') && item.websiteUrl && onArticleOpen) {
      onArticleOpen(item);
      return;
    }
    const url = item.websiteUrl || (item.streamUrl && item.streamUrl !== '#' ? item.streamUrl : null);
    if (url) {
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      if (!w) window.location.href = url;
    }
  };

  const getCategoryButton = (item: MediaItem) => {
    if (item.category === 'newspaper' || item.category === 'online') {
      return (
        <button onClick={() => handleAction(item)} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline active:scale-95 transition-transform">
          Read <ExternalLink size={12} />
        </button>
      );
    }
    if (item.category === 'radio' && item.streamUrl === '#') {
      return (
        <button onClick={() => handleAction(item)} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline active:scale-95 transition-transform">
          <Radio size={12} />
          <span>{item.frequency || 'Airwave'}</span>
        </button>
      );
    }
    return (
      <button onClick={() => handleAction(item)} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors active:scale-95">
        <Play size={14} className="text-primary-foreground ml-0.5" />
      </button>
    );
  };

  const getItemIcon = (item: MediaItem) => {
    if (item.logo) {
      return (
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
          <img src={item.logo} alt={item.name} className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
              el.parentElement!.classList.add('text-primary');
              if (item.category === 'tv') el.parentElement!.innerHTML = '📺';
              else if (item.category === 'radio') el.parentElement!.innerHTML = '🎙️';
              else if (item.category === 'online') el.parentElement!.innerHTML = '🌐';
              else el.parentElement!.innerHTML = '📰';
            }}
          />
        </div>
      );
    }
    if (item.category === 'tv') return <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-primary flex-shrink-0">📺</div>;
    if (item.category === 'radio') return <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">🎙️</div>;
    if (item.category === 'online') return <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-primary flex-shrink-0"><Globe size={16} /></div>;
    return <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-primary flex-shrink-0">📰</div>;
  };

  return (
    <div className="mx-4 mt-4 rounded-lg overflow-hidden bg-card shadow-sm border border-border/50">
      <button onClick={() => setCollapsed(!collapsed)} className="category-header px-4 py-2.5 flex items-center gap-2 w-full">
        {icon}
        <h2 className="text-category-header-foreground font-bold text-base flex-1 text-left">{title}</h2>
        <span className="text-category-header-foreground/70">{collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</span>
      </button>
      {!collapsed && (
        <div className="divide-y divide-border">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <button onClick={() => handleAction(item)} className="flex items-center gap-3 flex-1 text-left active:scale-[0.98] transition-transform">
                {getItemIcon(item)}
                <div className="min-w-0">
                  <span className="font-medium text-card-foreground text-sm block truncate">{item.name}</span>
                  {item.category === 'radio' && item.streamUrl && item.streamUrl !== '#' && (
                    <span className="text-[10px] text-primary">Tap to listen</span>
                  )}
                  {item.category === 'radio' && item.streamUrl === '#' && item.frequency && (
                    <span className="text-[10px] text-muted-foreground">{item.frequency} • Airwave only</span>
                  )}
                </div>
                {item.isLive && (
                  <span className="flex items-center gap-1 text-xs flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-live live-dot" />
                    <span className="text-live font-semibold text-[10px]">LIVE</span>
                  </span>
                )}
              </button>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => favorites.toggle(item.id)} className="p-1.5 rounded-full hover:bg-muted transition-colors active:scale-95">
                  <Star size={16} className={favorites.isFavorite(item.id) ? 'fill-primary text-primary' : 'text-muted-foreground'} />
                </button>
                {getCategoryButton(item)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaCategory;
