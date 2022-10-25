import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubredditService } from './subreddit.service';
import { CreateSubredditDto } from './dto/create-subreddit.dto';
import { UpdateSubredditDto } from './dto/update-subreddit.dto';

@Controller('subreddit')
export class SubredditController {
  constructor(private readonly subredditService: SubredditService) {}

  @Post()
  create(@Body() createSubredditDto: CreateSubredditDto) {
    return this.subredditService.create(createSubredditDto);
  }

  @Get()
  findAll() {
    return this.subredditService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subredditService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubredditDto: UpdateSubredditDto) {
    return this.subredditService.update(+id, updateSubredditDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subredditService.remove(+id);
  }
}
