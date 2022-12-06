import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';

import { IsUserExistGuard } from '../auth/guards/is-user-exist.guard';
import { GeneralSearchDto } from './dto/general-search.dto';
import { GetSearchDto } from './dto/get-search-dto';
import { SubredditSearchDto } from './dto/subreddit-search.dto';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiProperty({ description: 'get all search results' })
  @ApiOkResponse({
    description: 'search has been returned successfully',
    type: [GetSearchDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Get('')
  generalSearch(@Query() _dto: GeneralSearchDto) {
    return {
      searchResult: [],
    };
  }

  @UseGuards(IsUserExistGuard)
  @ApiProperty({ description: 'search for people' })
  @Get('/peoples')
  searchPeople(@Query('word') word, @Req() req) {
    return this.searchService.searchPeople(word, 10, req._id);
  }

  @ApiProperty({ description: 'search for people' })
  @Get('/communities')
  searchCommunities(@Query('word') word) {
    return this.searchService.searchCommunities(word, 10);
  }

  @UseGuards(IsUserExistGuard)
  @ApiProperty({ description: 'search for people' })
  @Get('/posts')
  searchPosts(@Query('word') word, @Req() req) {
    return this.searchService.searchPosts(word, 10, req._id);
  }

  @UseGuards(IsUserExistGuard)
  @ApiProperty({ description: 'search for people' })
  @Get('/comments')
  searchComments(@Query('word') word, @Req() req) {
    return this.searchService.searchComments(word, 10, req._id);
  }

  @ApiProperty({ description: 'get subreddit search results' })
  @ApiOkResponse({
    description: 'return all subreddits search result',
    type: [GetSearchDto],
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Get('/subreddit/:subreddit')
  subredditSearch(@Query() _dto: SubredditSearchDto) {
    // return {
    //   searchResult: [],
    // };
  }
}
