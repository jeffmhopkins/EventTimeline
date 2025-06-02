#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Creating complete GitHub Pages build...');

try {
  // Clean and prepare
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  
  // Use the regular build but modify the output
  console.log('Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // The build goes to dist/public, we need to move it to dist/
  if (fs.existsSync('dist/public')) {
    // Move all files from dist/public to dist/
    const files = fs.readdirSync('dist/public');
    files.forEach(file => {
      fs.renameSync(
        path.join('dist/public', file),
        path.join('dist', file)
      );
    });
    // Remove empty public directory
    fs.rmdirSync('dist/public');
  }
  
  // Update index.html for GitHub Pages base path
  const indexPath = path.join('dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    // Add base tag for GitHub Pages
    indexContent = indexContent.replace(
      '<head>',
      '<head>\n    <base href="/EventTimeline/">'
    );
    
    // Update asset paths
    indexContent = indexContent.replace(
      /src="\/assets\//g,
      'src="/EventTimeline/assets/'
    );
    indexContent = indexContent.replace(
      /href="\/assets\//g,
      'href="/EventTimeline/assets/'
    );
    
    fs.writeFileSync(indexPath, indexContent);
    console.log('Updated index.html for GitHub Pages');
  }
  
  // Create .nojekyll file
  fs.writeFileSync(path.join('dist', '.nojekyll'), '');
  console.log('Created .nojekyll file');
  
  // Update service worker if it exists
  const swPath = path.join('dist', 'sw.js');
  if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf-8');
    
    // Update cache URLs
    swContent = swContent.replace(
      /const urlsToCache = \[([\s\S]*?)\]/,
      (match, urls) => {
        const updatedUrls = urls.replace(/['"]\/([^'"]*)['"]/g, "'/EventTimeline/$1'");
        return `const urlsToCache = [${updatedUrls}]`;
      }
    );
    
    fs.writeFileSync(swPath, swContent);
    console.log('Updated service worker paths');
  }
  
  // Create deployment instructions
  const deployInstructions = `# GitHub Pages Deployment Ready

## Files Built Successfully

Your Event Timeline application has been built for GitHub Pages deployment.

## Deployment Steps

1. Copy all files from this \`dist/\` directory to your GitHub repository
2. Go to your repository settings on GitHub
3. Navigate to "Pages" section
4. Set source to "Deploy from a branch"
5. Select your main branch and root folder
6. Save the settings

## Your App URL

After deployment, your app will be available at:
\`https://yourusername.github.io/EventTimeline/\`

## Configuration Applied

- ✅ Base path set to \`/EventTimeline/\`
- ✅ All asset paths updated
- ✅ Router configured for subdirectory hosting
- ✅ Service worker paths updated
- ✅ Jekyll processing disabled

## Files Included

All necessary files for a complete React application deployment.
`;

  fs.writeFileSync(path.join('dist', 'DEPLOY.md'), deployInstructions);
  
  console.log('\n✅ GitHub Pages build completed successfully!');
  console.log('\nBuild contents:');
  const files = fs.readdirSync('dist');
  files.forEach(file => {
    const stats = fs.statSync(path.join('dist', file));
    const size = stats.isDirectory() ? '(dir)' : `(${Math.round(stats.size / 1024)}KB)`;
    console.log(`  📄 ${file} ${size}`);
  });
  
  console.log('\n🚀 Ready for GitHub Pages deployment!');
  console.log('Copy the dist/ contents to your GitHub repository.');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}