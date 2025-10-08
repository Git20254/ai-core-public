import { Injectable } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ original: string; sizes: { small: string; medium: string; large: string } }> {
    // Upload original file
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const uploadStream = Cloudinary.uploader.upload_stream(
        { folder: 'avatars' },
        (error, uploaded) => {
          if (error) reject(error);
          else resolve(uploaded as UploadApiResponse);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    // Generate variant URLs using Cloudinary transformations
    const publicId = result.public_id;
    const version = result.version;

    const small = Cloudinary.url(publicId, { width: 64, height: 64, crop: 'fill', version });
    const medium = Cloudinary.url(publicId, { width: 256, height: 256, crop: 'fill', version });
    const large = Cloudinary.url(publicId, { width: 1024, height: 1024, crop: 'fill', version });

    return {
      original: result.secure_url,
      sizes: { small, medium, large },
    };
  }
}

