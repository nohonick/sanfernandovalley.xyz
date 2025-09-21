#!/usr/bin/env node

/**
 * Sitemap Generator for San Fernando Valley Business Directory
 * 
 * This script generates a sitemap.xml file for all business pages.
 * This helps search engines discover and index all your business pages.
 * 
 * Usage:
 *   node generate-sitemap.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs-extra');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://rnkbkjnxnumqtctetyvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua2Jram54bnVtcXRjdGV0eXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTQ0NjUsImV4cCI6MjA3MjIzMDQ2NX0.0I_IhSSq4g2kh_A55uDmg7TcieWaonMK33UQPc-lC14';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SITE_URL = 'https://sanfernandovalley.xyz';
const SITEMAP_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{{URLS}}
</urlset>`;

const URL_TEMPLATE = `  <url>
    <loc>{{URL}}</loc>
    <lastmod>{{LASTMOD}}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>{{PRIORITY}}</priority>
  </url>`;

async function generateSitemap() {
    console.log('🗺️  Generating sitemap...');
    
    try {
        // Fetch all active businesses
        const { data: businesses, error: businessError } = await supabase
            .from('businesses')
            .select('slug, updated_at')
            .eq('status', 'active');

        if (businessError) throw businessError;
        
        // Generate URLs
        let urls = [];
        
        // Add homepage
        urls.push(URL_TEMPLATE
            .replace('{{URL}}', SITE_URL)
            .replace('{{LASTMOD}}', new Date().toISOString().split('T')[0])
            .replace('{{PRIORITY}}', '1.0')
        );
        
        // Add business pages
        businesses.forEach(business => {
            const lastmod = business.updated_at 
                ? new Date(business.updated_at).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
                
            urls.push(URL_TEMPLATE
                .replace('{{URL}}', `${SITE_URL}/business/${business.slug}`)
                .replace('{{LASTMOD}}', lastmod)
                .replace('{{PRIORITY}}', '0.8')
            );
        });
        
        // Generate sitemap
        const sitemap = SITEMAP_TEMPLATE.replace('{{URLS}}', urls.join('\n'));
        
        // Write sitemap
        await fs.writeFile('sitemap.xml', sitemap, 'utf8');
        
        console.log(`✅ Generated sitemap.xml with ${urls.length} URLs`);
        console.log(`📄 Homepage: ${SITE_URL}`);
        console.log(`🏢 Business pages: ${businesses.length}`);
        
    } catch (error) {
        console.error('💥 Error generating sitemap:', error);
        process.exit(1);
    }
}

// Run the generator
if (require.main === module) {
    generateSitemap();
}

module.exports = { generateSitemap };
