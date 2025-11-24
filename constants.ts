import { FactStat, VerificationStatus } from './types';

export const LOADING_STATS: FactStat[] = [
  {
    id: 1,
    icon: "📻",
    stat: "1938 War of the Worlds",
    description: "Orson Welles' radio drama caused mass panic when listeners believed Martians were actually invading New Jersey."
  },
  {
    id: 2,
    icon: "🔭",
    stat: "The Great Moon Hoax",
    description: "In 1835, The New York Sun published articles claiming astronomers found bat-people on the moon. It took weeks to debunk."
  },
  {
    id: 3,
    icon: "📉",
    stat: "60% of people",
    description: "share news articles on social media without actually reading past the headline."
  },
  {
    id: 4,
    icon: "🤖",
    stat: "Deepfake Rise",
    description: "There has been a 90% increase in AI-generated deepfakes detected online in the last year alone."
  },
  {
    id: 5,
    icon: "⚔️",
    stat: "Operation Infektion",
    description: "A Soviet disinformation campaign in the 1980s successfully spread the rumor that the US invented HIV/AIDS."
  },
  {
    id: 6,
    icon: "🧠",
    stat: "Illusory Truth Effect",
    description: "Psychology shows that if you hear a lie often enough, you start to believe it is true, even if you know better."
  }
];

export const STATUS_CONFIG: Record<VerificationStatus, { color: string; label: string; icon: string; borderColor: string, bgColor: string }> = {
  'VERIFIED_REAL': {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-600',
    label: 'Verified Real',
    icon: '✅'
  },
  'LIKELY_REAL': {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-600',
    label: 'Likely Real',
    icon: '👍'
  },
  'UNCERTAIN': {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    label: 'Uncertain / No Consensus',
    icon: '⚠️'
  },
  'LIKELY_FAKE': {
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-600',
    label: 'Likely Fake / Misleading',
    icon: '✋'
  },
  'CONFIRMED_FAKE': {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-600',
    label: 'Fake / AI Generated',
    icon: '🚫'
  }
};