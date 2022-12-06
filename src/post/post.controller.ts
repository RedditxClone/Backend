import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { diskStorage } from 'multer';

import { User } from '../auth/decorators/user.decorator';
import { JWTUserGuard } from '../auth/guards';
import { PostCommentService } from '../post-comment/post-comment.service';
import { uniqueFileName } from '../utils';
import { ParseObjectIdPipe } from '../utils/utils.service';
import {
  CreatePostDto,
  DefaultSortPostDto,
  FollowPostDto,
  InsightsPostDto,
  ReturnPostDto,
  SendRepliesPostDto,
  SpamPostDto,
  UpdatePostDto,
  UploadMediaDto,
  VotePostDto,
} from './dto';
import { PostService } from './post.service';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postCommentService: PostCommentService,
  ) {}

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
    @User('_id') userId: Types.ObjectId,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postService.create(userId, createPostDto);
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
        destination: './statics/posts-media',
        filename: uniqueFileName,
      }),
    }),
  )
  @Post('/upload-media')
  uploadMedia(@UploadedFiles() files: Express.Multer.File[]) {
    return this.postService.uploadMedia(files);
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
  ) {
    return this.postCommentService.remove(id, userId, 'Post');
  }

  @ApiOperation({ description: 'Edit the body text of a post.' })
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
    return this.postCommentService.update(id, dto, userId);
  }

  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Get(':id')
  get(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.postCommentService.get(id, 'Post');
  }

  @ApiOperation({
    description: `Follow or unFollow a post.    
       To follow, follow should be True.
       To unFollow, follow should be False. 
       The user must have access to the subreddit to be able to follow a post within it.`,
  })
  @ApiCreatedResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/follow')
  //todo
  follow(@Param('id') id: string, @Body() followPostDto: FollowPostDto) {
    return followPostDto;
  }

  @ApiOperation({
    description: `Hide a post, this removes it from the user's default view of subreddit listings.`,
  })
  @ApiOkResponse({ description: `Successful post hide` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch(':id/hide')
  //todo
  hide(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({
    description: `UnHide a post, this removes the hide property from a post thus it can reappear again.`,
  })
  @ApiOkResponse({ description: `Successful post unhide` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch(':id/unhide')
  //todo
  unhide(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({
    description: `Lock a post. Prevents a post from receiving new comments.`,
  })
  @ApiOkResponse({ description: `Successful post lock` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch(':id/lock')
  //todo
  lock(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({
    description: `UnLock a post. Prevents a post from receiving new comments.`,
  })
  @ApiOkResponse({ description: `Successful post Unlock` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch(':id/unlock')
  //todo
  unlock(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({ description: `UnMark a post NSFW.` })
  @ApiCreatedResponse({ description: `Successful post mark` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/mark-nsfw')
  //todo
  markNsfw(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({ description: `Mark a post NSFW.` })
  @ApiCreatedResponse({ description: `Successful post mark` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/unmark-nsfw')
  //todo
  unMarkNsfw(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({
    description: `Brings it to the attention of the subreddit's moderators and marks it as spam.`,
  })
  @ApiCreatedResponse({ description: `Successful post report spam` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/spam')
  //todo
  spam(@Param('id') id: string, @Body() spamPostDto: SpamPostDto) {
    return spamPostDto;
  }

  @ApiOperation({ description: `Enable or disable inbox replies for a post.` })
  @ApiCreatedResponse({ description: `Successful post replies set` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/send-replies')
  //todo
  sendReplies(@Param('id') id, @Body() sendRepliesPostDto: SendRepliesPostDto) {
    return sendRepliesPostDto;
  }

  @ApiOperation({
    description: `Flag the post as spoiler.`,
  })
  @ApiOkResponse({ description: `Successful post spoiler` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch(':id/spoiler')
  //todo
  spoiler(@Param('id') id) {
    return id;
  }

  @ApiOperation({
    description: `Flag the post as not spoiler.`,
  })
  @ApiOkResponse({ description: `Successful post unSpoiler` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch(':id/unspoiler')
  //todo
  unSpoiler(@Param('id') id) {
    return id;
  }

  @ApiOperation({
    description: `Cast a vote on a post.`,
  })
  @ApiCreatedResponse({
    description: `Successful post vote, returns the new vote direction`,
    type: VotePostDto,
  })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/vote')
  //todo
  vote(@Param('id') id, @Body() votePostDto: VotePostDto) {
    return votePostDto;
  }

  @ApiOperation({
    description: `Save post, Saved things are kept in the user's saved listing for later perusal.`,
  })
  @ApiCreatedResponse({ description: `Successful post save` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/save')
  //todo
  save(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({
    description: `UnSave post, Saved things are kept in the user's saved listing for later perusal.`,
  })
  @ApiCreatedResponse({ description: `Successful post unsave` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/unsave')
  //todo
  unSave(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({
    description: `Set a suggested sort for a link.
     Suggested sorts are useful to display comments in a certain preferred way for posts.`,
  })
  @ApiCreatedResponse({ description: `Successful post suggested sort set` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/set-suggested-sort')
  //todo
  setSuggestedSort(@Body() defaultSortPostDto: DefaultSortPostDto) {
    return defaultSortPostDto;
  }

  @ApiOperation({
    description: `Get the total number of post views.`,
  })
  @ApiOkResponse({
    description: 'The resource was returned successfully',
    type: InsightsPostDto,
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  //todo
  @Get(':id/insights-counts')
  viewInsights(@Param('id') _id: string) {
    // TODO implement service

    const insightsPostDto: InsightsPostDto = new InsightsPostDto();
    insightsPostDto.insightsCount = 0;

    return insightsPostDto;
  }
}
