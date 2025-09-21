#!/usr/bin/env node

/**
 * Complete Hero Images Setup
 * 
 * This script will:
 * 1. Check if the hero_image_url column exists
 * 2. If not, provide instructions to add it
 * 3. Add hero images to all businesses
 * 4. Regenerate static pages
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs-extra');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://rnkbkjnxnumqtctetyvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua2Jram54bnVtcXRjdGV0eXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTQ0NjUsImV4cCI6MjA3MjIzMDQ2NX0.0I_IhSSq4g2kh_A55uDmg7TcieWaonMK33UQPc-lC14';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Placeholder images for different business types
const PLACEHOLDER_IMAGES = {
    'gym': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
    'fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
    'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80',
    'pizza': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80',
    'auto': 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800&h=600&fit=crop&q=80',
    'repair': 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800&h=600&fit=crop&q=80',
    'beauty': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop&q=80',
    'salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop&q=80',
    'hair': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop&q=80',
    'home': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
    'services': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
    'plumbing': 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2f2c0?w=800&h=600&fit=crop&q=80',
    'default': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80'
};

async function checkDatabaseConnection() {
    console.log('🔍 Checking database connection...');
    
    try {
        const { data: businesses, error } = await supabase
            .from('businesses')
            .select('id, name')
            .limit(1);
        
        if (error) {
            console.log('❌ Database connection failed:', error.message);
            return false;
        }
        
        console.log('✅ Database connection successful');
        console.log(`📊 Found ${businesses.length} business(es) in database`);
        return true;
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        return false;
    }
}

async function checkHeroImageColumn() {
    console.log('🔍 Checking for hero_image_url column...');
    
    try {
        const { data: businesses, error } = await supabase
            .from('businesses')
            .select('hero_image_url')
            .limit(1);
        
        if (error && error.message.includes('column "hero_image_url" does not exist')) {
            console.log('❌ hero_image_url column does not exist');
            return false;
        } else if (error) {
            console.log('❌ Error checking column:', error.message);
            return false;
        } else {
            console.log('✅ hero_image_url column exists');
            return true;
        }
    } catch (error) {
        console.log('❌ Error checking column:', error.message);
        return false;
    }
}

function searchPlaceholderImages(query) {
    const queryLower = query.toLowerCase();
    
    // Find matching placeholder based on query
    for (const [key, url] of Object.entries(PLACEHOLDER_IMAGES)) {
        if (queryLower.includes(key)) {
            return url;
        }
    }
    
    // Default fallback
    return PLACEHOLDER_IMAGES.default;
}

async function addHeroImages() {
    console.log('🖼️  Adding hero images to businesses...');
    
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
                const heroImageUrl = searchPlaceholderImages(searchQuery);
                
                // Update the business with the hero image URL
                const { error: updateError } = await supabase
                    .from('businesses')
                    .update({ hero_image_url: heroImageUrl })
                    .eq('id', business.id);
                
                if (updateError) throw updateError;
                
                console.log(`✅ Updated with hero image: ${heroImageUrl}`);
                
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`❌ Error updating ${business.name}:`, error.message);
            }
        }
        
        console.log('\n🎉 Hero image update process completed!');
        
    } catch (error) {
        console.error('❌ Error updating business images:', error);
    }
}

async function regenerateStaticPages() {
    console.log('📄 Regenerating static pages with hero images...');
    
    try {
        const { generateStaticPages } = require('./generate-static-pages.js');
        await generateStaticPages();
        console.log('✅ Static pages regenerated successfully!');
    } catch (error) {
        console.error('❌ Error regenerating static pages:', error);
    }
}

async function main() {
    console.log('🚀 Starting complete hero image setup...\n');
    
    // Check database connection
    const connected = await checkDatabaseConnection();
    if (!connected) {
        console.log('\n❌ Cannot proceed without database connection');
        return;
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Check if hero image column exists
    const columnExists = await checkHeroImageColumn();
    
    if (!columnExists) {
        console.log('\n📋 MANUAL STEP REQUIRED:');
        console.log('='.repeat(50));
        console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Navigate to "SQL Editor" in the left sidebar');
        console.log('4. Run this SQL command:');
        console.log('');
        console.log('   ALTER TABLE businesses ADD COLUMN hero_image_url TEXT;');
        console.log('');
        console.log('5. Click "Run" to execute the command');
        console.log('6. Come back and run this script again');
        console.log('='.repeat(50));
        return;
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Add hero images
    await addHeroImages();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Regenerate static pages
    await regenerateStaticPages();
    
    console.log('\n🎉 Complete hero image setup finished!');
    console.log('✅ Your business pages now have beautiful hero images');
    console.log('✅ Visit your business pages to see the results');
    console.log('✅ Run "npm run build" anytime to regenerate pages');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    checkDatabaseConnection, 
    checkHeroImageColumn, 
    addHeroImages, 
    regenerateStaticPages 
};
