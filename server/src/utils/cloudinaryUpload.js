import { v2 as cloudinary } from 'cloudinary';
import { bufferToStream } from './certificateGenerator.js';

/**
 * Configure Cloudinary
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload PDF certificate to Cloudinary
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} verificationCode - Unique verification code for filename
 * @returns {Promise<string>} - Cloudinary URL of uploaded PDF
 */
export async function uploadCertificatePDF(pdfBuffer, verificationCode) {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw', // Upload as raw file (not image)
          public_id: `certificates/${verificationCode}`,
          folder: 'anther-academy/certificates',
          format: 'pdf',
          overwrite: true,
          access_control: [{ access_type: 'token' }], // Optional: control access
        },
        (error, result) => {
          if (error) {
            console.error('🔴 Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log(`✅ Certificate uploaded to Cloudinary: ${result.secure_url}`);
            resolve(result.secure_url);
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const stream = bufferToStream(pdfBuffer);
      stream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('🔴 Certificate upload error:', error.message);
    throw error;
  }
}

/**
 * Upload to Cloudinary with authentication (for sensitive/private documents)
 * Used for: passport photos, credentials, personal documents
 * Returns: Secure URL (requires signed token to access) + public_id
 * @param {File|Buffer} file - File to upload
 * @param {string} folder - Cloudinary folder path (e.g., 'programme-applications')
 * @returns {Promise<{secure_url, public_id}>} - Upload result
 */
export async function uploadAuthenticatedToCloudinary(file, folder = 'authenticated-uploads') {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // Auto-detect: image, pdf, etc
          folder: `anther-academy/${folder}`,
          type: 'authenticated', // 🔒 CRITICAL: Authenticated access (not public)
          access_type: 'authenticated', // Only accessible with valid token
          timeout: 60000,
        },
        (error, result) => {
          if (error) {
            console.error(`🔴 Authenticated upload error (${folder}):`, error);
            reject(error);
          } else {
            console.log(`✅ Authenticated document uploaded: ${result.public_id}`);
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              bytes: result.bytes,
              format: result.format,
            });
          }
        }
      );

      // Handle both file objects and buffers
      if (file.buffer) {
        // Express multipart file
        const stream = bufferToStream(file.buffer);
        stream.pipe(uploadStream);
      } else if (Buffer.isBuffer(file)) {
        // Raw buffer
        const stream = bufferToStream(file);
        stream.pipe(uploadStream);
      } else {
        reject(new Error('Invalid file format'));
      }
    });
  } catch (error) {
    console.error('🔴 Authenticated upload error:', error.message);
    throw error;
  }
}

/**
 * Generate signed URL for authenticated Cloudinary asset
 * Authenticated assets require a signed URL to access
 * @param {string} publicId - Cloudinary public_id
 * @param {number} expirySeconds - URL expiry time in seconds (default: 3600 = 1 hour)
 * @returns {string} - Signed URL that can be used to access the authenticated resource
 */
export function generateSignedCloudinaryUrl(publicId, expirySeconds = 3600) {
  try {
    // Generate signed URL using Cloudinary SDK
    const url = cloudinary.url(publicId, {
      secure: true,
      sign_url: true,
      type: 'authenticated',
      resource_type: 'auto',
      expires_at: Math.floor(Date.now() / 1000) + expirySeconds,
    });
    return url;
  } catch (error) {
    console.error('🔴 Error generating signed URL:', error);
    // Fallback: return unsigned URL (will require authentication at delivery)
    return cloudinary.url(publicId, { secure: true, type: 'authenticated' });
  }
}


