import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null
        }
        else {
            const res = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto' });
            // console.log('File sucessfully uploaded on cloud', res.url);
            fs.unlinkSync(localFilePath)
            return res;
        }
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log(error);
        return null;
    }
}

const deleteVideoFromCloudinary = async (publicAssetId) => {
    try {
        if (!publicAssetId) {
            return null
        } else {
            const res = await cloudinary.api.delete_resources([`${publicAssetId}`], { resource_type: 'video' })
            return res
        }
    } catch (error) {
        console.log(error);
    }
}
const deleteImageFromCloudinary = async (publicAssetId) => {
    try {
        if (!publicAssetId) {
            return null
        } else {
            const res = await cloudinary.api.delete_resources([`${publicAssetId}`], { resource_type: 'image' })
            return res
        }
    } catch (error) {
        console.log(error);
    }
}
export { uploadOnCloudinary, deleteVideoFromCloudinary, deleteImageFromCloudinary }