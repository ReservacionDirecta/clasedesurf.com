import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = process.env.STORAGE_PATH || path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
    }
});

router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Construct URL
        // We assume the server serves 'uploads' folder at /uploads route
        // So if backend is at http://api.com, file is at http://api.com/uploads/filename
        // We return the relative path that the frontend can use (or absolute if we prefer)
        // The current Class model uses "String" for images.
        // If the frontend accesses via the backend URL, we can return `{backendUrl}/uploads/{filename}` or just `/uploads/{filename}` if proxying.

        // If we return just `/uploads/filename`, the frontend (which is on :3000) might try to load it from :3000/uploads (404) unless proxy is set up or full URL is used.
        // Usually standard to return the full URL if storage is local static.

        const protocol = req.protocol;
        const host = req.get('host');
        const fullUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.json({ url: fullUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// List uploaded images
router.get('/', (req, res) => {
    try {
        const protocol = req.protocol;
        const host = req.get('host');

        if (!fs.existsSync(uploadDir)) {
            return res.json([]);
        }

        const files = fs.readdirSync(uploadDir);
        const images = files.filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));

        const sortedImages = images.map(file => {
            const stats = fs.statSync(path.join(uploadDir, file));
            return { file, mtime: stats.mtime };
        }).sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

        const imageUrls = sortedImages.map(img => ({
            url: `${protocol}://${host}/uploads/${img.file}`,
            name: img.file
        }));

        res.json(imageUrls);
    } catch (error) {
        console.error('List error:', error);
        res.status(500).json({ message: 'Failed to list images' });
    }
});

export default router;
