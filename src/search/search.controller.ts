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
  searchPeople(
    @Query('word') word,
    @Query('page') page,
    @Query('limit') limit,
    @Req() req,
  ) {
    return this.searchService.searchPeople(word, page, limit, req._id);
  }

  @ApiProperty({ description: 'search for communities' })
  @UseGuards(IsUserExistGuard)
  @Get('/communities')
  searchCommunities(
    @Query('word') word,
    @Query('page') page,
    @Query('limit') limit,
    @Req() { user },
  ) {
    return this.searchService.searchCommunities(word, page, limit, user);
  }

  @ApiProperty({
    description: 'search for communities starts with any word or character',
  })
  @UseGuards(IsUserExistGuard)
  @Get('/communities/start')
  searchCommunitiesStartsWith(
    @Query('word') word,
    @Query('page') page,
    @Query('limit') limit,
    @Req() { user },
  ) {
    return this.searchService.searchCommunitiesStartsWith(
      word,
      page,
      limit,
      user,
    );
  }

  @UseGuards(IsUserExistGuard)
  @ApiProperty({ description: 'search for posts' })
  @Get('/posts')
  searchPosts(@Query('word') word, @Query() query, @Req() req) {
    return this.searchService.searchPosts(word, query, req._id);
  }

  @UseGuards(IsUserExistGuard)
  @ApiProperty({ description: 'search for comments' })
  @Get('/comments')
  searchComments(
    @Query('word') word,
    @Query('page') page,
    @Query('limit') limit,
    @Req() req,
  ) {
    page = Number(page);

    return this.searchService.searchComments(word, page, limit, req._id);
  }

  @UseGuards(IsUserExistGuard)
  @ApiProperty({ description: 'genral search' })
  @Get('/general')
  searchGeneral(@Query('word') word, @Req() { user }) {
    return Promise.all([
      this.searchService.searchPeople(word, 1, 5, user?._id),
      this.searchService.searchCommunities(word, 1, 5, user),
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
    return this.searchService.searchFlairs(word, subreddit, page, limit);
  }
}
