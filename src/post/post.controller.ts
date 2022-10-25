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
import {
  ApiBody,
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
  @Patch(':id/edit')
  //todo
  update(@Param('id') id: string, @Body() createCommentDto: CreatePostDto) {
    return this.postService.update(+id, createCommentDto);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        dir: {
          type: 'boolean',
        },
      },
    },
  })
  @ApiOperation({
    description: `Follow or unFollow a post.    
       To follow, follow should be True.
       To unFollow, follow should be False. 
       The user must have access to the subreddit to be able to follow a post within it.`,
  })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/follow')
  //todo
  follow(@Param('id') id: string, @Body() follow: boolean) {
    return follow;
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
  @ApiOkResponse({ description: `Successful post mark` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/mark_nsfw')
  //todo
  markNsfw(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({ description: `Mark a post NSFW.` })
  @ApiOkResponse({ description: `Successful post mark` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/unmark_nsfw')
  //todo
  unMarkNsfw(@Param('id') id: string) {
    return id;
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
    },
  })
  @ApiOperation({
    description: `Brings it to the attention of the subreddit's moderators and marks it as spam.`,
  })
  @ApiOkResponse({ description: `Successful post report spam` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/spam')
  //todo
  spam(@Param('id') id: string, @Body() message: string) {
    return message;
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        state: {
          type: 'boolean',
        },
      },
    },
  })
  @ApiOperation({ description: `Enable or disable inbox replies for a post.` })
  @ApiOkResponse({ description: `Successful post replies set` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/send_replies')
  //todo
  sendReplies(@Param('id') id, @Body() state: boolean) {
    return state;
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

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        dir: {
          type: 'integer',
        },
      },
    },
  })
  @ApiOperation({
    description: `Cast a vote on a post.`,
  })
  @ApiOkResponse({ description: `Successful post vote` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/vote')
  //todo
  vote(@Param('id') id, @Body() dir: number) {
    return dir;
  }
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
        },
      },
    },
  })
  @ApiOperation({
    description: `Save post, Saved things are kept in the user's saved listing for later perusal.`,
  })
  @ApiOkResponse({ description: `Successful post save` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/save')
  //todo
  save(@Param('id') id: string, @Body() category: string) {
    return category;
  }
  @ApiOperation({
    description: `UnSave post, Saved things are kept in the user's saved listing for later perusal.`,
  })
  @ApiOkResponse({ description: `Successful post unsave` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/unsave')
  //todo
  unSave(@Param('id') id: string) {
    return id;
  }
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sort: {
          type: 'string',
        },
      },
    },
  })
  @ApiOperation({
    description: `Set a suggested sort for a link.
     Suggested sorts are useful to display comments in a certain preferred way for posts.`,
  })
  @ApiOkResponse({ description: `Successful post suggested sort set` })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/set_suggested_sort')
  //todo
  setSuggestedSort(@Body() sort: string) {
    return sort;
  }
}
