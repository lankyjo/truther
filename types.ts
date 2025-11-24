export type AppState = 'IDLE' | 'LOADING' | 'RESULT';

export type VerificationStatus = 'VERIFIED_REAL' | 'LIKELY_REAL' | 'UNCERTAIN' | 'LIKELY_FAKE' | 'CONFIRMED_FAKE';

export type SourceCategory = 'OFFICIAL' | 'NEWS' | 'OPINION' | 'SATIRE' | 'SOCIAL' | 'UNCATEGORIZED';

export interface AnalysisResult {
  status: VerificationStatus;
  score: number; // 0 to 100
  title: string;
  simpleSummary: string;
  detailedAnalysis: string;
  contentDate: string; // "YYYY-MM-DD" or "Unknown"
  isBreakingNews: boolean;
  isAiGenerated: boolean;
  sources: Array<{
    title: string;
    url: string;
    category: SourceCategory;
  }>;
}

export interface FactStat {
  id: number;
  icon: string;
  stat: string;
  description: string;
}