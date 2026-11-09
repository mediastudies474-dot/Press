import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLatestNews } from '@/hooks/useLatestNews';

interface NewsCarouselProps {
  onArticleOpen?: (url: string, title: string, source: string) => void;
  onVideoPlay?: (videoId: string, title: string) => void;
}

const isYouTubeUrl = (url: string) => url.includes('youtube.com/watch') || url.includes('youtu.be/');
const getYouTubeId = (url: string) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    return u.searchParams.get('v');
  } catch { return null; }
};

const NewsCarousel = ({ onArticleOpen, onVideoPlay }: NewsCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const { slides: dynamicSlides, loading } = useLatestNews();
  const touchStart = useRef<number | null>(null);

  // Only use real source images; drop slides whose image failed to load.
  const allSlides = useMemo(
    () => dynamicSlides.filter(s => s.image && !broken.has(s.image)),
    [dynamicSlides, broken]
  );

  useEffect(() => {
    if (allSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % allSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [allSlides.length]);

  const next = () => setCurrent(p => (p + 1) % allSlides.length);
  const prev = () => setCurrent(p => (p - 1 + allSlides.length) % allSlides.length);

  if (loading && allSlides.length === 0) {
    return (
      <div className="mt-0 overflow-hidden bg-card border border-border/50 h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (allSlides.length === 0) return null;

  const slide = allSlides[current % allSlides.length];
  if (!slide) return null;

  const isVideo = isYouTubeUrl(slide.url);

  const open = () => {
    if (isVideo && onVideoPlay) {
      const id = getYouTubeId(slide.url);
      if (id) { onVideoPlay(id, slide.subtitle); return; }
    }
    if (onArticleOpen) onArticleOpen(slide.url, slide.subtitle, slide.title);
  };

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    touchStart.current = null;
  };

  return (
    <div className="mt-0 overflow-hidden bg-card shadow-lg border border-border/50">
      <div
        className="relative h-64 cursor-pointer group"
        onClick={open}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {allSlides.map((s, i) => (
          <img
            key={s.id ?? i}
            src={s.image}
            alt={s.subtitle}
            loading={i === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
            onError={() => {
              setBroken(prev => {
                const n = new Set(prev);
                n.add(s.image);
                return n;
              });
            }}
          />
        ))}

        <div className="absolute inset-0 media-scrim" />

        {/* Source badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded">
            {slide.title}
          </span>
          {isVideo && (
            <span className="bg-media-overlay/60 backdrop-blur-md text-media-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded flex items-center gap-1">
              <Play size={10} className="fill-media-foreground" /> Video
            </span>
          )}
        </div>

        {/* Prev / Next arrows */}
        {allSlides.length > 1 && (
          <>
            <Button variant="ghost"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-media-overlay/40 backdrop-blur-md text-media-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button variant="ghost"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-media-overlay/40 backdrop-blur-md text-media-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <ChevronRight size={18} />
            </Button>
          </>
        )}

        {/* Title + CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-media-foreground text-base font-bold leading-tight line-clamp-2 drop-shadow-lg">
            {slide.subtitle}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-media-foreground/80 text-[11px] font-medium">
              {isVideo ? <><Play size={11} /> Tap to watch</> : <><ExternalLink size={11} /> Tap to read</>}
            </span>
            <div className="flex gap-1">
              {allSlides.slice(0, 8).map((_, i) => (
                <Button variant="ghost"
                  key={i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                  className={`p-0 min-w-0 h-1 rounded-full transition-all ${i === current ? 'w-6 bg-primary' : 'w-1.5 bg-media-foreground/40'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCarousel;
