import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JWTUserGuard } from '../auth/guards';
import { ParseObjectIdPipe } from '../utils/utils.service';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { PostCommentService } from './post-comment.service';

@Controller('thing')
export class PostCommentController {
  constructor(private readonly postCommentService: PostCommentService) {}

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
  upvote(@Param('thing', ParseObjectIdPipe) thingId, @Req() req) {
    return this.postCommentService.upvote(thingId, req.user._id);
  }

  @ApiOperation({
    description: 'downvote post or comment',
  })
  @ApiCreatedResponse({ description: 'downvoted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Request' })
  @ApiBadRequestResponse({ description: 'invalid mongo id' })
  @UseGuards(JWTUserGuard)
  @Post('/:thing/downvote')
  downvote(@Param('thing', ParseObjectIdPipe) thingId, @Req() req) {
    return this.postCommentService.downvote(thingId, req.user._id);
  }

  @ApiOperation({
    description: 'remove upvote or downvote for post or comment',
  })
  @ApiCreatedResponse({ description: 'removed successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Request' })
  @ApiBadRequestResponse({ description: 'invalid mongo id' })
  @UseGuards(JWTUserGuard)
  @Post('/:thing/unvote')
  unvote(@Param('thing', ParseObjectIdPipe) thingId, @Req() req) {
    return this.postCommentService.unvote(thingId, req.user._id);
  }
}
