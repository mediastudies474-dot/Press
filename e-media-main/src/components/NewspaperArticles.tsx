import { ExternalLink, Newspaper, Loader2, Play } from 'lucide-react';
import { useLatestArticles } from '@/hooks/useLatestArticles';
import { mediaData } from '@/data/media';

const FALLBACK_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><rect width="400" height="240" fill="#1a1a1a"/><text x="200" y="125" font-family="sans-serif" font-size="18" fill="#888" text-anchor="middle">No image</text></svg>`
);

const sourceFallback = (sourceName: string): string => {
  const m = mediaData.find(x => x.name === sourceName);
  return (m?.logo as string) || FALLBACK_PLACEHOLDER;
};

export interface Article {
  id: string;
  title: string;
  image: string;
  source: string;
  category: string;
  url: string;
  date: string;
}

// Static fallback articles
const fallbackArticles: Article[] = [
  {
    id: 'eo-1',
    title: "Pupil arrested for minor's alleged rape granted E50 000 bail",
    image: 'https://eswatiniobserver.com/wp-content/uploads/2026/04/ghcghch-696x506.jpg',
    source: 'Eswatini Observer',
    category: 'News',
    url: 'https://eswatiniobserver.com/pupil-granted-bail-minor-rape-case-eswatini/',
    date: 'Apr 9, 2026',
  },
  {
    id: 'tos-1',
    title: "Amazulu loanee 'Mbhobho' makes waves in Eswatini",
    image: 'https://www.times.co.sz/news/img/20260409134333SSSS.jpg',
    source: 'Times of Eswatini',
    category: 'Sports',
    url: 'https://www.times.co.sz/sports/',
    date: 'Apr 9, 2026',
  },
];

interface NewspaperArticlesProps {
  onArticleOpen?: (url: string, title: string, source: string) => void;
  onVideoPlay?: (videoId: string, title: string) => void;
}

const isYouTubeUrl = (url: string) => url.includes('youtube.com/watch');
const getYouTubeId = (url: string) => {
  try { return new URL(url).searchParams.get('v'); } catch { return null; }
};

const NewspaperArticles = ({ onArticleOpen, onVideoPlay }: NewspaperArticlesProps) => {
  const { articles: dynamicArticles, loading } = useLatestArticles();
  const allArticles = dynamicArticles.length > 0 ? dynamicArticles : fallbackArticles;

  const handleClick = (article: Article, e: React.MouseEvent) => {
    e.preventDefault();
    if (isYouTubeUrl(article.url) && onVideoPlay) {
      const videoId = getYouTubeId(article.url);
      if (videoId) { onVideoPlay(videoId, article.title); return; }
    }
    if (onArticleOpen) {
      onArticleOpen(article.url, article.title, article.source);
    }
  };

  if (loading && dynamicArticles.length === 0) {
    return (
      <div className="mt-5 mx-4 pb-4 flex items-center justify-center py-8">
        <Loader2 size={18} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mt-5 mx-4 pb-4">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Newspaper size={14} className="text-primary" />
        Latest Updates
      </h3>

      {/* Featured article */}
      <a
        href={allArticles[0].url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => handleClick(allArticles[0], e)}
        className="group block bg-card rounded-lg overflow-hidden shadow-sm border border-border/50 hover:border-primary/30 transition-all mb-3"
      >
        <div className="relative h-40 overflow-hidden">
          <img
            src={allArticles[0].image}
            alt={allArticles[0].title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = sourceFallback(allArticles[0].source); }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <span className="text-[10px] font-bold text-primary bg-card/80 px-2 py-0.5 rounded">{allArticles[0].source}</span>
            <p className="text-sm font-semibold text-white mt-1 line-clamp-2">{allArticles[0].title}</p>
          </div>
          {isYouTubeUrl(allArticles[0].url) && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
              <Play size={20} className="text-primary-foreground ml-0.5" />
            </div>
          )}
        </div>
      </a>

      {/* Grid of articles */}
      <div className="grid grid-cols-2 gap-3">
        {allArticles.slice(1, 9).map(article => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleClick(article, e)}
            className="group bg-card rounded-lg overflow-hidden shadow-sm border border-border/50 hover:border-primary/30 transition-all"
          >
            <div className="relative h-24 overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { (e.target as HTMLImageElement).src = sourceFallback(article.source); }}
              />
              {isYouTubeUrl(article.url) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center">
                    <Play size={14} className="text-primary-foreground ml-0.5" />
                  </div>
                </div>
              )}
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-card/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={12} className="text-primary" />
              </div>
            </div>
            <div className="p-2.5">
              <p className="text-xs font-medium text-card-foreground line-clamp-2 leading-tight">{article.title}</p>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[10px] text-primary font-semibold">{article.source}</p>
                <p className="text-[10px] text-muted-foreground">{article.date}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewspaperArticles;
