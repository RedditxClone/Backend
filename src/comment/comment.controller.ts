import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { Types } from 'mongoose';

import { User } from '../auth/decorators/user.decorator';
import { JWTUserGuard } from '../auth/guards';
import { PostCommentService } from '../post-comment/post-comment.service';
import { ParseObjectIdPipe } from '../utils/utils.service';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly postCommentService: PostCommentService,
  ) {}

  @ApiOperation({ description: 'Submit a new comment.' })
  @ApiCreatedResponse({
    description: 'The resource was created successfully',
    type: CreateCommentDto,
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Post('submit')
  async create(
    @User('username') username: string,
    @User('_id') userId: Types.ObjectId,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(username, userId, createCommentDto);
  }

  @ApiOperation({ description: 'Deletes a comment.' })
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
    return this.postCommentService.remove(id, userId, 'Comment', username);
  }

  @ApiOperation({ description: 'Edit the body text of a comment.' })
  @ApiOkResponse({
    description: 'The resource was updated successfully',
    type: UpdateCommentDto,
  })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateCommentDto,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.postCommentService.update(id, dto, userId);
  }

  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Get(':id')
  get(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.postCommentService.get(id, 'Comment');
  }
}
