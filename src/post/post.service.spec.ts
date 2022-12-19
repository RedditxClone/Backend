import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { BlockSchema } from '../block/block.schema';
import { BlockService } from '../block/block.service';
import { CommentSchema } from '../comment/comment.schema';
import { FollowSchema } from '../follow/follow.schema';
import { FollowService } from '../follow/follow.service';
import { NotificationModule } from '../notification/notification.module';
import { PostCommentSchema } from '../post-comment/post-comment.schema';
import { PostCommentService } from '../post-comment/post-comment.service';
import type { SubredditDocument } from '../subreddit/subreddit.schema';
import { SubredditSchema } from '../subreddit/subreddit.schema';
import { SubredditService } from '../subreddit/subreddit.service';
import { SubredditUserSchema } from '../subreddit/subreddit-user.schema';
import { SubredditUserLeftSchema } from '../subreddit/subreddit-user-left.schema';
import type { UserDocument } from '../user/user.schema';
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
import type { CreatePostDto } from './dto';
import { HideSchema } from './hide.schema';
import type { Post } from './post.schema';
import { PostSchema } from './post.schema';
import { PostService } from './post.service';
import { stubPost } from './test/stubs/post.stub';

describe('PostService', () => {
  let service: PostService;
  let module: TestingModule;
  const postDto: CreatePostDto = {
    subredditId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
    title: 'post1',
    text: 'Hello World',
    nsfw: false,
    spoiler: false,
    flair: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
  };
  let subredditService: SubredditService;
  let userService: UserService;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        ImagesHandlerModule,
        NotificationModule,
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
          { name: 'Vote', schema: VoteSchema },
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
        SubredditService,
        UserService,
        FollowService,
        BlockService,
        ApiFeaturesService,
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    subredditService = module.get<SubredditService>(SubredditService);
    userService = module.get<UserService>(UserService);
  });

  let id: Types.ObjectId;
  it('should be defined', () => {
    expect(subredditService).toBeDefined();
    expect(userService).toBeDefined();
    expect(service).toBeDefined();
  });
  describe('create post spec', () => {
    test('should create successfully', async () => {
      const userId = new Types.ObjectId('6363fba4ab2c2f94f3ac9f37');
      const post = await service.create(userId, postDto);
      id = post._id;
      const expected = stubPost();
      expect(post).toEqual(expect.objectContaining(expected));
    });
  });
  describe('upload media spec', () => {
    test('should upload successfully', () => {
      const files: Express.Multer.File[] = [];
      const res = service.uploadMedia(files);
      expect(res.status).toEqual('success');
    });
  });
  // describe('upload media for post spec', () => {
  //   it('must upload them successfully', async () => {
  //     const userId = new Types.ObjectId('6363fba4ab2c2f94f3ac9f37');
  //     const post = await service.create(userId, postDto);
  //     const files: any = [{ filename: 'file1' }];
  //     const res = await service.uploadPostMedia(files, post._id, userId);
  //     expect(res.images).toEqual(['assets/post-media/file1']);
  //   });
  // });
  describe('get discover page', () => {
    let sr, post, user, user2;
    beforeAll(async () => {
      user = await userService.createUser({
        email: 'email@example.com',
        username: 'usernameewe',
        password: '123456778',
      });
      user2 = await userService.createUser({
        email: 'email@example.com',
        username: 'usernamee',
        password: '123456778',
      });
      sr = await subredditService.create(
        {
          name: 'sr100',
          over18: true,
          type: 'sr1',
        },
        user.username,
        user._id,
      );
      post = await service.create(user._id, {
        title: 'title',
        subredditId: sr._id,
        text: 'text',
      });
      const files: any = [
        { filename: 'file1' },
        { filename: 'file2' },
        { filename: 'file3' },
      ];
      await service.uploadPostMedia(files, post._id, user._id);
      await userService.block(user._id, user2._id);
    });
    it('must get 3 photos successfully', async () => {
      const res = await service.discover(user._id, 1, 10);
      expect(res.length).toEqual(3);
    });
    it('must return 0 images', async () => {
      const res = await service.discover(user2._id, 1, 10);
      expect(res).toEqual([]);
    });
  });

  describe('hide', () => {
    const userId = new Types.ObjectId(1);
    it('should hide successfully', async () => {
      const res = await service.hide(id, userId);
      expect(res).toEqual({ status: 'success' });
    });
    it('should throw duplicate error', async () => {
      await expect(service.hide(id, userId)).rejects.toThrow('duplicate');
    });
    it('should unhide successfully', async () => {
      const res = await service.unhide(id, userId);
      expect(res).toEqual({ status: 'success' });
    });
  });

  const generateUsers = async () => {
    const user1 = await userService.createUser({
      email: 'email@gmail.com',
      username: 'username',
      password: '12345678',
    });
    const user2 = await userService.createUser({
      email: 'email@gmail.com',
      username: 'username2',
      password: '12345678',
    });

    return [user1, user2];
  };

  const generateSRs = async (
    user1: string,
    user1Id: Types.ObjectId,
    user2: string,
    user2Id: Types.ObjectId,
  ) => {
    const sr1 = await subredditService.create(
      {
        name: 'sr1',
        over18: true,
        type: 'type',
      },
      user1,
      user1Id,
    );
    const sr2 = await subredditService.create(
      {
        name: 'sr2',
        over18: true,
        type: 'type',
      },
      user2,
      user2Id,
    );

    return [sr1, sr2];
  };

  describe('retrieve posts', () => {
    const pagination: PaginationParamsDto = { limit: 10, page: 1, sort: 'new' };
    let user1: UserDocument;
    let user2: UserDocument;
    const subreddits: SubredditDocument[] = [];
    const posts: Array<Post & { _id: Types.ObjectId }> = [];
    beforeAll(async () => {
      const users = await generateUsers();
      user1 = users[0];
      user2 = users[1];
      const [sr1, sr2] = await generateSRs(
        user1.username,
        user1._id,
        user2.username,
        user2._id,
      );
      subreddits.push(sr1, sr2);

      await subredditService.joinSubreddit(user1._id, sr2._id);

      const post1 = await service.create(user2._id, {
        title: 'post1 title',
        text: 'post1 text',
        subredditId: sr1._id,
      });
      const post2 = await service.create(user2._id, {
        title: 'post2 title',
        text: 'post2 text',
        subredditId: sr2._id,
      });

      posts.push(post1, post2);
    });

    describe('timeline', () => {
      it('should return 2 posts successfully', async () => {
        const timeline = await service.getTimeLine(user1._id, pagination);
        expect(timeline.length).toEqual(2);
        expect(timeline[1]).toEqual(
          expect.objectContaining({
            _id: posts[0]._id,
            text: posts[0].text,
            title: posts[0].title,
            voteType: null,
            subredditInfo: {
              id: subreddits[0]._id,
              name: subreddits[0].name,
              isModerator: true,
              isJoin: true,
            },
            user: {
              id: user2._id,
              photo: '',
              username: user2.username,
              isFollowed: false,
              cakeDay: true,
              createdAt: timeline[0].user.createdAt,
            },
          }),
        );
      });
      it("shouldn't get any post after blocking user", async () => {
        await userService.block(user1._id, user2._id);
        const timeline = await service.getTimeLine(user1._id, pagination);
        expect(timeline).toEqual([]);
        await userService.unblock(user1._id, user2._id);
      });
      it("it shouldn't get first post before of hiding it", async () => {
        await service.hide(posts[1]._id, user1._id);
        const timeline = await service.getTimeLine(user1._id, pagination);
        expect(timeline.length).toEqual(1);
        expect(timeline[0]).toEqual(
          expect.objectContaining({
            _id: posts[0]._id,
            text: posts[0].text,
            title: posts[0].title,
            voteType: null,
            subredditInfo: {
              id: subreddits[0]._id,
              name: subreddits[0].name,
              isModerator: true,
              isJoin: true,
            },
            user: {
              id: user2._id,
              photo: '',
              username: user2.username,
              isFollowed: false,
              cakeDay: true,
              createdAt: timeline[0].user.createdAt,
            },
          }),
        );
      });
      it('must get all posts randomly', async () => {
        const userId = undefined;
        const timeline = await service.getTimeLine(userId, pagination);
        expect(timeline.length).toEqual(3);
      });
      it('must limit return to only one post', async () => {
        const timeline = await service.getTimeLine(user1._id, {
          page: 1,
          limit: 1,
          sort: 'new',
        });
        expect(timeline.length).toEqual(1);
      });
      it("shouldn't get any post due to not joining any subreddit", async () => {
        const timeline = await service.getTimeLine(
          new Types.ObjectId(100),
          pagination,
        );
        expect(timeline).toEqual([]);
      });
    });
    describe('get my posts', () => {
      it('must get all of my posts', async () => {
        const res = await service.getPostsOfUser(user2._id, pagination);
        expect(res.length).toEqual(2);
        expect(res[0].user).toEqual({
          id: user2._id,
          username: user2.username,
          photo: user2.profilePhoto,
          isFollowed: false,
          cakeDay: true,
          createdAt: res[0].user.createdAt,
        });
      });
      it('must get no posts', async () => {
        const res = await service.getPostsOfUser(user1._id, pagination);
        expect(res.length).toEqual(0);
      });
    });
    describe('get hidden posts', () => {
      it('must return on post', async () => {
        // hidden from the last test
        const res = await service.getHiddenPosts(user1._id, pagination);
        expect(res.length).toEqual(1);
        await service.unhide(res[0]._id, user1._id);
      });
      it('must return empty set', async () => {
        const res = await service.getHiddenPosts(user1._id, pagination);
        expect(res.length).toEqual(0);
      });
    });
    describe('get popular posts', () => {
      it('must return on post', async () => {
        const res = await service.getPopularPosts(user1._id, pagination);
        expect(res.length).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('approve', () => {
    let post: Post & { _id: Types.ObjectId };

    const username = 'fred';
    const userId = new Types.ObjectId(1);
    beforeAll(async () => {
      const sr = await subredditService.create(
        {
          name: 'sr',
          over18: true,
          type: 'sr',
        },
        username,
        userId,
      );
      post = await service.create(userId, {
        subredditId: sr._id,
        text: 'this is a post',
        title: 'post title',
      });
      expect(post._id).toBeInstanceOf(Types.ObjectId);
    });
    it('must approve post successfully', async () => {
      const res = await service.approve(username, post._id);
      expect(res).toEqual({ status: 'success' });
    });
    it('must throw error because already approved', async () => {
      await expect(service.approve(username, post._id)).rejects.toThrow(
        'approved',
      );
    });
    it('must throw error because not mod', async () => {
      await expect(service.approve('aref', post._id)).rejects.toThrow(
        'moderator',
      );
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});
