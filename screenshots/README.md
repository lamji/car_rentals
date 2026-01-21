# 📸 Screenshots Guide

This directory contains screenshots for the README.md documentation.

## Current Screenshots

### ✅ Preview Image (preview.png)
- **Content**: Main application preview showing the car rental interface
- **Status**: ✅ Added
- **Usage**: Featured as the main hero image in README.md

## Required Screenshots

### 1. Home Page (home-page.png)
- **URL**: http://localhost:3000
- **Content**: Main search interface with location selector and date picker
- **Capture**: Full viewport showing the hero section and search form

### 2. Location Modal (location-modal.png)
- **Steps**: 
  1. Click on location input field
  2. Type "national" to see region suggestions
  3. Select "National Capital Region (NCR)"
  4. Show province input field
- **Capture**: Modal with cascading location selection in progress

### 3. Car Listings (car-listings.png)
- **URL**: http://localhost:3000/cars
- **Content**: Grid of available cars with filtering options
- **Capture**: Multiple car cards with search and filter UI

### 4. Car Details (car-details.png)
- **URL**: http://localhost:3000/cars/[id]
- **Content**: Detailed car information page
- **Capture**: Car images, specs, pricing, and booking button

### 5. Booking Flow (booking-flow.png)
- **URL**: http://localhost:3000/cars/[id]/fulfillment
- **Content**: Multi-step checkout process
- **Capture**: Booking form with location, dates, and user details

## How to Take Screenshots

### Using Browser DevTools
1. Open the application in Chrome/Firefox
2. Open Developer Tools (F12)
3. Use the device toolbar to set viewport size (recommended: 1920x1080)
4. Take screenshots using:
   - Chrome: Right-click → Capture screenshot → Capture full size screenshot
   - Firefox: Right-click → Take Screenshot → Full Page

### Using Command Line Tools
```bash
# Using playwright (if installed)
npx playwright screenshot http://localhost:3000 screenshots/home-page.png

# Using puppeteer (if installed)
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.screenshot({ path: 'screenshots/home-page.png', fullPage: true });
  await browser.close();
})();
"
```

## Screenshot Guidelines

### Resolution
- **Desktop**: 1920x1080 or 1440x900
- **Mobile**: 375x812 (iPhone X) or 360x640 (Android)

### Quality
- **Format**: PNG (for clarity)
- **Compression**: Lossless
- **Size**: Keep under 2MB per image

### Content
- **No browser UI**: Hide bookmarks, toolbar, etc.
- **Clean state**: Clear any personal data or test content
- **Consistent styling**: Use the same theme/settings for all screenshots

### Naming Convention
- Use lowercase with hyphens
- Descriptive names: `home-page.png`, `location-modal.png`
- Avoid spaces and special characters

## Current Status

The following screenshots are needed:
- [ ] home-page.png
- [ ] location-modal.png  
- [ ] car-listings.png
- [ ] car-details.png
- [ ] booking-flow.png

## Tips for Great Screenshots

1. **Good lighting**: Ensure the UI is clearly visible
2. **Proper focus**: Make sure the main content is in focus
3. **Consistent viewport**: Use the same screen size for all screenshots
4. **Clean data**: Use realistic but non-sensitive test data
5. **Show interactions**: Capture UI states like hover, focus, or loading

## Alternative: Placeholders

If screenshots aren't ready, you can use placeholder services:
- https://via.placeholder.com/800x600?text=Home+Page
- https://picsum.photos/seed/carrental/800/600.jpg

Just update the README.md links accordingly.
