# Hero Images for San Fernando Valley Directory

This directory now includes comprehensive hero image functionality for your business listings. Hero images make your business pages more visually appealing and professional.

## 🚀 Quick Start

### Step 1: Add Database Column
Add the `hero_image_url` field to your Supabase database:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Run: `ALTER TABLE businesses ADD COLUMN hero_image_url TEXT;`

### Step 2: Add Hero Images
Run the hero image script:
```bash
npm run hero-images
```

### Step 3: Regenerate Pages
Rebuild your static pages:
```bash
npm run build
```

## 📁 Files Added

### Core Scripts
- `add-hero-images.js` - Basic hero image script with placeholder images
- `advanced-image-scraper.js` - Advanced script with Google/Unsplash API support
- `test-hero-images.js` - Test script to verify functionality

### Documentation
- `HERO_IMAGES_SETUP.md` - Detailed setup guide
- `HERO_IMAGES_README.md` - This comprehensive guide

### Updated Files
- `generate-static-pages.js` - Updated to include hero image support
- `package.json` - Added new npm scripts

## 🛠️ Available Scripts

```bash
# Basic hero image setup (uses placeholder images)
npm run hero-images

# Advanced hero image setup (supports Google/Unsplash APIs)
npm run hero-images-advanced

# Test hero image functionality
npm run test-hero

# Generate static pages (includes hero images)
npm run build
```

## 🖼️ Image Sources

### Placeholder Images (Default)
The basic script uses high-quality Unsplash images for different business types:
- **Gyms/Fitness**: Modern gym equipment
- **Restaurants**: Restaurant interiors
- **Auto Services**: Auto repair shops
- **Beauty/Salons**: Salon interiors
- **Home Services**: Home improvement
- **Default**: Generic business image

### Advanced Options
The advanced script supports:
- **Google Custom Search API**: Real Google image search
- **Unsplash API**: Professional stock photos
- **Custom Images**: Your own image URLs

## 🎨 Visual Features

### Hero Section Styling
- **Background Images**: Full-width hero images
- **Gradient Overlay**: Ensures text readability
- **Responsive Design**: Works on all screen sizes
- **Fallback Support**: Graceful degradation without images

### CSS Classes
- `.business-hero` - Base hero section
- `.business-hero.has-image` - Hero section with background image
- `--hero-bg-image` - CSS custom property for background image

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env` file for API keys:

```env
# Google Custom Search API
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id

# Unsplash API
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

### Customizing Images
Edit the `PLACEHOLDER_IMAGES` object in the scripts to use your own images:

```javascript
const PLACEHOLDER_IMAGES = {
    'gym': 'https://your-cdn.com/gym-image.jpg',
    'restaurant': 'https://your-cdn.com/restaurant-image.jpg',
    // ... more categories
};
```

## 📊 Database Schema

### New Column
```sql
ALTER TABLE businesses ADD COLUMN hero_image_url TEXT;
```

### Column Details
- **Type**: TEXT
- **Nullable**: Yes (businesses can exist without hero images)
- **Purpose**: Stores URL to hero image for each business

## 🧪 Testing

### Test Script
Run the test script to verify everything works:

```bash
npm run test-hero
```

This will:
1. Test database connection
2. Check if hero_image_url field exists
3. Generate test pages with and without hero images
4. Show you the results

### Test Pages Generated
- `test-business-with-hero.html` - Business page with hero image
- `test-business-no-hero.html` - Business page without hero image

## 🚀 Deployment

### Vercel
The hero images work seamlessly with Vercel deployment:

```bash
npm run vercel-build
```

### Other Hosting
For other hosting providers:

```bash
npm run build
npm run sitemap
# Upload the generated files
```

## 🔍 Troubleshooting

### Common Issues

#### Database Field Missing
**Error**: `column "hero_image_url" does not exist`
**Solution**: Add the column using the SQL command above

#### No Images Found
**Cause**: API keys not configured or network issues
**Solution**: Check API configuration or use placeholder images

#### Images Not Displaying
**Cause**: Invalid image URLs or CSS issues
**Solution**: Check image URLs and CSS loading

### Debug Steps
1. Run `npm run test-hero` to check basic functionality
2. Check Supabase dashboard for updated businesses
3. Verify image URLs are accessible
4. Check browser console for errors

## 📈 Performance Considerations

### Image Optimization
- Images are loaded from external CDNs (Unsplash)
- Consider implementing image optimization for production
- Use WebP format for better compression
- Implement lazy loading for better performance

### Caching
- Static pages are generated once and cached
- Images are cached by browsers and CDNs
- Consider implementing service worker for offline support

## 🔮 Future Enhancements

### Planned Features
- **Image Upload**: Allow businesses to upload their own images
- **Image Optimization**: Automatic image resizing and compression
- **Multiple Images**: Support for image galleries
- **Image Search**: Better image search algorithms
- **A/B Testing**: Test different images for better engagement

### API Integrations
- **Google Places API**: Get images from Google Places
- **Yelp API**: Business images from Yelp
- **Facebook API**: Images from business Facebook pages
- **Custom Image API**: Your own image service

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Run the test script to identify problems
3. Check the Supabase dashboard for database issues
4. Verify your API keys and configuration

## 🎉 Success!

Once everything is set up, your business directory will have:
- ✅ Professional hero images for each business
- ✅ Responsive design that works on all devices
- ✅ Fast loading with optimized images
- ✅ SEO-friendly image metadata
- ✅ Graceful fallbacks for missing images

Your San Fernando Valley business directory will look much more professional and engaging with these hero images!

