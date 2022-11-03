import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ControllerService } from './module/controller/controller.service';
import { EmailModule } from './utils/mail/mail.module';

@Module({
  imports: [
    // for using .env variables
    ConfigModule.forRoot(),
    // connect to database using connection string
    MongooseModule.forRoot(process.env.DB_CONNECTION_STRING),
    UserModule,
    PostModule,
    CommentModule,
    SubredditModule,
    MessageModule,
    NotificationModule,
    SearchModule,
    AuthModule,
    CategoryModule,
    MailerModule.forRoot({
      transport: {
        service: 'hotmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
    }),
    EmailModule,
  ],
  controllers: [],
  providers: [ControllerService],
})
export class AppModule {}
