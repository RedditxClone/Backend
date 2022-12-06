import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { BlockModule } from '../block/block.module';
import { CommentService } from '../comment/comment.service';
import type { CreateCommentDto } from '../comment/dto';
import type { CreatePostDto } from '../post/dto';
import { PostService } from '../post/post.service';
import { PostCommentModule } from '../post-comment/post-comment.module';
import type { CreateSubredditDto } from '../subreddit/dto/create-subreddit.dto';
import { SubredditModule } from '../subreddit/subreddit.module';
import { SubredditService } from '../subreddit/subreddit.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { rootMongooseTestModule } from '../utils/mongoose-in-memory';

describe('SearchService', () => {
  let searchService: SearchService;
  let id1: Types.ObjectId;
  let id2: Types.ObjectId;
  let id3: Types.ObjectId;
  let postId: Types.ObjectId;
  let commentId: Types.ObjectId;
  let subredditId1: Types.ObjectId;
  let subredditId2: Types.ObjectId;

  const postData: CreatePostDto = {
    text: "aref=> That's the body of the post",
    flair: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
    subredditId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
    title: 'first post created hi',
  };

  const commentData: CreateCommentDto = {
    text: "aref=> That's the body of the comment",
    parentId: new Types.ObjectId('6363fba4ab2c2f94f5ac9137'),
    postId: new Types.ObjectId('638f5398bcc906ca9a8b48f2'),
    subredditId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
  };

  const user1Data = {
    email: 'email@example.com',
    password: '12345678',
    username: 'aref',
  };
  const user2Data = {
    email: 'email2@example.com',
    password: '12345678',
    username: 'fareed',
  };

  const user3Data = {
    email: 'email3@example.com',
    password: '12345678',
    username: 'fareed2',
  };
  const subreddit1: CreateSubredditDto = {
    name: '11sr',
    type: 'public',
    over18: false,
  };
  const subreddit2: CreateSubredditDto = {
    name: 'sr1123',
    type: 'public',
    over18: false,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BlockModule,
        UserModule,
        PostCommentModule,
        SubredditModule,
        rootMongooseTestModule(),
      ],
      controllers: [SearchController],
      providers: [SearchService, ApiFeaturesService],
    }).compile();

    searchService = module.get<SearchService>(SearchService);
    const userService: UserService = module.get<UserService>(UserService);
    const subredditService: SubredditService =
      module.get<SubredditService>(SubredditService);
    const user1 = await userService.createUser(user1Data);
    id1 = user1._id;
    const user2 = await userService.createUser(user2Data);
    id2 = user2._id;
    const user3 = await userService.createUser(user3Data);
    id3 = user3._id;

    const subredditDocument1 = await subredditService.create(subreddit1, id1);
    const subredditDocument2 = await subredditService.create(subreddit2, id3);
    subredditId1 = subredditDocument1._id;
    subredditId2 = subredditDocument2._id;

    const postService: PostService = module.get<PostService>(PostService);
    const commentService: CommentService =
      module.get<CommentService>(CommentService);
    postData.subredditId = subredditId1;
    const p = await postService.create(id2, postData);

    commentData.postId = p._id;
    commentData.subredditId = subredditId1;

    const c = await commentService.create(id1, commentData);
    commentId = c._id;
    postId = p._id;
  });

  it('should be defined', () => {
    expect(searchService).toBeDefined();
  });

  describe('search for people', () => {
    it('should find the user successfully', async () => {
      const data = await searchService.searchPeople('far', 3, id1);
      expect(data.length).toBe(2);
      expect(data[0]._id.toString()).toEqual(id2.toString());
    });
    it('should find nothing', async () => {
      const data = await searchService.searchPeople('farid', 3, id1);
      expect(data.length).toBe(0);
    });
  });

  describe('search for posts', () => {
    it('should find the post successfully', async () => {
      const data = await searchService.searchPosts('ref', 3, id2);
      expect(data.length).toBe(1);
      expect(data[0]._id.toString()).toEqual(postId.toString());
      expect(data[0].userId._id.toString()).toEqual(id2.toString());
      expect(data[0].subredditId._id.toString()).toEqual(
        postData.subredditId.toString(),
      );
    });

    it('should find nothing', async () => {
      const data = await searchService.searchPosts('arref', 3, id1);
      expect(data.length).toBe(0);
    });
  });

  describe('search for comments', () => {
    it('should find the post successfully', async () => {
      const data = await searchService.searchComments('com', 3, id2);
      console.log(data);
      // expect(data.length).toBe(1);
      // expect(data[0]._id.toString()).toEqual(postId.toString());
      // expect(data[0].userId._id.toString()).toEqual(id2.toString());
      // expect(data[0].subredditId._id.toString()).toEqual(
      //   postData.subredditId.toString(),
      // );
    });

    // it('should find nothing', async () => {
    //   const data = await searchService.searchPosts('arref', 3, id1);
    //   expect(data.length).toBe(0);
    // });
  });

  describe('search for subreddits', () => {
    it('should find the subreddit successfully', async () => {
      // const data = await searchService.searchCommunities('11', 3);
      // expect(data.length).toBe(2);
      // expect(data[0]._id.toString()).toEqual(id2.toString());
    });
  });
});
