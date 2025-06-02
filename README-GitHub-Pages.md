# GitHub Pages Deployment Guide

This guide explains how to deploy your Event Timeline application to GitHub Pages with the `/EventTimeline/` base path.

## Files Created

### 1. `vite.github-pages.config.ts`
A specialized Vite configuration for GitHub Pages builds with:
- Base path set to `/EventTimeline/`
- Optimized build settings
- Correct asset path handling

### 2. Router Configuration
Updated `client/src/App.tsx` to:
- Detect GitHub Pages environment using `import.meta.env.BASE_URL`
- Configure wouter router with proper base path
- Handle subdirectory routing correctly

### 3. Build Scripts
- `build-github-pages.js` - Complete build with post-processing
- `create-github-pages-build.js` - Quick setup for testing
- `create-full-github-pages-build.js` - Production-ready build

## Quick Deployment Steps

1. **Build for GitHub Pages:**
   ```bash
   npx vite build --config vite.github-pages.config.ts
   ```

2. **Manual post-processing:**
   - Add `.nojekyll` file to `dist/`
   - Update any hardcoded paths in service worker
   - Ensure all asset references use `/EventTimeline/` prefix

3. **Deploy to GitHub:**
   - Copy `dist/` contents to your repository
   - Enable GitHub Pages in repository settings
   - Your app will be available at `https://yourusername.github.io/EventTimeline/`

## Key Changes Made

### Router Configuration
- Added wouter Router component with base path detection
- Automatically switches between `/` (development) and `/EventTimeline/` (GitHub Pages)

### Build Configuration
- Separate Vite config for GitHub Pages
- Base URL set to `/EventTimeline/`
- Asset paths automatically prefixed

### Environment Detection
- Uses `import.meta.env.BASE_URL` to detect deployment environment
- Gracefully handles both local development and GitHub Pages

## Files Structure

```
dist/
├── index.html          # Main app entry point
├── assets/             # CSS, JS, and other assets
├── .nojekyll          # Prevents Jekyll processing
└── README.md          # Deployment instructions
```

## Testing Locally

To test the GitHub Pages build locally:

1. Build with GitHub Pages config
2. Serve the `dist/` directory with a static server
3. Access via `http://localhost:port/EventTimeline/`

The application should work correctly with the subdirectory path structure.