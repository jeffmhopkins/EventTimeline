# Event Timeline

A dynamic event timeline application that empowers users to manage and track time-sensitive events with precision.

## Features

- **Enhanced Time Management**: Supports events before AND after main event with intuitive timing selection
- **Smart Status Transitions**: Color-coded event states with adjustable imminent thresholds
- **Progress Timeline Bar**: Visual timeline with event dots and real-time progress tracking
- **Timeline Control**: Pause/resume functionality for timeline review and manual navigation
- **Dynamic Phase Tracking**: Header title automatically updates to show the most recent completed phase event
- **Advanced Data Management**: CSV import/export with proper time offset handling and local caching
- **Auto-Scroll Navigation**: Intelligent positioning of completed events with pause-aware controls
- **Audio & Visual Alerts**: Sound notifications and screen flash effects for event completion
- **Dark Mode Default**: Complete dark theme with light mode toggle option
- **URL Import**: Share and import event timelines using URL parameters

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

## URL Import Feature

Share event timelines by adding `?events=URL` to your timeline URL:
```
https://your-timeline.com/?events=https://example.com/timeline.csv
```

The app will automatically fetch and import events from the provided CSV URL.

## Deployment

The `dist/` folder contains the production build ready for deployment to any hosting service.

## Standalone Version

Use the build script to generate a portable HTML file:
- Run `build-standalone.bat` or `node build-standalone.js`
- This creates a single HTML file that works offline

## Technology Stack

- React with TypeScript
- Tailwind CSS
- Vite
- Lucide React
- shadcn/ui

## Privacy

This application runs entirely in your browser with complete data privacy. All event information is stored locally and never transmitted to external servers.

## Created By

Jeff Hopkins
- GitHub: https://github.com/jeffmhopkins/EventTimeline