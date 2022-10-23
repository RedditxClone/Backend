import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    // for using .env variables
    ConfigModule.forRoot(),
    // connect to database using connection string
    MongooseModule.forRoot(process.env.DB_CONNECTION_STRING),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
