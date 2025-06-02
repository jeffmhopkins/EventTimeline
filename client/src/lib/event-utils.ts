import { Event } from "@shared/schema";

export function formatTime(seconds: number): string {
  // Special case for zero (main event)
  if (seconds === 0) {
    return '0s';
  }
  
  const absSeconds = Math.abs(seconds);
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const secs = absSeconds % 60;
  
  const sign = seconds < 0 ? '-' : '+';
  
  if (hours > 0) {
    return `${sign}${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${sign}${minutes}m ${secs}s`;
  } else {
    return `${sign}${secs}s`;
  }
}

// Store category colors in localStorage for persistence
const CATEGORY_COLORS_KEY = 'categoryColors_v10'; // Changed key to force refresh

// Clear old localStorage entries on load
if (typeof window !== 'undefined') {
  localStorage.removeItem('categoryColors');
  localStorage.removeItem('categoryColors_v2');
  localStorage.removeItem('categoryColors_v3');
  localStorage.removeItem('categoryColors_v4');
  localStorage.removeItem('categoryColors_v5');
  localStorage.removeItem('categoryColors_v6');
  localStorage.removeItem('categoryColors_v7');
  localStorage.removeItem('categoryColors_v8');
  localStorage.removeItem('categoryColors_v9');
}

// Predefined colors to use in order
const predefinedColors = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', 
  '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'
];

// Generate truly random colors with good brightness (for when predefined colors are exhausted)
function generateRandomColor(): { bg: string; border: string; text: string } {
  // Generate random hue (0-360)
  const hue = Math.floor(Math.random() * 360);
  
  // Use good saturation and lightness values for visibility
  const saturation = Math.floor(Math.random() * 40) + 60; // 60-100%
  const borderLightness = Math.floor(Math.random() * 20) + 50; // 50-70%
  const textLightness = Math.floor(Math.random() * 20) + 70; // 70-90%
  
  // Convert HSL to hex
  const borderColor = hslToHex(hue, saturation, borderLightness);
  const textColor = hslToHex(hue, saturation, textLightness);
  
  return {
    bg: 'transparent',
    border: borderColor,
    text: textColor
  };
}

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  const sDecimal = s / 100;
  const lDecimal = l / 100;
  
  const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = lDecimal - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
}

function getCategoryColors(): Record<string, any> {
  try {
    const saved = localStorage.getItem(CATEGORY_COLORS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveCategoryColors(colors: Record<string, any>) {
  localStorage.setItem(CATEGORY_COLORS_KEY, JSON.stringify(colors));
}

export function getCategoryColor(category: string): { bg: string; border: string; text: string } {
  if (!category || category.trim() === '') {
    return { bg: 'transparent', border: '#64748b', text: '#94a3b8' };
  }
  
  const trimmedCategory = category.trim();
  const categoryColors = getCategoryColors();
  
  // If category already has a color, return it
  if (categoryColors[trimmedCategory]) {
    return categoryColors[trimmedCategory];
  }
  
  // Get count of existing categories to determine which predefined color to use
  const existingCategories = Object.keys(categoryColors);
  const colorIndex = existingCategories.length;
  
  // Helper function to adjust color brightness
  const adjustColor = (hex: string, textLighten: number, borderDarken: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Make text color lighter (towards white)
    const textR = Math.min(255, r + (255 - r) * textLighten);
    const textG = Math.min(255, g + (255 - g) * textLighten);
    const textB = Math.min(255, b + (255 - b) * textLighten);
    
    // Make border color darker (towards black)
    const borderR = Math.max(0, r * (1 - borderDarken));
    const borderG = Math.max(0, g * (1 - borderDarken));
    const borderB = Math.max(0, b * (1 - borderDarken));
    
    const textColor = `#${Math.round(textR).toString(16).padStart(2, '0')}${Math.round(textG).toString(16).padStart(2, '0')}${Math.round(textB).toString(16).padStart(2, '0')}`;
    const borderColor = `#${Math.round(borderR).toString(16).padStart(2, '0')}${Math.round(borderG).toString(16).padStart(2, '0')}${Math.round(borderB).toString(16).padStart(2, '0')}`;
    
    return { textColor, borderColor };
  };

  let newColor;
  if (colorIndex < predefinedColors.length) {
    // Use predefined color from the list with adjustments
    const predefinedColor = predefinedColors[colorIndex];
    
    // Special handling for different colors
    const colorLower = predefinedColor.toLowerCase();
    const isYellow = colorLower === '#ffe119';
    const isPurple = colorLower === '#911eb4';
    const isBlue = colorLower === '#4363d8';
    
    let borderDarkenAmount = 0.5; // Default for most colors
    if (isYellow) {
      borderDarkenAmount = 0.7; // Yellow stays darker
    } else if (isPurple || isBlue) {
      borderDarkenAmount = 0.3; // Purple and blue are lighter
    }
    
    const { textColor, borderColor } = adjustColor(predefinedColor, 0.4, borderDarkenAmount);
    newColor = {
      bg: 'transparent',
      border: borderColor,
      text: textColor
    };
  } else {
    // All predefined colors used, generate random color
    newColor = generateRandomColor();
  }
  
  // Save the new category color
  categoryColors[trimmedCategory] = newColor;
  saveCategoryColors(categoryColors);
  
  return newColor;
}

// Function to clear all category colors
export function clearAllCategoryColors(): void {
  localStorage.removeItem(CATEGORY_COLORS_KEY);
  localStorage.removeItem('categoryColors'); // Clear old key too
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
  
  // Format time for main event category
  const formatTimeForCategory = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // First event is the main event (offset = 0 seconds)
  newEvents.push({
    id: `${Date.now()}-main`,
    title: 'Main Event',
    description: 'The primary event everything leads up to',
    category: formatTimeForCategory(mainEventTimestamp), // Store time in HH:MM:SS format
    timeToEvent: 0, // 0 = happens at main event time
    createdAt: currentTime,
    status: 'upcoming'
  });

  // Generate other events with negative offsets (10-300 seconds before main event)
  let phaseEventAdded = false;
  for (let i = 0; i < eventCount - 1; i++) {
    const offsetSeconds = -(Math.floor(Math.random() * 290) + 10); // -10 to -300 seconds (before main event)
    
    // Determine if this event should occur between current time and main event time
    const eventTargetTime = mainEventTimestamp - (Math.abs(offsetSeconds) * 1000);
    const isBetweenNowAndMainEvent = currentTime < eventTargetTime && eventTargetTime < mainEventTimestamp;
    
    // Add one phase event, but only if it would be between current time and main event
    let eventCategory = categories[Math.floor(Math.random() * categories.length)];
    if (!phaseEventAdded && isBetweenNowAndMainEvent) {
      eventCategory = 'Phase';
      phaseEventAdded = true;
    }
    
    newEvents.push({
      id: `${Date.now()}-${Math.random()}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      category: eventCategory,
      timeToEvent: offsetSeconds, // negative offset in seconds before main event
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
