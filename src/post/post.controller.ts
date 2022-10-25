import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ description: 'Submit a post to a subreddit.' })
  @ApiCreatedResponse({ description: 'The resource was created successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnprocessableEntityResponse({
    description:
      'If a link with the same URL has already been submitted to the specified subreddit an error will be returned unless resubmit is true.',
  })
  @Post('/submit')
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  // @Get()
  // findAll() {
  //   return this.postService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.postService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
  //   return this.postService.update(+id, updatePostDto);
  // }

  @ApiOperation({ description: 'Deletes a post.' })
  @ApiOkResponse({ description: 'The resource was deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
  @ApiOperation({ description: 'Edit the body text of a post.' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch('/edit')
  //todo
  edit(@Body() body: any) {
    return body;
  }
  @ApiOperation({
    description: `Follow or unFollow a post.    
       To follow, follow should be True.
       To unFollow, follow should be False. 
       The user must have access to the subreddit to be able to follow a post within it.`,
  })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/follow')
  //todo
  follow(@Body() body: any) {
    return body;
  }
  @ApiOperation({
    description: `Hide a post, this removes it from the user's default view of subreddit listings.`,
  })
  @ApiOkResponse({ description: `Successful post hide` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/hide')
  //todo
  hide(@Body() body: any) {
    return body;
  }
  @ApiOperation({
    description: `UnHide a post, this removes the hide property from a post thus it can reappear again.`,
  })
  @ApiOkResponse({ description: `Successful post unhide` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/unhide')
  //todo
  unhide(@Body() body: any) {
    return body;
  }
  @ApiOperation({
    description: `Lock a post. Prevents a post from receiving new comments.`,
  })
  @ApiOkResponse({ description: `Successful post lock` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/lock')
  //todo
  lock(@Body() body: any) {
    return body;
  }
  @ApiOperation({
    description: `UnLock a post. Prevents a post from receiving new comments.`,
  })
  @ApiOkResponse({ description: `Successful post Unlock` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/unlock')
  //todo
  unlock(@Body() body: any) {
    return body;
  }
  @ApiOperation({ description: `UnMark a post NSFW.` })
  @ApiOkResponse({ description: `Successful post mark` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/mark_nsfw')
  //todo
  markNsfw(@Body() body: any) {
    return body;
  }
  @ApiOperation({ description: `Mark a post NSFW.` })
  @ApiOkResponse({ description: `Successful post mark` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/unmark_nsfw')
  //todo
  unMarkNsfw(@Body() body: any) {
    return body;
  }
  @ApiOperation({
    description: `Brings it to the attention of the subreddit's moderators and marks it as spam.`,
  })
  @ApiOkResponse({ description: `Successful post report spam` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/spam')
  //todo
  spam(@Body() body: any) {
    return body;
  }
  @ApiOperation({ description: `Enable or disable inbox replies for a post.` })
  @ApiOkResponse({ description: `Successful post replies set` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/send_replies')
  //todo
  sendReplies(@Body() body: any) {
    return body;
  }
  @ApiOperation({
    description: `Flag the post as spoiler.`,
  })
  @ApiOkResponse({ description: `Successful post spoiler` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/spoiler')
  //todo
  spoiler(@Body() body: any) {
    return body;
  }
  @ApiOperation({
    description: `Flag the post as not spoiler.`,
  })
  @ApiOkResponse({ description: `Successful post unSpoiler` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/unspoiler')
  //todo
  unSpoiler(@Body() body: any) {
    return body;
  }
  @ApiOperation({
    description: `Cast a vote on a post.`,
  })
  @ApiOkResponse({ description: `Successful post vote` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/vote')
  //todo
  vote(@Body() body: any) {
    return body;
  }
  @ApiOperation({
    description: `Save post, Saved things are kept in the user's saved listing for later perusal.`,
  })
  @ApiOkResponse({ description: `Successful post save` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/save')
  //todo
  save(@Body() body: any) {
    return body;
  }
  @ApiOperation({
    description: `UnSave post, Saved things are kept in the user's saved listing for later perusal.`,
  })
  @ApiOkResponse({ description: `Successful post unsave` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/unsave')
  //todo
  unSave(@Body() body: any) {
    return body;
  }
  @ApiOperation({
    description: `Set a suggested sort for a link.
     Suggested sorts are useful to display comments in a certain preferred way for posts.`,
  })
  @ApiOkResponse({ description: `Successful post suggested sort set` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/set_suggested_sort')
  //todo
  setSuggestedSort(@Body() body: any) {
    return body;
  }
}
