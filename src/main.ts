import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());
  app.enableCors({ origin: '*' });

  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
    }),
  );

  app.setGlobalPrefix('api');
  app.set('trust proxy', true);

  const config = new DocumentBuilder()
    .setTitle('Sallat Backend API Documentation')
    .setDescription(
      `
## Overview
Sallat is a comprehensive delivery management system that handles trips, customers, vendors, and real-time notifications.
    `,
    )
    .setVersion('1.0')
    .addTag('Accounts', 'Account management endpoints')
    .addTag('Trips', 'Trip management endpoints')
    .addTag('Customers', 'Customer management endpoints')
    .addTag('Vendors', 'Vendor management endpoints')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Categories', 'Category management endpoints')
    .addTag('Error Logs', 'Error log management endpoints')
    .addTag('Sessions', 'Session managment endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('https://sallat.onrender.com', 'Production Server')
    .addServer('http://localhost:3000', 'Local Development')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
    },
    customSiteTitle: 'Sallat API Documentation',
  });

  app
    .getHttpAdapter()
    .getInstance()
    .get('/health', (_req, res) => {
      res.status(200).send('OK');
    });

  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
