import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';

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
