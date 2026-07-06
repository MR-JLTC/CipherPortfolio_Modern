const fs = require('fs');
const path = require('path');

// --- Read credentials ---
// On Netlify: process.env is populated from the Netlify dashboard environment variables.
// Locally: falls back to parsing your .env file.
let url = process.env.SUPABASE_URL || '';
let key = process.env.SUPABASE_ANON_KEY || '';

// Local fallback: parse .env file if env vars are not set
if (!url || !key) {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf-8');
        envFile.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            if (trimmed.startsWith('SUPABASE_URL=') && !url) {
                url = trimmed.substring('SUPABASE_URL='.length).trim();
            }
            if (trimmed.startsWith('SUPABASE_ANON_KEY=') && !key) {
                key = trimmed.substring('SUPABASE_ANON_KEY='.length).trim();
            }
        });
        console.log('📄 Loaded credentials from local .env file.');
    }
}

if (!url || !key) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in Netlify Environment Variables (or in .env for local use).');
    process.exit(1);
}

// --- Write js/supabaseConfig.js ---
const configPath = path.join(__dirname, 'js', 'supabaseConfig.js');
const jsContent = `// AUTO-GENERATED — DO NOT EDIT.
// On Netlify: generated from dashboard Environment Variables at build time.
// Locally: generated from .env by running: node generate-config.js
window.SUPABASE_URL = '${url}';
window.SUPABASE_ANON_KEY = '${key}';
`;

fs.writeFileSync(configPath, jsContent);
console.log('✅ Successfully generated js/supabaseConfig.js from environment variables.');
