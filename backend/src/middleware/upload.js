import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import multer from 'multer';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(ApiError.badRequest('Only JPG, PNG, WebP or AVIF images are allowed'));
    }
    return cb(null, true);
  },
});

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'kharna/sarees', resource_type: 'image' },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });

const uploadToDisk = async (file) => {
  const dir = path.resolve(process.cwd(), 'uploads');
  await fs.mkdir(dir, { recursive: true });
  const ext = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  await fs.writeFile(path.join(dir, name), file.buffer);
  return `/uploads/${name}`;
};

export const saveImage = (file) =>
  isCloudinaryConfigured() ? uploadToCloudinary(file.buffer) : uploadToDisk(file);
