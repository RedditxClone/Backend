import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { rootMongooseTestModule } from '../mongooseInMemory';
import { SeederService } from './seeder.service.';

/**
 * Import and provide seeder classes.
 *
 * @module
 */
@Module({
  imports: [
    // for using .env variables
    ConfigModule.forRoot(),
    rootMongooseTestModule(),
    // connect to database using connection string
    // MongooseModule.forRoot(process.env.DB_CONNECTION_STRING),
    UserModule,
  ],
  controllers: [],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
