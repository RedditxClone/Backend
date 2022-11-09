import { NestFactory } from '@nestjs/core';

import { SeederModule } from './utils/seeder/seeder.module';
import { SeederService } from './utils/seeder/seeder.service.';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  const seeder = appContext.get(SeederService);

  await seeder.seed();

  await appContext.close();
}

void bootstrap();
