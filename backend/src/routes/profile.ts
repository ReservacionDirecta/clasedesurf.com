import express from 'express'
import multer from 'multer'
import cloudinary from 'cloudinary'

const router = express.Router()

// Configure Cloudinary (credentials should be in env vars)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
})

const storage = multer.memoryStorage()
const upload = multer({ storage })

// POST /profile/photo - upload a profile image (jpg/png)
router.post('/photo', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const mime = req.file.mimetype || 'image/jpeg'
    const base64 = req.file.buffer.toString('base64')
    const dataUri = `data:${mime};base64,${base64}`
    const result: any = await cloudinary.v2.uploader.upload(dataUri, {
      folder: 'student_profiles',
      overwrite: true
    })

    // Ideally persist result.secure_url to the user's profile in DB here
    res.json({ url: result.secure_url, public_id: result.public_id })
  } catch (e) {
    console.error('Profile image upload error:', e)
    res.status(500).json({ message: 'Image upload failed' })
  }
})

export default router
