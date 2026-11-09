import vocFmLogo from '@/assets/logos/voc-fm.png';
import eswatiniTvLogo from '@/assets/logos/eswatini-tv.jpeg';
import ebisLogo from '@/assets/logos/ebis.webp';
import channelYemaSwatiLogo from '@/assets/logos/channel-yemaswati.webp';
import uneswaFmLogo from '@/assets/logos/uneswa-fm.webp';
import timesLogo from '@/assets/logos/times-of-eswatini.webp';
import swazilandNewsLogo from '@/assets/logos/swaziland-news.webp';
import beyondBooksLogo from '@/assets/logos/beyond-books.jpg';
import teaPodcastLogo from '@/assets/logos/tea-podcast.jpg';
import pinkTableLogo from '@/assets/logos/pink-table.jpg';
import siphilaKanjaniLogo from '@/assets/logos/siphila-kanjani.jpg';
import jtmPodcastLogo from '@/assets/logos/jtm-podcast.jpg';
import baneleWjlmLogo from '@/assets/logos/banele-wjlm.jpg';
import epnCover from '@/assets/logos/epn-logo.png';
import ednCover from '@/assets/logos/edn-cover.jpg';
import ineCover from '@/assets/logos/independent-news-logo.jpeg';
import inhlaseCover from '@/assets/logos/inhlase-logo.png';
import etCover from '@/assets/logos/et-cover.jpg';
import nszCover from '@/assets/logos/nsz-cover.jpg';
import swaziNewsweekCover from '@/assets/logos/swazi-newsweek.jpg';
import nationMagazineCover from '@/assets/logos/nation-magazine.jpg';
import africaUncensoredCover from '@/assets/logos/africa-uncensored.jpg';
import agribusinessLogo from '@/assets/logos/agribusiness-media.jpeg';
import climateEnvLogo from '@/assets/logos/climate-env-news.jpg';
import tertiaryHubLogo from '@/assets/logos/tertiary-hub.jpg';
import itvLogo from '@/assets/logos/itv-logo.jpg';
import breakingNewsSlide from '@/assets/slides/breaking-news.jpg';
import sportsSlide from '@/assets/slides/sports.jpg';
import cultureSlide from '@/assets/slides/culture.jpg';
import entertainmentSlide from '@/assets/slides/entertainment.jpg';
import eswatiniLandscapeSlide from '@/assets/slides/eswatini-landscape.jpg';

export interface MediaItem {
  id: string;
  name: string;
  category: 'tv' | 'radio' | 'newspaper' | 'online' | 'magazine' | 'investigative';
  streamUrl?: string;
  websiteUrl?: string;
  isLive?: boolean;
  logo?: string;
  frequency?: string;
}

export const mediaData: MediaItem[] = [
  // TV
  {
    id: 'etv',
    name: 'Eswatini TV',
    category: 'tv',
    streamUrl: 'https://www.youtube.com/@eswatini_tv',
    isLive: true,
    logo: eswatiniTvLogo,
  },
  {
    id: 'cys',
    name: 'Channel YemaSwati',
    category: 'tv',
    streamUrl: 'https://www.youtube.com/@channelyemaswati',
    isLive: false,
    logo: channelYemaSwatiLogo,
  },
  {
    id: 'itv',
    name: 'ITV — Online Television',
    category: 'tv',
    streamUrl: 'https://itvszl.vercel.app',
    isLive: true,
    logo: itvLogo,
  },
  // Radio
  {
    id: 'ebis-sw',
    name: 'EBIS Siswati',
    category: 'radio',
    streamUrl: '#',
    isLive: true,
    logo: ebisLogo,
    frequency: 'FM 88.5 MHz',
  },
  {
    id: 'ebis-en',
    name: 'EBIS English',
    category: 'radio',
    streamUrl: '#',
    isLive: true,
    logo: ebisLogo,
    frequency: 'FM 97.6 MHz',
  },
  {
    id: 'uneswa-fm',
    name: 'UNESWA FM 88.2',
    category: 'radio',
    streamUrl: 'https://jmc.uneswa.ac.sz/public/uneswa_fm_88.2',
    isLive: true,
    logo: uneswaFmLogo,
    frequency: 'FM 88.2 MHz',
  },
  {
    id: 'voc-fm',
    name: 'VOC FM',
    category: 'radio',
    streamUrl: 'https://zeno.fm/radio/voice-of-the-church-fm-vocfm/',
    isLive: true,
    logo: vocFmLogo,
    frequency: 'FM 99.1 MHz',
  },
  // Newspapers
  {
    id: 'eo',
    name: 'Eswatini Observer',
    category: 'newspaper',
    websiteUrl: 'https://eswatiniobserver.com/',
    logo: 'https://eswatiniobserver.com/wp-content/uploads/2025/11/DAILY-NEW-LOGO-Reliable-Read-copy.jpg',
  },
  {
    id: 'tos',
    name: 'Times of Eswatini',
    category: 'newspaper',
    websiteUrl: 'https://www.times.co.sz/',
    logo: timesLogo,
  },
  {
    id: 'sn',
    name: 'Swaziland News',
    category: 'newspaper',
    websiteUrl: 'https://www.swazilandnews.co.za',
    logo: swazilandNewsLogo,
  },
  // Online Media Platforms
  {
    id: 'epn',
    name: 'Eswatini Positive News',
    category: 'online',
    websiteUrl: 'https://eswatinipositivenews.online/',
    logo: epnCover,
  },
  {
    id: 'edn',
    name: 'Eswatini Daily News',
    category: 'online',
    websiteUrl: 'https://swazidailynews.com/',
    logo: ednCover,
  },
  {
    id: 'ine',
    name: 'Independent News',
    category: 'online',
    websiteUrl: 'https://independentnews.co.sz/',
    logo: ineCover,
  },
  {
    id: 'et',
    name: 'The Eswatini Times',
    category: 'online',
    websiteUrl: 'https://eswatinitimes.com/',
    logo: etCover,
  },
  {
    id: 'nsz',
    name: 'News Eswatini',
    category: 'online',
    websiteUrl: 'https://newsswaziland.com/',
    logo: nszCover,
  },
  {
    id: 'agribusiness',
    name: 'AgriBusiness Media',
    category: 'online',
    websiteUrl: 'https://agribusinessmedia.com/',
    logo: agribusinessLogo,
  },
  {
    id: 'cenn',
    name: 'Climate & Environment News Network',
    category: 'online',
    websiteUrl: 'https://www.cenewsnetwork.org/',
    logo: climateEnvLogo,
  },
  {
    id: 'tertiary-hub',
    name: 'Tertiary Hub',
    category: 'online',
    websiteUrl: 'https://www.facebook.com/chestersd101',
    logo: tertiaryHubLogo,
  },
  // Magazines
  {
    id: 'swazi-newsweek',
    name: 'Swazi Newsweek',
    category: 'magazine',
    websiteUrl: 'https://swazinewsweek.com/',
    logo: swaziNewsweekCover,
  },
  {
    id: 'nation-magazine',
    name: 'The Nation Magazine',
    category: 'magazine',
    websiteUrl: 'https://thenationmagazine.co.sz/',
    logo: nationMagazineCover,
  },
  // Investigative News
  {
    id: 'inhlase',
    name: 'Inhlase Centre for Investigative Journalism',
    category: 'investigative',
    websiteUrl: 'https://inhlase.com/',
    logo: inhlaseCover,
  },
  {
    id: 'africa-uncensored',
    name: 'Africa Uncensored',
    category: 'investigative',
    websiteUrl: 'https://africauncensored.online/',
    logo: africaUncensoredCover,
  },
  {
    id: 'sn-investigative',
    name: 'Swaziland News Investigative',
    category: 'investigative',
    websiteUrl: 'https://www.swazilandnews.co.za/category/investigative/',
    logo: swazilandNewsLogo,
  },
  {
    id: 'ine-investigative',
    name: 'Independent Investigative',
    category: 'investigative',
    websiteUrl: 'https://independentnews.co.sz/',
    logo: ineCover,
  },
];

// Podcast data
export interface PodcastItem {
  id: string;
  name: string;
  host: string;
  description: string;
  thumbnail: string;
  youtubeChannelUrl: string;
  youtubeSearchQuery: string;
}

export const podcastData: PodcastItem[] = [
  {
    id: 'tea-podcast',
    name: 'TEA Podcast',
    host: "Bab'Dlamini",
    description: 'Talk Entertainment & Art — the unapologetic voice of Eswatini\'s culture, music, and street-level conversations.',
    thumbnail: teaPodcastLogo,
    youtubeChannelUrl: 'https://www.youtube.com/@TEAPodcastEswatini',
    youtubeSearchQuery: 'TEA Podcast Eswatini Bab Dlamini',
  },
  {
    id: 'pink-table',
    name: 'The Pink Table',
    host: 'Zinzi Twala',
    description: 'Femininity, empowerment, and conversations that matter — Eswatini\'s leading women-focused podcast.',
    thumbnail: pinkTableLogo,
    youtubeChannelUrl: 'https://www.youtube.com/@ThePinkTableSZ',
    youtubeSearchQuery: 'The Pink Table Eswatini podcast Zinzi Twala',
  },
  {
    id: 'cys-podcast',
    name: 'CYS Podcast',
    host: 'Channel YemaSwati',
    description: 'Deep-dive interviews and cultural stories from the heart of Eswatini with Channel YemaSwati.',
    thumbnail: channelYemaSwatiLogo,
    youtubeChannelUrl: 'https://www.youtube.com/@channelyemaswati',
    youtubeSearchQuery: 'Channel YemaSwati podcast interview',
  },
  {
    id: 'siswati-podcast',
    name: 'Siphila Kanjani',
    host: 'Various Hosts',
    description: 'Conversations about life, wellness, and modern Swazi living — tackling real issues in SiSwati.',
    thumbnail: siphilaKanjaniLogo,
    youtubeChannelUrl: 'https://www.youtube.com/results?search_query=Siphila+Kanjani+Eswatini+podcast',
    youtubeSearchQuery: 'Siphila Kanjani Eswatini podcast',
  },
  {
    id: 'beyond-books',
    name: 'Beyond the Books',
    host: 'Beyond the Books Podcast',
    description: 'Eswatini\'s podcast exploring life beyond academics — real stories, insights, and conversations that matter.',
    thumbnail: beyondBooksLogo,
    youtubeChannelUrl: 'https://www.youtube.com/@beyondthebookspodcast_esw',
    youtubeSearchQuery: 'Beyond the Books Podcast Eswatini',
  },
  {
    id: 'jtm-podcast',
    name: 'JTM Podcast',
    host: 'JTM',
    description: 'Eswatini\'s JTM Podcast — candid conversations on culture, business, and the people shaping the kingdom.',
    thumbnail: jtmPodcastLogo,
    youtubeChannelUrl: 'https://www.youtube.com/@jtmpodcast',
    youtubeSearchQuery: 'JTM Podcast Eswatini',
  },
  {
    id: 'banele-wjlm',
    name: 'Banele WJLM',
    host: 'Banele',
    description: 'WJLM Podcast — bold, unfiltered conversations on Eswatini culture, lifestyle and the stories that move the nation.',
    thumbnail: baneleWjlmLogo,
    youtubeChannelUrl: 'https://www.youtube.com/@banelewjlm',
    youtubeSearchQuery: 'Banele WJLM Podcast Eswatini',
  },
];

// Fallback slideshow images
export const newsSlides = [
  {
    id: 1,
    title: 'BREAKING NEWS',
    subtitle: 'Stay updated with the latest from Eswatini',
    image: breakingNewsSlide,
    url: 'https://eswatiniobserver.com/',
  },
  {
    id: 2,
    title: 'SPORTS',
    subtitle: 'Eswatini football and athletics highlights',
    image: sportsSlide,
    url: 'https://www.times.co.sz/',
  },
  {
    id: 3,
    title: 'CULTURE',
    subtitle: 'Traditional ceremonies and celebrations',
    image: cultureSlide,
    url: 'https://www.youtube.com/@EswatiniTV',
  },
  {
    id: 4,
    title: 'ENTERTAINMENT',
    subtitle: 'Music, festivals and nightlife in Eswatini',
    image: entertainmentSlide,
    url: 'https://www.youtube.com/@channelyemaswati',
  },
  {
    id: 5,
    title: 'ESWATINI',
    subtitle: 'Discover the beauty of the Kingdom',
    image: eswatiniLandscapeSlide,
    url: 'https://eswatiniobserver.com/',
  },
];
