import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

import { User } from '../auth/decorators/user.decorator';
import { JWTUserGuard } from '../auth/guards';
import { IsUserExistGuard } from '../auth/guards/is-user-exist.guard';
import { PaginationParamsDto } from '../utils/apiFeatures/dto';
import { ParseObjectIdPipe } from '../utils/utils.service';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { PostCommentService } from './post-comment.service';

@Controller('thing')
export class PostCommentController {
  constructor(private readonly postCommentService: PostCommentService) {}

  @ApiOkResponse({ description: 'posts returned successfully' })
  @ApiUnauthorizedResponse({ description: 'you must login first' })
  @UseGuards(JWTUserGuard)
  @Get('upvoted')
  getUpvoted(
    @User('_id') userId: Types.ObjectId,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.postCommentService.getUpvoted(userId, pagination);
  }

  @ApiOkResponse({ description: 'posts returned successfully' })
  @ApiUnauthorizedResponse({ description: 'you must login first' })
  @UseGuards(JWTUserGuard)
  @Get('downvoted')
  getDownvoted(
    @User('_id') userId: Types.ObjectId,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.postCommentService.getDownvoted(userId, pagination);
  }

  @Post()
  create(@Body() createPostCommentDto: CreatePostCommentDto) {
    return this.postCommentService.create(createPostCommentDto);
  }

  @Get()
  findAll() {
    return this.postCommentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postCommentService.findOne(Number(id));
  }

  @ApiOperation({
    description: 'upvote post or comment',
  })
  @ApiCreatedResponse({ description: 'upvoted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Request' })
  @ApiBadRequestResponse({ description: 'invalid mongo id' })
  @UseGuards(JWTUserGuard)
  @Post('/:thing/upvote')
  upvote(
    @Param('thing', ParseObjectIdPipe) thingId,
    @User('_id') userId: Types.ObjectId,
    @User('dontNotifyIds') dontNotifyIds: Types.ObjectId[],
  ) {
    return this.postCommentService.upvote(thingId, userId, dontNotifyIds);
  }

  @ApiOperation({
    description: 'downvote post or comment',
  })
  @ApiCreatedResponse({ description: 'downvoted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Request' })
  @ApiBadRequestResponse({ description: 'invalid mongo id' })
  @UseGuards(JWTUserGuard)
  @Post('/:thing/downvote')
  downvote(
    @Param('thing', ParseObjectIdPipe) thingId,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.postCommentService.downvote(thingId, userId);
  }

  @ApiOperation({
    description: 'remove upvote or downvote for post or comment',
  })
  @ApiCreatedResponse({ description: 'removed successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Request' })
  @ApiBadRequestResponse({ description: 'invalid mongo id' })
  @UseGuards(JWTUserGuard)
  @Post('/:thing/unvote')
  unvote(
    @Param('thing', ParseObjectIdPipe) thingId,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.postCommentService.unvote(thingId, userId);
  }

  @ApiOperation({
    description: 'spam post or comment',
  })
  @ApiCreatedResponse({ description: 'spammed successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Request' })
  @ApiBadRequestResponse({ description: 'invalid mongo id' })
  @ApiNotFoundResponse({
    description: 'wrong post id or you are not the moderator',
  })
  @UseGuards(JWTUserGuard)
  @Post('/:thing/spam')
  spam(
    @Param('thing', ParseObjectIdPipe) thingId: Types.ObjectId,
    @User('username') username: string,
  ) {
    return this.postCommentService.spam(username, thingId);
  }

  @ApiOperation({
    description: 'unspam post or comment',
  })
  @ApiCreatedResponse({ description: 'unspammed successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Request' })
  @ApiBadRequestResponse({ description: 'invalid mongo id' })
  @ApiNotFoundResponse({
    description: 'wrong post id or you are not the moderator',
  })
  @UseGuards(JWTUserGuard)
  @Post('/:thing/unspam')
  unspam(
    @Param('thing', ParseObjectIdPipe) thingId: Types.ObjectId,
    @User('username') username: string,
  ) {
    return this.postCommentService.unspam(username, thingId);
  }

  @ApiOperation({
    description: 'remove post or comment',
  })
  @ApiCreatedResponse({ description: 'removed successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Request' })
  @ApiBadRequestResponse({ description: 'invalid mongo id' })
  @ApiNotFoundResponse({
    description: 'wrong post id or you are not the moderator',
  })
  @UseGuards(JWTUserGuard)
  @Post('/:thing/remove')
  disapprove(
    @Param('thing', ParseObjectIdPipe) thingId: Types.ObjectId,
    @User('username') username: string,
  ) {
    return this.postCommentService.disApprove(username, thingId);
  }

  @UseGuards(IsUserExistGuard)
  @Get('user/:username')
  getThingsOfUser(
    @Param('username') username: string,
    @Req() req,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.postCommentService.getThingsOfUser(
      username,
      req._id,
      pagination,
    );
  }
}
