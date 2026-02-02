export type ResourceCategory = 'playbooks' | 'workouts'

export interface DownloadableResource {
  id: string
  title: string
  description: string
  category: ResourceCategory
  filename: string
  pageCount: number
  tags: string[]
  icon: string
}

export const RESOURCE_CATEGORIES: Record<
  ResourceCategory,
  { label: string; description: string; icon: string }
> = {
  playbooks: {
    label: 'Playbooks',
    description:
      'Complete scheme playbooks with formations, play diagrams, and coaching notes.',
    icon: '📋',
  },
  workouts: {
    label: 'Workout Templates',
    description:
      'Printable training logs with tracking boxes for sets, reps, and weights.',
    icon: '🏋️',
  },
}

export const RESOURCES: DownloadableResource[] = [
  {
    id: 'spread-offense',
    title: 'HS Spread Offense Playbook',
    description:
      'A complete spread offense installation for high school programs. Covers core passing concepts (mesh, spacing, four verticals), RPO tags, screen game, and the run game out of 10/11 personnel shotgun and pistol formations.',
    category: 'playbooks',
    filename: 'hs-spread-offense-playbook.pdf',
    pageCount: 28,
    tags: ['offense', 'spread', 'passing', 'RPO'],
    icon: '🏈',
  },
  {
    id: 'wing-t-offense',
    title: 'HS Wing-T Offense Playbook',
    description:
      'The classic Wing-T system adapted for modern high school football. Includes buck sweep, trap, counter, waggle pass action, and jet sweep series with formation diagrams and blocking assignments.',
    category: 'playbooks',
    filename: 'hs-wing-t-offense-playbook.pdf',
    pageCount: 26,
    tags: ['offense', 'wing-t', 'run-game', 'misdirection'],
    icon: '🏈',
  },
  {
    id: '4-3-defense',
    title: 'HS 4-3 Defense Playbook',
    description:
      'A base 4-3 defensive package for high school programs. Covers over/under front alignments, base Cover 3 and Cover 1 shells, run fits, gap integrity, and a core blitz menu including fire zone pressures.',
    category: 'playbooks',
    filename: 'hs-4-3-defense-playbook.pdf',
    pageCount: 24,
    tags: ['defense', '4-3', 'coverage', 'blitz'],
    icon: '🛡️',
  },
  {
    id: '3-4-defense',
    title: 'HS 3-4 Defense Playbook',
    description:
      'A complete 3-4 defensive system featuring two-gap technique for nose tackles, OLB edge rushes, zone coverage principles, and a versatile blitz package built around exotic pressures.',
    category: 'playbooks',
    filename: 'hs-3-4-defense-playbook.pdf',
    pageCount: 24,
    tags: ['defense', '3-4', 'two-gap', 'zone'],
    icon: '🛡️',
  },
  {
    id: 'special-teams',
    title: 'HS Special Teams Playbook',
    description:
      'A complete special teams manual covering kickoff, kickoff return, punt, punt return, punt block, field goal, field goal block, and onside kick schemes with personnel alignments.',
    category: 'playbooks',
    filename: 'hs-special-teams-playbook.pdf',
    pageCount: 20,
    tags: ['special-teams', 'kickoff', 'punt', 'field-goal'],
    icon: '⚡',
  },
  {
    id: 'offseason-strength',
    title: 'Off-Season Strength Program',
    description:
      'A 4-week periodized strength program built around squat, bench, deadlift, and power clean progressions. Printable weekly logs with empty boxes for recording sets, reps, and weight.',
    category: 'workouts',
    filename: 'offseason-strength-program.pdf',
    pageCount: 8,
    tags: ['strength', 'off-season', 'squat', 'bench'],
    icon: '💪',
  },
  {
    id: 'inseason-maintenance',
    title: 'In-Season Maintenance Program',
    description:
      'A weekly in-season lifting template using the game-day-minus system. Maintains strength with reduced volume while managing fatigue. Includes tracking boxes for each session.',
    category: 'workouts',
    filename: 'inseason-maintenance-program.pdf',
    pageCount: 6,
    tags: ['in-season', 'maintenance', 'game-day-minus'],
    icon: '📊',
  },
  {
    id: 'speed-agility',
    title: 'Speed & Agility Program',
    description:
      'A 6-week progressive speed and agility development program. Covers linear acceleration, change of direction, plyometrics, and sprint mechanics with weekly tracking sheets.',
    category: 'workouts',
    filename: 'speed-agility-program.pdf',
    pageCount: 10,
    tags: ['speed', 'agility', 'plyometrics', 'sprint'],
    icon: '⚡',
  },
  {
    id: 'combine-prep',
    title: 'Combine/Camp Prep Program',
    description:
      'An 8-week countdown program designed to peak for combine or camp testing. Covers 40-yard dash, vertical jump, broad jump, 3-cone, and shuttle preparation with weekly logs.',
    category: 'workouts',
    filename: 'combine-camp-prep-program.pdf',
    pageCount: 12,
    tags: ['combine', 'camp', '40-yard-dash', 'testing'],
    icon: '🎯',
  },
  {
    id: 'lineman-program',
    title: 'Lineman-Specific Program',
    description:
      'A 4-week training program for offensive and defensive linemen. Emphasizes posterior chain strength, hand violence drills, lateral movement, and pad-level conditioning with tracking logs.',
    category: 'workouts',
    filename: 'lineman-specific-program.pdf',
    pageCount: 8,
    tags: ['lineman', 'OL', 'DL', 'strength'],
    icon: '🔨',
  },
  {
    id: 'skill-position',
    title: 'Skill Position Program',
    description:
      'A 4-week program for WRs, DBs, and RBs focusing on explosive speed, route-running agility, hip fluidity, and position-specific conditioning. Includes weekly tracking sheets.',
    category: 'workouts',
    filename: 'skill-position-program.pdf',
    pageCount: 8,
    tags: ['WR', 'DB', 'RB', 'speed'],
    icon: '🏃',
  },
  {
    id: 'qb-development',
    title: 'QB Development Program',
    description:
      'A 4-week quarterback-specific training program covering arm care, throwing mechanics drills, footwork ladders, pocket movement patterns, and football-specific conditioning with tracking logs.',
    category: 'workouts',
    filename: 'qb-development-program.pdf',
    pageCount: 8,
    tags: ['QB', 'quarterback', 'throwing', 'footwork'],
    icon: '🎯',
  },
]

export function getResourcesByCategory(
  category?: ResourceCategory,
): DownloadableResource[] {
  if (!category) return RESOURCES
  return RESOURCES.filter((r) => r.category === category)
}

export function getResourceById(
  id: string,
): DownloadableResource | undefined {
  return RESOURCES.find((r) => r.id === id)
}

export function getDownloadUrl(filename: string): string {
  return `/downloads/${filename}`
}
