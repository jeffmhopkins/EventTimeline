#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building PWA-ready GitHub Pages deployment...');

try {
  // Clean dist directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }

  // Build with GitHub Pages config
  console.log('Building application...');
  execSync('GITHUB_PAGES=true npx vite build --config vite.github-pages.config.ts --mode production', { 
    stdio: 'inherit' 
  });

  // Create .nojekyll file
  fs.writeFileSync(path.join('dist', '.nojekyll'), '');

  // Copy GitHub Pages specific PWA files
  if (fs.existsSync('client/manifest.github-pages.json')) {
    fs.copyFileSync('client/manifest.github-pages.json', path.join('dist', 'manifest.json'));
    console.log('Copied GitHub Pages manifest');
  }

  if (fs.existsSync('client/sw.github-pages.js')) {
    fs.copyFileSync('client/sw.github-pages.js', path.join('dist', 'sw.js'));
    console.log('Copied GitHub Pages service worker');
  }

  // Create PWA deployment guide
  const pwaGuide = `# PWA GitHub Pages Deployment

## PWA Configuration

This build includes proper PWA configuration for GitHub Pages:

- **Start URL**: \`/EventTimeline/\`
- **Scope**: \`/EventTimeline/\`
- **Service Worker**: Configured for subdirectory hosting
- **Manifest**: Updated with correct icon and start URL paths

## Installation

Users can install this as a PWA when visiting:
\`https://yourusername.github.io/EventTimeline/\`

The browser will show an "Install App" prompt, and the app will:
- Work offline with cached resources
- Have its own app icon
- Run in standalone mode
- Support push notifications (if implemented)

## Files

- \`manifest.json\` - PWA manifest with GitHub Pages paths
- \`sw.js\` - Service worker for offline functionality
- \`index.html\` - App entry point with PWA meta tags
`;

  fs.writeFileSync(path.join('dist', 'PWA.md'), pwaGuide);

  console.log('\n✅ PWA-ready GitHub Pages build completed!');
  console.log('\nPWA Features:');
  console.log('  📱 Installable as standalone app');
  console.log('  🔄 Offline functionality with service worker');
  console.log('  📍 Correct scope and start URL for /EventTimeline/');
  console.log('  🎨 App icons and theme configuration');

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}