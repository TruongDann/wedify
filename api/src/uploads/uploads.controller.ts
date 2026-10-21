import { Controller, Get, Header, Param, Post, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UploadedImage, UploadsService } from './uploads.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('images')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  uploadImage(@UploadedFile() file?: UploadedImage) { return this.uploadsService.saveImage(file); }

  // Ảnh do khách hàng đã đăng nhập tải lên cho thiệp của mình (form nhập thông tin thiệp).
  @ApiBearerAuth()
  @Post('photos')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  uploadPhoto(@UploadedFile() file?: UploadedImage) { return this.uploadsService.saveImage(file); }

  @Public()
  @Get('images/:filename')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async getImage(@Param('filename') filename: string): Promise<StreamableFile> {
    return this.uploadsService.openImage(filename);
  }
}
