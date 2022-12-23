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
import { MessageService } from '../message/message.service';
import { NotificationModule } from '../notification/notification.module';
import { HideSchema } from '../post/hide.schema';
import type { Post } from '../post/post.schema';
import { PostSchema } from '../post/post.schema';
import { PostService } from '../post/post.service';
import type { SubredditDocument } from '../subreddit/subreddit.schema';
import { SubredditSchema } from '../subreddit/subreddit.schema';
import { SubredditService } from '../subreddit/subreddit.service';
import { SubredditUserSchema } from '../subreddit/subreddit-user.schema';
import { SubredditUserLeftSchema } from '../subreddit/subreddit-user-left.schema';
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

jest.mock('../message/message.service.ts');

describe('PostCommentService', () => {
  let service: PostCommentService;
  let postService: PostService;
  let commentService: CommentService;
  let subredditService: SubredditService;
  let module: TestingModule;
  let subreddit: SubredditDocument;
  let flairId: Types.ObjectId;
  let userSR: Types.ObjectId;
  let username: string;
  let userService: UserService;
  let user;
  let normalId;
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
          { name: 'UserSubredditLeft', schema: SubredditUserLeftSchema },

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
        MessageService,
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
    const userNormal = await userService.createUser({
      email: 'eadsj@exmaple.com',
      password: 'password@rfksl',
      username: 'usrnames',
    });
    normalId = userNormal._id;
    userSR = user._id;
    username = user.username;
    subreddit = await subredditService.create(
      {
        name: 'subreddit',
        over18: true,
        type: 'type',
      },
      'usrname',
      user._id,
    );
    const { flairList } = await subredditService.createFlair(
      subreddit._id.toString(),
      {
        backgroundColor: 'red',
        text: 'flair1',
        textColor: 'blue',
      },
      user.username,
    );
    flairId = flairList[0]._id;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('check functions', () => {
    it('must be the owner', () => {
      const _userId = new Types.ObjectId(1);
      const _user2Id = _userId;
      const res = service.checkIfTheOwner(_userId, _user2Id);
      expect(res).toBeUndefined();
    });
    it('must be valid flair id', () => {
      const res = service.checkIfValidFlairId(undefined, []);
      expect(res).toBeUndefined();
    });
    it('must be valid flair id as well', () => {
      const fId = new Types.ObjectId(1);
      const res = service.checkIfValidFlairId(fId, [
        {
          _id: fId,
          text: 'text',
          backgroundColor: 'color',
          textColor: 'color',
        },
      ]);
      expect(res).toBeUndefined();
    });
  });
  describe('updateTing', () => {
    let post: Post & { _id: Types.ObjectId };
    let comment: Comment & { _id: Types.ObjectId };
    let userId: Types.ObjectId;
    beforeAll(async () => {
      // post = await postService.create();

      userId = new Types.ObjectId(1);
      await subredditService.joinSubreddit(userId, subreddit._id);
      post = await postService.create(userId, {
        subredditId: subreddit._id,
        text: 'this is a post',
        title: 'post title',
      });
      expect(post._id).toBeInstanceOf(Types.ObjectId);
      comment = await commentService.create(username, userId, {
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
      await subredditService.joinSubreddit(userId, subreddit._id);
      post = await postService.create(userId, {
        subredditId: subreddit._id,
        text: 'this is a post',
        title: 'post title',
      });
      expect(post._id).toBeInstanceOf(Types.ObjectId);
      comment = await commentService.create(username, userId, {
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
    let userName: string;
    beforeAll(async () => {
      userName = 'username';
      userId = new Types.ObjectId(1);
      await subredditService.joinSubreddit(userId, subreddit._id);
      post = await postService.create(userId, {
        subredditId: subreddit._id,
        text: 'this is a post',
        title: 'post title',
      });
      expect(post._id).toBeInstanceOf(Types.ObjectId);
      comment = await commentService.create(userName, userId, {
        subredditId: subreddit._id,
        parentId: post._id,
        postId: post._id,
        text: 'top level comment',
      });
    });
    it('should delete the post successfully', async () => {
      const res = await service.remove(post._id, userId, 'Post', userName);
      expect(res.status).toEqual('success');
    });
    it('should delete the comment successfully', async () => {
      const res = await service.remove(
        comment._id,
        userId,
        'Comment',
        userName,
      );
      expect(res.status).toEqual('success');
    });
    it('should throw not found error', async () => {
      await expect(
        service.remove(new Types.ObjectId(1), userId, 'Post', userName),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw mistype error', async () => {
      await expect(
        service.remove(comment._id, userId, 'Post', userName),
      ).rejects.toThrow(BadRequestException);
    });
    it('should throw not authorized error', async () => {
      await expect(
        service.remove(comment._id, new Types.ObjectId(1), 'Comment', userName),
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
      userId = normalId;
      user2Id = new Types.ObjectId(2);
      await subredditService.joinSubreddit(userId, subreddit._id);
      post = await postService.create(userId, {
        subredditId: subreddit._id,
        text: 'this is a post',
        title: 'post title',
      });
      expect(post._id).toBeInstanceOf(Types.ObjectId);
      comment = await commentService.create(username, userId, {
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
      comment = await commentService.create(username, userSR, {
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
    let curSR;
    beforeAll(async () => {
      // userId = new Types.ObjectId(1);
      curSR = await subredditService.create(
        {
          name: 'sr322',
          over18: true,
          type: 'subreddit',
        },
        user.username,
        user._id,
      );
      post = await postService.create(userSR, {
        subredditId: curSR._id,
        text: 'this is a post',
        title: 'post title',
      });

      expect(post._id).toBeInstanceOf(Types.ObjectId);
      comment = await commentService.create(username, userSR, {
        subredditId: curSR._id,
        parentId: post._id,
        postId: post._id,
        text: 'top level comment',
      });
    });

    it('must return both post and comment', async () => {
      const res = await service.getUnModeratedThingsForSubreddit(
        curSR.name,
        pagination,
        type,
      );
      expect(res.length).toEqual(2);
    });
    it('must return only the post after spamming comment', async () => {
      await service.spam('usrname', comment._id);
      const res = await service.getUnModeratedThingsForSubreddit(
        curSR.name,
        pagination,
        type,
      );
      expect(res.length).toEqual(1);
      expect(res[0].type).toEqual('Post');
    });
    it('must get the comment only', async () => {
      const res = await service.getSpammedThingsForSubreddit(
        curSR.name,
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
        curSR.name,
        pagination,
        type,
      );
      expect(res.length).toEqual(1);
      expect(res[0].type).toEqual('Post');
    });
    it('must return empty array', async () => {
      await service.spam('usrname', post._id);
      const res = await service.getUnModeratedThingsForSubreddit(
        curSR.name,
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
      await subredditService.joinSubreddit(user1._id, subreddit._id);
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

  describe('get comments of thing', () => {
    let post;
    let comment;
    beforeAll(async () => {
      const user1 = await userService.createUser({
        email: 'wkljwk@emkdms.com',
        username: 'user100lkfs',
        password: '1234556778',
      });
      await subredditService.joinSubreddit(user1._id, subreddit._id);
      post = await postService.create(user1._id, {
        text: 'texst',
        title: 'title',
        subredditId: subreddit._id,
      });
      comment = await commentService.create(user1.username, user1._id, {
        parentId: post._id,
        postId: post._id,
        subredditId: subreddit._id,
        text: 'comment text',
      });
    });
    it('must get comment', async () => {
      const res = await service.getThings(
        { _id: post._id },
        {
          limit: 4,
          page: 1,
          sort: 'top',
        },
        userSR._id,
      );
      expect(res.length).toEqual(1);
      expect(res[0]._id.toString()).toEqual(comment._id.toString());
    });
    it('must get empty array', async () => {
      const res = await service.getThings(
        { _id: comment._id },
        {
          limit: 4,
          page: 1,
          sort: 'top',
        },
        userSR._id,
      );
      expect(res.length).toEqual(0);
    });
  });

  describe('get specific types of posts of user', () => {
    let post1, post2;
    beforeAll(async () => {
      post1 = await postService.create(userSR._id, {
        subredditId: subreddit._id,
        title: 'title',
        text: 'text',
      });
      post2 = await postService.create(userSR._id, {
        subredditId: subreddit._id,
        title: 'title',
        text: 'text',
      });
      await userService.savePost(userSR._id, post1._id);
      await userService.savePost(userSR._id, post2._id);
    });
    describe('get saved posts', () => {
      it('must get saved posts successfully', async () => {
        const savedPosts = await service.getSavedPosts(userSR._id, {
          limit: 10,
          page: 1,
          sort: 'top',
        });
        expect(savedPosts.length).toEqual(2);
      });
      it('must get empty array', async () => {
        const savedPosts = await service.getSavedPosts(new Types.ObjectId(1), {
          limit: 1,
          page: 1,
          sort: 'top',
        });
        expect(savedPosts.length).toEqual(0);
      });
    });
    describe('get overview things', () => {
      it('must get posts and comments of user', async () => {
        const overviewThings = await service.getOverviewThings(userSR._id, {
          limit: 10,
          page: 1,
          sort: 'top',
        });
        expect(overviewThings.length).toBeLessThanOrEqual(10);

        const post1Found = overviewThings.find(
          (val) => val._id.toString() === post1._id.toString(),
        );
        expect(post1Found._id).toEqual(post1._id);
        const post2Found = overviewThings.find(
          (val) => val._id.toString() === post2._id.toString(),
        );
        expect(post2Found._id).toEqual(post2._id);
      });
    });
    describe('get history', () => {
      it('must get posts and comments of user', async () => {
        const history = await service.getOverviewThings(userSR._id, {
          limit: 10,
          page: 1,
          sort: 'top',
        });
        expect(history.length).toBeLessThanOrEqual(10);

        const post1Found = history.find(
          (val) => val._id.toString() === post1._id.toString(),
        );
        expect(post1Found._id).toEqual(post1._id);
        const post2Found = history.find(
          (val) => val._id.toString() === post2._id.toString(),
        );
        expect(post2Found._id).toEqual(post2._id);
      });
    });
  });
  describe('search post', () => {
    it('must get number of posts', async () => {
      const res = await service.searchPostAggregate('text', userSR._id, 1, 10);
      expect(res.length).toBeLessThanOrEqual(10);

      for (const { text, title } of res) {
        expect(text.includes('text') || title.includes('text')).toEqual(true);
      }
    });
    it('must return no post', async () => {
      const res = await service.searchPostAggregate(
        'ksjfkjfshsngjswh',
        userSR._id,
      );
      expect(res.length).toEqual(0);
    });
  });
  describe('search community', () => {
    it('must get number of subreddits', async () => {
      const res = await service.searchCommentQuery(
        'subreddit',
        userSR._id,
        1,
        10,
      );
      expect(res.length).toBeLessThanOrEqual(10);

      for (const { name } of res) {
        expect(name.includes('subreddit')).toEqual(true);
      }
    });
  });
  describe('get thing i moderate', () => {
    let newUser, post;
    beforeAll(async () => {
      newUser = await userService.createUser({
        email: 'fsljgkj@jkgd.ceoj',
        password: '13o4jkkrjwrwr',
        username: 'wjwtkjtj',
      });
      const sr = await subredditService.create(
        {
          name: 'gskjgek',
          over18: true,
          type: 'fsjkgs',
        },
        newUser.username,
        newUser._id,
      );
      post = await postService.create(
        { _id: newUser._id, username: newUser.username },
        {
          subredditId: sr._id,
          title: 'title',
          text: 'text',
        },
      );
    });
    it('must get post successfully', async () => {
      const res = await service.getThingIModerate(newUser.username, post._id);
      expect(res.length).toEqual(1);
    });
  });

  describe('get posts and comments of owner', () => {
    it('must get posts successfully', async () => {
      const res = await service.getPostsOfOwner(userSR, new Types.ObjectId(1), {
        limit: 10,
        page: 1,
        sort: 'top',
      });
      expect(res.length).toBeLessThanOrEqual(10);

      for (const { userId, type } of res) {
        expect(userId.toString()).toEqual(userSR.toString());
        expect(type).toEqual('Post');
      }
    });
    it('must get comments successfully', async () => {
      const res = await service.getCommentsOfOwner(
        userSR,
        new Types.ObjectId(1),
        {
          limit: 10,
          page: 1,
          sort: 'top',
        },
      );
      expect(res.length).toBeLessThanOrEqual(10);

      for (const comment of res) {
        expect(comment.user.id.toString()).toEqual(userSR.toString());
      }
    });
  });
  describe('get posts of subreddit', () => {
    it('must get posts successfully', async () => {
      const res = await service.getPostsOfSubreddit(subreddit.name, undefined, {
        page: 1,
        limit: 10,
        sort: 'top',
      });
      expect(res.length).toBeLessThanOrEqual(10);

      for (const { subredditInfo } of res) {
        expect(subredditInfo.id.toString()).toEqual(subreddit._id.toString());
      }
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});
