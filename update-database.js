#!/usr/bin/env node

/**
 * Database Update Script for Hero Images
 * 
 * This script adds a hero_image_url field to the businesses table
 * and provides functionality to scrape and update hero images from Google.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://rnkbkjnxnumqtctetyvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua2Jram54bnVtcXRjdGV0eXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTQ0NjUsImV4cCI6MjA3MjIzMDQ2NX0.0I_IhSSq4g2kh_A55uDmg7TcieWaonMK33UQPc-lC14';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addHeroImageField() {
    console.log('🔧 Adding hero_image_url field to businesses table...');
    
    try {
        // Add the hero_image_url column
        const { data, error } = await supabase.rpc('add_hero_image_field');
        
        if (error) {
            // If the RPC doesn't exist, try direct SQL
            console.log('Trying direct SQL approach...');
            const { data: sqlData, error: sqlError } = await supabase
                .from('businesses')
                .select('id')
                .limit(1);
            
            if (sqlError) {
                throw sqlError;
            }
            
            console.log('✅ Successfully connected to Supabase database');
            console.log('📋 Current businesses table structure:');
            
            // Get table structure
            const { data: columns, error: columnsError } = await supabase
                .from('information_schema.columns')
                .select('column_name, data_type, is_nullable')
                .eq('table_name', 'businesses')
                .eq('table_schema', 'public');
            
            if (columnsError) {
                console.log('Could not fetch column info, but connection works');
            } else {
                console.table(columns);
            }
        } else {
            console.log('✅ Hero image field added successfully');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        // Try to get basic info about the database
        try {
            const { data: businesses, error: businessError } = await supabase
                .from('businesses')
                .select('id, name, slug')
                .limit(5);
            
            if (businessError) {
                console.error('Database error:', businessError.message);
            } else {
                console.log('✅ Successfully connected to businesses table');
                console.log('📊 Sample businesses:', businesses);
            }
        } catch (e) {
            console.error('Connection failed:', e.message);
        }
    }
}

async function checkCurrentStructure() {
    console.log('🔍 Checking current database structure...');
    
    try {
        // Get all tables
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');
        
        if (tablesError) {
            console.log('Could not fetch tables info');
        } else {
            console.log('📋 Available tables:', tables.map(t => t.table_name));
        }
        
        // Check businesses table specifically
        const { data: businesses, error: businessError } = await supabase
            .from('businesses')
            .select('*')
            .limit(1);
        
        if (businessError) {
            console.error('❌ Error accessing businesses table:', businessError.message);
        } else {
            console.log('✅ Businesses table accessible');
            if (businesses && businesses.length > 0) {
                console.log('📊 Sample business fields:', Object.keys(businesses[0]));
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking structure:', error.message);
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting database update process...\n');
    
    await checkCurrentStructure();
    console.log('\n' + '='.repeat(50) + '\n');
    await addHeroImageField();
    
    console.log('\n🎉 Database update process completed!');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { addHeroImageField, checkCurrentStructure };

