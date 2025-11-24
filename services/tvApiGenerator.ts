import { Page, TvUiConfig, TvSection, BlockType, TvMediaItem, Platform } from '../types';
import { fetchConfig, fetchPlaylistItems, fetchPage } from './mockDatabase';

/**
 * THE ENGINE:
 * This service represents the Backend API Logic (/api/ui-config).
 * It fetches data, merges it, applies platform rules, and calculates layout coordinates
 * so the low-power TV device doesn't have to.
 */

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// Fallback stream if DB is missing it (Big Buck Bunny)
const DEFAULT_FALLBACK_STREAM = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

// Normalize raw media into lightweight TV items
const normalizeMediaItem = (item: any, blockType: BlockType): TvMediaItem => {
  // Decide which image to use based on block type
  const isPortrait = blockType === BlockType.RAIL_PORTRAIT || blockType === BlockType.GRID;
  
  return {
    id: item.id,
    title: item.title,
    image: isPortrait ? item.poster : item.backdrop,
    actionUrl: `/player/${item.id}`,
    streamUrl: item.videoUrl || DEFAULT_FALLBACK_STREAM, // Ensure we always have a stream
    metadata: {
      durationStr: formatDuration(item.duration),
      year: '2023', // mocked
      badges: item.tags ? item.tags.slice(0, 2) : []
    }
  };
};

const calculateLayout = (type: BlockType, options: any) => {
  // Pre-calculated LightningJS dimensions (assuming 1080p canvas)
  switch (type) {
    case BlockType.HERO:
      return { itemWidth: 1920, itemHeight: 600, gap: 0, titleY: 50, rowY: 100 };
    case BlockType.RAIL_PORTRAIT:
      return { itemWidth: 250, itemHeight: 375, gap: 40, titleY: 0, rowY: 60 };
    case BlockType.RAIL_LANDSCAPE:
      return { itemWidth: 400, itemHeight: 225, gap: 40, titleY: 0, rowY: 60 };
    default:
      return { itemWidth: 300, itemHeight: 300, gap: 40, titleY: 0, rowY: 60 };
  }
};

export const generateTvConfig = (pageSlug: string): TvUiConfig => {
  try {
    const globalConfig = fetchConfig();
    const page = fetchPage(pageSlug);

    if (!page) {
      console.error(`[TvApi] Page '${pageSlug}' not found in database.`);
      throw new Error(`Page '${pageSlug}' not found. Please ensure database is seeded.`);
    }

    // Transform Blocks to TV Sections
    const sections: TvSection[] = page.blocks
      .filter(block => block.visibility.platforms.includes(Platform.TV))
      .map(block => {
        const rawItems = block.playlistId ? fetchPlaylistItems(block.playlistId) : [];
        const normalizedItems = rawItems.map((item: any) => normalizeMediaItem(item, block.type));

        return {
          id: block.id,
          type: block.type,
          title: block.title,
          layout: calculateLayout(block.type, block.layoutOptions),
          items: normalizedItems
        };
      });

    return {
      meta: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        platform: 'TV'
      },
      theme: globalConfig.theme,
      navigation: globalConfig.navigation,
      page: {
        id: page.id,
        title: page.title,
        sections
      }
    };
  } catch (error) {
    console.error("[TvApi] Generation Error:", error);
    throw error;
  }
};