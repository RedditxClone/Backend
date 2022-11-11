import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JWTUserGuard } from '../auth/guards';
import { CommentService } from './comment.service';
import {
  CreateCommentDto,
  SendRepliesCommentDto,
  SpamCommentDto,
  UpdateCommentDto,
  VoteCommentDto,
} from './dto';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({ description: 'Submit a new comment.' })
  @ApiCreatedResponse({
    description: 'The resource was created successfully',
    type: CreateCommentDto,
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Post('submit')
  async create(@Req() req, @Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(req.user._id, createCommentDto);
  }

  @ApiOperation({ description: 'Deletes a comment.' })
  @ApiOkResponse({ description: 'The resource was deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(Number(id));
  }

  @ApiOperation({ description: 'Edit the body text of a comment.' })
  @ApiOkResponse({
    description: 'The resource was updated successfully',
    type: UpdateCommentDto,
  })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch(':id/edit')
  //todo
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(Number(id), updateCommentDto);
  }

  @ApiOperation({
    description: 'Prevents new child comments from receiving new comments.',
  })
  @ApiCreatedResponse({ description: 'Successful comment lock' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/lock')
  //todo
  lock(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({
    description: 'Unlock a comment, allows a comment to receive new comments.',
  })
  @ApiCreatedResponse({ description: 'Successful comment unlock' })
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
  @ApiCreatedResponse({ description: 'Successful comment report spam' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/spam')
  //todo
  spam(@Param('id') id: string, @Body() spamCommentDto: SpamCommentDto) {
    return spamCommentDto;
  }

  @ApiOperation({
    description:
      "Save comment, Saved things are kept in the user's saved listing for later perusal.",
  })
  @ApiCreatedResponse({ description: 'Successful comment save' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/save')
  //todo
  save(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({
    description:
      "UnSave a link or comment, this removes the thing from the user's saved listings as well.",
  })
  @ApiCreatedResponse({ description: 'Successful comment unsave' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/unsave')
  //todo
  unSave(@Param('id') id: string) {
    return id;
  }

  @ApiOperation({
    description:
      'Enable or disable inbox replies for a comment, true to enable.',
  })
  @ApiCreatedResponse({ description: 'Successful comment set inbox replies' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/send_replies/')
  //todo
  sendReplies(
    @Param('id') id,
    @Body() sendRepliesCommentDto: SendRepliesCommentDto,
  ) {
    return sendRepliesCommentDto;
  }

  @ApiOperation({
    description: `Cast a vote on a comment. 
    dir indicates the direction of the vote. Voting 1 is an upvote,
     -1 is a downvote, and 0 is equivalent to "un-voting" by clicking again on a highlighted arrow.`,
  })
  @ApiCreatedResponse({ description: 'Successful comment vote' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':id/vote')
  //todo
  vote(@Param('id') id, @Body() voteCommentDto: VoteCommentDto) {
    return voteCommentDto;
  }
}
