import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefix all endpoinds with api/
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Redditx')
    .setDescription('The Redditx API description')
    .setVersion('1.0')
    .addTag('Redditx')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
