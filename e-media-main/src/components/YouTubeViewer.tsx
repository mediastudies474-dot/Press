import { ArrowLeft, ExternalLink } from 'lucide-react';

interface YouTubeViewerProps {
  videoId: string;
  title: string;
  onBack: () => void;
}

const YouTubeViewer = ({ videoId, title, onBack }: YouTubeViewerProps) => {
  const handleOpenExternal = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col max-w-md mx-auto">
      <header className="bg-card px-3 py-3 flex items-center gap-2 border-b border-border sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{title}</p>
          <p className="text-[10px] text-muted-foreground">YouTube</p>
        </div>
        <button onClick={handleOpenExternal} className="p-2 rounded-full hover:bg-muted transition-colors" title="Open in YouTube">
          <ExternalLink size={18} className="text-primary" />
        </button>
      </header>
      <div className="flex-1 flex flex-col">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-4">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
      </div>
    </div>
  );
};

export default YouTubeViewer;
