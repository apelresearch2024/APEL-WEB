import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

export const initCloudinary = () => {

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'apel_projects',
    resource_type: 'raw', // 'raw' is used for PDFs
    allowed_formats: ['pdf'],
  },
});

export const upload = multer({ storage });