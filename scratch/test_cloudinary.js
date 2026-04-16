import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
  timeout: 60000,
});

const streamUpload = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        console.log('Starting upload_stream...');
        const stream = cloudinary.uploader.upload_stream(
            { 
                folder: folder,
                resource_type: 'auto'
            },
            (error, result) => {
                if (result) {
                    console.log('Upload success!');
                    resolve(result);
                } else {
                    console.error('Upload error:', error);
                    reject(error);
                }
            }
        );
        
        console.log('Piping buffer...');
        Readable.from(fileBuffer).pipe(stream);
        
        // Listen for events
        stream.on('error', (err) => console.error('Stream error event:', err));
        stream.on('finish', () => console.log('Stream finish event'));
    });
};

const runTest = async () => {
    try {
        const dummyBuffer = Buffer.from('Testing cloudinary upload');
        console.log('Test Buffer created, size:', dummyBuffer.length);
        const result = await streamUpload(dummyBuffer, 'test_folder');
        console.log('Result URL:', result.secure_url);
    } catch (err) {
        console.error('Test Failed:', err);
    }
};

runTest();
