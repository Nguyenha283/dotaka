export interface GenerationResult {
  id: string;
  url: string;
  timestamp: number;
  originalUrl: string;
  moldingUrls: string[];
  options: {
    model: string;
    resolution: string;
    nsfwChecker: boolean;
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
