const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 image string to Cloudinary.
 * @param {string} base64String - The data URI string (e.g. data:image/png;base64,...)
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadBase64Image = async (base64String) => {
  try {
    const response = await cloudinary.uploader.upload(base64String, {
      folder: 'streammate_profiles',
    });
    return response.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Image upload failed');
  }
};

module.exports = {
  uploadBase64Image,
};
