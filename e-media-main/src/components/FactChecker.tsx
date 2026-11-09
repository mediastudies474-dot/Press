import { useState } from 'react';
import { ShieldCheck, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Source {
  source_name: string;
  title: string;
  url: string;
  published_at: string | null;
  snippet?: string | null;
}

interface Metrics {
  independentSources: number;
  avgSimilarity: number;
  bayesianPosterior: number;
  confidence: 'Low' | 'Medium' | 'High';
}

const FactChecker = () => {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const { toast } = useToast();

  const run = async () => {
    if (claim.trim().length < 5) {
      toast({ title: 'Add more detail', description: 'Enter at least a sentence to check.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setVerdict(null);
    setSources([]);
    setMetrics(null);
    try {
      const { data, error } = await supabase.functions.invoke('fact-check', {
        body: { claim: claim.trim() },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setVerdict((data as any).verdict);
      setSources((data as any).sources || []);
      setMetrics((data as any).metrics || null);
    } catch (e: any) {
      toast({
        title: 'Fact-check failed',
        description: e.message || 'Try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="text-primary" size={22} />
        <h2 className="text-lg font-bold text-foreground">Fact Check</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        AI-powered triangulation across Eswatini media and global sources. Paste a claim,
        headline, or social media post.
      </p>

      <div className="bg-card rounded-xl border border-border/50 p-3 shadow-sm">
        <Textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="e.g. The Lilangeni was devalued against the Rand last week."
          rows={4}
          className="resize-none border-0 focus-visible:ring-0 p-2 text-sm"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-muted-foreground">{claim.length} chars</span>
          <Button onClick={run} disabled={loading} size="sm" className="gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? 'Triangulating…' : 'Check claim'}
          </Button>
        </div>
      </div>

      {metrics && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="bg-card rounded-lg border border-border/50 p-2 text-center">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Outlets</p>
            <p className="text-lg font-bold text-foreground">{metrics.independentSources}</p>
          </div>
          <div className="bg-card rounded-lg border border-border/50 p-2 text-center">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Similarity</p>
            <p className="text-lg font-bold text-foreground">{metrics.avgSimilarity.toFixed(2)}</p>
          </div>
          <div className="bg-card rounded-lg border border-border/50 p-2 text-center">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">P(authentic)</p>
            <p className="text-lg font-bold text-primary">{(metrics.bayesianPosterior * 100).toFixed(0)}%</p>
          </div>
        </div>
      )}

      {verdict && (
        <div className="mt-4 bg-card rounded-xl border border-border/50 p-4 shadow-sm">
          <div className="prose prose-sm dark:prose-invert max-w-none text-card-foreground prose-headings:text-card-foreground prose-strong:text-foreground">
            <ReactMarkdown>{verdict}</ReactMarkdown>
          </div>
        </div>
      )}

      {sources.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
            Local sources cross-referenced
          </h3>
          <div className="space-y-2">
            {sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-card rounded-lg border border-border/50 p-3 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-primary">{s.source_name}</p>
                    <p className="text-xs font-medium text-card-foreground line-clamp-2 mt-0.5">{s.title}</p>
                    {s.snippet && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{s.snippet}</p>
                    )}
                  </div>
                  <ExternalLink size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {!verdict && !loading && (
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Tips:</p>
          <ul className="mt-1 space-y-0.5">
            <li>• Be specific: include names, places, and dates</li>
            <li>• One claim at a time gives the best result</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FactChecker;
