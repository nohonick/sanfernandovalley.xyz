# Hero Images Setup Guide

This guide will help you add hero images to your San Fernando Valley business directory.

## Step 1: Add Database Column

First, you need to add the `hero_image_url` column to your `businesses` table in Supabase:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Run this SQL command:

```sql
ALTER TABLE businesses ADD COLUMN hero_image_url TEXT;
```

## Step 2: Run the Hero Image Script

After adding the column, run the script to populate hero images:

```bash
node add-hero-images.js
```

This script will:
- Check if the `hero_image_url` field exists
- Search for appropriate images for each business
- Update the database with hero image URLs
- Regenerate static pages with hero images

## Step 3: Verify the Results

After running the script:

1. Check your Supabase dashboard to see the updated businesses with hero image URLs
2. Run `npm run build` to regenerate all static pages
3. Visit your business pages to see the hero images in action

## Features Added

### Database Changes
- Added `hero_image_url` TEXT column to `businesses` table
- Stores URLs to hero images for each business

### Template Updates
- Updated business page template to display hero images
- Added CSS for hero image backgrounds with overlay
- Hero images are displayed as background images with a gradient overlay

### Image Sources
The script uses placeholder images from Unsplash for different business types:
- Gyms/Fitness: Gym equipment images
- Restaurants: Restaurant interior images  
- Auto Services: Auto repair shop images
- Beauty/Salons: Salon interior images
- Home Services: Home improvement images
- Default: Generic business image

### CSS Styling
- Hero images are displayed as background images
- Gradient overlay ensures text remains readable
- Responsive design works on all screen sizes
- Fallback to solid gradient if no image is available

## Customization

### Using Your Own Images
To use your own images instead of the placeholder ones:

1. Update the `placeholderImages` object in `add-hero-images.js`
2. Replace the Unsplash URLs with your own image URLs
3. Run the script again

### Google Custom Search API (Advanced)
For real Google image search, you can:

1. Get a Google Custom Search API key
2. Create a custom search engine
3. Update the `searchGoogleImages` function to use the API
4. Replace the placeholder logic with real search results

### Image Optimization
Consider:
- Using a CDN for faster image loading
- Implementing image optimization (WebP format, responsive sizes)
- Adding lazy loading for better performance

## Troubleshooting

### Database Connection Issues
If you get connection errors:
- Verify your Supabase URL and API key in the script
- Check that your Supabase project is active
- Ensure the API key has the correct permissions

### Missing Images
If some businesses don't get images:
- Check the search query logic in `searchGoogleImages`
- Add more specific image categories for your business types
- Verify the image URLs are accessible

### Template Issues
If hero images don't display:
- Check that the CSS is properly loaded
- Verify the image URLs are valid
- Test the template variables are being replaced correctly

## Next Steps

1. **Add the database column** (Step 1 above)
2. **Run the script** to populate images
3. **Test the results** on your business pages
4. **Customize** the image sources as needed
5. **Deploy** your updated site

The hero images will make your business directory much more visually appealing and professional!

