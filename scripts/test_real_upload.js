import cloudinary from '../backend/config/cloudinary.js';
import fs from 'fs';

const testUpload = async () => {
    console.log('Testing Real Upload to Cloudinary...');
    try {
        // Create a tiny dummy image buffer (pixel)
        const dummyImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
        
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'test_folder' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(dummyImage);
        });

        console.log('Upload Success! URL:', result.secure_url);
    } catch (err) {
        console.error('Upload Failed:', err);
    }
};

testUpload();
