import dotenv from 'dotenv';
dotenv.config()
import { v2 as cloudinary } from 'cloudinary';
import { unlink } from 'fs/promises';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET
});

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const uploadedFile = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });

        console.log('File uploaded on cloudinary:', uploadedFile.url);
        await unlink(localFilePath);
        return uploadedFile;

    } catch (error) {
        console.error('Error while uploading on cloudinary:', error);
        await unlink(localFilePath).catch(err => console.error('Failed to delete local file:', err));
        return null;
    }
};
