const fs = require('fs');
const path = require('path');

const requiredMarketingVars = {
    NEXT_PUBLIC_COMPANY_NAME: {
        required: true,
        validate: (val) => val.length > 0 && val.length <= 50
    },
    NEXT_PUBLIC_META_DESCRIPTION: {
        required: true,
        validate: (val) => val.length >= 50 && val.length <= 160
    },
    NEXT_PUBLIC_META_KEYWORDS: {
        required: true,
        validate: (val) => val.split(',').length >= 3
    },
    NEXT_PUBLIC_CONTACT_EMAIL: {
        required: true,
        validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    },
    NEXT_PUBLIC_SOCIAL_LINKS: {
        required: true,
        validate: (val) => {
            try {
                const links = JSON.parse(val);
                return links.twitter || links.linkedin;
            } catch {
                return false;
            }
        }
    },
    NEXT_PUBLIC_FEATURES_CONFIG: {
        required: true,
        validate: (val) => {
            try {
                return Object.keys(JSON.parse(val)).length > 0;
            } catch {
                return false;
            }
        }
    },
    NEXT_PUBLIC_OG_IMAGE_URL: {
        required: true,
        validate: (val) => val.startsWith('https://')
    }
};

const requiredUIUXVars = {
    // Theme and Styling
    NEXT_PUBLIC_UI_THEME: {
        required: true,
        validate: (val) => ['modern', 'classic', 'minimal'].includes(val)
    },
    NEXT_PUBLIC_COLOR_SCHEME: {
        required: true,
        validate: (val) => {
            try {
                const colors = JSON.parse(val);
                return colors.primary && colors.secondary && isValidHexColor(colors.primary);
            } catch {
                return false;
            }
        }
    },
    NEXT_PUBLIC_FONT_FAMILY: {
        required: true,
        validate: (val) => {
            try {
                const fonts = JSON.parse(val);
                return fonts.heading && fonts.body;
            } catch {
                return false;
            }
        }
    },

    // User Experience
    NEXT_PUBLIC_ANIMATION_SPEED: {
        required: true,
        validate: (val) => !isNaN(val) && val >= 100 && val <= 1000
    },
    NEXT_PUBLIC_PAGE_SIZE: {
        required: true,
        validate: (val) => !isNaN(val) && val > 0 && val <= 100
    },

    // Accessibility
    NEXT_PUBLIC_MIN_FONT_SIZE: {
        required: true,
        validate: (val) => val.endsWith('px') && parseInt(val) >= 16
    },
    NEXT_PUBLIC_LINE_HEIGHT: {
        required: true,
        validate: (val) => !isNaN(val) && parseFloat(val) >= 1.4
    },

    // Layout
    NEXT_PUBLIC_MAX_CONTENT_WIDTH: {
        required: true,
        validate: (val) => val.endsWith('px') && parseInt(val) > 0
    },
    NEXT_PUBLIC_GRID_BREAKPOINTS: {
        required: true,
        validate: (val) => {
            try {
                const breakpoints = JSON.parse(val);
                return breakpoints.sm && breakpoints.md && breakpoints.lg;
            } catch {
                return false;
            }
        }
    }
};

// Helper function to validate hex colors
function isValidHexColor(color) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

function validateEnvFile(envPath) {
    if (!fs.existsSync(envPath)) {
        console.error(`❌ Environment file not found: ${envPath}`);
        return false;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = Object.fromEntries(
        envContent
            .split('\n')
            .filter(line => line && !line.startsWith('#'))
            .map(line => line.split('='))
            .map(([key, ...val]) => [key, val.join('=')])
    );

    let isValid = true;
    const errors = [];
    const warnings = [];

    // Validate required marketing variables
    for (const [varName, config] of Object.entries(requiredMarketingVars)) {
        if (!envVars[varName] && config.required) {
            errors.push(`❌ Missing required variable: ${varName}`);
            isValid = false;
            continue;
        }

        if (envVars[varName] && !config.validate(envVars[varName])) {
            errors.push(`❌ Invalid value for ${varName}`);
            isValid = false;
        }
    }

    // Validate UI/UX variables
    for (const [varName, config] of Object.entries(requiredUIUXVars)) {
        if (!envVars[varName] && config.required) {
            errors.push(`❌ Missing required UI/UX variable: ${varName}`);
            isValid = false;
            continue;
        }

        if (envVars[varName] && !config.validate(envVars[varName])) {
            errors.push(`❌ Invalid value for ${varName}`);
            isValid = false;
        }
    }

    // Check for SEO optimization
    if (!envVars.NEXT_PUBLIC_META_DESCRIPTION || envVars.NEXT_PUBLIC_META_DESCRIPTION.length < 50) {
        warnings.push('⚠️ Meta description should be at least 50 characters for better SEO');
    }

    // Check for performance configuration
    if (!envVars.NEXT_PUBLIC_IMAGE_OPTIMIZATION) {
        warnings.push('⚠️ Image optimization is not enabled');
    }

    if (!envVars.NEXT_PUBLIC_CDN_URL) {
        warnings.push('⚠️ CDN URL is not configured');
    }

    // Performance Checks
    if (!envVars.NEXT_PUBLIC_LAZY_LOAD_IMAGES) {
        warnings.push('⚠️ Image lazy loading is not enabled');
    }

    if (!envVars.NEXT_PUBLIC_PRELOAD_FONTS) {
        warnings.push('⚠️ Font preloading is not enabled');
    }

    // Accessibility Checks
    if (!envVars.NEXT_PUBLIC_ENABLE_SCREEN_READER_HINTS) {
        warnings.push('⚠️ Screen reader hints are not enabled');
    }

    if (!envVars.NEXT_PUBLIC_FOCUS_VISIBLE) {
        warnings.push('⚠️ Visible focus indicators are not enabled');
    }

    // User Experience Checks
    if (!envVars.NEXT_PUBLIC_ENABLE_PROGRESSIVE_LOADING) {
        warnings.push('⚠️ Progressive loading is not enabled');
    }

    if (!envVars.NEXT_PUBLIC_ENABLE_TOUR_GUIDE) {
        warnings.push('⚠️ User onboarding tour is not enabled');
    }

    // Output results
    console.log(`\nValidating ${path.basename(envPath)}:`);
    
    if (errors.length > 0) {
        console.log('\nErrors:');
        errors.forEach(error => console.log(error));
    }

    if (warnings.length > 0) {
        console.log('\nWarnings:');
        warnings.forEach(warning => console.log(warning));
    }

    if (isValid && warnings.length === 0) {
        console.log('✅ All marketing and UI/UX configurations are valid!');
    }

    return isValid;
}

// Validate production environment
console.log('\n=== Marketing and UI/UX Environment Validation ===');
const isValid = validateEnvFile('.env.production');

if (!isValid) {
    console.log('\n❌ Please fix the above errors before deploying to production.');
    process.exit(1);
}

console.log('\n✅ Validation complete!'); 