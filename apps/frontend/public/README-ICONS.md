# PWA Icon Assets

This directory needs the following icon assets for PWA functionality:

## Required Icons

### App Icons
- `pwa-192x192.png` - 192x192px app icon
- `pwa-512x512.png` - 512x512px app icon
- `apple-touch-icon.png` - 180x180px Apple touch icon
- `favicon-32x32.png` - 32x32px favicon
- `favicon-16x16.png` - 16x16px favicon
- `mask-icon.svg` - SVG icon for Safari pinned tabs

### Screenshots (Optional but recommended)
- `screenshot-wide.png` - 1280x720px desktop screenshot
- `screenshot-mobile.png` - 750x1334px mobile screenshot
- `og-image.png` - 1200x630px Open Graph image

## Creating Icons

You can use the vite-plugin-pwa icon generator or create them manually:

### Option 1: Using pwa-asset-generator
```bash
npm install -g pwa-asset-generator
pwa-asset-generator logo.svg ./public --icon-only
```

### Option 2: Manual Creation
1. Create a 512x512px PNG with your app logo
2. Use an online tool like https://realfavicongenerator.net/
3. Place generated files in this directory

## Current Setup

The app is configured to use these icons in:
- `vite.config.ts` - PWA manifest configuration
- `index.html` - Favicon and apple-touch-icon references

## Temporary Solution

For development, placeholder icons can be created. The PWA will still function without custom icons, but will use browser defaults.
