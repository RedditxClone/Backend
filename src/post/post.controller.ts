import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { diskStorage } from 'multer';

import { User } from '../auth/decorators/user.decorator';
import { JWTUserGuard } from '../auth/guards';
import { IsUserExistGuard } from '../auth/guards/is-user-exist.guard';
import { PostCommentService } from '../post-comment/post-comment.service';
import { UserUniqueKeys } from '../user/dto/user-unique-keys.dto';
import { uniqueFileName } from '../utils';
import { PaginationParamsDto } from '../utils/apiFeatures/dto';
import { ParseObjectIdPipe } from '../utils/utils.service';
import {
  CreatePostDto,
  ReturnPostDto,
  UpdatePostDto,
  UploadMediaDto,
} from './dto';
import { DiscoverReturnDto } from './dto/discover-return-dto';
import { PostService } from './post.service';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postCommentService: PostCommentService,
  ) {}

  @ApiOkResponse({
    description: 'your hidden posts returned successfully',
    type: ReturnPostDto,
  })
  @ApiUnauthorizedResponse({ description: 'you must login' })
  @Get('hidden')
  @UseGuards(JWTUserGuard)
  getHiddenPosts(
    @User('_id') userId: Types.ObjectId,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.postService.getHiddenPosts(userId, pagination);
  }

  @ApiOkResponse({
    description: 'your hidden posts returned successfully',
    type: ReturnPostDto,
  })
  @ApiUnauthorizedResponse({ description: 'you must login' })
  @Get('popular')
  @UseGuards(IsUserExistGuard)
  getPopularPosts(
    @User('_id') userId: Types.ObjectId,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.postService.getPopularPosts(userId, pagination);
  }

  @ApiOkResponse({
    description: 'posts returned successfully',
    type: DiscoverReturnDto,
  })
  @Get('discover')
  @UseGuards(JWTUserGuard)
  discover(
    @User('_id') userId: Types.ObjectId,
    @Query('page') page: number | undefined,
    @Query('limit') limit: number | undefined,
  ) {
    return this.postService.discover(userId, page, limit);
  }

  @ApiOkResponse({
    description: 'posts returned successfully',
    type: ReturnPostDto,
  })
  @Get('timeline')
  @UseGuards(IsUserExistGuard)
  getTimeLine(
    @User() userInfo: UserUniqueKeys | undefined,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.postService.getTimeLine(userInfo, pagination);
  }

  @ApiOkResponse({
    description: 'your posts returned successfully',
    type: ReturnPostDto,
  })
  @ApiUnauthorizedResponse({ description: 'you must login' })
  @Get('me')
  @UseGuards(JWTUserGuard)
  getMePosts(
    @User('_id') userId: Types.ObjectId,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.postService.getPostsOfUser(userId, pagination);
  }

  @ApiOperation({ description: 'Submit a post to a subreddit.' })
  @ApiCreatedResponse({
    description: 'The resource was created successfully',
    type: ReturnPostDto,
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnprocessableEntityResponse({
    description:
      'If a link with the same URL has already been submitted to the specified subreddit an error will be returned unless resubmit is true.',
  })
  @UseGuards(JWTUserGuard)
  @Post('/submit')
  async create(
    @User() userInfo: UserUniqueKeys,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postService.create(userInfo, createPostDto);
  }

  @ApiOperation({ description: 'upload a post media.' })
  @ApiCreatedResponse({
    description: 'The resource was uploaded successfully',
    type: UploadMediaDto,
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './assets/posts-media',
        filename: uniqueFileName,
      }),
    }),
  )
  @Post('/upload-media')
  uploadMedia(@UploadedFiles() files: Express.Multer.File[]) {
    return this.postService.uploadMedia(files);
  }

  @ApiOperation({ description: 'upload a post media.' })
  @ApiCreatedResponse({
    description: 'The resource was uploaded successfully',
    type: UploadMediaDto,
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './assets/posts-media',
        filename: uniqueFileName,
      }),
    }),
  )
  @Post('/:post_id/upload-media')
  uploadPostMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('post_id') postId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.postService.uploadPostMedia(files, postId, userId);
  }

  @ApiOperation({ description: 'Deletes a post.' })
  @ApiOkResponse({ description: 'The resource was deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Delete(':id')
  @UseGuards(JWTUserGuard)
  remove(
    @User('_id') userId: Types.ObjectId,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @User('username') username: string,
  ) {
    return this.postCommentService.remove(id, userId, 'Post', username);
  }

  @ApiOperation({
    description: 'edit some post information',
  })
  @ApiOkResponse({
    description: 'The resource was updated successfully',
    type: ReturnPostDto,
  })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdatePostDto,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.postService.update(id, dto, userId);
  }

  @ApiNotFoundResponse({ description: 'Resource not found' })
  @UseGuards(IsUserExistGuard)
  @Get(':id')
  get(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() req) {
    return this.postService.getPost(id, req._id);
  }

  @ApiOperation({
    description: `Hide a post, this removes it from the user's default view of subreddit listings.`,
  })
  @ApiOkResponse({ description: `Successful post hide` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Post(':post/hide')
  hide(
    @Param('post', ParseObjectIdPipe) postId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.postService.hide(postId, userId);
  }

  @ApiOperation({
    description: `UnHide a post, this removes the hide property from a post thus it can reappear again.`,
  })
  @ApiOkResponse({ description: `Successful post unhide` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Post(':post/unhide')
  unhide(
    @Param('post', ParseObjectIdPipe) postId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.postService.unhide(postId, userId);
  }

  @ApiOperation({
    description: `Lock a post. Prevents a post from receiving new comments.`,
  })
  @ApiOkResponse({ description: `Successful post lock` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch(':id/lock')
  lock(@Param('id') id: string) {
    return id;
  }

  @UseGuards(JWTUserGuard)
  @Post('/:post/approve')
  approve(
    @Param('post', ParseObjectIdPipe) postId: Types.ObjectId,
    @User('username') username: string,
  ) {
    return this.postService.approve(username, postId);
  }
}
