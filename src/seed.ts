import { NestFactory } from '@nestjs/core';
import { SeederModule } from './utils/seeder/seeder.module';
import { SeederService } from './utils/seeder/seeder.service.';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  const seeder = appContext.get(SeederService);
  try {
    await seeder.seed();
  } catch (err) {
    throw err;
  }

  await appContext.close();
  process.exit(0);
}

bootstrap();
