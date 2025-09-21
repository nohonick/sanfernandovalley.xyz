#!/usr/bin/env node

/**
 * Wait for Hero Image Column
 * 
 * This script will keep checking until the hero_image_url column is added
 * to the businesses table, then proceed with adding hero images.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://rnkbkjnxnumqtctetyvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua2Jram54bnVtcXRjdGV0eXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTQ0NjUsImV4cCI6MjA3MjIzMDQ2NX0.0I_IhSSq4g2kh_A55uDmg7TcieWaonMK33UQPc-lC14';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkColumn() {
    try {
        const { data: businesses, error } = await supabase
            .from('businesses')
            .select('hero_image_url')
            .limit(1);
        
        if (error && error.message.includes('column "hero_image_url" does not exist')) {
            return false;
        } else if (error) {
            console.log('❌ Error checking column:', error.message);
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.log('❌ Error checking column:', error.message);
        return false;
    }
}

async function waitForColumn() {
    console.log('⏳ Waiting for hero_image_url column to be added...');
    console.log('📋 Please add the column in your Supabase dashboard:');
    console.log('   ALTER TABLE businesses ADD COLUMN hero_image_url TEXT;');
    console.log('');
    
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max
    
    while (attempts < maxAttempts) {
        attempts++;
        console.log(`🔍 Attempt ${attempts}/${maxAttempts} - Checking for column...`);
        
        const columnExists = await checkColumn();
        
        if (columnExists) {
            console.log('✅ hero_image_url column found!');
            return true;
        }
        
        console.log('⏳ Column not found yet, waiting 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    console.log('❌ Timeout waiting for column. Please check your Supabase dashboard.');
    return false;
}

async function addHeroImages() {
    console.log('🖼️  Adding hero images to businesses...');
    
    try {
        // Import the hero image script
        const { updateBusinessImages } = require('./add-hero-images.js');
        await updateBusinessImages();
    } catch (error) {
        console.log('❌ Error adding hero images:', error.message);
    }
}

async function main() {
    console.log('🚀 Starting hero image setup process...\n');
    
    const columnAdded = await waitForColumn();
    
    if (columnAdded) {
        console.log('\n' + '='.repeat(50) + '\n');
        await addHeroImages();
        
        console.log('\n' + '='.repeat(50) + '\n');
        console.log('🎉 Hero image setup completed!');
        console.log('✅ You can now run: npm run build');
        console.log('✅ Then visit your business pages to see the hero images');
    } else {
        console.log('\n❌ Setup incomplete. Please add the column and try again.');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { waitForColumn, addHeroImages };

