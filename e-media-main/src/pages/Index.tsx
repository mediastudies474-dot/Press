import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tv, Radio as RadioIcon, Newspaper, Star, Play, ExternalLink, Globe, BookOpen, Search as SearchIcon, MonitorPlay } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import SearchBar from '@/components/SearchBar';
import NewsCarousel from '@/components/NewsCarousel';
import MediaCategory from '@/components/MediaCategory';
import BottomNav from '@/components/BottomNav';
import SettingsPanel from '@/components/SettingsPanel';
import YouTubeSection from '@/components/YouTubeSection';
import NewspaperArticles from '@/components/NewspaperArticles';
import NotificationPanel from '@/components/NotificationPanel';
import RadioPlayer from '@/components/RadioPlayer';
import PodcastSection from '@/components/PodcastSection';
import ArticleReader from '@/components/ArticleReader';
import YouTubeViewer from '@/components/YouTubeViewer';
import TopicSelector from '@/components/TopicSelector';
import TopicFilterBar from '@/components/TopicFilterBar';
import NotificationPermissionPrompt from '@/components/NotificationPermissionPrompt';
import Footer from '@/components/Footer';
import InstallPrompt from '@/components/InstallPrompt';
import FactChecker from '@/components/FactChecker';
import GamesPage from '@/pages/GamesPage';
import { Button } from '@/components/ui/button';
import { mediaData, MediaItem } from '@/data/media';
import { useFavorites } from '@/hooks/useFavorites';
import { useSettings } from '@/hooks/useSettings';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useTrackInteraction } from '@/hooks/useTrackInteraction';
import { usePersonalizedFeed } from '@/hooks/usePersonalizedFeed';
import { useAdMobBanner } from '@/hooks/useAdMob';

// Inferred topic mapping per category (used by the topic filter bar)
const CATEGORY_TOPICS: Record<MediaItem['category'], string[]> = {
  tv: ['news', 'entertainment', 'culture'],
  radio: ['news', 'community', 'entertainment'],
  newspaper: ['news', 'politics', 'business', 'sports'],
  online: ['news', 'positive', 'lifestyle', 'community'],
  magazine: ['lifestyle', 'culture', 'business'],
  investigative: ['investigative', 'politics'],
};

type Tab = 'home' | 'favorites' | 'factcheck' | 'games' | 'notifications' | 'more';

const Index = () => {
  const [tab, setTab] = useState<Tab>('home');
  const changeTab = (next: Tab) => {
    setTab(next);
    window.history.replaceState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const [searchVisible, setSearchVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [radioStation, setRadioStation] = useState<MediaItem | null>(null);
  const [articleReader, setArticleReader] = useState<{ url: string; title: string; source: string } | null>(null);
  const [youtubeViewer, setYoutubeViewer] = useState<{ videoId: string; title: string } | null>(null);
  const favorites = useFavorites();
  const settings = useSettings();
  const notifs = useRealtimeNotifications();
  const { track } = useTrackInteraction();
  const { recommendedMedia, hasPersonalization } = usePersonalizedFeed();
  useAdMobBanner(true);

  const matchesTopic = (item: MediaItem) =>
    !topicFilter || (CATEGORY_TOPICS[item.category] || []).includes(topicFilter);

  const filter = (items: typeof mediaData) =>
    items
      .filter(matchesTopic)
      .filter(i => i.name.toLowerCase().includes(query.toLowerCase()));

  const tv = filter(mediaData.filter(m => m.category === 'tv'));
  const radio = filter(mediaData.filter(m => m.category === 'radio'));
  const newspapers = filter(mediaData.filter(m => m.category === 'newspaper'));
  const online = filter(mediaData.filter(m => m.category === 'online'));
  const magazines = filter(mediaData.filter(m => m.category === 'magazine'));
  const investigative = filter(mediaData.filter(m => m.category === 'investigative'));

  const favItems = mediaData.filter(m => favorites.isFavorite(m.id));

  const handleMediaAction = (item: typeof mediaData[0]) => {
    track(item.id, 'click', { category: item.category });
    if (item.category === 'radio' && item.streamUrl) {
      setRadioStation(item);
      return;
    }
    if (['newspaper', 'online', 'magazine', 'investigative'].includes(item.category) && item.websiteUrl) {
      track(item.id, 'read', { category: item.category });
      setArticleReader({ url: item.websiteUrl, title: item.name, source: item.name });
      return;
    }
    const url = item.websiteUrl || (item.streamUrl && item.streamUrl !== '#' ? item.streamUrl : null);
    if (url) {
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      if (!w) window.location.href = url;
    }
  };

  const handleRadioPlay = (item: MediaItem) => {
    track(item.id, 'play', { category: 'radio' });
    setRadioStation(item);
  };
  const handleArticleOpen = (item: MediaItem) => {
    if (item.websiteUrl) {
      track(item.id, 'read', { category: item.category });
      setArticleReader({ url: item.websiteUrl, title: item.name, source: item.name });
    }
  };
  const handleVideoPlay = (videoId: string, title: string) => {
    track(videoId, 'play', { type: 'youtube' });
    setYoutubeViewer({ videoId, title });
  };

  return (
    <div className="app-container">
      <AppHeader
        onSearchToggle={() => setSearchVisible(!searchVisible)}
        onSettingsOpen={() => changeTab('more')}
        onAvatarClick={() => changeTab('more')}
      />
      <SearchBar visible={searchVisible} query={query} onChange={setQuery} onClose={() => { setSearchVisible(false); setQuery(''); }} />
      <InstallPrompt />

      <main className="pb-24">
        {tab === 'home' && (
          <>
            <div className="px-4 py-4 flex items-center justify-between gap-2"><h2 className="font-bold text-lg">Today's edition</h2><Link to="/newsroom"><Button variant="outline" size="sm"><Newspaper size={14} /> Newsroom</Button></Link></div>
            <NewsCarousel
              onArticleOpen={(url, title, source) => {
                track('carousel', 'click', { url });
                setArticleReader({ url, title, source });
              }}
              onVideoPlay={handleVideoPlay}
            />

            <div className="px-4 mt-4">
              <a
                href="https://itvszl.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-card border border-primary/40 rounded-lg p-3 shadow-sm hover:border-primary transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <MonitorPlay size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-foreground truncate">Watch ITV — Online TV</p>
                  <p className="text-[11px] text-muted-foreground truncate">Stream live & on-demand shows</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <ExternalLink size={13} className="text-primary-foreground" />
                </div>
              </a>
            </div>

            <NotificationPermissionPrompt />

            <TopicSelector />

            <TopicFilterBar active={topicFilter} onChange={setTopicFilter} />

            {hasPersonalization && recommendedMedia.length > 0 && !topicFilter && (
              <MediaCategory
                title="For You"
                icon={<Star size={18} className="text-category-header-foreground" />}
                items={recommendedMedia}
                favorites={favorites}
                onRadioPlay={handleRadioPlay}
                onArticleOpen={handleArticleOpen}
              />
            )}

            {tv.length > 0 && <MediaCategory title="TV" icon={<Tv size={18} className="text-category-header-foreground" />} items={tv} favorites={favorites} />}
            {tv.length > 0 && <YouTubeSection channelKey="etv" title="Eswatini TV Videos" onVideoPlay={handleVideoPlay} />}
            {tv.length > 0 && <YouTubeSection channelKey="cys" title="Channel YemaSwati" onVideoPlay={handleVideoPlay} />}
            {radio.length > 0 && <MediaCategory title="Radio" icon={<RadioIcon size={18} className="text-category-header-foreground" />} items={radio} favorites={favorites} onRadioPlay={handleRadioPlay} />}
            {newspapers.length > 0 && <MediaCategory title="Newspapers" icon={<Newspaper size={18} className="text-category-header-foreground" />} items={newspapers} favorites={favorites} onArticleOpen={handleArticleOpen} />}
            {online.length > 0 && <MediaCategory title="Online Media" icon={<Globe size={18} className="text-category-header-foreground" />} items={online} favorites={favorites} onArticleOpen={handleArticleOpen} />}
            {magazines.length > 0 && <MediaCategory title="Magazines" icon={<BookOpen size={18} className="text-category-header-foreground" />} items={magazines} favorites={favorites} onArticleOpen={handleArticleOpen} />}
            {investigative.length > 0 && <MediaCategory title="Investigative News" icon={<SearchIcon size={18} className="text-category-header-foreground" />} items={investigative} favorites={favorites} onArticleOpen={handleArticleOpen} />}
            <PodcastSection onVideoPlay={handleVideoPlay} />
            <NewspaperArticles onArticleOpen={(url, title, source) => {
              track('article', 'read', { url });
              setArticleReader({ url, title, source });
            }} onVideoPlay={handleVideoPlay} />
          </>
        )}

        {tab === 'favorites' && (
          <div className="px-4 pt-4 pb-24">
            <h2 className="text-lg font-bold text-foreground mb-4">Your Favorites</h2>
            {favItems.length === 0 ? (
              <div className="text-center py-16">
                <Star size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No favorites yet</p>
                <p className="text-muted-foreground text-sm mt-1">Tap the star icon on any media to save it here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {favItems.map(item => (
                  <div key={item.id} className="bg-card rounded-lg p-4 flex items-center justify-between shadow-sm border border-border/50">
                    <button onClick={() => handleMediaAction(item)} className="flex items-center gap-3 flex-1 text-left">
                      {item.logo && <img src={item.logo} alt="" className="w-8 h-8 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                      <span className="text-sm font-medium text-card-foreground">{item.name}</span>
                      <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded">{item.category}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => favorites.toggle(item.id)} className="p-1.5 rounded-full hover:bg-muted transition-colors active:scale-95">
                        <Star size={18} className="fill-primary text-primary" />
                      </button>
                      <button onClick={() => handleMediaAction(item)} className="p-1.5 rounded-full hover:bg-muted transition-colors active:scale-95">
                        {['newspaper', 'online', 'magazine', 'investigative'].includes(item.category) ? <ExternalLink size={16} className="text-primary" /> : <Play size={16} className="text-primary" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'factcheck' && <FactChecker />}

        {tab === 'games' && <GamesPage />}


        {tab === 'notifications' && (
          <NotificationPanel notifications={notifs.notifications} onMarkAsRead={notifs.markAsRead} onMarkAllRead={notifs.markAllRead} onClearAll={notifs.clearAll} />
        )}

        {tab === 'more' && (
          <SettingsPanel
            darkMode={settings.darkMode}
            dataSaver={settings.dataSaver}
            fontSize={settings.fontSize}
            autoplay={settings.autoplay}
            pushEnabled={settings.pushEnabled}
            onDarkToggle={settings.setDarkMode}
            onDataSaverToggle={settings.setDataSaver}
            onFontSizeChange={settings.setFontSize}
            onAutoplayToggle={settings.setAutoplay}
            onPushToggle={settings.setPushEnabled}
          />
        )}
        <Footer />
      </main>

      {articleReader && <ArticleReader url={articleReader.url} title={articleReader.title} source={articleReader.source} onBack={() => setArticleReader(null)} />}
      {youtubeViewer && <YouTubeViewer videoId={youtubeViewer.videoId} title={youtubeViewer.title} onBack={() => setYoutubeViewer(null)} />}
      {radioStation?.streamUrl && <RadioPlayer stationName={radioStation.name} streamUrl={radioStation.streamUrl} logo={radioStation.logo} frequency={radioStation.frequency} onClose={() => setRadioStation(null)} />}
      <BottomNav active={tab} onTabChange={changeTab} notificationCount={notifs.unreadCount} />
    </div>
  );
};

export default Index;
