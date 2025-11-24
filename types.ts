// --- 1. CMS Database Schema Models ---

export enum Platform {
  TV = 'TV',
  WEB = 'WEB',
  MOBILE = 'MOBILE'
}

export enum BlockType {
  HERO = 'HERO',
  RAIL_LANDSCAPE = 'RAIL_LANDSCAPE',
  RAIL_PORTRAIT = 'RAIL_PORTRAIT',
  GRID = 'GRID',
  CONTINUE_WATCHING = 'CONTINUE_WATCHING',
  LIVE_STRIP = 'LIVE_STRIP'
}

export enum SourceProvider {
  JWPLAYER = 'JWPLAYER',
  CLOUDFLARE = 'CLOUDFLARE',
  CUSTOM = 'CUSTOM'
}

export interface MediaItem {
  id: string;
  providerId: string; // The external ID (mediaid)
  provider: SourceProvider;
  title: string;
  description: string;
  duration: number;
  poster: string;
  backdrop: string;
  videoUrl: string; // HLS or Dash
  tags: string[];
}

export interface PlaylistBinding {
  id: string;
  providerPlaylistId: string; // e.g. JW Player Playlist ID
  provider: SourceProvider;
  titleOverride?: string;
  limit?: number;
}

export interface PageBlock {
  id: string;
  type: BlockType;
  title: string;
  playlistId?: string; // Links to PlaylistBinding
  layoutOptions: {
    aspectRatio?: '16:9' | '2:3' | '1:1';
    itemHeight?: number;
    autoplay?: boolean;
    lazyLoad?: boolean;
  };
  visibility: {
    platforms: Platform[];
    requiresAuth: boolean;
  };
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  blocks: PageBlock[];
}

export interface NavigationItem {
  id: string;
  label: string;
  action: 'PAGE' | 'LINK' | 'MODAL';
  target: string; // Page ID or URL
}

export interface GlobalConfig {
  theme: {
    primaryColor: string;
    focusColor: string;
    backgroundColor: string;
    fontFamily: string;
    radius: number;
  };
  navigation: NavigationItem[];
  featureFlags: Record<string, boolean>;
}

// --- 2. TV Client JSON Response Models (LightningJS Optimized) ---

export interface LightningNode {
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  src?: string;
  text?: string;
  color?: string;
  alpha?: number;
}

// The normalized item the TV client receives
export interface TvMediaItem {
  id: string;
  title: string;
  image: string; // Pre-resolved optimal size
  actionUrl: string;
  streamUrl: string; // Playback URL (HLS)
  metadata: {
    durationStr: string;
    year: string;
    badges: string[];
  };
}

export interface TvSection {
  id: string;
  type: BlockType;
  title: string;
  layout: {
    itemWidth: number;
    itemHeight: number;
    gap: number;
    titleY: number;
    rowY: number;
  };
  items: TvMediaItem[];
}

export interface TvUiConfig {
  meta: {
    generatedAt: string;
    version: string;
    platform: 'TV';
  };
  theme: GlobalConfig['theme'];
  navigation: NavigationItem[];
  page: {
    id: string;
    title: string;
    sections: TvSection[];
  };
}