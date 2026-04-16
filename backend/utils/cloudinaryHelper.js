import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

export const streamUpload = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        console.log(`[Cloudinary] Starting upload for buffer (size: ${fileBuffer.length}) into folder: ${folder}`);
        
        const stream = cloudinary.uploader.upload_stream(
            { 
                folder: folder,
                resource_type: 'auto'
            },
            (error, result) => {
                if (result) {
                    console.log('[Cloudinary] Upload success:', result.secure_url);
                    resolve(result);
                } else {
                    console.error('[Cloudinary] Upload Error Details:', error);
                    reject(error);
                }
            }
        );

        // More robust way to send buffer to the stream
        stream.end(fileBuffer);
    });
};


export const deleteMediaFromCloudinary = async (url) => {
    if (!url || !url.includes('cloudinary.com')) return;
    try {
        // Extract public_id from Cloudinary URL
        // Format: https://res.cloudinary.com/[cloud_name]/[resource_type]/upload/v[version]/[folder]/[public_id].[ext]
        const parts = url.split('/');
        const fileNameWithExt = parts.pop();
        const publicIdWithFolder = parts.slice(parts.indexOf('upload') + 2).join('/') + '/' + fileNameWithExt.split('.')[0];
        
        // Remove version number if it starts with 'v' followed by digits
        const cleanPublicId = publicIdWithFolder.replace(/^v\d+\//, '');

        await cloudinary.uploader.destroy(cleanPublicId);
        console.log('Cleanup: Deleted from Cloudinary:', cleanPublicId);
    } catch (err) {
        console.error('Cleanup Error: Failed to delete Cloudinary media:', err.message);
    }
};


