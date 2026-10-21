import { BadRequestException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { mkdir, stat, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { randomUUID } from 'crypto';

export interface UploadedImage {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
};

@Injectable()
export class UploadsService {
  private readonly imageDir: string;
  constructor(private config: ConfigService) {
    this.imageDir = resolve(config.get('STORAGE_ROOT', resolve(process.cwd(), 'storage')), 'images');
  }

  async saveImage(file?: UploadedImage) {
    if (!file) throw new BadRequestException('Vui lòng chọn file hình ảnh');
    const extension = EXTENSIONS[file.mimetype];
    if (!extension) throw new BadRequestException('Chỉ hỗ trợ JPG, PNG, WEBP hoặc GIF');
    if (file.size > 10 * 1024 * 1024) throw new BadRequestException('Hình ảnh không được vượt quá 10MB');
    await mkdir(this.imageDir, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(resolve(this.imageDir, filename), file.buffer, { flag: 'wx' });
    const baseUrl = this.config.get('PUBLIC_API_URL', 'http://localhost:4000/api/v1').replace(/\/$/, '');
    return { filename, url: `${baseUrl}/uploads/images/${filename}`, size: file.size, mimeType: file.mimetype };
  } 

  async openImage(filename: string) {
    if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(filename)) throw new NotFoundException('Không tìm thấy hình ảnh');
    const path = resolve(this.imageDir, filename);
    try { await stat(path); } catch { throw new NotFoundException('Không tìm thấy hình ảnh'); }
    const extension = filename.split('.').pop();
    const contentType = extension === 'jpg' ? 'image/jpeg' : `image/${extension}`;
    return new StreamableFile(createReadStream(path), { type: contentType, disposition: 'inline' });
  }
}
