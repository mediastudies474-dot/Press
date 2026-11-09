import { useState } from 'react';
import { Play, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useYouTubeVideos, YouTubeVideo } from '@/hooks/useYouTubeVideos';

interface YouTubeSectionProps {
  channelKey: string;
  title: string;
  onVideoPlay?: (videoId: string, title: string) => void;
}

const VideoCard = ({ video, onPlay }: { video: YouTubeVideo; onPlay?: (videoId: string, title: string) => void }) => {
  const handleClick = () => {
    if (onPlay) {
      onPlay(video.id, video.title);
    } else {
      window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div onClick={handleClick} className="flex-shrink-0 w-56 group cursor-pointer" role="button" tabIndex={0}>
      <div className="relative rounded-lg overflow-hidden">
        <img src={video.thumbnail} alt={video.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Play size={18} className="text-primary-foreground ml-0.5" />
          </div>
        </div>
      </div>
      <p className="text-xs font-medium text-card-foreground mt-2 line-clamp-2 leading-tight">{video.title}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{video.channelTitle}</p>
    </div>
  );
};

const YouTubeSection = ({ channelKey, title, onVideoPlay }: YouTubeSectionProps) => {
  const { videos, loading, error } = useYouTubeVideos(channelKey);
  const [collapsed, setCollapsed] = useState(false);

  if (error) return null;

  return (
    <div className="mt-4 mx-4">
      <button onClick={() => setCollapsed(!collapsed)} className="w-full text-sm font-bold text-foreground mb-2.5 flex items-center gap-2">
        <Play size={14} className="text-primary" />
        <span className="flex-1 text-left">{title}</span>
        <span className="text-muted-foreground">{collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</span>
      </button>
      {!collapsed && (
        loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {videos.map(video => (
              <VideoCard key={video.id} video={video} onPlay={onVideoPlay} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default YouTubeSection;
