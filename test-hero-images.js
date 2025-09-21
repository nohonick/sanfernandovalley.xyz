#!/usr/bin/env node

/**
 * Test Hero Images Functionality
 * 
 * This script tests the hero image functionality by:
 * 1. Checking if the database field exists
 * 2. Testing image search functionality
 * 3. Generating a test business page with hero image
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs-extra');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://rnkbkjnxnumqtctetyvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua2Jram54bnVtcXRjdGV0eXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTQ0NjUsImV4cCI6MjA3MjIzMDQ2NX0.0I_IhSSq4g2kh_A55uDmg7TcieWaonMK33UQPc-lC14';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test business with hero image
const testBusiness = {
    id: 999,
    name: "Test Gym Sherman Oaks",
    slug: "test-gym-sherman-oaks",
    address: "12345 Ventura Blvd, Sherman Oaks, CA 91403",
    phone: "(818) 555-0123",
    website: "https://www.testgym.com",
    description: "A test gym for demonstrating hero image functionality. This gym offers state-of-the-art equipment and professional training services.",
    status: "active",
    hero_image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80",
    categories: { name: "Gyms & Fitness", slug: "gyms" },
    business_tags: [
        { tags: { name: "Sherman Oaks", tag_type: "location" } },
        { tags: { name: "24/7 Access", tag_type: "amenity" } },
        { tags: { name: "Personal Training", tag_type: "service" } },
        { tags: { name: "Group Classes", tag_type: "service" } }
    ]
};

// Test business without hero image
const testBusinessNoImage = {
    id: 998,
    name: "Test Restaurant Encino",
    slug: "test-restaurant-encino",
    address: "54321 Ventura Blvd, Encino, CA 91436",
    phone: "(818) 555-0456",
    website: "https://www.testrestaurant.com",
    description: "A test restaurant for demonstrating fallback behavior when no hero image is available.",
    status: "active",
    hero_image_url: null,
    categories: { name: "Restaurants", slug: "restaurants" },
    business_tags: [
        { tags: { name: "Encino", tag_type: "location" } },
        { tags: { name: "Fine Dining", tag_type: "specialization" } },
        { tags: { name: "Delivery", tag_type: "service" } }
    ]
};

// Import the business page generator
const { generateBusinessPage } = require('./generate-static-pages.js');

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');
    
    try {
        const { data: businesses, error } = await supabase
            .from('businesses')
            .select('id, name, hero_image_url')
            .limit(1);
        
        if (error) {
            console.log('❌ Database connection failed:', error.message);
            return false;
        }
        
        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        return false;
    }
}

async function testHeroImageField() {
    console.log('🔍 Testing hero_image_url field...');
    
    try {
        const { data: businesses, error } = await supabase
            .from('businesses')
            .select('hero_image_url')
            .limit(1);
        
        if (error && error.message.includes('column "hero_image_url" does not exist')) {
            console.log('❌ hero_image_url field does not exist');
            console.log('📋 Please add it with: ALTER TABLE businesses ADD COLUMN hero_image_url TEXT;');
            return false;
        } else if (error) {
            console.log('❌ Error checking field:', error.message);
            return false;
        } else {
            console.log('✅ hero_image_url field exists');
            return true;
        }
    } catch (error) {
        console.log('❌ Error checking field:', error.message);
        return false;
    }
}

function generateTestPages() {
    console.log('📄 Generating test pages...');
    
    try {
        // Sample business hours
        const sampleHours = [
            { day_of_week: 0, open_time: "08:00", close_time: "20:00", is_24_hour: false, is_closed: false },
            { day_of_week: 1, open_time: "06:00", close_time: "22:00", is_24_hour: false, is_closed: false },
            { day_of_week: 2, open_time: "06:00", close_time: "22:00", is_24_hour: false, is_closed: false },
            { day_of_week: 3, open_time: "06:00", close_time: "22:00", is_24_hour: false, is_closed: false },
            { day_of_week: 4, open_time: "06:00", close_time: "22:00", is_24_hour: false, is_closed: false },
            { day_of_week: 5, open_time: "06:00", close_time: "22:00", is_24_hour: false, is_closed: false },
            { day_of_week: 6, open_time: "08:00", close_time: "20:00", is_24_hour: false, is_closed: false }
        ];
        
        // Generate page with hero image
        console.log('📄 Generating page with hero image...');
        const htmlWithImage = generateBusinessPage(testBusiness, sampleHours, [testBusinessNoImage]);
        const filePathWithImage = path.join(__dirname, 'test-business-with-hero.html');
        fs.writeFileSync(filePathWithImage, htmlWithImage, 'utf8');
        console.log(`✅ Generated: ${filePathWithImage}`);
        
        // Generate page without hero image
        console.log('📄 Generating page without hero image...');
        const htmlWithoutImage = generateBusinessPage(testBusinessNoImage, sampleHours, [testBusiness]);
        const filePathWithoutImage = path.join(__dirname, 'test-business-no-hero.html');
        fs.writeFileSync(filePathWithoutImage, htmlWithoutImage, 'utf8');
        console.log(`✅ Generated: ${filePathWithoutImage}`);
        
        return true;
    } catch (error) {
        console.log('❌ Error generating test pages:', error.message);
        return false;
    }
}

async function main() {
    console.log('🧪 Starting hero image functionality test...\n');
    
    // Test 1: Database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
        console.log('\n❌ Cannot proceed without database connection');
        return;
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Hero image field
    const fieldExists = await testHeroImageField();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Generate test pages
    const pagesGenerated = generateTestPages();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Summary
    console.log('📊 Test Results:');
    console.log(`   Database Connection: ${dbConnected ? '✅ Pass' : '❌ Fail'}`);
    console.log(`   Hero Image Field: ${fieldExists ? '✅ Pass' : '❌ Fail'}`);
    console.log(`   Test Pages Generated: ${pagesGenerated ? '✅ Pass' : '❌ Fail'}`);
    
    if (dbConnected && fieldExists && pagesGenerated) {
        console.log('\n🎉 All tests passed!');
        console.log('\n📋 Next steps:');
        console.log('1. Open test-business-with-hero.html in your browser');
        console.log('2. Open test-business-no-hero.html in your browser');
        console.log('3. Compare the two pages to see the hero image difference');
        console.log('4. Run the main hero image script to update your real businesses');
    } else {
        console.log('\n❌ Some tests failed. Please fix the issues above before proceeding.');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testDatabaseConnection, testHeroImageField, generateTestPages };

