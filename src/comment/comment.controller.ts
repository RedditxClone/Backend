import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TextDto } from './dto/text.dto';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({ description: 'Submit a new comment.' })
  @ApiCreatedResponse({ description: 'The resource was created successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post()
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @ApiOperation({ description: 'Deletes a comment.' })
  @ApiOkResponse({ description: 'The resource was deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }

  @ApiOperation({ description: 'Edit the body text of a comment.' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch('/edit/:id')
  //todo
  update(@Param('id') id: string, @Body() updateCommentDto: CreateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @ApiOperation({
    description: 'Prevents new child comments from receiving new comments.',
  })
  @ApiOkResponse({ description: 'Successful comment lock' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch(':id/lock')
  //todo
  lock(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({
    description: 'Unlock a comment, allows a comment to receive new comments.',
  })
  @ApiOkResponse({ description: 'Successful comment unlock' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/unlock')
  //todo
  unlock(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({
    description:
      "Brings it to the attention of the subreddit's moderators and marks it as spam.",
  })
  @ApiOkResponse({ description: 'Successful comment report spam' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/spam')
  //todo
  spam(@Param('id') id: string, @Body() textDto: TextDto) {
    return textDto;
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
    description:
      "Save comment, Saved things are kept in the user's saved listing for later perusal.",
  })
  @ApiCreatedResponse({ description: 'Successful comment save' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/save')
  //todo
  save(@Param('id') id: string, @Body() category: string) {
    return category;
  }
  @ApiOperation({
    description:
      "UnSave a link or comment, this removes the thing from the user's saved listings as well.",
  })
  @ApiCreatedResponse({ description: 'Successful comment unsave' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Delete(':id/unsave')
  //todo
  unSave(@Param('id') id: string) {
    return id;
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
  @ApiOperation({
    description:
      'Enable or disable inbox replies for a comment, true to enable.',
  })
  @ApiOkResponse({ description: 'Successful comment set inbox replies' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/send_replies/:id')
  //todo
  sendReplies(@Param('id') id, @Body() state: boolean) {
    return state;
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
    description: `Cast a vote on a comment. 
    dir indicates the direction of the vote. Voting 1 is an upvote,
     -1 is a downvote, and 0 is equivalent to "un-voting" by clicking again on a highlighted arrow.`,
  })
  @ApiOkResponse({ description: 'Successful comment vote' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/vote/:id')
  //todo
  vote(@Param('id') id, @Body() dir: number) {
    return id;
  }
}
