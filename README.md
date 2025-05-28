# Event Timeline - Dynamic Event Management

A dynamic event timeline application that empowers users to manage and track time-sensitive events with precision, enhanced with Progressive Web App (PWA) capabilities.

## Features

- **Real-time Countdowns** - Live countdown timers showing precise time remaining for each event
- **Category Filtering** - Filter events by category to focus on specific types of activities
- **Status Indicators** - Color-coded status showing completed, upcoming, and imminent events
- **Pause & Resume** - Pause the timeline to review events without losing track of time
- **Audio Notifications** - Optional sound alerts when events complete
- **Visual Effects** - Screen blink notifications and auto-scroll to completed events
- **Progress Timeline** - Visual timeline bar showing event positions and overall progress
- **Dark Mode** - Complete dark theme support for comfortable viewing
- **CSV Import/Export** - Import events from CSV data
- **PWA Support** - Install as a standalone app with offline capability
- **Local Data Storage** - Complete privacy with browser localStorage

## Technology Stack

- **React** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Express** backend server
- **shadcn/ui** components
- **Lucide React** icons
- **TanStack Query** for data management
- **Wouter** for routing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd event-timeline
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the local development URL shown in the terminal.

### Building for Production

```bash
npm run build
```

The built files will be available in the `dist` directory.

## How It Works

1. **Set your main event time** - This serves as the reference point for all other events
2. **Add events with time offsets** - Create events that occur before the main event (e.g., "Setup - 30 minutes before")
3. **Watch real-time transitions** - Events transition from upcoming (gray) to imminent (yellow) to completed (blue/green)
4. **Use controls effectively** - Utilize filtering, notifications, and pause controls to manage your timeline

## Data & Privacy

All event data is stored locally in your browser using localStorage. No data is sent to external servers, ensuring complete privacy and control over your timeline information. The application works entirely offline once loaded, making it reliable for time-critical scenarios.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.