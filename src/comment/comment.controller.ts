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
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({ description: 'Submit a new comment.' })
  @ApiCreatedResponse({ description: 'The resource was created successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  // @ApiBody({ description: 'Create some resource' })
  @Post()
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  // @Get()
  // findAll() {
  //   return this.commentService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.commentService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
  //   return this.commentService.update(+id, updateCommentDto);
  // }

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
  @Patch('/edit')
  //todo
  edit(@Body() body: any) {
    return body;
  }

  @ApiOperation({
    description: 'Prevents new child comments from receiving new comments.',
  })
  @ApiOkResponse({ description: 'Successful comment lock' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/lock')
  //todo
  lock(@Body() body: any) {
    return body;
  }

  @ApiOperation({
    description: 'Unlock a comment, allows a comment to receive new comments.',
  })
  @ApiOkResponse({ description: 'Successful comment unlock' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/unlock')
  //todo
  unlock(@Body() body: any) {
    return body;
  }

  @ApiOperation({
    description:
      "Brings it to the attention of the subreddit's moderators and marks it as spam.",
  })
  @ApiOkResponse({ description: 'Successful comment report spam' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/spam')
  //todo
  spam(@Body() body: any) {
    return body;
  }

  @ApiOperation({
    description:
      "Save comment, Saved things are kept in the user's saved listing for later perusal.",
  })
  @ApiCreatedResponse({ description: 'Successful comment save' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/save')
  //todo
  save(@Body() body: any) {
    return body;
  }
  @ApiOperation({
    description:
      "UnSave a link or comment, this removes the thing from the user's saved listings as well.",
  })
  @ApiCreatedResponse({ description: 'Successful comment unsave' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/unsave')
  //todo
  unSave(@Body() body: any) {
    return body;
  }

  @ApiOperation({
    description: 'Enable or disable inbox replies for a comment.',
  })
  @ApiOkResponse({ description: 'Successful comment set inbox replies' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/send_replies')
  //todo
  sendReplies(@Body() body: any) {
    return body;
  }

  @ApiOperation({
    description: 'Cast a vote on a comment.',
  })
  @ApiOkResponse({ description: 'Successful comment vote' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post('/vote')
  //todo
  vote(@Body() body: any) {
    return body;
  }
}
