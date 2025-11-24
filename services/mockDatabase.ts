import { Page, BlockType, Platform, SourceProvider, MediaItem, GlobalConfig } from '../types';

// --- IN-MEMORY DATA STORE ---

const MOCK_PAGES: Page[] = [
  { id: 'home', slug: 'home', title: 'Home', blocks: [] },
  { id: 'movies', slug: 'movies', title: 'Movies', blocks: [] },
  { id: 'series', slug: 'series', title: 'TV Series', blocks: [] },
  { id: 'settings', slug: 'settings', title: 'Settings', blocks: [] }
];

const MOCK_BLOCKS: any[] = [
  // HOME PAGE BLOCKS
  {
    id: 'b1', page_id: 'home', type: BlockType.HERO, title: 'Featured', playlistId: 'pl_featured',
    layoutOptions: { autoplay: true, aspectRatio: '16:9' },
    visibility: { platforms: [Platform.TV, Platform.WEB], requiresAuth: false },
    display_order: 1
  },
  {
    id: 'b2', page_id: 'home', type: BlockType.RAIL_PORTRAIT, title: 'Trending Now', playlistId: 'pl_trending',
    layoutOptions: { aspectRatio: '2:3', itemHeight: 350 },
    visibility: { platforms: [Platform.TV, Platform.WEB], requiresAuth: false },
    display_order: 2
  },
  {
    id: 'b3', page_id: 'home', type: BlockType.RAIL_LANDSCAPE, title: 'New Releases', playlistId: 'pl_new',
    layoutOptions: { aspectRatio: '16:9', itemHeight: 200 },
    visibility: { platforms: [Platform.TV], requiresAuth: false },
    display_order: 3
  },
  {
    id: 'b4', page_id: 'home', type: BlockType.CONTINUE_WATCHING, title: 'Continue Watching', playlistId: 'pl_cw',
    layoutOptions: { aspectRatio: '16:9', itemHeight: 200 },
    visibility: { platforms: [Platform.TV], requiresAuth: true },
    display_order: 4
  },
  // MOVIES PAGE BLOCKS
  {
    id: 'b5', page_id: 'movies', type: BlockType.HERO, title: 'Movie Spotlight', playlistId: 'pl_movies_hero',
    layoutOptions: { autoplay: false, aspectRatio: '16:9' },
    visibility: { platforms: [Platform.TV], requiresAuth: false },
    display_order: 1
  },
  {
    id: 'b6', page_id: 'movies', type: BlockType.GRID, title: 'Action Movies', playlistId: 'pl_action',
    layoutOptions: { aspectRatio: '2:3', itemHeight: 300 },
    visibility: { platforms: [Platform.TV], requiresAuth: false },
    display_order: 2
  },
  // SERIES PAGE BLOCKS
  {
    id: 'b7', page_id: 'series', type: BlockType.RAIL_LANDSCAPE, title: 'Popular Series', playlistId: 'pl_series_pop',
    layoutOptions: { aspectRatio: '16:9', itemHeight: 250 },
    visibility: { platforms: [Platform.TV], requiresAuth: false },
    display_order: 1
  },
  // SETTINGS PAGE BLOCKS
  {
    id: 'b8', page_id: 'settings', type: BlockType.GRID, title: 'Manage Profiles', playlistId: 'pl_cw',
    layoutOptions: { aspectRatio: '1:1', itemHeight: 250 },
    visibility: { platforms: [Platform.TV], requiresAuth: true },
    display_order: 1
  }
];

// Default Stream: Big Buck Bunny HLS
const DEFAULT_STREAM = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

let MOCK_MEDIA_ITEMS: MediaItem[] = [
  { id: 'm1', providerId: 'jw_1', provider: SourceProvider.JWPLAYER, title: 'Cyberpunk Horizons', description: 'Neon lights and rain.', duration: 5400, poster: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?q=80&w=1080', backdrop: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?q=80&w=1920', videoUrl: DEFAULT_STREAM, tags: ['Sci-Fi'] },
  { id: 'm2', providerId: 'jw_2', provider: SourceProvider.JWPLAYER, title: 'Nature Fury', description: 'Volcanoes and power.', duration: 3200, poster: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1080', backdrop: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1920', videoUrl: DEFAULT_STREAM, tags: ['Nature'] },
  { id: 'm3', providerId: 'jw_3', provider: SourceProvider.JWPLAYER, title: 'Urban Explorer', description: 'Parkour in Paris.', duration: 1800, poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=1080', backdrop: 'https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=1920', videoUrl: DEFAULT_STREAM, tags: ['Action'] },
  { id: 'm4', providerId: 'jw_4', provider: SourceProvider.JWPLAYER, title: 'Deep Blue', description: 'Mariana Trench.', duration: 4200, poster: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?q=80&w=1080', backdrop: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?q=80&w=1920', videoUrl: DEFAULT_STREAM, tags: ['Doc'] },
  { id: 'm5', providerId: 'jw_5', provider: SourceProvider.JWPLAYER, title: 'Speed Racer', description: 'F1 racing.', duration: 7200, poster: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1080', backdrop: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1920', videoUrl: DEFAULT_STREAM, tags: ['Sports'] },
  { id: 'm6', providerId: 'jw_6', provider: SourceProvider.JWPLAYER, title: 'Cosmic Journey', description: 'Stars await.', duration: 9000, poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1080', backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920', videoUrl: DEFAULT_STREAM, tags: ['Sci-Fi'] },
];

// Playlist ID -> Array of Media IDs
const MOCK_PLAYLIST_CONTENT: Record<string, string[]> = {
  'pl_featured': ['m1', 'm2', 'm3'],
  'pl_trending': ['m4', 'm5', 'm6', 'm1', 'm2'],
  'pl_new': ['m3', 'm6', 'm2'],
  'pl_cw': ['m1', 'm2'],
  'pl_movies_hero': ['m5'],
  'pl_action': ['m3', 'm5', 'm1'],
  'pl_series_pop': ['m2', 'm4', 'm6']
};

// --- Repository Layer ---

export const getAllPages = (): Page[] => {
  return MOCK_PAGES;
};

export const fetchPage = (slug: string): Page | undefined => {
  console.log(`[Repo] Fetching page: ${slug}`);
  
  const page = MOCK_PAGES.find(p => p.slug === slug);
  
  if (!page) {
    console.error(`[Repo] Page '${slug}' not found in MOCK_PAGES.`);
    return undefined;
  }

  const pageBlocks = MOCK_BLOCKS.filter(b => b.page_id === page.id).sort((a, b) => a.display_order - b.display_order);
  
  // Return constructed page object
  return {
    ...page,
    blocks: pageBlocks.map(b => ({
        id: b.id,
        type: b.type,
        title: b.title,
        playlistId: b.playlistId,
        layoutOptions: b.layoutOptions,
        visibility: b.visibility
    }))
  };
};

export const updateBlockTitle = (blockId: string, newTitle: string) => {
  const block = MOCK_BLOCKS.find(b => b.id === blockId);
  if (block) {
    block.title = newTitle;
    console.log(`[Repo] Updated block ${blockId} title to "${newTitle}"`);
  }
};

export const getLibrary = (): MediaItem[] => {
  return MOCK_MEDIA_ITEMS;
};

export const addMediaToBlock = (blockId: string, mediaId: string) => {
  const block = MOCK_BLOCKS.find(b => b.id === blockId);
  if (!block || !block.playlistId) return;
  
  if (!MOCK_PLAYLIST_CONTENT[block.playlistId]) {
    MOCK_PLAYLIST_CONTENT[block.playlistId] = [];
  }
  
  // Avoid duplicates
  if (!MOCK_PLAYLIST_CONTENT[block.playlistId].includes(mediaId)) {
    MOCK_PLAYLIST_CONTENT[block.playlistId].push(mediaId);
    console.log(`[Repo] Added media ${mediaId} to block ${blockId}`);
  }
};

export const removeMediaFromBlock = (blockId: string, mediaId: string) => {
  const block = MOCK_BLOCKS.find(b => b.id === blockId);
  if (!block || !block.playlistId || !MOCK_PLAYLIST_CONTENT[block.playlistId]) return;

  MOCK_PLAYLIST_CONTENT[block.playlistId] = MOCK_PLAYLIST_CONTENT[block.playlistId].filter(id => id !== mediaId);
  console.log(`[Repo] Removed media ${mediaId} from block ${blockId}`);
};

export const fetchConfig = (): GlobalConfig => {
  return {
    theme: {
      primaryColor: '#e50914',
      focusColor: '#ffffff',
      backgroundColor: '#141414',
      fontFamily: 'Inter-Regular',
      radius: 8
    },
    navigation: [
      { id: 'n1', label: 'Home', action: 'PAGE', target: 'home' },
      { id: 'n2', label: 'Movies', action: 'PAGE', target: 'movies' },
      { id: 'n3', label: 'Series', action: 'PAGE', target: 'series' },
      { id: 'n4', label: 'Settings', action: 'MODAL', target: 'settings' }
    ],
    featureFlags: {
      'enable_4k': true,
      'new_player_ui': false
    }
  };
};

export const fetchPlaylistItems = (playlistId: string): MediaItem[] => {
  const ids = MOCK_PLAYLIST_CONTENT[playlistId] || [];
  // Resolve IDs to objects
  const items = ids.map(id => MOCK_MEDIA_ITEMS.find(m => m.id === id)).filter(Boolean) as MediaItem[];
  return items;
};

// --- DATA INGESTION ---

export const importJwPlaylist = async (url: string): Promise<number> => {
  console.log(`[Importer] Fetching from JW: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    
    const data = await response.json();
    const playlist = data.playlist;

    if (!Array.isArray(playlist)) throw new Error("Invalid JW Playlist Format");

    const newItems = playlist.map((item: any) => {
      // Try to find HLS stream specifically
      const hlsSource = item.sources?.find((s: any) => s.type === 'application/vnd.apple.mpegurl' || s.file.endsWith('.m3u8'));
      const mp4Source = item.sources?.find((s: any) => s.type === 'video/mp4');
      // Fallback to standard JW manifest url pattern if sources are empty/missing
      const fallbackUrl = `https://cdn.jwplayer.com/manifests/${item.mediaid}.m3u8`;
      const videoUrl = hlsSource?.file || mp4Source?.file || item.sources?.[0]?.file || fallbackUrl;

      return {
        id: item.mediaid,
        providerId: item.mediaid,
        provider: SourceProvider.JWPLAYER,
        title: item.title,
        description: item.description || '',
        duration: item.duration || 0,
        poster: item.image,
        backdrop: item.image,
        videoUrl: videoUrl, // Prioritize HLS
        tags: item.tags ? (typeof item.tags === 'string' ? item.tags.split(',') : item.tags) : []
      };
    });

    let count = 0;
    for (const item of newItems) {
        // Check existence
        if (!MOCK_MEDIA_ITEMS.find(m => m.id === item.id)) {
            MOCK_MEDIA_ITEMS.push(item);
            count++;
        }
    }
    
    console.log(`[Importer] Successfully imported ${count} items into memory.`);
    return count;
  } catch (error) {
    console.error("[Importer] Failed:", error);
    throw error;
  }
};