import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Search for a team logo in Cloudinary folder
 * @param {string} teamName - The name of the team
 * @param {string} folderName - The Cloudinary folder name (default: 'fifa-simulator-laliga-teams')
 * @returns {string} - The secure URL of the logo or empty string if not found
 */
export const getTeamLogoUrl = async (teamName, folderName = 'fifa-simulator-laliga-teams') => {
    try {
        // Normalize team name for search (replace spaces with underscores, remove special chars, lowercase)
        const normalizedTeamName = teamName
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');

        // Search for resources in the folder
        const result = await cloudinary.search
            .expression(`folder:${folderName}`)
            .max_results(500)
            .execute();

        // Find matching resource
        const matchingResource = result.resources.find(resource => {
            const publicId = resource.public_id.split('/').pop().toLowerCase();
            return publicId.includes(normalizedTeamName) || 
                   normalizedTeamName.includes(publicId) ||
                   publicId === normalizedTeamName;
        });

        if (matchingResource) {
            return matchingResource.secure_url;
        }

        console.log(`⚠️  No logo found for team: ${teamName}`);
        return '';
    } catch (error) {
        console.error(`❌ Error fetching logo for ${teamName}:`, error.message);
        return '';
    }
};

export default cloudinary;
