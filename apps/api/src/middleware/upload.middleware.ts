import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { Request } from 'express';
import { AppError } from '../utils/errors.js';

/** Allowed MIME types for file uploads */
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  document: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

const ALL_ALLOWED = [...ALLOWED_MIME_TYPES.image, ...ALLOWED_MIME_TYPES.document];

/** Allowed extensions */
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.docx', '.xlsx'];

/** Blocked executable extensions */
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.mjs',
  '.php', '.py', '.rb', '.pl', '.cgi', '.com', '.scr', '.pif',
  '.msi', '.dll', '.sys', '.jar', '.war', '.class',
];

/** Maximum file size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Generates a cryptographically random filename to prevent path traversal.
 */
function generateSafeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const random = crypto.randomBytes(16).toString('hex');
  return `${random}${ext}`;
}

/**
 * File filter: validates MIME type and extension.
 */
function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  const ext = path.extname(file.originalname).toLowerCase();

  // Block executable extensions
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    cb(new AppError(400, 'INVALID_FILE_TYPE', `File type ${ext} is not allowed`) as any);
    return;
  }

  // Check extension whitelist
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new AppError(400, 'INVALID_FILE_TYPE', `Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed`) as any);
    return;
  }

  // Check MIME type
  if (!ALL_ALLOWED.includes(file.mimetype)) {
    cb(new AppError(400, 'INVALID_MIME_TYPE', `MIME type ${file.mimetype} is not allowed`) as any);
    return;
  }

  cb(null, true);
}

/** Memory storage with random filenames */
const storage = multer.memoryStorage();

/**
 * Configured multer upload instance with security constraints.
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Max 5 files per request
    fieldNameSize: 100,
    fieldSize: 1024 * 1024, // 1 MB field value limit
  },
});

export { generateSafeFilename, ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, MAX_FILE_SIZE };
