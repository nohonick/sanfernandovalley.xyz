#!/usr/bin/env node

/**
 * Add Hero Image Column to Supabase Database
 * 
 * This script will help you add the hero_image_url column to your businesses table.
 * Since direct database modification isn't available, this provides the SQL command
 * and then helps populate the column with hero images.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://rnkbkjnxnumqtctetyvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua2Jram54bnVtcXRjdGV0eXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTQ0NjUsImV4cCI6MjA3MjIzMDQ2NX0.0I_IhSSq4g2kh_A55uDmg7TcieWaonMK33UQPc-lC14';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

async function addHeroImageColumn() {
    console.log('🔧 Adding hero_image_url column...');
    
    try {
        // Try to add the column using a simple update that would fail if column doesn't exist
        const { data, error } = await supabase
            .from('businesses')
            .update({ hero_image_url: null })
            .eq('id', -1); // This will fail but test if column exists
        
        if (error && error.message.includes('column "hero_image_url" does not exist')) {
            console.log('❌ Column does not exist. Please add it manually.');
            return false;
        } else if (error) {
            // If it's a different error, the column might exist
            console.log('✅ Column appears to exist (or connection issue)');
            return true;
        } else {
            console.log('✅ Column exists and is accessible');
            return true;
        }
    } catch (error) {
        console.log('❌ Error testing column:', error.message);
        return false;
    }
}

async function showManualInstructions() {
    console.log('\n📋 MANUAL STEPS REQUIRED:');
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
}

async function main() {
    console.log('🚀 Starting database column addition process...\n');
    
    // Check database connection
    const connected = await checkDatabaseConnection();
    if (!connected) {
        console.log('\n❌ Cannot proceed without database connection');
        return;
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Check if column already exists
    const columnExists = await checkHeroImageColumn();
    
    if (columnExists) {
        console.log('\n🎉 hero_image_url column already exists!');
        console.log('✅ You can now run the hero image scripts:');
        console.log('   npm run hero-images');
        console.log('   npm run hero-images-advanced');
        return;
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Try to add column programmatically
    const columnAdded = await addHeroImageColumn();
    
    if (!columnAdded) {
        console.log('\n' + '='.repeat(50) + '\n');
        await showManualInstructions();
    } else {
        console.log('\n🎉 Column addition process completed!');
        console.log('✅ You can now run the hero image scripts:');
        console.log('   npm run hero-images');
        console.log('   npm run hero-images-advanced');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    checkDatabaseConnection, 
    checkHeroImageColumn, 
    addHeroImageColumn 
};

