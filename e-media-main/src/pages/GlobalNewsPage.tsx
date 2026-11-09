import { useState } from 'react';
import { Globe2, RefreshCw, ArrowUpRight, Search, Newspaper, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobalNews, type GlobalStory } from '@/hooks/useGlobalNews';

const topics = ['All', 'World', 'Politics', 'Business', 'Technology', 'Sports', 'Science'];
const time = (value: string | null) => value ? new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
function StoryImage({ story, featured = false }: { story: GlobalStory; featured?: boolean }) {
  const [failed, setFailed] = useState(false);
  return story.image && !failed ? <img src={story.image} alt="" loading={featured ? 'eager' : 'lazy'} onError={() => setFailed(true)} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center"><Newspaper className="text-muted-foreground" size={32} /></div>;
}
export default function GlobalNewsPage({ onArticleOpen }: { onArticleOpen: (url: string, title: string, source: string) => void }) {
  const feed = useGlobalNews();
  const [topic, setTopic] = useState('All');
  const [search, setSearch] = useState('');
  const articles = (feed.data?.articles ?? []).filter(a => (topic === 'All' || a.topics.includes(topic.toLowerCase())) && `${a.title} ${a.source}`.toLowerCase().includes(search.toLowerCase()));
  const lead = articles[0];
  const open = (a: GlobalStory) => onArticleOpen(a.url, a.title, a.source);
  return <section className="pt-6">
    <div className="px-4 flex items-start justify-between gap-3 mb-5">
      <div><p className="text-primary text-[10px] uppercase font-bold mb-1 flex items-center gap-1.5"><Globe2 size={12} /> Around the world</p><h2 className="text-3xl font-extrabold">Global News</h2><p className="text-xs text-muted-foreground mt-2">{feed.data ? `Updated ${time(feed.data.fetchedAt)}` : 'International headlines'}</p></div>
      <Button size="icon" variant="outline" aria-label="Refresh global news" title="Refresh global news" onClick={() => feed.refetch()} disabled={feed.isFetching}><RefreshCw className={feed.isFetching ? 'animate-spin' : ''} /></Button>
    </div>
    <div className="mx-4 relative mb-4"><Search size={16} className="absolute left-3 top-3 text-muted-foreground" /><input aria-label="Search global news" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search headlines or publishers" className="h-10 w-full bg-card border border-border rounded-md pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
    <div className="flex overflow-x-auto gap-2 px-4 pb-4">{topics.map(t => <Button key={t} variant={topic === t ? 'default' : 'outline'} size="sm" onClick={() => setTopic(t)} aria-pressed={topic === t}>{t}</Button>)}</div>
    {feed.isLoading && <div className="px-4 space-y-4" aria-label="Loading global headlines"><div className="h-64 bg-muted animate-pulse rounded-lg" /><div className="h-24 bg-muted animate-pulse rounded-lg" /></div>}
    {feed.isError && <div className="px-4 py-12 text-center"><AlertCircle className="mx-auto text-primary mb-3" /><p className="text-sm mb-4">Global news is temporarily unavailable.</p><Button onClick={() => feed.refetch()} variant="outline"><RefreshCw /> Try again</Button></div>}
    {feed.data?.stale && <p className="mx-4 mb-4 text-xs text-muted-foreground">Showing the last available edition while the service reconnects.</p>}
    {lead && <Button variant="ghost" onClick={() => open(lead)} className="relative block h-72 w-full overflow-hidden rounded-none p-0 text-left whitespace-normal hover:bg-transparent">
      <StoryImage story={lead} featured /><div className="absolute inset-0 media-scrim" /><div className="absolute inset-x-0 bottom-0 p-5 text-media-foreground"><span className="inline-block bg-primary text-primary-foreground px-2 py-1 text-[10px] font-bold rounded-sm mb-3">{lead.source}</span><h3 className="text-xl font-bold leading-snug line-clamp-3">{lead.title}</h3><p className="text-[10px] mt-2 text-media-foreground/75">{time(lead.publishedAt)}</p></div>
    </Button>}
    <div className="px-4 divide-y divide-border">{articles.slice(1).map(a => <Button variant="ghost" key={a.id} onClick={() => open(a)} className="w-full h-auto py-4 px-0 rounded-none whitespace-normal text-left justify-start gap-3 hover:bg-muted/30">
      <div className="w-20 h-20 rounded-md overflow-hidden shrink-0"><StoryImage story={a} /></div><div className="min-w-0 flex-1"><p className="text-primary text-[10px] font-bold mb-1">{a.source}</p><h3 className="text-sm font-semibold line-clamp-3 leading-snug">{a.title}</h3><p className="text-muted-foreground text-[10px] mt-2">{time(a.publishedAt)}</p></div><ArrowUpRight className="text-muted-foreground shrink-0" />
    </Button>)}</div>
    {!feed.isLoading && !feed.isError && !articles.length && <p className="py-12 px-4 text-center text-sm text-muted-foreground">No headlines match this selection.</p>}
    <p className="px-4 mt-5 text-[10px] text-muted-foreground">NewsData.io · Publication times shown locally · Availability depends on the publisher and your news plan.</p>
  </section>;
}