import { MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { BlockSchema } from '../block/block.schema';
import { BlockService } from '../block/block.service';
import { CommentSchema } from '../comment/comment.schema';
import { FollowSchema } from '../follow/follow.schema';
import { FollowService } from '../follow/follow.service';
import { PostCommentSchema } from '../post-comment/post-comment.schema';
import type { SubredditDocument } from '../subreddit/subreddit.schema';
import { SubredditSchema } from '../subreddit/subreddit.schema';
import { SubredditService } from '../subreddit/subreddit.service';
import { SubredditUserSchema } from '../subreddit/subreddit-user.schema';
import type { UserDocument } from '../user/user.schema';
import { UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { ImagesHandlerModule } from '../utils/imagesHandler/images-handler.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongoose-in-memory';
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
        ]),
      ],
      providers: [
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
    user1Id: Types.ObjectId,
    user2Id: Types.ObjectId,
  ) => {
    const sr1 = await subredditService.create(
      {
        name: 'sr1',
        over18: true,
        type: 'type',
      },
      user1Id,
    );
    const sr2 = await subredditService.create(
      {
        name: 'sr2',
        over18: true,
        type: 'type',
      },
      user2Id,
    );

    return [sr1, sr2];
  };

  describe('retrieve posts', () => {
    const page = undefined;
    const limit = undefined;
    let user1: UserDocument;
    let user2: UserDocument;
    const subreddits: SubredditDocument[] = [];
    const posts: Array<Post & { _id: Types.ObjectId }> = [];
    beforeAll(async () => {
      const users = await generateUsers();
      user1 = users[0];
      user2 = users[1];
      const [sr1, sr2] = await generateSRs(user1._id, user2._id);
      subreddits.push(sr1, sr2);

      await subredditService.joinSubreddit(user1._id, sr1._id);
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
        const timeline = await service.getTimeLine(user1._id, page, limit);
        expect(timeline.length).toEqual(2);
        expect(timeline[0]).toEqual(
          expect.objectContaining({
            _id: posts[0]._id,
            text: posts[0].text,
            title: posts[0].title,
            voteType: null,
            subreddit: {
              id: subreddits[0]._id,
              name: subreddits[0].name,
              type: subreddits[0].type,
            },
            user: {
              id: user2._id,
              photo: '',
              username: user2.username,
            },
          }),
        );
      });
      it("shouldn't get any post after blocking user", async () => {
        await userService.block(user1._id, user2._id);
        const timeline = await service.getTimeLine(user1._id, page, limit);
        expect(timeline).toEqual([]);
        await userService.unblock(user1._id, user2._id);
      });
      it("it shouldn't get second post before of hiding it", async () => {
        await service.hide(posts[1]._id, user1._id);
        const timeline = await service.getTimeLine(user1._id, page, limit);
        expect(timeline.length).toEqual(1);
        expect(timeline[0]).toEqual(
          expect.objectContaining({
            _id: posts[0]._id,
            text: posts[0].text,
            title: posts[0].title,
            voteType: null,
            subreddit: {
              id: subreddits[0]._id,
              name: subreddits[0].name,
              type: subreddits[0].type,
            },
            user: {
              id: user2._id,
              photo: '',
              username: user2.username,
            },
          }),
        );
      });
      it('must get all posts randomly', async () => {
        const userId = undefined;
        const timeline = await service.getTimeLine(userId, page, limit);
        expect(timeline.length).toEqual(2);
      });
      it('must limit return to only one post', async () => {
        const timeline = await service.getTimeLine(user1._id, page, 1);
        expect(timeline.length).toEqual(1);
      });
      it("shouldn't get any post due to not joining any subreddit", async () => {
        const timeline = await service.getTimeLine(user2._id, page, limit);
        expect(timeline).toEqual([]);
      });
    });
    describe('get my posts', () => {
      it('must get all of my posts');
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});
