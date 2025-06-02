#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read file with error handling
function readFileSync(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.warn(`Warning: Could not read ${filePath}`);
        return '';
    }
}

// Extract React component from file
function extractComponent(content, componentName) {
    // Remove imports and exports, keep the component logic
    let cleaned = content
        .replace(/^import.*$/gm, '') // Remove import lines
        .replace(/^export\s+default.*$/gm, '') // Remove export default
        .replace(/^export\s+{.*$/gm, '') // Remove export statements
        .replace(/^export\s+function/gm, 'function') // Convert export function to function
        .replace(/^export\s+const/gm, 'const') // Convert export const to const
        .trim();
    
    return cleaned;
}

// Recursively find all files in a directory
function findFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
        return files;
    }
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && item !== 'node_modules' && item !== '.git') {
            files.push(...findFiles(fullPath, extensions));
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Extract CSS from files
function extractCSS() {
    const cssFiles = [
        ...findFiles('client/src', ['.css']),
        'client/index.css',
        'postcss.config.js',
        'tailwind.config.ts'
    ];
    
    let customCSS = '';
    
    for (const cssFile of cssFiles) {
        const content = readFileSync(cssFile);
        if (content.trim()) {
            // Extract CSS custom properties and animations
            const cssRules = content.match(/:root\s*{[^}]+}|\.[\w-]+\s*{[^}]+}|@keyframes[^}]+{[^}]+}/g);
            if (cssRules) {
                customCSS += cssRules.join('\n') + '\n';
            }
        }
    }
    
    return customCSS;
}

// Main build function
function buildStandalone() {
    console.log('Building standalone HTML file...');
    
    // Extract custom CSS
    const customCSS = extractCSS();
    
    // Automatically discover all source files
    const sourceFiles = [
        ...findFiles('client/src'),
        ...findFiles('shared'),
        ...findFiles('server') // In case you have shared utilities
    ];
    
    console.log(`Found ${sourceFiles.length} source files to process...`);
    
    // Process all files
    const processedComponents = {};
    const allProcessedCode = [];
    
    // Priority order for loading - utilities first, then components, then pages
    const loadOrder = [
        // Utilities and schemas first
        'shared/schema.ts',
        'client/src/lib/utils.ts',
        'client/src/lib/event-utils.ts',
        'client/src/lib/queryClient.ts',
        
        // Hooks next
        'client/src/hooks/',
        
        // UI components
        'client/src/components/ui/',
        
        // Custom components
        'client/src/components/',
        
        // Pages last
        'client/src/pages/',
        
        // Main app files
        'client/src/App.tsx',
        'client/src/main.tsx'
    ];
    
    // Sort files by priority
    const sortedFiles = sourceFiles.sort((a, b) => {
        const getPriority = (file) => {
            for (let i = 0; i < loadOrder.length; i++) {
                if (file.includes(loadOrder[i])) {
                    return i;
                }
            }
            return loadOrder.length; // Unknown files last
        };
        
        return getPriority(a) - getPriority(b);
    });
    
    // Process each file
    for (const filePath of sortedFiles) {
        const content = readFileSync(filePath);
        if (content.trim()) {
            const fileName = path.basename(filePath, path.extname(filePath));
            const processed = extractComponent(content, fileName);
            
            if (processed.trim()) {
                processedComponents[fileName] = processed;
                allProcessedCode.push(`// File: ${filePath}`);
                allProcessedCode.push(processed);
                allProcessedCode.push(''); // Empty line between files
                console.log(`✓ Processed: ${filePath}`);
            }
        }
    }

    // Generate the standalone HTML
    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Timeline - Dynamic Event Management</title>
    
    <!-- PWA Meta Tags -->
    <meta name="description" content="Dynamic event timeline application for precise timing and coordination">
    <meta name="theme-color" content="#3b82f6">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Event Timeline">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        border: "hsl(var(--border))",
                        input: "hsl(var(--input))",
                        ring: "hsl(var(--ring))",
                        background: "hsl(var(--background))",
                        foreground: "hsl(var(--foreground))",
                        primary: {
                            DEFAULT: "hsl(var(--primary))",
                            foreground: "hsl(var(--primary-foreground))",
                        },
                        secondary: {
                            DEFAULT: "hsl(var(--secondary))",
                            foreground: "hsl(var(--secondary-foreground))",
                        },
                        destructive: {
                            DEFAULT: "hsl(var(--destructive))",
                            foreground: "hsl(var(--destructive-foreground))",
                        },
                        muted: {
                            DEFAULT: "hsl(var(--muted))",
                            foreground: "hsl(var(--muted-foreground))",
                        },
                        accent: {
                            DEFAULT: "hsl(var(--accent))",
                            foreground: "hsl(var(--accent-foreground))",
                        },
                        popover: {
                            DEFAULT: "hsl(var(--popover))",
                            foreground: "hsl(var(--popover-foreground))",
                        },
                        card: {
                            DEFAULT: "hsl(var(--card))",
                            foreground: "hsl(var(--card-foreground))",
                        },
                    },
                }
            }
        }
    </script>
    
    <!-- React and ReactDOM -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    
    <style>
        :root {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
            --card: 0 0% 100%;
            --card-foreground: 222.2 84% 4.9%;
            --popover: 0 0% 100%;
            --popover-foreground: 222.2 84% 4.9%;
            --primary: 221.2 83.2% 53.3%;
            --primary-foreground: 210 40% 98%;
            --secondary: 210 40% 96%;
            --secondary-foreground: 222.2 84% 4.9%;
            --muted: 210 40% 96%;
            --muted-foreground: 215.4 16.3% 46.9%;
            --accent: 210 40% 96%;
            --accent-foreground: 222.2 84% 4.9%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 210 40% 98%;
            --border: 214.3 31.8% 91.4%;
            --input: 214.3 31.8% 91.4%;
            --ring: 221.2 83.2% 53.3%;
        }
        
        .dark {
            --background: 222.2 84% 4.9%;
            --foreground: 210 40% 98%;
            --card: 222.2 84% 4.9%;
            --card-foreground: 210 40% 98%;
            --popover: 222.2 84% 4.9%;
            --popover-foreground: 210 40% 98%;
            --primary: 217.2 91.2% 59.8%;
            --primary-foreground: 222.2 84% 4.9%;
            --secondary: 217.2 32.6% 17.5%;
            --secondary-foreground: 210 40% 98%;
            --muted: 217.2 32.6% 17.5%;
            --muted-foreground: 215 20.2% 65.1%;
            --accent: 217.2 32.6% 17.5%;
            --accent-foreground: 210 40% 98%;
            --destructive: 0 62.8% 30.6%;
            --destructive-foreground: 210 40% 98%;
            --border: 217.2 32.6% 17.5%;
            --input: 217.2 32.6% 17.5%;
            --ring: 224.3 76.3% 94.1%;
        }
        
        * {
            border-color: hsl(var(--border));
        }
        
        body {
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
        }
        
        /* Custom CSS from project */
        ${customCSS}
    </style>
</head>
<body>
    <div id="root"></div>

    <!-- Babel for JSX transformation -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <script type="text/babel">
        const { useState, useEffect, useRef, useCallback, useMemo } = React;
        
        // Utility functions
        const cn = (...classes) => classes.filter(Boolean).join(' ');
        
        // BEGIN GENERATED COMPONENTS AND UTILITIES
        
        ${allProcessedCode.join('\n        ')}
        
        // END GENERATED COMPONENTS
        
        // Render the app
        const rootElement = document.getElementById('root');
        if (rootElement) {
            ReactDOM.render(React.createElement(App), rootElement);
        }
    </script>
</body>
</html>`;

    // Write the file
    const outputPath = 'event-timeline-standalone-generated.html';
    fs.writeFileSync(outputPath, htmlTemplate);
    
    console.log(`✅ Standalone HTML file generated: ${outputPath}`);
    console.log(`📄 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    console.log('🚀 You can now open this file directly in any web browser');
}

// Run the build
if (import.meta.url === `file://${process.argv[1]}`) {
    buildStandalone();
}