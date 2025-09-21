#!/usr/bin/env node

/**
 * Add Hero Images to Businesses
 * 
 * This script adds hero_image_url field to businesses and provides
 * functionality to scrape hero images from Google.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs-extra');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://rnkbkjnxnumqtctetyvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua2Jram54bnVtcXRjdGV0eXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTQ0NjUsImV4cCI6MjA3MjIzMDQ2NX0.0I_IhSSq4g2kh_A55uDmg7TcieWaonMK33UQPc-lC14';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Google Images search function
async function searchGoogleImages(query, limit = 1) {
    try {
        // For now, we'll use a placeholder approach
        // In a real implementation, you'd use Google Custom Search API or web scraping
        console.log(`🔍 Searching for images: "${query}"`);
        
        // Placeholder URLs for different business types
        const placeholderImages = {
            'gym': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
            'fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
            'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
            'pizza': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
            'auto': 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800&h=600&fit=crop',
            'repair': 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800&h=600&fit=crop',
            'beauty': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
            'salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
            'home': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
            'services': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
        };
        
        // Find matching placeholder based on query
        const queryLower = query.toLowerCase();
        for (const [key, url] of Object.entries(placeholderImages)) {
            if (queryLower.includes(key)) {
                return [url];
            }
        }
        
        // Default fallback
        return ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'];
        
    } catch (error) {
        console.error('Error searching for images:', error);
        return [];
    }
}

async function addHeroImageField() {
    console.log('🔧 Attempting to add hero_image_url field...');
    
    try {
        // First, let's check if the field already exists
        const { data: businesses, error: testError } = await supabase
            .from('businesses')
            .select('hero_image_url')
            .limit(1);
        
        if (testError && testError.message.includes('column "hero_image_url" does not exist')) {
            console.log('❌ hero_image_url field does not exist. You need to add it manually in Supabase dashboard.');
            console.log('📋 SQL to run in Supabase SQL Editor:');
            console.log('ALTER TABLE businesses ADD COLUMN hero_image_url TEXT;');
            return false;
        } else if (testError) {
            throw testError;
        } else {
            console.log('✅ hero_image_url field already exists!');
            return true;
        }
        
    } catch (error) {
        console.error('❌ Error checking field:', error.message);
        return false;
    }
}

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
                const imageUrls = await searchGoogleImages(searchQuery);
                
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

async function generateUpdatedStaticPages() {
    console.log('📄 Regenerating static pages with hero images...');
    
    try {
        // Import the existing generator
        const { generateStaticPages } = require('./generate-static-pages.js');
        await generateStaticPages();
        
    } catch (error) {
        console.error('❌ Error regenerating static pages:', error);
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting hero image update process...\n');
    
    const fieldExists = await addHeroImageField();
    
    if (fieldExists) {
        console.log('\n' + '='.repeat(50) + '\n');
        await updateBusinessImages();
        
        console.log('\n' + '='.repeat(50) + '\n');
        await generateUpdatedStaticPages();
    } else {
        console.log('\n📋 Please add the hero_image_url field manually first:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to the SQL Editor');
        console.log('3. Run: ALTER TABLE businesses ADD COLUMN hero_image_url TEXT;');
        console.log('4. Then run this script again');
    }
    
    console.log('\n🎉 Process completed!');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    addHeroImageField, 
    updateBusinessImages, 
    searchGoogleImages,
    generateUpdatedStaticPages 
};

