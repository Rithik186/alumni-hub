import cloudinary from '../backend/config/cloudinary.js';
import dotenv from 'dotenv';
dotenv.config();

async function testUpload() {
  console.log('--- CLOUDINARY DIAGNOSTIC TEST ---');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  
  try {
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BvDAAF/gERv5eMogAAAABJRU5ErkJggg=='; // Tiny 1x1 pixel image
    console.log('Attempting tiny test upload...');
    
    const result = await cloudinary.uploader.upload(testImage, {
      folder: 'alumni_platform/test',
    });
    
    console.log('✅ SUCCESS!');
    console.log('URL:', result.secure_url);
  } catch (err) {
    console.error('❌ FAILED!');
    console.error('Error Message:', err.message);
    console.error('Full Error:', JSON.stringify(err, null, 2));
  }
}

testUpload();
