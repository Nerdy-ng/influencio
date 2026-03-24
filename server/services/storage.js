// ─────────────────────────────────────────────────────────────────────────────
//  Brandiór — Storage Service (S3 stub)
//  TODO: replace with real implementation using @aws-sdk/client-s3
// ─────────────────────────────────────────────────────────────────────────────

const BUCKET_BASE = 'https://brandior-assets.s3.amazonaws.com/uploads'

/**
 * Simulate uploading a file to S3.
 *
 * @param {Buffer}  buffer    - File content
 * @param {string}  filename  - Original filename
 * @param {string}  mimetype  - MIME type (e.g. 'image/png', 'video/mp4')
 * @returns {Promise<{ url: string, key: string }>}
 */
export async function uploadFile(buffer, filename, mimetype) {
  // TODO: replace with real S3 upload using @aws-sdk/client-s3
  //
  // Example real implementation:
  //
  // import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
  // const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-west-1' })
  // const key = `uploads/${Date.now()}-${filename}`
  // await s3.send(new PutObjectCommand({
  //   Bucket:      process.env.S3_BUCKET,
  //   Key:         key,
  //   Body:        buffer,
  //   ContentType: mimetype,
  //   ACL:         'public-read',
  // }))
  // return { url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`, key }

  console.log(`[Storage] Simulating upload: ${filename} (${mimetype}, ${buffer?.length ?? 0} bytes)`)

  const key = `${Date.now()}-${filename}`
  const url = `${BUCKET_BASE}/${key}`

  return { url, key }
}

/**
 * Simulate deleting a file from S3 by key.
 *
 * @param {string} key - S3 object key
 * @returns {Promise<void>}
 */
export async function deleteFile(key) {
  // TODO: replace with real S3 delete using @aws-sdk/client-s3
  //
  // Example:
  // import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
  // const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-west-1' })
  // await s3.send(new DeleteObjectCommand({
  //   Bucket: process.env.S3_BUCKET,
  //   Key:    key,
  // }))

  console.log(`[Storage] Simulating delete: ${key}`)
}

/**
 * Simulate generating a presigned URL for direct browser uploads.
 *
 * @param {string} filename  - Desired filename
 * @param {string} mimetype  - MIME type
 * @param {number} expiresIn - Seconds until expiry (default 300)
 * @returns {Promise<{ uploadUrl: string, publicUrl: string, key: string }>}
 */
export async function getPresignedUploadUrl(filename, mimetype, expiresIn = 300) {
  // TODO: replace with real presigned URL using @aws-sdk/s3-request-presigner
  console.log(`[Storage] Simulating presigned URL for: ${filename} (expires in ${expiresIn}s)`)

  const key       = `${Date.now()}-${filename}`
  const uploadUrl = `https://brandior-assets.s3.amazonaws.com/${key}?X-Amz-Expires=${expiresIn}&stub=true`
  const publicUrl = `${BUCKET_BASE}/${key}`

  return { uploadUrl, publicUrl, key }
}
