# FIFA Backend Setup Guide

## Quick Start

### First Time Setup
Run this command to import teams and start the server:
```bash
npm run setup
```

Or for development with auto-reload:
```bash
npm run dev-setup
```

## Available Scripts

### `npm start`
Starts the production server
- Checks database status on startup
- Shows warnings if data is missing

### `npm run dev`
Starts the development server with nodemon
- Auto-reloads on file changes
- Checks database status on startup

### `npm run import-teams`
Imports teams from CSV with Cloudinary logos
- Deletes existing teams
- Fetches logos from Cloudinary
- Imports team data with ratings

### `npm run setup`
First-time setup (imports teams + starts server)

### `npm run dev-setup`
First-time setup for development (imports teams + starts dev server)

## Startup Checks

When the server starts, it automatically:
1. ✅ Connects to MongoDB
2. 🔍 Checks if teams are in the database
3. 🔍 Checks if players are in the database
4. ⚠️  Shows warnings if data is missing
5. 🚀 Starts the server

## Manual Data Import

If you need to re-import teams:
```bash
npm run import-teams
```

## Environment Variables Required

Make sure your `.env` file contains:
```env
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
```

## Troubleshooting

### No teams found
Run: `npm run import-teams`

### No players found
Import your player data manually

### Server won't start
1. Check MongoDB connection
2. Verify environment variables
3. Check console for errors
