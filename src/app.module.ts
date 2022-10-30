import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { MessageModule } from './message/message.module';
import { NotificationModule } from './notification/notification.module';
import { PostModule } from './post/post.module';
import { SearchModule } from './search/search.module';
import { SubredditModule } from './subreddit/subreddit.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    // for using .env variables
    ConfigModule.forRoot(),
    // connect to database using connection string
    // MongooseModule.forRoot(process.env.DB_CONNECTION_STRING),
    UserModule,
    PostModule,
    CommentModule,
    SubredditModule,
    MessageModule,
    NotificationModule,
    SearchModule,
    AuthModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
