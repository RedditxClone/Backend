import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { PostCommentService } from './post-comment.service';

@Controller('post-comment')
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
}
