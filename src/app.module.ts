import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentModule } from './comment/comment.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { SubredditModule } from './subreddit/subreddit.module';
import { MessageModule } from './message/message.module';
import { NotificationModule } from './notification/notification.module';
import { SearchModule } from './search/search.module';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
