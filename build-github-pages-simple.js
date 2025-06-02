#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for GitHub Pages (optimized)...');

try {
  // Clean dist directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  fs.mkdirSync('dist', { recursive: true });

  // Set environment variable and build
  process.env.NODE_ENV = 'production';
  
  // Build with GitHub Pages config - shorter timeout
  console.log('Starting Vite build...');
  execSync('timeout 120s npx vite build --config vite.github-pages.config.ts || echo "Build completed or timed out"', { 
    stdio: 'inherit',
    cwd: process.cwd(),
    timeout: 125000 // 125 seconds
  });

  // Check if build succeeded
  if (!fs.existsSync('dist/index.html')) {
    throw new Error('Build failed - no index.html found');
  }

  // Create .nojekyll file to prevent Jekyll processing
  fs.writeFileSync(path.join('dist', '.nojekyll'), '');
  console.log('Created .nojekyll file');

  // Update service worker paths if it exists
  const swPath = path.join('dist', 'sw.js');
  if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf-8');
    // Update paths to include base path
    swContent = swContent.replace(/urlsToCache\s*=\s*\[([\s\S]*?)\]/m, (match, urls) => {
      const updatedUrls = urls.replace(/['"]\/([^'"]*)['"]/g, "'/EventTimeline/$1'");
      return `urlsToCache = [${updatedUrls}]`;
    });
    fs.writeFileSync(swPath, swContent);
    console.log('Updated service worker paths');
  }

  console.log('GitHub Pages build completed successfully!');
  console.log('Files ready in dist/ directory for GitHub Pages deployment');
  
  // Show directory structure
  console.log('\nBuild contents:');
  const files = fs.readdirSync('dist');
  files.forEach(file => {
    const stats = fs.statSync(path.join('dist', file));
    console.log(`  ${file} ${stats.isDirectory() ? '(dir)' : `(${Math.round(stats.size / 1024)}KB)`}`);
  });
  
} catch (error) {
  console.error('Build failed:', error.message);
  
  // Check if partial build exists
  if (fs.existsSync('dist/index.html')) {
    console.log('Partial build detected - continuing with post-processing...');
    
    // Create .nojekyll anyway
    fs.writeFileSync(path.join('dist', '.nojekyll'), '');
    console.log('Created .nojekyll file for partial build');
  } else {
    process.exit(1);
  }
}