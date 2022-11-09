import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from './../../user/user.module';
import { SeederService } from './seeder.service';

/**
 * Import and provide seeder classes.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_CONNECTION_STRING || ''),
    UserModule,
  ],
  controllers: [],
  providers: [SeederService, Logger],
  exports: [SeederService],
})
export class SeederModule {}