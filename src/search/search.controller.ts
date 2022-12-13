import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

import { IsUserExistGuard } from '../auth/guards/is-user-exist.guard';
import { ParseObjectIdPipe } from '../utils/utils.service';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @UseGuards(IsUserExistGuard)
  @ApiProperty({ description: 'search for people' })
  @Get('/peoples')
  searchPeople(@Query('word') word, @Query('page') page, @Req() req) {
    return this.searchService.searchPeople(word, Number(page), 10, req._id);
  }

  @ApiProperty({ description: 'search for communities' })
  @Get('/communities')
  searchCommunities(@Query('word') word, @Query('page') page) {
    page = Number(page);

    return this.searchService.searchCommunities(word, page ?? 1, 10);
  }

  @UseGuards(IsUserExistGuard)
  @ApiProperty({ description: 'search for posts' })
  @Get('/posts')
  searchPosts(@Query('word') word, @Query('page') page, @Req() req) {
    return this.searchService.searchPosts(word, Number(page), 10, req._id);
  }

  @UseGuards(IsUserExistGuard)
  @ApiProperty({ description: 'search for comments' })
  @Get('/comments')
  searchComments(@Query('word') word, @Query('page') page, @Req() req) {
    return this.searchService.searchComments(word, Number(page), 10, req._id);
  }

  @UseGuards(IsUserExistGuard)
  @ApiProperty({ description: 'genral search' })
  @Get('/general')
  searchGeneral(@Query('word') word, @Req() req) {
    return Promise.all([
      this.searchService.searchPeople(word, 1, 5, req._id),
      this.searchService.searchCommunities(word, 1, 5),
    ]);
  }

  @ApiProperty({ description: 'search for flairs' })
  @Get('/subreddit/:subreddit/flairs')
  searchFlairs(
    @Query('word') word,
    @Param('subreddit', ParseObjectIdPipe) subreddit,
    @Query('page') page,
    @Query('limit') limit,
  ) {
    limit = Number(limit);
    page = Number(page);

    return this.searchService.searchFlairs(
      word,
      subreddit,
      page ?? 1,
      limit ?? 50,
    );
  }
}
