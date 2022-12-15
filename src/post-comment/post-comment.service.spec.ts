import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { BlockSchema } from '../block/block.schema';
import { BlockService } from '../block/block.service';
import type { Comment } from '../comment/comment.schema';
import { CommentSchema } from '../comment/comment.schema';
import { CommentService } from '../comment/comment.service';
import { FollowSchema } from '../follow/follow.schema';
import { FollowService } from '../follow/follow.service';
import { NotificationModule } from '../notification/notification.module';
import { HideSchema } from '../post/hide.schema';
import type { Post } from '../post/post.schema';
import { PostSchema } from '../post/post.schema';
import { PostService } from '../post/post.service';
import type { SubredditDocument } from '../subreddit/subreddit.schema';
import { SubredditSchema } from '../subreddit/subreddit.schema';
import { SubredditService } from '../subreddit/subreddit.service';
import { SubredditUserSchema } from '../subreddit/subreddit-user.schema';
import { UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import type { PaginationParamsDto } from '../utils/apiFeatures/dto';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
import { VoteSchema } from '../vote/vote.schema';
import type { PostComment } from './post-comment.schema';
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
  let userSR: Types.ObjectId;
  let userService: UserService;
  let user;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ImagesHandlerModule,
        NotificationModule,
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
          { name: 'Follow', schema: FollowSchema },
          { name: 'Block', schema: BlockSchema },
          { name: 'Hide', schema: HideSchema },
          { name: 'Subreddit', schema: SubredditSchema },
          { name: 'UserSubreddit', schema: SubredditUserSchema },
          { name: 'User', schema: UserSchema },
          {
            name: 'Vote',
            schema: VoteSchema,
          },
          {
            name: 'Hide',
            schema: HideSchema,
          },
        ]),
      ],
      providers: [
        PostCommentService,
        PostService,
        ApiFeaturesService,
        CommentService,
        SubredditService,
        UserService,
        FollowService,
        BlockService,
      ],
    }).compile();

    service = module.get<PostCommentService>(PostCommentService);
    postService = module.get<PostService>(PostService);
    commentService = module.get<CommentService>(CommentService);
    subredditService = module.get<SubredditService>(SubredditService);
    userService = module.get<UserService>(UserService);
    user = await userService.createUser({
      email: 'eadj@exmaple.com',
      password: 'password@rfksl',
      username: 'usrname',
    });
    userSR = user._id;
    subreddit = await subredditService.create(
      {
        name: 'subreddit',
        over18: true,
        type: 'type',
      },
      'usrname',
    );
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
        subredditId: subreddit._id,
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

    it('should be updated flair successfully', async () => {
      const res = await service.update(post._id, { flair: flairId }, userId);
      expect(res).toEqual({ status: 'success' });
    });

    it('should throw error because unallowed flair id', async () => {
      await expect(
        service.update(post._id, { flair: new Types.ObjectId(1) }, userId),
      ).rejects.toThrow('flair is not included in post subreddit');
    });
  });
  describe('getThing', () => {
    let post: Post & { _id: Types.ObjectId };
    let comment: Comment & { _id: Types.ObjectId };
    let userId: Types.ObjectId;
    beforeAll(async () => {
      userId = new Types.ObjectId(1);
      post = await postService.create(userId, {
        subredditId: subreddit._id,
        text: 'this is a post',
        title: 'post title',
      });
      expect(post._id).toBeInstanceOf(Types.ObjectId);
      comment = await commentService.create(userId, {
        subredditId: subreddit._id,
        parentId: post._id,
        postId: post._id,
        text: 'top level comment',
      });
    });
    it('should get the post successfully', async () => {
      const res: PostComment = await service.get(post._id, 'Post');
      expect(res.text).toEqual(post.text);
    });
    it('should get the comment successfully', async () => {
      const res: PostComment = await service.get(comment._id, 'Comment');
      expect(res.text).toEqual(comment.text);
    });
    it('should throw not found error', async () => {
      await expect(service.get(new Types.ObjectId(1), 'Post')).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should throw mistype error', async () => {
      await expect(service.get(comment._id, 'Post')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('deleteThing', () => {
    let post: Post & { _id: Types.ObjectId };
    let comment: Comment & { _id: Types.ObjectId };
    let userId: Types.ObjectId;
    beforeAll(async () => {
      userId = new Types.ObjectId(1);
      post = await postService.create(userId, {
        subredditId: subreddit._id,
        text: 'this is a post',
        title: 'post title',
      });
      expect(post._id).toBeInstanceOf(Types.ObjectId);
      comment = await commentService.create(userId, {
        subredditId: subreddit._id,
        parentId: post._id,
        postId: post._id,
        text: 'top level comment',
      });
    });
    it('should delete the post successfully', async () => {
      const res = await service.remove(post._id, userId, 'Post');
      expect(res.status).toEqual('success');
    });
    it('should delete the comment successfully', async () => {
      const res = await service.remove(comment._id, userId, 'Comment');
      expect(res.status).toEqual('success');
    });
    it('should throw not found error', async () => {
      await expect(
        service.remove(new Types.ObjectId(1), userId, 'Post'),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw mistype error', async () => {
      await expect(service.remove(comment._id, userId, 'Post')).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw not authorized error', async () => {
      await expect(
        service.remove(comment._id, new Types.ObjectId(1), 'Comment'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
  describe('vote', () => {
    let post: Post & { _id: Types.ObjectId };
    let comment: Comment & { _id: Types.ObjectId };
    let userId: Types.ObjectId;
    let user2Id: Types.ObjectId;
    beforeAll(async () => {
      // post = await postService.create();
      userId = new Types.ObjectId(1);
      user2Id = new Types.ObjectId(2);
      post = await postService.create(userId, {
        subredditId: subreddit._id,
        text: 'this is a post',
        title: 'post title',
      });
      expect(post._id).toBeInstanceOf(Types.ObjectId);
      comment = await commentService.create(userId, {
        subredditId: subreddit._id,
        parentId: post._id,
        postId: post._id,
        text: 'top level comment',
      });
    });
    it('should upvote successfully', async () => {
      const res = await service.upvote(comment._id, userId, []);
      expect(res).toEqual({ votesCount: 1 });
    });
    it('should upvote successfully', async () => {
      const res = await service.upvote(comment._id, user2Id, []);
      expect(res).toEqual({ votesCount: 2 });
    });

    it('should downvote successfully', async () => {
      const res = await service.downvote(comment._id, userId);
      expect(res).toEqual({ votesCount: 0 });
    });
    it('should upvote with no effect', async () => {
      const res = await service.upvote(comment._id, user2Id, []);
      expect(res).toEqual({ votesCount: 0 });
    });

    it('should unvote successfully', async () => {
      const res = await service.unvote(comment._id, user2Id);
      expect(res).toEqual({ votesCount: -1 });
    });

    it('should throw an error', async () => {
      const wrongId = new Types.ObjectId(1);
      await expect(service.upvote(wrongId, userId, [])).rejects.toThrow(
        `there is no post or comment with id ${wrongId}`,
      );
    });
  });

  describe('spam/remove', () => {
    let post: Post & { _id: Types.ObjectId };
    let comment: Comment & { _id: Types.ObjectId };
    // let userId: Types.ObjectId;
    beforeAll(async () => {
      // userId = new Types.ObjectId(1);
      post = await postService.create(userSR, {
        subredditId: subreddit._id,
        text: 'this is a post',
        title: 'post title',
      });
      expect(post._id).toBeInstanceOf(Types.ObjectId);
      comment = await commentService.create(userSR, {
        subredditId: subreddit._id,
        parentId: post._id,
        postId: post._id,
        text: 'top level comment',
      });
    });
    describe('spam', () => {
      it('must spam post successfully', async () => {
        const res = await service.spam('usrname', post._id);
        expect(res).toEqual({ status: 'success' });
      });
      it('must spam comment successfully', async () => {
        const res = await service.spam('usrname', comment._id);
        expect(res).toEqual({ status: 'success' });
      });
      it('must throw errror because already spammed', async () => {
        await expect(service.spam('usrname', post._id)).rejects.toThrow(
          'spammed',
        );
      });
      it('must throw error because not mod', async () => {
        await expect(service.spam('fred', post._id)).rejects.toThrow(
          'moderator',
        );
      });
      it('must unspam post successfully', async () => {
        const res = await service.unspam('usrname', post._id);
        expect(res).toEqual({ status: 'success' });
      });
      it('must unspam comment successfully', async () => {
        const res = await service.unspam('usrname', comment._id);
        expect(res).toEqual({ status: 'success' });
      });
    });
    describe('remove', () => {
      it('must remove post successfully', async () => {
        const res = await service.disApprove('usrname', post._id);
        expect(res).toEqual({ status: 'success' });
      });
      it('must remove comment successfully', async () => {
        const res = await service.disApprove('usrname', comment._id);
        expect(res).toEqual({ status: 'success' });
      });
      it('must throw errror because already removed', async () => {
        await expect(service.disApprove('usrname', post._id)).rejects.toThrow(
          'removed',
        );
      });
      it('must throw error because not mod', async () => {
        await expect(service.disApprove('fred', post._id)).rejects.toThrow(
          'moderator',
        );
      });
    });
  });
  describe('get un-moderated/spammed/edited/upvoted/downvoted', () => {
    let post: Post & { _id: Types.ObjectId };
    let comment: Comment & { _id: Types.ObjectId };
    const pagination: PaginationParamsDto = { limit: 10, page: 1, sort: 'new' };
    const type = undefined;
    beforeAll(async () => {
      // userId = new Types.ObjectId(1);
      post = await postService.create(userSR, {
        subredditId: subreddit._id,
        text: 'this is a post',
        title: 'post title',
      });

      expect(post._id).toBeInstanceOf(Types.ObjectId);
      comment = await commentService.create(userSR, {
        subredditId: subreddit._id,
        parentId: post._id,
        postId: post._id,
        text: 'top level comment',
      });
    });

    it('must return both post and comment', async () => {
      const res = await service.getUnModeratedThingsForSubreddit(
        subreddit._id,
        pagination,
        type,
      );
      expect(res.length).toEqual(2);
    });
    it('must return only the post after spamming comment', async () => {
      await service.spam('usrname', comment._id);
      const res = await service.getUnModeratedThingsForSubreddit(
        subreddit._id,
        pagination,
        type,
      );
      expect(res.length).toEqual(1);
      expect(res[0].type).toEqual('Post');
    });
    it('must get the comment only', async () => {
      const res = await service.getSpammedThingsForSubreddit(
        subreddit._id,
        pagination,
        type,
      );
      expect(res.length).toEqual(1);
      expect(res[0].type).toEqual('Comment');
    });
    it('must get the post only', async () => {
      await service.update(
        post._id,
        {
          text: 'new text',
        },
        userSR,
      );
      const res = await service.getEditedThingsForSubreddit(
        subreddit._id,
        pagination,
        type,
      );
      expect(res.length).toEqual(1);
      expect(res[0].type).toEqual('Post');
    });
    it('must return empty array', async () => {
      await service.spam('usrname', post._id);
      const res = await service.getUnModeratedThingsForSubreddit(
        subreddit._id,
        pagination,
        type,
      );
      expect(res.length).toEqual(0);
    });
    it('must return empty array', async () => {
      const res = await service.getUpvoted(userSR, pagination);
      expect(res).toEqual([]);
    });
    it('must return element after upvoting it', async () => {
      await service.upvote(post._id, userSR, []);
      const res = await service.getUpvoted(userSR, pagination);
      expect(res.length).toEqual(1);
      expect(res[0]._id).toEqual(post._id);
    });
    it("must't return the element after downvoting it", async () => {
      await service.downvote(post._id, userSR);
      const res = await service.getUpvoted(userSR, pagination);
      expect(res.length).toEqual(0);
    });
    it('must return post', async () => {
      const res = await service.getDownvoted(userSR, pagination);
      expect(res.length).toEqual(1);
      expect(res[0]._id).toEqual(post._id);
    });
  });
  describe('get user things', () => {
    let user1, user2;
    const pagination: PaginationParamsDto = { limit: 10, page: 1, sort: 'new' };
    beforeAll(async () => {
      user1 = await userService.createUser({
        email: 'wkljwk@emkdms.com',
        username: 'user1lkfs',
        password: '1234556778',
      });
      user2 = await userService.createUser({
        email: 'wkljwk@emkdms.com',
        username: 'user1lkfsd',
        password: '1234556778',
      });
      await postService.create(user1._id, {
        text: 'texst',
        title: 'title',
        subredditId: subreddit._id,
      });
      await postService.create(user1._id, {
        text: 'texst',
        title: 'title',
        subredditId: subreddit._id,
      });
    });
    it('must get user post', async () => {
      const res = await service.getThingsOfUser(
        user1.username,
        user2._id,
        pagination,
      );
      expect(res.length).toEqual(2);
    });
    it('must get nothing', async () => {
      const res = await service.getThingsOfUser(
        user2.username,
        user1._id,
        pagination,
      );
      expect(res.length).toEqual(0);
    });
    it('must get nothing', async () => {
      await userService.block(user1._id, user2._id);
      const res = await service.getThingsOfUser(
        user1.username,
        user2._id,
        pagination,
      );
      expect(res.length).toEqual(0);
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});
