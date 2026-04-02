import { GenerationResult } from './types';

export const MOCK_RECENT_RESULTS: GenerationResult[] = [
  {
    id: 'mock-1',
    url: 'https://picsum.photos/seed/molding1/800/600',
    originalUrl: 'https://picsum.photos/seed/room1/800/600',
    moldingUrls: ['https://picsum.photos/seed/mold1/200/200'],
    timestamp: Date.now() - 3600000,
    options: { model: 'flux-2/pro-image-to-image', resolution: '1K', nsfwChecker: false, aspectRatio: '16:9' }
  },
  {
    id: 'mock-2',
    url: 'https://picsum.photos/seed/molding2/800/600',
    originalUrl: 'https://picsum.photos/seed/room2/800/600',
    moldingUrls: ['https://picsum.photos/seed/mold2/200/200'],
    timestamp: Date.now() - 7200000,
    options: { model: 'flux-2/flex-image-to-image', resolution: '1K', nsfwChecker: false, aspectRatio: '16:9' }
  }
];
