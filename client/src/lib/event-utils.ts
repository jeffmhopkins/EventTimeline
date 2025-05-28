import { Event } from "@shared/schema";

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `-${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `-${minutes}m ${secs}s`;
  } else {
    return `-${secs}s`;
  }
}

// Store category colors in localStorage for persistence
const CATEGORY_COLORS_KEY = 'categoryColors';

const availableColors = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
];

function getCategoryColors(): Record<string, string> {
  try {
    const saved = localStorage.getItem(CATEGORY_COLORS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveCategoryColors(colors: Record<string, string>) {
  localStorage.setItem(CATEGORY_COLORS_KEY, JSON.stringify(colors));
}

export function getCategoryColor(category: string): string {
  if (!category) return 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300';
  
  const categoryColors = getCategoryColors();
  
  // If category already has a color, return it
  if (categoryColors[category]) {
    return categoryColors[category];
  }
  
  // Assign a random color to new category
  const usedColors = Object.values(categoryColors);
  const availableUnusedColors = availableColors.filter(color => !usedColors.includes(color));
  
  // If all colors are used, pick any random color
  const colorsToChooseFrom = availableUnusedColors.length > 0 ? availableUnusedColors : availableColors;
  const randomColor = colorsToChooseFrom[Math.floor(Math.random() * colorsToChooseFrom.length)];
  
  // Save the new category color
  categoryColors[category] = randomColor;
  saveCategoryColors(categoryColors);
  
  return randomColor;
}

export function generateRandomEvents(): Event[] {
  const categories = ['Meeting', 'Workshop', 'Conference', 'Deadline', 'Launch', 'Review'];
  
  // Pre-assign colors to categories that will be used
  categories.forEach(category => getCategoryColor(category));
  const titles = [
    'Team Standup', 'Product Launch', 'Code Review', 'Client Presentation',
    'Design Review', 'Sprint Planning', 'User Testing', 'Feature Demo',
    'Strategy Session', 'Performance Review', 'Training Workshop', 'Milestone Check'
  ];
  const descriptions = [
    'Weekly team sync and progress updates',
    'Quarterly business review and planning',
    'Technical architecture discussion',
    'User experience feedback session',
    'Project milestone celebration',
    'Knowledge sharing and best practices',
    'Strategic planning and roadmap review',
    'Performance metrics and KPI review'
  ];

  const newEvents: Event[] = [];
  const eventCount = Math.floor(Math.random() * 6) + 25; // 25-30 events
  const currentTime = Date.now();
  
  // Main event time: 2-3 minutes from now (absolute timestamp)
  const mainEventTimestamp = currentTime + ((Math.floor(Math.random() * 61) + 120) * 1000); // 120-180 seconds from now
  
  // First event is the main event (offset = 0 seconds before main event)
  newEvents.push({
    id: `${Date.now()}-main`,
    title: 'Main Event',
    description: 'The primary event everything leads up to',
    category: '',
    timeToEvent: 0, // 0 seconds before main event
    createdAt: currentTime,
    status: 'upcoming'
  });

  // Generate other events with offsets 10-300 seconds before main event (within 5 minutes)
  for (let i = 0; i < eventCount - 1; i++) {
    const offsetSeconds = Math.floor(Math.random() * 290) + 10; // 10-300 seconds (5 minutes) before main event
    
    newEvents.push({
      id: `${Date.now()}-${Math.random()}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      timeToEvent: offsetSeconds, // positive offset in seconds before main event
      createdAt: currentTime,
      status: 'upcoming'
    });
  }

  // Add the main event timestamp to all events for reference
  newEvents.forEach(event => {
    (event as any).mainEventTimestamp = mainEventTimestamp;
  });

  return newEvents;
}
