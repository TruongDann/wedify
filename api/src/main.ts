import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Thiệp lưu cả danh sách phần tử (hàng trăm phần tử + ảnh SVG nhúng) nên vượt giới hạn mặc định 100KB.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  app.useBodyParser('json', { limit: '5mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '5mb' });
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  const corsOrigins = [
    ...config.get('CORS_ORIGIN', 'http://localhost:3000').split(','),
    ...config.get('ADMIN_CORS_ORIGIN', 'http://localhost:3001').split(','),
  ].map((origin) => origin.trim()).filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // loai bo field khong khai bao trong DTO - tranh mass-assignment
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wedify API')
    .setDescription('REST API cho nen tang tao thiep cuoi online Wedify')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get('PORT', 4000);
  await app.listen(port);
  console.log(`Wedify API đang chạy tại http://localhost:${port}/api/v1`);
  console.log(`Swagger docs tại http://localhost:${port}/api/docs`);
}
bootstrap();
