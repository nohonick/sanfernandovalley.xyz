#!/usr/bin/env node

/**
 * Category Pages Generator for San Fernando Valley Business Directory
 * 
 * This script generates static HTML pages for all business categories.
 * Each category page will be searchable and filterable by tags.
 * 
 * Usage:
 *   node generate-category-pages.js
 * 
 * Requirements:
 *   npm install @supabase/supabase-js fs-extra
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs-extra');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://rnkbkjnxnumqtctetyvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua2Jram54bnVtcXRjdGV0eXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTQ0NjUsImV4cCI6MjA3MjIzMDQ2NX0.0I_IhSSq4g2kh_A55uDmg7TcieWaonMK33UQPc-lC14';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Category page template
const CATEGORY_PAGE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{PAGE_TITLE}} | San Fernando Valley Directory</title>
    <meta name="description" content="{{PAGE_DESCRIPTION}}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{CANONICAL_URL}}">
    <meta property="og:title" content="{{PAGE_TITLE}} | San Fernando Valley Directory">
    <meta property="og:description" content="{{PAGE_DESCRIPTION}}">
    <meta property="og:image" content="{{CATEGORY_IMAGE}}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{CANONICAL_URL}}">
    <meta property="twitter:title" content="{{PAGE_TITLE}} | San Fernando Valley Directory">
    <meta property="twitter:description" content="{{PAGE_DESCRIPTION}}">
    <meta property="twitter:image" content="{{CATEGORY_IMAGE}}">

    <!-- Structured Data -->
    <script type="application/ld+json">
    {{STRUCTURED_DATA}}
    </script>

    <link rel="stylesheet" href="/styles.css">
    <style>
        /* Category Page Specific Styles */
        .category-hero {
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            color: white;
            padding: 4rem 0;
            position: relative;
            overflow: hidden;
        }

        .category-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }

        .category-header {
            position: relative;
            z-index: 1;
            text-align: center;
        }

        .breadcrumb {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.8);
        }

        .breadcrumb a {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: color 0.2s;
        }

        .breadcrumb a:hover {
            color: white;
        }

        .breadcrumb-separator {
            color: rgba(255, 255, 255, 0.5);
        }

        .category-title {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 1rem;
            line-height: 1.1;
        }

        .category-subtitle {
            font-size: 1.25rem;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .filter-section {
            background: white;
            padding: 3rem 0;
        }

        .filter-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 0 1rem;
        }

        .filter-header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .filter-title {
            font-size: 2rem;
            font-weight: bold;
            color: #111827;
            margin-bottom: 1rem;
        }

        .filter-subtitle {
            color: #6b7280;
            font-size: 1.125rem;
        }

        .filter-form {
            background: #f9fafb;
            border-radius: 1rem;
            padding: 2rem;
            border: 1px solid #e5e7eb;
        }

        .filter-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
        }

        .form-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
        }

        .form-select {
            padding: 0.75rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 0.5rem;
            font-size: 1rem;
            background: white;
            transition: all 0.2s;
        }

        .form-select:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        @media (max-width: 768px) {
            .filter-grid {
                grid-template-columns: 1fr;
            }
        }

        .results-section {
            background: #f9fafb;
            padding: 3rem 0;
        }

        .results-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }

        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .results-title {
            font-size: 1.5rem;
            font-weight: bold;
            color: #111827;
        }

        .results-count {
            color: #6b7280;
            font-size: 0.875rem;
        }

        .business-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }

        .business-card {
            background: white;
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            transition: all 0.2s;
            text-decoration: none;
            color: inherit;
        }

        .business-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-color: #2563eb;
        }

        .business-card-header {
            margin-bottom: 1rem;
        }

        .business-card-title {
            font-size: 1.25rem;
            font-weight: bold;
            color: #111827;
            margin-bottom: 0.5rem;
            line-height: 1.3;
        }

        .business-card-category {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #eff6ff;
            color: #1e40af;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            margin-bottom: 0.75rem;
        }

        .business-card-description {
            color: #6b7280;
            font-size: 0.875rem;
            line-height: 1.5;
            margin-bottom: 1rem;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .business-card-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .business-card-tag {
            padding: 0.25rem 0.5rem;
            background: #f3f4f6;
            color: #374151;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .business-card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1rem;
            border-top: 1px solid #f3f4f6;
        }

        .business-card-location {
            color: #6b7280;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .business-card-actions {
            display: flex;
            gap: 0.5rem;
        }

        .action-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.2s;
        }

        .action-btn-primary {
            background: #2563eb;
            color: white;
        }

        .action-btn-primary:hover {
            background: #1d4ed8;
        }

        .action-btn-secondary {
            background: #f3f4f6;
            color: #374151;
        }

        .action-btn-secondary:hover {
            background: #e5e7eb;
        }

        .no-results {
            text-align: center;
            padding: 3rem 1rem;
            color: #6b7280;
        }

        .no-results-icon {
            width: 4rem;
            height: 4rem;
            margin: 0 auto 1rem;
            color: #d1d5db;
        }

        .no-results-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
        }

        .no-results-text {
            font-size: 1rem;
            color: #6b7280;
        }

        .cta-section {
            background: white;
            padding: 3rem 0;
            text-align: center;
        }

        .cta-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 0 1rem;
        }

        .cta-title {
            font-size: 2rem;
            font-weight: bold;
            color: #111827;
            margin-bottom: 1rem;
        }

        .cta-text {
            color: #6b7280;
            font-size: 1.125rem;
            margin-bottom: 2rem;
            line-height: 1.6;
        }

        .cta-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 2rem;
            background: #2563eb;
            color: white;
            border-radius: 0.75rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
        }

        .cta-button:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        @media (max-width: 768px) {
            .category-title {
                font-size: 2.5rem;
            }
            
            .search-form {
                padding: 1.5rem;
            }
            
            .business-grid {
                grid-template-columns: 1fr;
            }
            
            .results-header {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav">
        <div class="container">
            <div class="nav-content">
                <a href="/" class="nav-brand">San Fernando Valley Directory</a>
                
                <div class="nav-links">
                    <a href="/#categories" class="nav-link">Categories</a>
                    <a href="/#neighborhoods" class="nav-link">Neighborhoods</a>
                    <a href="/#search" class="nav-link">Search</a>
                </div>
                
                <button type="button" class="mobile-menu-btn" aria-label="Open mobile menu">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </div>
    </nav>

    <!-- Category Hero -->
    <section class="category-hero">
        <div class="container">
            <div class="category-header">
                <nav class="breadcrumb">
                    <a href="/">Home</a>
                    <span class="breadcrumb-separator">/</span>
                    <a href="/#categories">Categories</a>
                    <span class="breadcrumb-separator">/</span>
                    <span>{{CATEGORY_NAME}}</span>
                </nav>
                
                <h1 class="category-title">{{PAGE_TITLE}}</h1>
                <p class="category-subtitle">{{PAGE_DESCRIPTION}}</p>
            </div>
        </div>
    </section>

    <!-- Filter Section -->
    <section class="filter-section">
        <div class="container">
            <div class="filter-container">
                <div class="filter-header">
                    <h2 class="filter-title">Find {{CATEGORY_NAME}} in the San Fernando Valley</h2>
                    <p class="filter-subtitle">Filter by tags and neighborhood to find exactly what you're looking for</p>
                </div>
                
                <div class="filter-form">
                    <div class="filter-grid">
                        <div class="form-group">
                            <label for="tagFilter" class="form-label">Tags</label>
                            <select id="tagFilter" name="tag" class="form-select">
                                <option value="">All Filters</option>
                                {{TAG_OPTIONS}}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="neighborhoodFilter" class="form-label">Neighborhood</label>
                            <select id="neighborhoodFilter" name="neighborhood" class="form-select">
                                <option value="">All Neighborhoods</option>
                                {{NEIGHBORHOOD_OPTIONS}}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Results Section -->
    <section class="results-section">
        <div class="results-container">
            <div class="results-header">
                <h3 class="results-title">{{CATEGORY_NAME}} in the San Fernando Valley</h3>
                <span class="results-count" id="resultsCount">{{BUSINESS_COUNT}} businesses found</span>
            </div>
            
            <div class="business-grid" id="businessGrid">
                {{BUSINESS_CARDS}}
            </div>
            
            <div class="no-results" id="noResults" style="display: none;">
                <svg class="no-results-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
                </svg>
                <h4 class="no-results-title">No businesses found</h4>
                <p class="no-results-text">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="cta-container">
            <h2 class="cta-title">Don't see your business listed?</h2>
            <p class="cta-text">Join the San Fernando Valley Directory and connect with local customers in your area.</p>
            <a href="/#contact" class="cta-button">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your Business
            </a>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <p>&copy; 2025 San Fernando Valley Directory. Find local businesses in the SFV.</p>
            </div>
        </div>
    </footer>

    <script>
        // Filter functionality
        const tagFilter = document.getElementById('tagFilter');
        const neighborhoodFilter = document.getElementById('neighborhoodFilter');
        const businessGrid = document.getElementById('businessGrid');
        const noResults = document.getElementById('noResults');
        const resultsCount = document.getElementById('resultsCount');
        
        let allBusinesses = {{BUSINESSES_JSON}};
        let filteredBusinesses = [...allBusinesses];
        
        // Initialize filters
        function initializeFilters() {
            tagFilter.addEventListener('change', filterBusinesses);
            neighborhoodFilter.addEventListener('change', filterBusinesses);
            
            updateResults();
        }
        
        function filterBusinesses() {
            const selectedTag = tagFilter.value.toLowerCase();
            const selectedNeighborhood = neighborhoodFilter.value.toLowerCase();
            
            filteredBusinesses = allBusinesses.filter(business => {
                // Tag filter
                const matchesTag = !selectedTag || 
                    business.tags.some(tag => tag.toLowerCase() === selectedTag);
                
                // Neighborhood filter
                const matchesNeighborhood = !selectedNeighborhood || 
                    business.location.toLowerCase().includes(selectedNeighborhood);
                
                return matchesTag && matchesNeighborhood;
            });
            
            updateResults();
        }
        
        function updateResults() {
            // Update results count
            resultsCount.textContent = \`\${filteredBusinesses.length} businesses found\`;
            
            // Show/hide no results
            if (filteredBusinesses.length === 0) {
                businessGrid.style.display = 'none';
                noResults.style.display = 'block';
            } else {
                businessGrid.style.display = 'grid';
                noResults.style.display = 'none';
                
                // Update business cards
                businessGrid.innerHTML = filteredBusinesses.map(business => createBusinessCard(business)).join('');
            }
        }
        
        function createBusinessCard(business) {
            const tags = business.tags.map(tag => \`<span class="business-card-tag">\${tag}</span>\`).join('');
            
            return \`
                <a href="/business/\${business.slug}" class="business-card">
                    <div class="business-card-header">
                        <div class="business-card-category">\${business.category}</div>
                        <h3 class="business-card-title">\${business.name}</h3>
                        <p class="business-card-description">\${business.description}</p>
                        <div class="business-card-tags">\${tags}</div>
                    </div>
                    <div class="business-card-footer">
                        <div class="business-card-location">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            \${business.location}
                        </div>
                        <div class="business-card-actions">
                            <span class="action-btn action-btn-primary">View Details</span>
                        </div>
                    </div>
                </a>
            \`;
        }
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initializeFilters);
    </script>
</body>
</html>`;

// Helper functions
function generatePageTitle(categoryName) {
    return `${categoryName} in the San Fernando Valley`;
}

function generatePageDescription(categoryName, description) {
    return description;
}

function generateStructuredData(category) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": generatePageTitle(category.name),
        "description": generatePageDescription(category.name, category.description),
        "url": `https://sanfernandovalley.xyz/${category.slug}`,
        "mainEntity": {
            "@type": "ItemList",
            "name": `${category.name} in San Fernando Valley`,
            "description": category.description
        }
    };
    
    return JSON.stringify(structuredData, null, 2);
}

function generateTagOptions(categoryId, allTags, categoryTags) {
    // Get tags that are relevant to this category
    const relevantTags = categoryTags[categoryId] || [];
    
    if (relevantTags.length === 0) {
        return '<option value="">No filters available yet</option>';
    }
    
    return relevantTags.map(tag => 
        `<option value="${tag.toLowerCase()}">${tag}</option>`
    ).join('');
}

function generateNeighborhoodOptions(locationTags) {
    if (!locationTags || locationTags.length === 0) {
        return '<option value="">No neighborhoods available yet</option>';
    }
    
    return locationTags.map(tag => 
        `<option value="${tag.toLowerCase()}">${tag}</option>`
    ).join('');
}

function generateBusinessCards(businesses) {
    if (!businesses || businesses.length === 0) {
        return [];
    }
    
    return businesses.map(business => {
        const tags = business.business_tags?.map(bt => bt.tags?.name).filter(Boolean) || [];
        const locationTag = tags.find(tag => 
            business.business_tags?.find(bt => bt.tags?.tag_type === 'location' && bt.tags?.name === tag)
        ) || 'San Fernando Valley';
        
        return {
            name: business.name,
            slug: business.slug,
            description: business.description || `Find ${business.name} in the San Fernando Valley.`,
            category: business.categories?.name || 'Business',
            location: locationTag,
            tags: tags
        };
    });
}

function generateCategoryPage(category, businesses, allTags, categoryTags, locationTags) {
    const pageTitle = generatePageTitle(category.name);
    const pageDescription = generatePageDescription(category.name, category.description);
    const businessCards = generateBusinessCards(businesses);
    const tagOptions = generateTagOptions(category.id, allTags, categoryTags);
    const neighborhoodOptions = generateNeighborhoodOptions(locationTags);
    
    // Replace template variables
    const html = CATEGORY_PAGE_TEMPLATE
        .replace(/\{\{PAGE_TITLE\}\}/g, pageTitle)
        .replace(/\{\{PAGE_DESCRIPTION\}\}/g, pageDescription)
        .replace(/\{\{CANONICAL_URL\}\}/g, `https://sanfernandovalley.xyz/${category.slug}`)
        .replace(/\{\{CATEGORY_IMAGE\}\}/g, '') // Add category image URL if available
        .replace(/\{\{STRUCTURED_DATA\}\}/g, generateStructuredData(category))
        .replace(/\{\{CATEGORY_NAME\}\}/g, category.name)
        .replace(/\{\{TAG_OPTIONS\}\}/g, tagOptions)
        .replace(/\{\{NEIGHBORHOOD_OPTIONS\}\}/g, neighborhoodOptions)
        .replace(/\{\{BUSINESS_COUNT\}\}/g, businesses.length.toString())
        .replace(/\{\{BUSINESS_CARDS\}\}/g, businessCards.map(createBusinessCardHTML).join(''))
        .replace(/\{\{BUSINESSES_JSON\}\}/g, JSON.stringify(businessCards));
    
    return html;
}

function createBusinessCardHTML(business) {
    const tags = business.tags.map(tag => `<span class="business-card-tag">${tag}</span>`).join('');
    
    return `
        <a href="/business/${business.slug}" class="business-card">
            <div class="business-card-header">
                <div class="business-card-category">${business.category}</div>
                <h3 class="business-card-title">${business.name}</h3>
                <p class="business-card-description">${business.description}</p>
                <div class="business-card-tags">${tags}</div>
            </div>
            <div class="business-card-footer">
                <div class="business-card-location">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    ${business.location}
                </div>
                <div class="business-card-actions">
                    <span class="action-btn action-btn-primary">View Details</span>
                </div>
            </div>
        </a>
    `;
}

// Main function
async function generateCategoryPages() {
    console.log('🚀 Starting category page generation...');
    
    try {
        // Category pages will be created in the root directory
        const rootDir = __dirname;
        
        // Fetch all categories
        console.log('📊 Fetching categories from database...');
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (categoriesError) throw categoriesError;
        
        console.log(`📝 Found ${categories.length} categories to generate`);
        
        // Fetch all available tags for filtering
        console.log('🏷️ Fetching available tags...');
        const { data: tagsData, error: tagsError } = await supabase
            .from('tags')
            .select('name, tag_type')
            .order('name');

        if (tagsError) {
            console.warn('⚠️ Could not fetch tags:', tagsError.message);
        }

        const allTags = tagsData || [];
        const locationTags = allTags.filter(tag => tag.tag_type === 'location').map(tag => tag.name);
        console.log(`🏷️ Found ${allTags.length} total tags, ${locationTags.length} location tags`);

        // Get category-specific tags by fetching businesses and their tags
        const categoryTags = {};
        for (const category of categories) {
            const { data: businessTags, error: businessTagsError } = await supabase
                .from('businesses')
                .select(`
                    business_tags (
                        tags (name, tag_type)
                    )
                `)
                .eq('category_id', category.id)
                .eq('status', 'active');

            if (!businessTagsError && businessTags) {
                const tagNames = new Set();
                businessTags.forEach(business => {
                    business.business_tags?.forEach(bt => {
                        if (bt.tags && bt.tags.tag_type !== 'location') {
                            tagNames.add(bt.tags.name);
                        }
                    });
                });
                categoryTags[category.id] = Array.from(tagNames).sort();
            }
        }
        
        // Process each category
        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            console.log(`📄 Generating page ${i + 1}/${categories.length}: ${category.name}`);
            
            try {
                // Fetch businesses for this category
                const { data: businesses, error: businessError } = await supabase
                    .from('businesses')
                    .select(`
                        *,
                        categories (name, slug),
                        business_tags (
                            tags (name, slug, tag_type)
                        )
                    `)
                    .eq('category_id', category.id)
                    .eq('status', 'active');

                if (businessError) throw businessError;

                // Generate HTML
                const html = generateCategoryPage(category, businesses || [], allTags, categoryTags, locationTags);
                
                // Write file
                const filePath = path.join(rootDir, `${category.slug}.html`);
                await fs.writeFile(filePath, html, 'utf8');
                
                console.log(`✅ Generated: /${category.slug}.html (${businesses?.length || 0} businesses)`);
                
            } catch (error) {
                console.error(`❌ Error generating page for ${category.name}:`, error.message);
                // Continue with next category
            }
        }
        
        console.log('🎉 Category page generation completed!');
        console.log(`📁 Generated ${categories.length} category pages in root directory`);
        
    } catch (error) {
        console.error('💥 Error during category page generation:', error);
        process.exit(1);
    }
}

// Run the generator
if (require.main === module) {
    generateCategoryPages();
}

module.exports = { generateCategoryPages };
