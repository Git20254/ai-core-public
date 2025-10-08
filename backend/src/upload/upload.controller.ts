import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as Cloudinary } from 'cloudinary';
import * as multer from 'multer';
import * as streamifier from 'streamifier';

@Controller('upload')
export class UploadController {
  constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof Cloudinary) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('📂 File received:', file.originalname, file.mimetype, file.size);

    if (!file || !file.buffer || file.size === 0) {
      throw new Error('❌ No file buffer received.');
    }

    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'solares/uploads' },
        (error, result) => {
          if (error) {
            console.error('❌ Upload failed:', error);
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Upload failed: No result from Cloudinary.'));
          }

          console.log('✅ Upload success:', result.secure_url);
          resolve({
            message: '✅ File uploaded successfully!',
            url: result.secure_url,
          });
        },
      );

      // Pipe buffer correctly
      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }
}

