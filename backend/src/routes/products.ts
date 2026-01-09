import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const rootDir = process.env.STORAGE_PATH || path.join(__dirname, '../../uploads');
        const uploadDir = path.join(rootDir, 'products');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
});

// GET /api/products/public
// Get all active products for homepage (Public)
router.get('/public', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            include: { school: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 12 // Limit for homepage
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching public products:', error);
        res.status(500).json({ message: 'Error al obtener productos públicos' });
    }
});

// GET /api/products
// Get all products (Admin only)
router.get('/', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { school: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching all products:', error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
});

// GET /api/products/school/:schoolId
// Get all products for a specific school (Public or Admin)
router.get('/school/:schoolId', async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { category, activeOnly } = req.query;

        const whereClause: any = {
            schoolId: parseInt(schoolId)
        };

        if (activeOnly === 'true') {
            whereClause.isActive = true;
        }

        if (category) {
            whereClause.category = String(category);
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
});

// POST /api/products
// Create a new product (School Admin only)
router.post('/', requireAuth, requireRole(['SCHOOL_ADMIN', 'ADMIN']), upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, stock, category, schoolId } = req.body;

        // Validate required fields
        if (!name || !price || !schoolId) {
            return res.status(400).json({ message: 'Nombre, precio y ID de escuela son requeridos' });
        }

        const imagePath = req.file
            ? `/uploads/products/${req.file.filename}`
            : null;

        const product = await prisma.product.create({
            data: {
                schoolId: parseInt(schoolId),
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock || '0'),
                category,
                image: imagePath,
                isActive: true
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error al crear el producto' });
    }
});

// PUT /api/products/:id
// Update a product (School Admin only)
router.put('/:id', requireAuth, requireRole(['SCHOOL_ADMIN', 'ADMIN']), upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, category, isActive } = req.body;

        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Verify ownership (optional but recommended)
        // Here assume middleware checks user permissions for the school, but ideally check product.schoolId matches user's school

        const imagePath = req.file
            ? `/uploads/products/${req.file.filename}`
            : existingProduct.image;

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name: name || undefined,
                description: description || undefined,
                price: price ? parseFloat(price) : undefined,
                stock: stock ? parseInt(stock) : undefined,
                category: category || undefined,
                isActive: isActive !== undefined ? isActive === 'true' : undefined,
                image: imagePath
            }
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error al actualizar el producto' });
    }
});

// DELETE /api/products/:id
// Soft delete a product (School Admin only)
router.delete('/:id', requireAuth, requireRole(['SCHOOL_ADMIN', 'ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });

        res.json({ message: 'Producto desactivado correactmente', product });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error al eliminar el producto' });
    }
});

export default router;
