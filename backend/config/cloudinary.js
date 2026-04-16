import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
});


console.log('Cloudinary Config Check:', {
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME ? 'CONNECTED' : 'MISSING'),
    api_key: (process.env.CLOUDINARY_API_KEY ? 'CONNECTED' : 'MISSING'),
    api_secret: (process.env.CLOUDINARY_API_SECRET ? 'CONNECTED' : 'MISSING')
});




export default cloudinary;
