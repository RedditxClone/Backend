import { NestFactory } from '@nestjs/core';
import { SeederModule } from './utils/seeder/seeder.module';
import { SeederService } from './utils/seeder/seeder.service.';

async function bootstrap() {
  NestFactory.createApplicationContext(SeederModule).then((appContext) => {
    const seeder = appContext.get(SeederService);
    seeder.seed().finally(() => appContext.close());
  });
}
void bootstrap();
