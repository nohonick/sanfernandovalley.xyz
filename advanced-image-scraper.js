#!/usr/bin/env node

/**
 * Advanced Image Scraper for Business Hero Images
 * 
 * This script provides multiple methods to find and set hero images for businesses:
 * 1. Google Custom Search API (requires API key)
 * 2. Unsplash API (free, requires API key)
 * 3. Placeholder images (no API required)
 */

const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const fs = require('fs-extra');

// Supabase configuration
const SUPABASE_URL = 'https://rnkbkjnxnumqtctetyvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua2Jram54bnVtcXRjdGV0eXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTQ0NjUsImV4cCI6MjA3MjIzMDQ2NX0.0I_IhSSq4g2kh_A55uDmg7TcieWaonMK33UQPc-lC14';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuration - Add your API keys here
const CONFIG = {
    // Google Custom Search API (optional)
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
    GOOGLE_SEARCH_ENGINE_ID: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
    
    // Unsplash API (optional)
    UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || '',
    
    // Fallback to placeholder images if no API keys
    USE_PLACEHOLDERS: true
};

// Placeholder images for different business categories
const PLACEHOLDER_IMAGES = {
    'gym': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
    'fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
    'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80',
    'pizza': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80',
    'auto': 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800&h=600&fit=crop&q=80',
    'repair': 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800&h=600&fit=crop&q=80',
    'beauty': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop&q=80',
    'salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop&q=80',
    'home': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
    'services': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
    'plumbing': 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2f2c0?w=800&h=600&fit=crop&q=80',
    'hair': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop&q=80',
    'default': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80'
};

// Helper function to make HTTP requests
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Google Custom Search API
async function searchGoogleImages(query, limit = 1) {
    if (!CONFIG.GOOGLE_API_KEY || !CONFIG.GOOGLE_SEARCH_ENGINE_ID) {
        console.log('⚠️  Google API not configured, using placeholders');
        return [];
    }
    
    try {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${CONFIG.GOOGLE_API_KEY}&cx=${CONFIG.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image&num=${limit}&safe=medium`;
        
        const response = await makeRequest(searchUrl);
        
        if (response.items && response.items.length > 0) {
            return response.items.map(item => item.link);
        }
        
        return [];
    } catch (error) {
        console.error('Google search error:', error.message);
        return [];
    }
}

// Unsplash API
async function searchUnsplashImages(query, limit = 1) {
    if (!CONFIG.UNSPLASH_ACCESS_KEY) {
        console.log('⚠️  Unsplash API not configured, using placeholders');
        return [];
    }
    
    try {
        const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape&client_id=${CONFIG.UNSPLASH_ACCESS_KEY}`;
        
        const response = await makeRequest(searchUrl);
        
        if (response.results && response.results.length > 0) {
            return response.results.map(photo => photo.urls.regular);
        }
        
        return [];
    } catch (error) {
        console.error('Unsplash search error:', error.message);
        return [];
    }
}

// Placeholder image search
function searchPlaceholderImages(query) {
    const queryLower = query.toLowerCase();
    
    // Find matching placeholder based on query
    for (const [key, url] of Object.entries(PLACEHOLDER_IMAGES)) {
        if (queryLower.includes(key)) {
            return [url];
        }
    }
    
    // Default fallback
    return [PLACEHOLDER_IMAGES.default];
}

// Main image search function
async function searchImages(query, limit = 1) {
    console.log(`🔍 Searching for images: "${query}"`);
    
    // Try Google Custom Search first
    let images = await searchGoogleImages(query, limit);
    
    // Fallback to Unsplash
    if (images.length === 0) {
        images = await searchUnsplashImages(query, limit);
    }
    
    // Fallback to placeholders
    if (images.length === 0 && CONFIG.USE_PLACEHOLDERS) {
        images = searchPlaceholderImages(query);
    }
    
    return images;
}

// Check if hero_image_url field exists
async function checkHeroImageField() {
    try {
        const { data: businesses, error } = await supabase
            .from('businesses')
            .select('hero_image_url')
            .limit(1);
        
        if (error && error.message.includes('column "hero_image_url" does not exist')) {
            return false;
        } else if (error) {
            throw error;
        } else {
            return true;
        }
    } catch (error) {
        console.error('Error checking field:', error.message);
        return false;
    }
}

// Update business images
async function updateBusinessImages() {
    console.log('🖼️  Updating business hero images...');
    
    try {
        // Fetch all businesses
        const { data: businesses, error: businessError } = await supabase
            .from('businesses')
            .select(`
                id,
                name,
                slug,
                description,
                categories (name, slug)
            `)
            .eq('status', 'active');
        
        if (businessError) throw businessError;
        
        console.log(`📊 Found ${businesses.length} businesses to update`);
        
        for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];
            console.log(`\n📄 Processing ${i + 1}/${businesses.length}: ${business.name}`);
            
            try {
                // Check if business already has a hero image
                const { data: existingBusiness, error: checkError } = await supabase
                    .from('businesses')
                    .select('hero_image_url')
                    .eq('id', business.id)
                    .single();
                
                if (checkError) throw checkError;
                
                if (existingBusiness.hero_image_url) {
                    console.log(`⏭️  Skipping - already has hero image: ${existingBusiness.hero_image_url}`);
                    continue;
                }
                
                // Search for appropriate image
                const searchQuery = `${business.name} ${business.categories?.name || ''} San Fernando Valley`;
                const imageUrls = await searchImages(searchQuery);
                
                if (imageUrls.length > 0) {
                    const heroImageUrl = imageUrls[0];
                    
                    // Update the business with the hero image URL
                    const { error: updateError } = await supabase
                        .from('businesses')
                        .update({ hero_image_url: heroImageUrl })
                        .eq('id', business.id);
                    
                    if (updateError) throw updateError;
                    
                    console.log(`✅ Updated with hero image: ${heroImageUrl}`);
                } else {
                    console.log(`❌ No suitable image found for ${business.name}`);
                }
                
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`❌ Error updating ${business.name}:`, error.message);
            }
        }
        
        console.log('\n🎉 Hero image update process completed!');
        
    } catch (error) {
        console.error('❌ Error updating business images:', error);
    }
}

// Generate updated static pages
async function generateUpdatedStaticPages() {
    console.log('📄 Regenerating static pages with hero images...');
    
    try {
        const { generateStaticPages } = require('./generate-static-pages.js');
        await generateStaticPages();
        console.log('✅ Static pages regenerated successfully!');
    } catch (error) {
        console.error('❌ Error regenerating static pages:', error);
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting advanced hero image update process...\n');
    
    // Check configuration
    console.log('🔧 Configuration:');
    console.log(`   Google API: ${CONFIG.GOOGLE_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   Unsplash API: ${CONFIG.UNSPLASH_ACCESS_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   Placeholders: ${CONFIG.USE_PLACEHOLDERS ? '✅ Enabled' : '❌ Disabled'}`);
    console.log('');
    
    const fieldExists = await checkHeroImageField();
    
    if (!fieldExists) {
        console.log('❌ hero_image_url field does not exist!');
        console.log('📋 Please add the field manually first:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to the SQL Editor');
        console.log('3. Run: ALTER TABLE businesses ADD COLUMN hero_image_url TEXT;');
        console.log('4. Then run this script again');
        return;
    }
    
    console.log('✅ hero_image_url field exists!');
    console.log('\n' + '='.repeat(50) + '\n');
    
    await updateBusinessImages();
    
    console.log('\n' + '='.repeat(50) + '\n');
    await generateUpdatedStaticPages();
    
    console.log('\n🎉 Process completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Check your Supabase dashboard to see the updated businesses');
    console.log('2. Visit your business pages to see the hero images');
    console.log('3. Customize the image sources in the script if needed');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    searchImages,
    updateBusinessImages,
    generateUpdatedStaticPages,
    checkHeroImageField
};

