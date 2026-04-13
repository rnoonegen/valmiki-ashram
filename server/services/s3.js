const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { randomUUID } = require('crypto');
const path = require('path');

function readS3Env() {
  const region = String(process.env.S3_REGION || '').trim();
  const spaceName = String(process.env.S3_SPACE_NAME || '').trim();
  const accessKeyId = String(process.env.S3_ACCESS_KEY_ID || '').trim();
  const secretAccessKey = String(process.env.S3_ACCESS_KEY_SECRET || '').trim();
  const endpoint =
    String(process.env.S3_ENDPOINT || '').trim() ||
    (region ? `https://${region}.digitaloceanspaces.com` : '');
  return { region, spaceName, accessKeyId, secretAccessKey, endpoint };
}

function assertS3Config() {
  const { region, spaceName, accessKeyId, secretAccessKey, endpoint } = readS3Env();
  const missing = [];
  if (!region) missing.push('S3_REGION');
  if (!spaceName) missing.push('S3_SPACE_NAME');
  if (!accessKeyId) missing.push('S3_ACCESS_KEY_ID');
  if (!secretAccessKey) missing.push('S3_ACCESS_KEY_SECRET');
  if (!endpoint && region) missing.push('S3_ENDPOINT');
  if (missing.length) {
    const err = new Error(
      `Missing S3 configuration: ${missing.join(', ')}. Set these in the server environment (e.g. Kubernetes Secret server-env). See docs/DEPLOY-DIGITALOCEAN.md Part F.`,
    );
    err.status = 500;
    throw err;
  }
  return { region, spaceName, accessKeyId, secretAccessKey, endpoint };
}

function createS3Client() {
  const { region, accessKeyId, secretAccessKey, endpoint } = assertS3Config();
  return new S3Client({
    region,
    endpoint,
    forcePathStyle: false,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

const baseFolder = 'valmiki-ashram';

function buildPublicUrl(objectKey, spaceName, region) {
  const customCdn = process.env.S3_PUBLIC_BASE_URL;
  if (customCdn) {
    return `${customCdn.replace(/\/$/, '')}/${objectKey}`;
  }
  return `https://${spaceName}.${region}.digitaloceanspaces.com/${objectKey}`;
}

async function uploadImage({ fileBuffer, mimeType, originalName, folder = 'misc' }) {
  const { spaceName, region } = assertS3Config();
  const client = createS3Client();
  const ext = path.extname(originalName || '') || '.jpg';
  const safeFolder = String(folder || 'misc').replace(/[^a-zA-Z0-9/_-]/g, '');
  const objectKey = `${baseFolder}/${safeFolder}/${Date.now()}-${randomUUID()}${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: spaceName,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: mimeType || 'application/octet-stream',
      ACL: 'public-read',
    })
  );

  return {
    key: objectKey,
    url: buildPublicUrl(objectKey, spaceName, region),
  };
}

async function deleteImage(objectKey) {
  const { spaceName } = assertS3Config();
  const client = createS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: spaceName,
      Key: objectKey,
    })
  );
}

module.exports = {
  uploadImage,
  deleteImage,
};
