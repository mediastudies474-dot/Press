import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Newspaper, PenLine, Archive, ArrowLeft, Trash2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNewsroomArticles, useIsStaff, usePublishArticle, useDeleteArticle, type NewsroomArticle } from '@/hooks/useNewsroom';
import { toast } from 'sonner';

const categories = ['news', 'politics', 'business', 'sports', 'culture', 'community'];
const time = (v: string) => new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function Editor({ onDone }: { onDone: () => void }) {
  const publish = usePublishArticle();
  const [form, setForm] = useState({ title: '', summary: '', body: '', category: 'news', image_url: '' });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    if (!form.title.trim() || !form.body.trim()) { toast.error('Title and story body are required.'); return; }
    try {
      await publish.mutateAsync(form);
      toast.success('Story published.');
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Publishing failed.');
    }
  };
  const input = 'w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';
  return (
    <div className="mx-4 mb-6 bg-card border border-border rounded-lg p-4 space-y-3">
      <h3 className="font-bold text-sm flex items-center gap-2"><PenLine size={14} className="text-primary" /> New story</h3>
      <input aria-label="Story title" className={input} placeholder="Headline" value={form.title} onChange={set('title')} />
      <input aria-label="Story summary" className={input} placeholder="Short summary (optional)" value={form.summary} onChange={set('summary')} />
      <div className="flex gap-2">
        <select aria-label="Category" className={input} value={form.category} onChange={set('category')}>
          {categories.map(c => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
        </select>
        <input aria-label="Image URL" className={input} placeholder="Image URL (optional)" value={form.image_url} onChange={set('image_url')} />
      </div>
      <textarea aria-label="Story body" className={`${input} min-h-40`} placeholder="Write the full story…" value={form.body} onChange={set('body')} />
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onDone}>Cancel</Button>
        <Button size="sm" onClick={submit} disabled={publish.isPending}>{publish.isPending ? 'Publishing…' : 'Publish story'}</Button>
      </div>
    </div>
  );
}

function ArticleCard({ article, canManage, onOpen }: { article: NewsroomArticle; canManage: boolean; onOpen: (a: NewsroomArticle) => void }) {
  const del = useDeleteArticle();
  return (
    <article className="bg-card border border-border rounded-lg overflow-hidden">
      {article.image_url && <img src={article.image_url} alt="" className="w-full h-40 object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold rounded-sm capitalize">{article.category}</span>
          <span className="text-[10px] text-muted-foreground">{time(article.published_at)}</span>
        </div>
        <button onClick={() => onOpen(article)} className="text-left">
          <h3 className="font-bold leading-snug">{article.title}</h3>
          {article.summary && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>}
        </button>
        <div className="flex items-center justify-between mt-3">
          <p className="text-[11px] text-muted-foreground">By {article.author_name || 'Imvelo staff'}</p>
          {canManage && (
            <Button variant="ghost" size="icon" aria-label="Delete story" onClick={async () => { await del.mutateAsync(article.id); toast.success('Story deleted.'); }}>
              <Trash2 size={14} className="text-destructive" />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function NewsroomPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const articles = useNewsroomArticles();
  const staff = useIsStaff();
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState<NewsroomArticle | null>(null);
  const isStaff = !!staff.data;

  if (open) {
    return (
      <div className="app-container min-h-screen pb-24">
        <div className="px-4 pt-4">
          <Button variant="ghost" size="sm" onClick={() => setOpen(null)}><ArrowLeft size={16} /> Back to newsroom</Button>
        </div>
        <article className="px-4 pt-4 max-w-2xl mx-auto">
          {open.image_url && <img src={open.image_url} alt="" className="w-full h-56 object-cover rounded-lg mb-4" />}
          <span className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold rounded-sm capitalize">{open.category}</span>
          <h1 className="text-2xl font-extrabold mt-3 leading-tight">{open.title}</h1>
          <p className="text-xs text-muted-foreground mt-2">By {open.author_name || 'Imvelo staff'} · {time(open.published_at)}</p>
          <div className="mt-5 text-sm leading-relaxed whitespace-pre-wrap">{open.body}</div>
        </article>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen pb-24">
      <div className="px-4 pt-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft size={16} /> Home</Button>
        <Link to="/archives"><Button variant="outline" size="sm"><Archive size={14} /> Archives</Button></Link>
      </div>
      <header className="px-4 pt-4 pb-5">
        <p className="text-primary text-[10px] uppercase font-bold mb-1 flex items-center gap-1.5"><Newspaper size={12} /> Imvelo T&M Group</p>
        <h1 className="text-3xl font-extrabold">Newsroom</h1>
        <p className="text-xs text-muted-foreground mt-2">Original stories published by our editorial team.</p>
      </header>

      {!user && (
        <div className="mx-4 mb-6 bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Staff members sign in to publish stories.</p>
          <Link to="/staff"><Button size="sm"><LogIn size={14} /> Staff login</Button></Link>
        </div>
      )}
      {user && !isStaff && !staff.isLoading && (
        <p className="mx-4 mb-6 text-xs text-muted-foreground bg-card border border-border rounded-lg p-3">
          Your account is not on the staff list, so you can read but not publish. Ask an editor to grant you staff access.
        </p>
      )}
      {isStaff && !editing && (
        <div className="px-4 mb-6"><Button onClick={() => setEditing(true)} className="w-full"><PenLine size={14} /> Write a new story</Button></div>
      )}
      {isStaff && editing && <Editor onDone={() => setEditing(false)} />}

      <div className="px-4 space-y-4">
        {articles.isLoading && <div className="h-40 bg-muted animate-pulse rounded-lg" />}
        {articles.data?.map(a => <ArticleCard key={a.id} article={a} canManage={isStaff && a.author_id === user?.id} onOpen={setOpen} />)}
        {articles.data?.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">No stories published yet. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
