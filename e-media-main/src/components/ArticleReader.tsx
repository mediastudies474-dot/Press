import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Loader2, AlertCircle, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';


interface ArticleReaderProps {
  url: string;
  title: string;
  source: string;
  onBack: () => void;
}

interface ParsedArticle {
  title: string;
  author: string | null;
  published_at: string | null;
  site_name: string | null;
  lead_image: string | null;
  content_html: string;
  url: string;
}

const ArticleReader = ({ url, title, source, onBack }: ArticleReaderProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<ParsedArticle | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setArticle(null);


    supabase.functions
      .invoke('read-article', { body: { url } })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(err.message);
        } else if (data?.error) {
          setError(data.error);
        } else if (!data?.content_html || data.content_html.length < 200) {
          setError('Could not extract article content from the source.');
        } else {
          setArticle(data as ParsedArticle);
        }
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message || 'Failed to load');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [url]);

  const handleOpenExternal = () => window.open(url, '_blank', 'noopener,noreferrer');

  const publishedNice = article?.published_at
    ? new Date(article.published_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null;

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col max-w-md mx-auto">
      <header className="bg-card px-3 py-3 flex items-center gap-2 border-b border-border sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Back">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{article?.title || title || source}</p>
          <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
            <Globe size={10} /> {article?.site_name || source}
          </p>
        </div>
        <button onClick={handleOpenExternal} className="p-2 rounded-full hover:bg-muted transition-colors" title="Open original">
          <ExternalLink size={18} className="text-primary" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 size={28} className="animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading article from {source}…</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center py-24 px-6">
            <div className="text-center">
              <AlertCircle size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium mb-1">Couldn't load in-app</p>
              <p className="text-xs text-muted-foreground mb-4">{error}</p>
              <button
                onClick={handleOpenExternal}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2"
              >
                <ExternalLink size={14} /> Open original
              </button>
            </div>
          </div>
        )}

        {!loading && article && (
          <article className="px-5 pt-5 pb-12">
            <h1 className="text-2xl font-extrabold leading-tight text-foreground mb-2">{article.title}</h1>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-4 flex-wrap">
              {article.author && <span className="font-semibold text-foreground/80">By {article.author}</span>}
              {article.author && publishedNice && <span>·</span>}
              {publishedNice && <span>{publishedNice}</span>}
              <span>·</span>
              <span className="text-primary font-semibold">{article.site_name || source}</span>
            </div>

            {article.lead_image && (
              <img
                src={article.lead_image}
                alt=""
                className="w-full rounded-xl mb-5 object-cover max-h-72"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}

            <div
              className="article-content prose prose-sm max-w-none text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content_html }}
            />


            <div className="mt-8 pt-4 border-t border-border/50">
              <p className="text-[11px] text-muted-foreground italic mb-3">
                © Content belongs to <span className="font-semibold">{article.site_name || source}</span> and its
                respective creators. ES-PRESS displays this story for convenience only.
              </p>
              <button
                onClick={handleOpenExternal}
                className="w-full py-3 rounded-xl bg-muted text-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-muted/70"
              >
                <ExternalLink size={14} /> Read original on {article.site_name || source}
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};

export default ArticleReader;
