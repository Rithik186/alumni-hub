import cloudinary from '../backend/config/cloudinary.js';

const testCloudinary = async () => {
    console.log('Testing Cloudinary Connection...');
    console.log('Config:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing'
    });

    try {
        const result = await cloudinary.api.ping();
        console.log('Cloudinary Ping Success:', result);
    } catch (err) {
        console.error('Cloudinary Ping Failed:', err.message);
    }
};

testCloudinary();
