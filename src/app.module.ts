import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';

import { AuthModule } from './auth/auth.module';
import { BlockModule } from './block/block.module';
import { CategoryModule } from './category/category.module';
import { FollowModule } from './follow/follow.module';
import { HealthModule } from './health/health.module';
import { MessageModule } from './message/message.module';
import { ControllerService } from './module/controller/controller.service';
import { NotificationModule } from './notification/notification.module';
import { PostCommentModule } from './post-comment/post-comment.module';
import { SearchModule } from './search/search.module';
import { SubredditModule } from './subreddit/subreddit.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './utils/mail/mail.module';

@Module({
  imports: [
    // for using .env variables
    ConfigModule.forRoot(),
    // connect to database using connection string
    MongooseModule.forRoot(process.env.DB_CONNECTION_STRING || ''),
    UserModule,
    // PostModule,
    // CommentModule,
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
    FollowModule,
    EmailModule,
    BlockModule,
    PostCommentModule,
    HealthModule,
  ],
  controllers: [],
  providers: [ControllerService],
})
export class AppModule {}
