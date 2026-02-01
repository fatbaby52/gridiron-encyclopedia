export const SITE_NAME = 'Gridiron Encyclopedia'
export const SITE_DESCRIPTION =
  'The comprehensive American football knowledge base. Learn plays, formations, strategies, and coaching concepts from high school to the NFL.'

export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Offense', href: '/offense' },
  { label: 'Defense', href: '/defense' },
  { label: 'Special Teams', href: '/special-teams' },
  { label: 'Fundamentals', href: '/fundamentals' },
  { label: 'Strategy', href: '/strategy' },
  { label: 'History', href: '/history' },
  { label: 'Training', href: '/training' },
  { label: 'Reference', href: '/reference' },
  { label: 'Community', href: '/community' },
] as const

export const FORUM_CATEGORIES = [
  { key: 'general', label: 'General Discussion' },
  { key: 'offense', label: 'Offense' },
  { key: 'defense', label: 'Defense' },
  { key: 'special-teams', label: 'Special Teams' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'coaching', label: 'Coaching' },
  { key: 'film-study', label: 'Film Study' },
] as const

export const CATEGORIES = {
  fundamentals: {
    label: 'Fundamentals',
    description: 'Basic rules, positions, and concepts of American football',
    icon: '📋',
    color: 'grass',
  },
  offense: {
    label: 'Offense',
    description: 'Formations, run schemes, pass concepts, and offensive systems',
    icon: '🏈',
    color: 'gold',
  },
  defense: {
    label: 'Defense',
    description: 'Fronts, coverages, pressures, and defensive philosophies',
    icon: '🛡️',
    color: 'leather',
  },
  'special-teams': {
    label: 'Special Teams',
    description: 'Kickoff, punt, field goal, and return units',
    icon: '⚡',
    color: 'grass-light',
  },
  strategy: {
    label: 'Strategy',
    description: 'Game management, situational football, and advanced concepts',
    icon: '🧠',
    color: 'grass-dark',
  },
  history: {
    label: 'History',
    description: 'Evolution of the game, coaching trees, and historical innovations',
    icon: '📜',
    color: 'leather-light',
  },
  training: {
    label: 'Training',
    description: 'Position-specific workouts, athletic development, combine prep, and equipment reviews',
    icon: '🏋️',
    color: 'grass',
  },
  reference: {
    label: 'Reference',
    description: 'Glossary, rules reference, and quick-lookup resources',
    icon: '📖',
    color: 'gold-light',
  },
} as const

export type CategoryKey = keyof typeof CATEGORIES

export const LEVEL_LABELS: Record<string, string> = {
  hs: 'High School',
  college: 'College',
  nfl: 'NFL',
}

export const LEVEL_COLORS: Record<string, string> = {
  hs: 'bg-blue-100 text-blue-800',
  college: 'bg-orange-100 text-orange-800',
  nfl: 'bg-red-100 text-red-800',
}

export const CHAT_LIMITS = {
  anonymous: 10,
  registered: 50,
} as const
