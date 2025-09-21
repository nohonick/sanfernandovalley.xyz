#!/usr/bin/env node

/**
 * Static Site Generator for San Fernando Valley Business Directory
 * 
 * This script generates static HTML pages for all businesses in the database.
 * Run this whenever you add new businesses or update existing ones.
 * 
 * Usage:
 *   node generate-static-pages.js
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

// Business page template
const BUSINESS_PAGE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{BUSINESS_NAME}} | San Fernando Valley Directory</title>
    <meta name="description" content="{{BUSINESS_DESCRIPTION}}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{CANONICAL_URL}}">
    <meta property="og:title" content="{{BUSINESS_NAME}} | San Fernando Valley Directory">
    <meta property="og:description" content="{{BUSINESS_DESCRIPTION}}">
    <meta property="og:image" content="{{BUSINESS_IMAGE}}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{CANONICAL_URL}}">
    <meta property="twitter:title" content="{{BUSINESS_NAME}} | San Fernando Valley Directory">
    <meta property="twitter:description" content="{{BUSINESS_DESCRIPTION}}">
    <meta property="twitter:image" content="{{BUSINESS_IMAGE}}">

    <!-- Structured Data -->
    <script type="application/ld+json">
    {{STRUCTURED_DATA}}
    </script>

    <link rel="stylesheet" href="/styles.css">
    <style>
        /* Business Listing Specific Styles */
        .business-hero {
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            color: white;
            padding: 3rem 0;
            position: relative;
            overflow: hidden;
        }

        .business-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }

        .business-header {
            position: relative;
            z-index: 1;
        }

        .breadcrumb {
            display: flex;
            align-items: center;
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

        .business-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            line-height: 1.2;
        }

        .business-subtitle {
            font-size: 1.125rem;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 2rem;
        }

        .business-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-bottom: 2rem;
        }

        .business-tag {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 500;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .business-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .action-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.2s;
            border: 2px solid transparent;
        }

        .action-btn-primary {
            background: white;
            color: #2563eb;
            border-color: white;
        }

        .action-btn-primary:hover {
            background: rgba(255, 255, 255, 0.9);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .action-btn-secondary {
            background: transparent;
            color: white;
            border-color: rgba(255, 255, 255, 0.3);
        }

        .action-btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.5);
        }

        .business-content {
            padding: 3rem 0;
        }

        .content-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }

        @media (min-width: 1024px) {
            .content-grid {
                grid-template-columns: 2fr 1fr;
            }
        }

        .main-content {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .content-card {
            background: white;
            border-radius: 0.75rem;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
        }

        .content-card h2 {
            font-size: 1.5rem;
            font-weight: bold;
            color: #111827;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .content-card h2::before {
            content: '';
            width: 4px;
            height: 1.5rem;
            background: linear-gradient(135deg, #2563eb, #4f46e5);
            border-radius: 2px;
        }

        .contact-item {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .contact-item:last-child {
            margin-bottom: 0;
        }

        .contact-icon {
            width: 1.25rem;
            height: 1.25rem;
            color: #6b7280;
            margin-top: 0.125rem;
            flex-shrink: 0;
        }

        .contact-details h3 {
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.25rem;
        }

        .contact-details p {
            color: #6b7280;
            font-size: 0.875rem;
        }

        .contact-details a {
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
        }

        .contact-details a:hover {
            color: #1d4ed8;
            text-decoration: underline;
        }

        .hours-grid {
            display: grid;
            gap: 0.75rem;
        }

        .hours-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .hours-row:last-child {
            border-bottom: none;
        }

        .hours-day {
            font-weight: 500;
            color: #111827;
        }

        .hours-time {
            color: #6b7280;
            font-size: 0.875rem;
        }

        .hours-today {
            background: #eff6ff;
            border-radius: 0.375rem;
            padding: 0.5rem 0.75rem;
            margin: -0.5rem -0.75rem;
        }

        .hours-today .hours-day {
            color: #2563eb;
        }

        .hours-today .hours-time {
            color: #1e40af;
            font-weight: 500;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
        }

        .feature-category {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .feature-category h3 {
            font-size: 0.875rem;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .feature-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .feature-tag {
            display: inline-flex;
            align-items: center;
            padding: 0.375rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .feature-tag-specialization {
            background: #fef3c7;
            color: #92400e;
        }

        .feature-tag-amenity {
            background: #d1fae5;
            color: #065f46;
        }

        .feature-tag-payment {
            background: #e0e7ff;
            color: #3730a3;
        }

        .feature-tag-service {
            background: #dbeafe;
            color: #1e40af;
        }

        .related-business {
            display: block;
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid #e5e7eb;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s;
            margin-bottom: 0.75rem;
        }

        .related-business:hover {
            background: #f9fafb;
            border-color: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .related-business:last-child {
            margin-bottom: 0;
        }

        .related-business h3 {
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.25rem;
        }

        .related-business p {
            font-size: 0.875rem;
            color: #6b7280;
        }

        @media (max-width: 768px) {
            .business-title {
                font-size: 2rem;
            }
            
            .business-actions {
                flex-direction: column;
            }
            
            .action-btn {
                justify-content: center;
            }
            
            .content-card {
                padding: 1.5rem;
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

    <!-- Business Hero -->
    <section class="business-hero">
        <div class="container">
            <div class="business-header">
                <nav class="breadcrumb">
                    <a href="/">Home</a>
                    <span class="breadcrumb-separator">/</span>
                    <a href="/#categories">Categories</a>
                    <span class="breadcrumb-separator">/</span>
                    <a href="/#categories">{{CATEGORY_NAME}}</a>
                    <span class="breadcrumb-separator">/</span>
                    <span>{{BUSINESS_NAME}}</span>
                </nav>
                
                <h1 class="business-title">{{BUSINESS_NAME}}</h1>
                <p class="business-subtitle">{{CATEGORY_NAME}}{{LOCATION_TAG}}</p>
                
                <div class="business-tags">
                    {{BUSINESS_TAGS}}
                </div>
                
                <div class="business-actions">
                    {{ACTION_BUTTONS}}
                </div>
            </div>
        </div>
    </section>

    <!-- Business Content -->
    <section class="business-content">
        <div class="container">
            <div class="content-grid">
                <!-- Main Content -->
                <div class="main-content">
                    <!-- About Section -->
                    {{ABOUT_SECTION}}
                    
                    <!-- Contact Information -->
                    <div class="content-card">
                        <h2>
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Contact Information
                        </h2>
                        {{CONTACT_INFO}}
                    </div>

                    <!-- Features & Amenities -->
                    {{FEATURES_SECTION}}
                </div>

                <!-- Sidebar -->
                <div class="sidebar">
                    <!-- Business Hours -->
                    {{HOURS_SECTION}}

                    <!-- Related Businesses -->
                    {{RELATED_SECTION}}
                </div>
            </div>
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
</body>
</html>`;

// Helper functions
function formatBusinessHours(hoursData) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formattedHours = [];
    const today = new Date().getDay();
    
    hoursData.forEach(hour => {
        const dayName = days[hour.day_of_week];
        let timeString = '';
        
        if (hour.is_24_hour) {
            timeString = '24 Hours';
        } else if (hour.is_closed) {
            timeString = 'Closed';
        } else {
            const openTime = new Date(`2000-01-01T${hour.open_time}`).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });
            const closeTime = new Date(`2000-01-01T${hour.close_time}`).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });
            timeString = `${openTime} - ${closeTime}`;
        }
        
        formattedHours.push({
            day: dayName,
            time: timeString,
            isToday: hour.day_of_week === today
        });
    });

    return formattedHours;
}

function categorizeTagsByType(businessTags) {
    const categorized = {
        payment: [],
        amenity: [],
        location: [],
        specialization: [],
        pricing: [],
        service: [],
        urgency: []
    };

    businessTags?.forEach(bt => {
        if (bt.tags) {
            categorized[bt.tags.tag_type]?.push(bt.tags);
        }
    });

    return categorized;
}

function generateGoogleMapsUrl(address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function generateStructuredData(business) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": business.categories?.name === 'Restaurants' ? 'Restaurant' : 'LocalBusiness',
        "name": business.name,
        "description": business.description,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": business.address
        },
        "telephone": business.phone,
        "url": business.website
    };
    
    return JSON.stringify(structuredData, null, 2);
}

function generateBusinessPage(business, businessHours, relatedBusinesses) {
    const categorizedTags = categorizeTagsByType(business.business_tags);
    const formattedHours = formatBusinessHours(businessHours);
    const locationTag = categorizedTags.location[0]?.name;
    
    // Generate business tags HTML
    let businessTagsHTML = `<span class="business-tag">${business.categories?.name}</span>`;
    categorizedTags.location.forEach(tag => {
        businessTagsHTML += `<span class="business-tag">${tag.name}</span>`;
    });
    
    // Generate action buttons HTML
    let actionButtonsHTML = '';
    if (business.phone) {
        actionButtonsHTML += `
            <a href="tel:${business.phone}" class="action-btn action-btn-primary">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Now
            </a>
        `;
    }
    actionButtonsHTML += `
        <a href="${generateGoogleMapsUrl(business.address)}" target="_blank" rel="noopener noreferrer" class="action-btn action-btn-secondary">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Get Directions
        </a>
    `;
    if (business.website) {
        actionButtonsHTML += `
            <a href="${business.website}" target="_blank" rel="noopener noreferrer" class="action-btn action-btn-secondary">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Visit Website
            </a>
        `;
    }
    
    // Generate about section
    let aboutSectionHTML = '';
    if (business.description) {
        aboutSectionHTML = `
            <div class="content-card">
                <h2>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    About
                </h2>
                <p>${business.description}</p>
            </div>
        `;
    }
    
    // Generate contact info
    let contactInfoHTML = `
        <div class="contact-item">
            <svg class="contact-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div class="contact-details">
                <h3>Address</h3>
                <p>${business.address}</p>
                <a href="${generateGoogleMapsUrl(business.address)}" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
            </div>
        </div>
    `;

    if (business.phone) {
        contactInfoHTML += `
            <div class="contact-item">
                <svg class="contact-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div class="contact-details">
                    <h3>Phone</h3>
                    <p><a href="tel:${business.phone}">${business.phone}</a></p>
                </div>
            </div>
        `;
    }

    if (business.website) {
        contactInfoHTML += `
            <div class="contact-item">
                <svg class="contact-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <div class="contact-details">
                    <h3>Website</h3>
                    <p><a href="${business.website}" target="_blank" rel="noopener noreferrer">Visit Website</a></p>
                </div>
            </div>
        `;
    }
    
    // Generate features section
    let featuresSectionHTML = '';
    const tagCategories = [
        { key: 'specialization', label: 'Specializations', class: 'feature-tag-specialization' },
        { key: 'amenity', label: 'Amenities', class: 'feature-tag-amenity' },
        { key: 'payment', label: 'Payment Methods', class: 'feature-tag-payment' },
        { key: 'service', label: 'Services', class: 'feature-tag-service' }
    ];

    let featuresHTML = '';
    tagCategories.forEach(category => {
        if (categorizedTags[category.key].length > 0) {
            featuresHTML += `
                <div class="feature-category">
                    <h3>${category.label}</h3>
                    <div class="feature-tags">
            `;
            categorizedTags[category.key].forEach(tag => {
                featuresHTML += `<span class="feature-tag ${category.class}">${tag.name}</span>`;
            });
            featuresHTML += '</div></div>';
        }
    });

    if (featuresHTML) {
        featuresSectionHTML = `
            <div class="content-card">
                <h2>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Features & Amenities
                </h2>
                <div class="features-grid">
                    ${featuresHTML}
                </div>
            </div>
        `;
    }
    
    // Generate hours section
    let hoursSectionHTML = '';
    if (formattedHours.length > 0) {
        let hoursHTML = '';
        formattedHours.forEach(hour => {
            const rowClass = hour.isToday ? 'hours-row hours-today' : 'hours-row';
            hoursHTML += `
                <div class="${rowClass}">
                    <span class="hours-day">${hour.day}</span>
                    <span class="hours-time">${hour.time}</span>
                </div>
            `;
        });
        
        hoursSectionHTML = `
            <div class="content-card">
                <h2>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Hours
                </h2>
                <div class="hours-grid">
                    ${hoursHTML}
                </div>
            </div>
        `;
    }
    
    // Generate related businesses section
    let relatedSectionHTML = '';
    if (relatedBusinesses.length > 0) {
        let relatedHTML = '';
        relatedBusinesses.slice(0, 5).forEach(relatedBusiness => {
            const relatedLocationTag = relatedBusiness.business_tags?.find(bt => 
                bt.tags?.tag_type === 'location'
            )?.tags?.name;
            
            relatedHTML += `
                <a href="/business/${relatedBusiness.slug}" class="related-business">
                    <h3>${relatedBusiness.name}</h3>
                    ${relatedLocationTag ? `<p>${relatedLocationTag}</p>` : ''}
                </a>
            `;
        });
        
        relatedSectionHTML = `
            <div class="content-card">
                <h2>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>More ${business.categories?.name}</span>
                </h2>
                <div>
                    ${relatedHTML}
                </div>
            </div>
        `;
    }
    
    // Replace template variables
    const html = BUSINESS_PAGE_TEMPLATE
        .replace(/\{\{BUSINESS_NAME\}\}/g, business.name)
        .replace(/\{\{BUSINESS_DESCRIPTION\}\}/g, business.description || `Find ${business.name} in the San Fernando Valley. ${business.categories?.name || 'Local business'} with contact information, hours, and more.`)
        .replace(/\{\{CANONICAL_URL\}\}/g, `https://sanfernandovalley.xyz/business/${business.slug}`)
        .replace(/\{\{BUSINESS_IMAGE\}\}/g, '') // Add business image URL if available
        .replace(/\{\{STRUCTURED_DATA\}\}/g, generateStructuredData(business))
        .replace(/\{\{CATEGORY_NAME\}\}/g, business.categories?.name || 'Business')
        .replace(/\{\{LOCATION_TAG\}\}/g, locationTag ? ` • ${locationTag}` : '')
        .replace(/\{\{BUSINESS_TAGS\}\}/g, businessTagsHTML)
        .replace(/\{\{ACTION_BUTTONS\}\}/g, actionButtonsHTML)
        .replace(/\{\{ABOUT_SECTION\}\}/g, aboutSectionHTML)
        .replace(/\{\{CONTACT_INFO\}\}/g, contactInfoHTML)
        .replace(/\{\{FEATURES_SECTION\}\}/g, featuresSectionHTML)
        .replace(/\{\{HOURS_SECTION\}\}/g, hoursSectionHTML)
        .replace(/\{\{RELATED_SECTION\}\}/g, relatedSectionHTML);
    
    return html;
}

// Main function
async function generateStaticPages() {
    console.log('🚀 Starting static page generation...');
    
    try {
        // Create business directory
        const businessDir = path.join(__dirname, 'business');
        await fs.ensureDir(businessDir);
        
        // Fetch all active businesses
        console.log('📊 Fetching businesses from database...');
        const { data: businesses, error: businessError } = await supabase
            .from('businesses')
            .select(`
                *,
                categories (name, slug)
            `)
            .eq('status', 'active');

        if (businessError) throw businessError;
        
        console.log(`📝 Found ${businesses.length} businesses to generate`);
        
        // Process each business
        for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];
            console.log(`📄 Generating page ${i + 1}/${businesses.length}: ${business.name}`);
            
            try {
                // Fetch business tags
                const { data: tagsData, error: tagsError } = await supabase
                    .from('business_tags')
                    .select(`
                        tags (name, slug, tag_type)
                    `)
                    .eq('business_id', business.id);

                if (tagsError) throw tagsError;
                business.business_tags = tagsData || [];

                // Fetch business hours
                const { data: hoursData, error: hoursError } = await supabase
                    .from('business_hours')
                    .select('*')
                    .eq('business_id', business.id)
                    .order('day_of_week');

                if (hoursError) throw hoursError;

                // Fetch related businesses
                const { data: relatedData, error: relatedError } = await supabase
                    .from('businesses')
                    .select(`
                        *,
                        categories (name, slug)
                    `)
                    .eq('category_id', business.category_id)
                    .neq('id', business.id)
                    .eq('status', 'active')
                    .limit(5);

                if (relatedError) throw relatedError;

                // Fetch tags for related businesses
                if (relatedData && relatedData.length > 0) {
                    const relatedBusinessIds = relatedData.map(b => b.id);
                    const { data: relatedTagsData, error: relatedTagsError } = await supabase
                        .from('business_tags')
                        .select(`
                            business_id,
                            tags (name, slug, tag_type)
                        `)
                        .in('business_id', relatedBusinessIds);

                    if (!relatedTagsError && relatedTagsData) {
                        const tagsByBusiness = {};
                        relatedTagsData.forEach(item => {
                            if (!tagsByBusiness[item.business_id]) {
                                tagsByBusiness[item.business_id] = [];
                            }
                            tagsByBusiness[item.business_id].push(item);
                        });

                        relatedData.forEach(relatedBusiness => {
                            relatedBusiness.business_tags = tagsByBusiness[relatedBusiness.id] || [];
                        });
                    }
                }

                // Generate HTML
                const html = generateBusinessPage(business, hoursData || [], relatedData || []);
                
                // Write file
                const filePath = path.join(businessDir, `${business.slug}.html`);
                await fs.writeFile(filePath, html, 'utf8');
                
                console.log(`✅ Generated: /business/${business.slug}.html`);
                
            } catch (error) {
                console.error(`❌ Error generating page for ${business.name}:`, error.message);
                // Continue with next business
            }
        }
        
        console.log('🎉 Static page generation completed!');
        console.log(`📁 Generated ${businesses.length} business pages in /business/ directory`);
        
    } catch (error) {
        console.error('💥 Error during static page generation:', error);
        process.exit(1);
    }
}

// Run the generator
if (require.main === module) {
    generateStaticPages();
}

module.exports = { generateStaticPages };
