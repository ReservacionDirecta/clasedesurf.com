import path from 'path';
import fs from 'fs';

// Determine storage path
// 1. Env var STORAGE_PATH
// 2. Production default: /storage/data (Railway Volume)
// 3. Fallback: ../../uploads (Local development)
export const getStoragePath = (): string => {
    if (process.env.STORAGE_PATH) {
        return process.env.STORAGE_PATH;
    }

    if (process.env.NODE_ENV === 'production') {
        return '/storage/data';
    }

    return path.join(__dirname, '../../uploads');
};

export const STORAGE_PATH = getStoragePath();

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_PATH)) {
    try {
        fs.mkdirSync(STORAGE_PATH, { recursive: true });
        console.log(`✅ Created storage directory at: ${STORAGE_PATH}`);
    } catch (error) {
        console.error(`❌ Failed to create storage directory at: ${STORAGE_PATH}`, error);
    }
} else {
    console.log(`📂 Storage directory exists at: ${STORAGE_PATH}`);
}

export default STORAGE_PATH;
