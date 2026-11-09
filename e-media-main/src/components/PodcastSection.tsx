import { Play, Loader2, Mic } from 'lucide-react';
import { useYouTubeVideos, YouTubeVideo } from '@/hooks/useYouTubeVideos';
import { podcastData, PodcastItem } from '@/data/media';

interface PodcastSectionProps {
  onVideoPlay?: (videoId: string, title: string) => void;
}

const PodcastCard = ({ podcast, onVideoPlay }: { podcast: PodcastItem; onVideoPlay?: (videoId: string, title: string) => void }) => {
  const handleClick = () => {
    // If it's a YouTube channel, try to open in-app
    if (onVideoPlay && podcast.youtubeChannelUrl.includes('youtube.com/watch')) {
      const videoId = new URL(podcast.youtubeChannelUrl).searchParams.get('v');
      if (videoId) {
        onVideoPlay(videoId, podcast.name);
        return;
      }
    }
    const w = window.open(podcast.youtubeChannelUrl, '_blank', 'noopener,noreferrer');
    if (!w) window.location.href = podcast.youtubeChannelUrl;
  };

  return (
    <button onClick={handleClick} className="flex-shrink-0 w-40 group text-left active:scale-[0.97] transition-transform">
      <div className="relative rounded-xl overflow-hidden aspect-square">
        <img
          src={podcast.thumbnail}
          alt={podcast.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/1a1a2e/dc2626?text=🎙️'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-xs font-bold text-white line-clamp-1">{podcast.name}</p>
          <p className="text-[10px] text-white/70">{podcast.host}</p>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2 leading-tight">{podcast.description}</p>
    </button>
  );
};

const PodcastVideoCard = ({ video, onVideoPlay }: { video: YouTubeVideo; onVideoPlay?: (videoId: string, title: string) => void }) => {
  const handleClick = () => {
    if (onVideoPlay) {
      onVideoPlay(video.id, video.title);
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

const PodcastSection = ({ onVideoPlay }: PodcastSectionProps) => {
  const { videos, loading } = useYouTubeVideos('tea-podcast');

  return (
    <div className="mt-5 mx-4">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Mic size={14} className="text-primary" />
        Podcasts
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {podcastData.map(podcast => (
          <PodcastCard key={podcast.id} podcast={podcast} onVideoPlay={onVideoPlay} />
        ))}
      </div>
      <h4 className="text-xs font-semibold text-muted-foreground mt-3 mb-2">Latest Episodes</h4>
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={18} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {videos.map(video => (
            <PodcastVideoCard key={video.id} video={video} onVideoPlay={onVideoPlay} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PodcastSection;
