import { GenerationResult } from './types';

export const MOCK_RECENT_RESULTS: GenerationResult[] = [
  {
    id: 'mock-1',
    url: 'https://picsum.photos/seed/molding1/800/600',
    originalUrl: 'https://picsum.photos/seed/room1/800/600',
    moldingUrls: ['https://picsum.photos/seed/mold1/200/200'],
    timestamp: Date.now() - 3600000,
    options: { style: 'Sang trọng', intensity: 'Rõ nét', angle: 'Toàn cảnh', aspectRatio: '16:9' }
  },
  {
    id: 'mock-2',
    url: 'https://picsum.photos/seed/molding2/800/600',
    originalUrl: 'https://picsum.photos/seed/room2/800/600',
    moldingUrls: ['https://picsum.photos/seed/mold2/200/200'],
    timestamp: Date.now() - 7200000,
    options: { style: 'Tối giản', intensity: 'Nhẹ', angle: 'Trung cảnh', aspectRatio: '16:9' }
  }
];
