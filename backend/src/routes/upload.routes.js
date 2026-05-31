import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// Resolve paths in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter (accept images and videos)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP, SVG, and MP4/WEBM/QuickTime videos are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Single file upload route (Admin only, accepts any field name)
router.post('/', authMiddleware, adminMiddleware, (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return errorResponse(res, `Multer error: ${err.message}`, 400);
      }
      return errorResponse(res, err.message, 400);
    }

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'No file was uploaded', 400);
    }

    const file = req.files[0];
    // Return the relative URL to access the uploaded file
    const fileUrl = `/uploads/${file.filename}`;

    return successResponse(res, {
      url: fileUrl,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size
    }, 'File uploaded successfully', 201);
  });
});

export default router;
