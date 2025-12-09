#!/bin/bash
# Script to start Vite dev server with .env loaded

cd "$(dirname "$0")"

# Load .env file
export $(cat .env | xargs)

# Show loaded variables for debugging
echo "🔍 Loaded VITE_STRIPE_PUBLISHABLE_KEY: $VITE_STRIPE_PUBLISHABLE_KEY"
echo "🔍 Loaded VITE_SUPABASE_URL: $VITE_SUPABASE_URL"

# Start dev server
npm run dev
