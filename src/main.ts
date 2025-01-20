import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({ origin: '*' });

  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
     // disableErrorMessages: true,
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Sallat API')
    .addServer('https://sallat.onrender.com')
    .setDescription('Straightforward API documentation for Sallat')
    .setVersion('1.0')
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
