import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { SeederModule } from './utils/seeder/seeder.module';
import { SeederService } from './utils/seeder/seeder.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  const logger = appContext.get(Logger);
  const seeder = appContext.get(SeederService);

  try {
    await seeder.seed();
    logger.log('Seeding completed successfully!');
  } catch (error) {
    logger.error('Seeding failed!');
    logger.error(error);
  } finally {
    await appContext.close();
  }

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
}

void bootstrap();
