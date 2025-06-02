#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for GitHub Pages...');

try {
  // Build using the GitHub Pages specific config
  execSync('vite build --config vite.github-pages.config.ts', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Create .nojekyll file to prevent Jekyll processing
  fs.writeFileSync(path.join('dist', '.nojekyll'), '');
  console.log('Created .nojekyll file');

  // Update service worker paths if it exists
  const swPath = path.join('dist', 'sw.js');
  if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf-8');
    // Update any absolute paths to include the base path
    swContent = swContent.replace(/'\//g, "'/EventTimeline/");
    swContent = swContent.replace(/"\//g, '"/EventTimeline/');
    fs.writeFileSync(swPath, swContent);
    console.log('Updated service worker paths');
  }

  console.log('GitHub Pages build completed successfully!');
  console.log('Files are ready in the dist/ directory');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}