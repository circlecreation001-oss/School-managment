import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env.js';
import { logger } from './logger.js';

const s3Client = new S3Client({
  endpoint: env.s3Endpoint || undefined,
  region: env.s3Region,
  credentials: {
    accessKeyId: env.s3AccessKey,
    secretAccessKey: env.s3SecretKey,
  },
  forcePathStyle: true, // Required for MinIO and compatible providers
});

export interface UploadParams {
  key: string;
  body: Buffer | ReadableStream;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  key: string;
  url: string;
}

export async function uploadFile(params: UploadParams): Promise<UploadResult> {
  const command = new PutObjectCommand({
    Bucket: env.s3Bucket,
    Key: params.key,
    Body: params.body as Buffer,
    ContentType: params.contentType,
    Metadata: params.metadata,
  });

  await s3Client.send(command);

  const url = `${env.s3Endpoint}/${env.s3Bucket}/${params.key}`;
  logger.debug({ key: params.key }, 'File uploaded successfully');

  return { key: params.key, url };
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.s3Bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: env.s3Bucket,
    Key: key,
  });

  await s3Client.send(command);
  logger.debug({ key }, 'File deleted successfully');
}

export function generateFileKey(tenantId: string, folder: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${tenantId}/${folder}/${timestamp}-${sanitized}`;
}
