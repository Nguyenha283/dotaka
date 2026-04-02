export interface GenerationResult {
  id: string;
  url: string;
  timestamp: number;
  originalUrl: string;
  moldingUrls: string[];
  options: {
    style: string;
    intensity: string;
    angle: string;
    aspectRatio: string;
  };
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}
