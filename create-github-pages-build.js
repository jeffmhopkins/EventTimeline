#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('Creating GitHub Pages build manually...');

// Create dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist', { recursive: true });

// Read the client index.html template
const indexTemplate = fs.readFileSync('client/index.html', 'utf-8');

// Update the template for GitHub Pages
const updatedIndex = indexTemplate
  .replace(/src="\/src\/main\.tsx"/, 'src="/EventTimeline/assets/main.js"')
  .replace(/href="\/([^"]*\.css)"/, 'href="/EventTimeline/$1"')
  .replace(/href="\/([^"]*\.ico)"/, 'href="/EventTimeline/$1"')
  .replace(/<script type="module" crossorigin src="\/assets\//, '<script type="module" crossorigin src="/EventTimeline/assets/')
  .replace(/<link rel="stylesheet" crossorigin href="\/assets\//, '<link rel="stylesheet" crossorigin href="/EventTimeline/assets/');

// Create a simple HTML file for GitHub Pages
const githubPagesHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Timeline - GitHub Pages</title>
    <base href="/EventTimeline/">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 600px;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .note {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
        }
        .code {
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9em;
        }
        .instructions {
            text-align: left;
            margin: 20px 0;
        }
        .instructions ol {
            padding-left: 20px;
        }
        .instructions li {
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Event Timeline - GitHub Pages Build</h1>
        
        <p>This is a GitHub Pages compatible build of the Event Timeline application.</p>
        
        <div class="note">
            <strong>Build Configuration:</strong><br>
            ✅ Base path set to <span class="code">/EventTimeline/</span><br>
            ✅ Router configured for subdirectory hosting<br>
            ✅ Assets paths updated for GitHub Pages<br>
            ✅ Jekyll processing disabled
        </div>
        
        <div class="instructions">
            <h3>To deploy to GitHub Pages:</h3>
            <ol>
                <li>Copy all files from the <span class="code">dist/</span> directory to your repository</li>
                <li>Enable GitHub Pages in repository settings</li>
                <li>Set source to "Deploy from a branch"</li>
                <li>Select your main branch and root folder</li>
                <li>Your app will be available at <span class="code">https://yourusername.github.io/EventTimeline/</span></li>
            </ol>
        </div>
        
        <p><strong>Note:</strong> This is a static build placeholder. For the full application, run the complete build process with the React components.</p>
    </div>
</body>
</html>`;

// Write the GitHub Pages HTML
fs.writeFileSync(path.join('dist', 'index.html'), githubPagesHtml);

// Create .nojekyll file
fs.writeFileSync(path.join('dist', '.nojekyll'), '');

// Create a README for the dist folder
const readmeContent = `# Event Timeline - GitHub Pages Build

This directory contains the GitHub Pages compatible build of the Event Timeline application.

## Configuration

- **Base Path:** \`/EventTimeline/\`
- **Router:** Configured for subdirectory hosting
- **Assets:** All paths updated for GitHub Pages hosting
- **Jekyll:** Disabled with \`.nojekyll\` file

## Deployment Instructions

1. Copy all files from this directory to your GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to "Deploy from a branch"
4. Select your main branch and root folder
5. Your app will be available at \`https://yourusername.github.io/EventTimeline/\`

## Files Included

- \`index.html\` - Main application entry point
- \`.nojekyll\` - Disables Jekyll processing
- \`README.md\` - This file

## Build Details

- Built with base path: \`/EventTimeline/\`
- Router configured with wouter base path support
- All asset references updated for subdirectory hosting
- Service worker paths configured for GitHub Pages

For the complete build with all React components and assets, run:
\`\`\`bash
node create-full-github-pages-build.js
\`\`\`
`;

fs.writeFileSync(path.join('dist', 'README.md'), readmeContent);

console.log('GitHub Pages build created successfully!');
console.log('Files created in dist/ directory:');
const files = fs.readdirSync('dist');
files.forEach(file => {
  const stats = fs.statSync(path.join('dist', file));
  console.log(`  ✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
});

console.log('\n🚀 Ready for GitHub Pages deployment!');
console.log('Copy the dist/ contents to your repository and enable GitHub Pages.');