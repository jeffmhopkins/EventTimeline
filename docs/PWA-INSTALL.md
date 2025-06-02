# PWA Installation Guide for GitHub Pages

## Installation Process

When users visit `https://yourusername.github.io/EventTimeline/`, they can install the Event Timeline as a Progressive Web App (PWA).

### Browser Support
- **Chrome/Edge**: Shows "Install" button in address bar
- **Firefox**: Shows "Install" option in page menu
- **Safari**: Use "Add to Home Screen" from share menu
- **Mobile browsers**: "Add to Home Screen" option available

### Installation Steps
1. Visit the GitHub Pages URL
2. Look for browser's install prompt or button
3. Click "Install" or "Add to Home Screen"
4. The app will install with its own icon and run standalone

## PWA Features Configured

### Offline Functionality
- Service worker caches essential resources
- App works offline after first visit
- Cached files include app shell and core assets

### App Manifest
- **Name**: Event Timeline
- **Start URL**: `/EventTimeline/`
- **Scope**: `/EventTimeline/`
- **Display**: Standalone (no browser UI)
- **Theme Color**: Blue (#3b82f6)

### Installation Benefits
- Appears in app launcher/dock
- Runs in standalone window
- Fast loading with cached resources
- Works offline for core functionality
- Native app-like experience

The PWA configuration is properly set up for GitHub Pages subdirectory hosting.