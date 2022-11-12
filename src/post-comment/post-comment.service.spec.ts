import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import type { Comment } from '../comment/comment.schema';
import { CommentSchema } from '../comment/comment.schema';
import { CommentService } from '../comment/comment.service';
import type { Post } from '../post/post.schema';
import { PostSchema } from '../post/post.schema';
import { PostService } from '../post/post.service';
import type { SubredditDocument } from '../subreddit/subreddit.schema';
import { SubredditSchema } from '../subreddit/subreddit.schema';
import { SubredditService } from '../subreddit/subreddit.service';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { PostCommentSchema } from './post-comment.schema';
import { PostCommentService } from './post-comment.service';

describe('PostCommentService', () => {
  let service: PostCommentService;
  let postService: PostService;
  let commentService: CommentService;
  let subredditService: SubredditService;
  let module: TestingModule;
  let subreddit: SubredditDocument;
  let flairId: Types.ObjectId;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ImagesHandlerModule,
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          {
            name: 'PostComment',
            schema: PostCommentSchema,
            discriminators: [
              {
                name: 'Post',
                schema: PostSchema,
              },
              {
                name: 'Comment',
                schema: CommentSchema,
              },
            ],
          },
          {
            name: 'Subreddit',
            schema: SubredditSchema,
          },
        ]),
      ],
      providers: [
        PostCommentService,
        PostService,
        CommentService,
        SubredditService,
      ],
    }).compile();

    service = module.get<PostCommentService>(PostCommentService);
    postService = module.get<PostService>(PostService);
    commentService = module.get<CommentService>(CommentService);
    subredditService = module.get<SubredditService>(SubredditService);
    subreddit = await subredditService.create({
      name: 'subreddit',
      over18: true,
      type: 'type',
    });
    const { flairList } = await subredditService.createFlair(
      subreddit._id.toString(),
      {
        backgroundColor: 'red',
        text: 'flair1',
        textColor: 'blue',
      },
    );
    flairId = flairList[0]._id;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('updateTing', () => {
    let post: Post & { _id: Types.ObjectId };
    let comment: Comment & { _id: Types.ObjectId };
    let userId: Types.ObjectId;
    beforeAll(async () => {
      // post = await postService.create();
      userId = new Types.ObjectId(1);
      post = await postService.create(userId, {
        subredditId: subreddit._id,
        text: 'this is a post',
        title: 'post title',
      });
      expect(post._id).toBeInstanceOf(Types.ObjectId);
      comment = await commentService.create(userId, {
        parentId: post._id,
        postId: post._id,
        text: 'top level comment',
      });
    });

    it('should update comment successfully', async () => {
      const res = await service.update(
        comment._id,
        { text: 'comment text' },
        userId,
      );
      expect(res).toEqual({ status: 'success' });
    });
    it('should be update post successfully', async () => {
      const res = await service.update(
        post._id,
        {
          text: 'new text',
        },
        userId,
      );
      expect(res).toEqual({ status: 'success' });
    });
    it('should give unauthorized because i am not the owner', async () => {
      await expect(
        service.update(post._id, { text: 'new text' }, new Types.ObjectId(2)),
      ).rejects.toThrow('only the owner can do this operation');
    });

    it('should throw that the post not found', async () => {
      await expect(
        service.update(userId, { text: 'new text' }, userId),
      ).rejects.toThrow(`id : ${userId} not found`);
    });

    it('should be updated flair successfullt', async () => {
      const res = await service.update(post._id, { flair: flairId }, userId);
      expect(res).toEqual({ status: 'success' });
    });

    it('should throw error because unallowed flair id', async () => {
      await expect(
        service.update(post._id, { flair: new Types.ObjectId(1) }, userId),
      ).rejects.toThrow('flair is not included in post subreddit');
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});
