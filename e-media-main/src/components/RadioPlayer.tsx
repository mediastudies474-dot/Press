import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, X, Loader2, Signal } from 'lucide-react';

interface RadioPlayerProps {
  stationName: string;
  streamUrl: string;
  logo?: string;
  frequency?: string;
  onClose: () => void;
}

const RadioPlayer = ({ stationName, streamUrl, logo, frequency, onClose }: RadioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const isAirwaveOnly = streamUrl === '#';

  const isZenoFm = streamUrl.includes('zeno.fm');
  const isAzuracast = streamUrl.includes('jmc.uneswa.ac.sz');

  const getDirectStreamUrl = () => {
    if (isAirwaveOnly) return '';
    if (isZenoFm) return 'https://stream.zeno.fm/yn65fsaurfhvv';
    if (isAzuracast) return 'https://jmc.uneswa.ac.sz/listen/uneswa_fm_88.2/radio.mp3';
    return streamUrl;
  };

  const togglePlay = async () => {
    if (isAirwaveOnly || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setLoading(true);
      setError(false);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleMute = () => {
    if (isAirwaveOnly || !audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const directUrl = getDirectStreamUrl();

  return (
    <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto z-50 px-3">
      <div className="glass rounded-2xl border border-border/50 shadow-xl p-4">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {logo && !logo.includes('embed') ? (
              <img src={logo} alt={stationName} className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Radio size={24} className="text-primary" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{stationName}</p>
            {isAirwaveOnly ? (
              <div className="flex items-center gap-1.5">
                <Signal size={12} className="text-primary" />
                <span className="text-[10px] text-primary font-semibold">{frequency || 'FM'} • AIRWAVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-live live-dot" />
                <span className="text-[10px] text-live font-semibold">
                  {loading ? 'CONNECTING...' : isPlaying ? 'LIVE' : error ? 'UNAVAILABLE' : 'READY'}
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {isAirwaveOnly ? (
              /* Airwave-only: just show close */
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/20 transition-colors active:scale-95">
                <X size={16} className="text-muted-foreground" />
              </button>
            ) : (
              <>
                <button onClick={toggleMute} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors active:scale-95">
                  {isMuted ? <VolumeX size={16} className="text-muted-foreground" /> : <Volume2 size={16} className="text-foreground" />}
                </button>
                <button onClick={togglePlay} disabled={loading} className="w-11 h-11 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-all active:scale-95 disabled:opacity-50">
                  {loading ? <Loader2 size={18} className="text-primary-foreground animate-spin" /> : isPlaying ? <Pause size={18} className="text-primary-foreground" /> : <Play size={18} className="text-primary-foreground ml-0.5" />}
                </button>
                <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/20 transition-colors active:scale-95">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </>
            )}
          </div>
        </div>

        {isAirwaveOnly && (
          <div className="mt-3 bg-primary/5 rounded-lg p-3 text-center">
            <p className="text-xs text-foreground font-medium">📻 Tune your FM radio to</p>
            <p className="text-2xl font-bold text-primary mt-1">{frequency || 'FM'}</p>
            <p className="text-[10px] text-muted-foreground mt-1">This station broadcasts on airwaves only</p>
          </div>
        )}

        {error && !isAirwaveOnly && (
          <p className="text-[10px] text-destructive mt-2 text-center">
            Stream unavailable. The station may be offline.
          </p>
        )}

        {!isAirwaveOnly && (
          <audio ref={audioRef} src={directUrl} preload="none" crossOrigin="anonymous"
            onError={() => { setError(true); setLoading(false); setIsPlaying(false); }}
            onCanPlay={() => setLoading(false)}
            onPlaying={() => { setIsPlaying(true); setLoading(false); }}
            onPause={() => setIsPlaying(false)}
          />
        )}
      </div>
    </div>
  );
};

export default RadioPlayer;
