import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNewsroomArticles, type NewsroomArticle } from '@/hooks/useNewsroom';

const monthKey = (v: string) => new Date(v).toLocaleString('en-GB', { month: 'long', year: 'numeric' });
const day = (v: string) => new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short' });

export default function ArchivesPage() {
  const navigate = useNavigate();
  const articles = useNewsroomArticles();
  const [openMonth, setOpenMonth] = useState<string | null>(null);
  const [openArticle, setOpenArticle] = useState<NewsroomArticle | null>(null);

  const groups = (articles.data ?? []).reduce<Record<string, NewsroomArticle[]>>((acc, a) => {
    const k = monthKey(a.published_at);
    (acc[k] ||= []).push(a);
    return acc;
  }, {});
  const months = Object.keys(groups);

  if (openArticle) {
    return (
      <div className="app-container min-h-screen pb-24">
        <div className="px-4 pt-4">
          <Button variant="ghost" size="sm" onClick={() => setOpenArticle(null)}><ArrowLeft size={16} /> Back to archives</Button>
        </div>
        <article className="px-4 pt-4 max-w-2xl mx-auto">
          {openArticle.image_url && <img src={openArticle.image_url} alt="" className="w-full h-56 object-cover rounded-lg mb-4" />}
          <span className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold rounded-sm capitalize">{openArticle.category}</span>
          <h1 className="text-2xl font-extrabold mt-3 leading-tight">{openArticle.title}</h1>
          <p className="text-xs text-muted-foreground mt-2">By {openArticle.author_name || 'Imvelo staff'}</p>
          <div className="mt-5 text-sm leading-relaxed whitespace-pre-wrap">{openArticle.body}</div>
        </article>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen pb-24">
      <div className="px-4 pt-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/newsroom')}><ArrowLeft size={16} /> Newsroom</Button>
      </div>
      <header className="px-4 pt-4 pb-5">
        <p className="text-primary text-[10px] uppercase font-bold mb-1 flex items-center gap-1.5"><Archive size={12} /> Imvelo T&M Group</p>
        <h1 className="text-3xl font-extrabold">Article Archives</h1>
        <p className="text-xs text-muted-foreground mt-2">Every story we have published, grouped by month.</p>
      </header>

      <div className="px-4 space-y-3">
        {articles.isLoading && <div className="h-32 bg-muted animate-pulse rounded-lg" />}
        {months.map(m => (
          <div key={m} className="bg-card border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenMonth(openMonth === m ? null : m)}
              className="w-full flex items-center justify-between p-4"
              aria-expanded={openMonth === m}
            >
              <span className="font-bold text-sm">{m} <span className="text-muted-foreground font-normal">({groups[m].length})</span></span>
              {openMonth === m ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openMonth === m && (
              <div className="divide-y divide-border border-t border-border">
                {groups[m].map(a => (
                  <button key={a.id} onClick={() => setOpenArticle(a)} className="w-full text-left p-4 hover:bg-muted/30 flex gap-3">
                    {a.image_url && <img src={a.image_url} alt="" className="w-14 h-14 rounded-md object-cover shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    <div className="min-w-0">
                      <p className="text-primary text-[10px] font-bold capitalize">{a.category} · {day(a.published_at)}</p>
                      <h3 className="text-sm font-semibold line-clamp-2 leading-snug">{a.title}</h3>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {!articles.isLoading && months.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">The archive is empty. Published stories will appear here.</p>
        )}
      </div>
    </div>
  );
}
