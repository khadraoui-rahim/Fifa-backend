# Cloudinary Setup Instructions

## 1. Install Cloudinary Package

Run the following command in the `server` directory:

```bash
npm install cloudinary
```

## 2. Add Cloudinary Credentials to .env

Add these environment variables to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### How to get your credentials:
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy your **Cloud Name**, **API Key**, and **API Secret**
3. Paste them into your `.env` file

## 3. Cloudinary Folder Structure

Make sure your Cloudinary folder is named: `fifa-simulator-laliga-teams`

### Team Logo Naming Convention

The script will search for logos using normalized team names. For best results, name your image files in Cloudinary like:

- `barcelona.png` or `fc-barcelona.png` for "FC Barcelona"
- `real-madrid.png` for "Real Madrid"
- `atletico-madrid.png` for "Atlético Madrid"

The script automatically:
- Converts team names to lowercase
- Replaces spaces with hyphens
- Removes special characters

## 4. Run the Import Script

```bash
node src/scripts/importTeams.js
```

The script will:
- Connect to MongoDB
- Read team data from CSV
- Search Cloudinary for matching logos
- Import teams with their logo URLs
- Show status for each team (✅ found, ⚠️ not found)

## 5. Verify

Check your MongoDB to ensure teams have the `logo` field populated with Cloudinary URLs.
