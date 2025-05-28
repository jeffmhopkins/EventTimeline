# Event Timeline - Dynamic Event Management

A precision-focused event timeline application designed to help you track and manage events relative to a main event. Whether you're coordinating a product launch, managing a conference schedule, or tracking project milestones, this tool provides real-time countdown functionality with visual status indicators and comprehensive Progressive Web App (PWA) capabilities.

## Overview

Event Timeline empowers users to manage and track time-sensitive events with precision and creative visual design. The application runs entirely in your browser without external dependencies, ensuring complete privacy and control over your timeline information while providing reliable functionality for time-critical scenarios.

## Key Features

### Real-Time Event Management
- **Synchronized Countdowns** - Centralized timer system with precise synchronization across all events
- **Dynamic Status Indicators** - Color-coded visual feedback showing upcoming (green), imminent (yellow), and completed (blue/purple) events
- **Pause & Resume Control** - Pause the timeline to review events without losing track of time
- **Main Event Reference** - Set a primary event time that serves as the anchor point for all other events

### Advanced User Experience
- **Category Filtering** - Organize and filter events by category to focus on specific types of activities
- **Progress Timeline** - Visual timeline bar showing event positions and overall progress with interactive dots
- **Auto-scroll Navigation** - Automatically scroll to completed events for seamless timeline tracking
- **Audio Notifications** - Optional sound alerts when events complete with customizable settings
- **Visual Effects** - Screen blink notifications for both completed events and imminent warnings

### Customization & Accessibility
- **Complete Dark Mode** - Full dark theme support for comfortable viewing in any environment
- **Imminent Event Warnings** - Configurable threshold for yellow warning indicators and special notifications
- **Responsive Design** - Adaptive layouts that work seamlessly on desktop, tablet, and mobile devices
- **PWA Installation** - Install as a standalone app with offline capability and home screen access

### Data Management
- **CSV Import/Export** - Import events from CSV data with flexible formatting support
- **Local Data Caching** - Optional browser localStorage with toggle for enhanced privacy control
- **Event Editing** - Click-to-edit functionality for titles, descriptions, categories, and timing
- **Sample Event Generation** - Built-in generator with realistic event templates for quick setup

## Technology Stack

**Frontend Framework**
- React 18 with TypeScript for type-safe component development
- Vite for fast development and optimized production builds
- Tailwind CSS for responsive, utility-first styling

**Backend & Data**
- Express.js server with TypeScript
- In-memory storage with extensible interface design
- TanStack Query for efficient data management and caching

**UI & Design**
- shadcn/ui component library for consistent, accessible interface elements
- Lucide React for comprehensive icon system
- Framer Motion for smooth animations and transitions

**Routing & PWA**
- Wouter for lightweight client-side routing
- Service Worker integration for offline functionality
- Web App Manifest for native app-like installation

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or pnpm package manager

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd event-timeline
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Access the application:**
   - Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5000`)
   - The application will automatically reload when you make changes to the source code

### Building for Production

```bash
npm run build
```

The optimized production build will be available in the `dist` directory, ready for deployment to any static hosting service.

## How It Works

### Setting Up Your Timeline

1. **Define Your Main Event** - Click on the main event time to set your primary event timestamp. This serves as the reference point for all other events in your timeline.

2. **Add Events with Time Offsets** - Create events that occur before the main event by specifying how many minutes prior they should happen (e.g., "Equipment Setup - 30 minutes before").

3. **Organize with Categories** - Assign categories like "logistics," "technical," "coordination," "safety," or "production" to group related events and enable filtering.

4. **Import Bulk Data** - Use the CSV import feature to quickly add multiple events with the format: `minutes_before,title,description,category`

### Monitoring Your Timeline

- **Visual Status Tracking** - Watch events transition from upcoming (green borders) to imminent (yellow borders) to completed (blue/purple borders)
- **Real-Time Countdown** - Each event displays a precise countdown timer showing remaining time
- **Progress Visualization** - The bottom timeline bar shows overall progress with interactive event dots
- **Smart Notifications** - Receive audio alerts and visual notifications when events complete or become imminent

### Advanced Controls

- **Pause Functionality** - Pause the entire timeline to review events without time progression
- **Category Filtering** - Toggle categories on/off to focus on specific types of events
- **Auto-scroll** - Automatically scroll to newly completed events for seamless tracking
- **Dark Mode** - Switch between light and dark themes for optimal viewing comfort

## Data & Privacy

**Complete Local Control** - All event data is stored locally in your browser using localStorage. No information is transmitted to external servers, ensuring complete privacy and data sovereignty.

**Offline Reliability** - The application works entirely offline once loaded, making it dependable for time-critical scenarios where internet connectivity might be unreliable.

**Optional Caching** - Users can toggle local data persistence on/off based on their privacy preferences and use case requirements.

## Development & Architecture

### Project Structure
```
event-timeline/
├── client/          # React frontend application
├── server/          # Express.js backend server
├── shared/          # Shared TypeScript schemas and types
└── dist/           # Production build output
```

### Key Design Principles
- **Component-based Architecture** - Modular React components with clear separation of concerns
- **Type Safety** - Comprehensive TypeScript coverage for reliable development
- **Responsive Design** - Mobile-first approach with progressive enhancement
- **Accessibility** - WCAG-compliant interface elements and keyboard navigation
- **Performance** - Optimized bundle sizes and efficient re-rendering patterns

## Contributing

We welcome contributions to improve Event Timeline! Here's how you can help:

1. **Fork the repository** and create a feature branch
2. **Make your changes** with appropriate tests and documentation
3. **Follow the existing code style** and TypeScript conventions
4. **Submit a pull request** with a clear description of your improvements

### Development Setup
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Create production build
npm run type-check  # Run TypeScript checks
```

## Created By

Event Timeline was developed by **Jeff Hopkins**, designed to provide precise event timing and coordination for time-critical scenarios. The application combines professional-grade functionality with an intuitive interface, making complex event coordination accessible to users of all technical levels.

## License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute according to the license terms.
