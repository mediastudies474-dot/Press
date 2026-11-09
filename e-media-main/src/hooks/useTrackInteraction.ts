import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mediaData } from '@/data/media';

type InteractionType = 'view' | 'click' | 'play' | 'read' | 'favorite' | 'share';

// One stable session id per browser tab
function getSessionId(): string {
  let sid = sessionStorage.getItem('emedia-session-id');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('emedia-session-id', sid);
  }
  return sid;
}

// Coarse location (cached for the session, no API key needed)
type GeoInfo = { country?: string; city?: string; region?: string };
let geoPromise: Promise<GeoInfo> | null = null;
function getGeo(): Promise<GeoInfo> {
  if (geoPromise) return geoPromise;
  const cached = sessionStorage.getItem('emedia-geo');
  if (cached) {
    geoPromise = Promise.resolve(JSON.parse(cached));
    return geoPromise;
  }
  geoPromise = fetch('https://ipapi.co/json/')
    .then(r => r.ok ? r.json() : {})
    .then((j: any) => {
      const g: GeoInfo = {
        country: j?.country_name || j?.country,
        city: j?.city,
        region: j?.region,
      };
      sessionStorage.setItem('emedia-geo', JSON.stringify(g));
      return g;
    })
    .catch(() => ({}));
  return geoPromise;
}

function lookupSource(mediaId: string) {
  const m = mediaData.find(x => x.id === mediaId);
  return {
    source_id: m?.id || mediaId,
    source_name: m?.name || mediaId,
    category: m?.category || null,
  };
}

export function useTrackInteraction() {
  const { user } = useAuth();

  const track = useCallback(async (
    mediaId: string,
    interactionType: InteractionType,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return;
    try {
      const geo = await getGeo();
      const src = lookupSource(mediaId);
      const row = {
        user_id: user.id,
        media_id: mediaId,
        interaction_type: interactionType,
        session_id: getSessionId(),
        source_id: src.source_id,
        source_name: src.source_name,
        category: (metadata as any)?.category || src.category,
        country: geo.country || null,
        city: geo.city || null,
        region: geo.region || null,
        user_agent: navigator.userAgent.slice(0, 255),
        metadata: metadata || {},
      };
      await (supabase as any).from('user_interactions').insert(row);
    } catch (e) {
      console.error('Track interaction error:', e);
    }
  }, [user]);

  /** Track time spent (dwell). Call returned `stop()` when the user leaves the item. */
  const startDwell = useCallback((mediaId: string, extra?: Record<string, unknown>) => {
    const startedAt = Date.now();
    return async () => {
      const dwell = Math.round((Date.now() - startedAt) / 1000);
      if (dwell < 1 || !user) return;
      try {
        const geo = await getGeo();
        const src = lookupSource(mediaId);
        const row = {
          user_id: user.id,
          media_id: mediaId,
          interaction_type: 'view' as const,
          dwell_seconds: dwell,
          session_id: getSessionId(),
          source_id: src.source_id,
          source_name: src.source_name,
          category: (extra as any)?.category || src.category,
          country: geo.country || null,
          city: geo.city || null,
          region: geo.region || null,
          user_agent: navigator.userAgent.slice(0, 255),
          metadata: extra || {},
        };
        await (supabase as any).from('user_interactions').insert(row);
      } catch (e) {
        console.error('Dwell track error:', e);
      }
    };
  }, [user]);

  return { track, startDwell };
}

/** Hook variant: automatically records dwell time while the component is mounted. */
export function useDwellTracker(mediaId: string | null, extra?: Record<string, unknown>) {
  const { startDwell } = useTrackInteraction();
  const stopRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (!mediaId) return;
    stopRef.current = startDwell(mediaId, extra);
    return () => { stopRef.current?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaId]);
}
