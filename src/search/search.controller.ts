import { Controller, Get, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse } from '@nestjs/swagger';
import { GeneralSearchDto } from './dto/general-search.dto';
import { SubredditSearchDto } from './dto/subreddit-search.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  @ApiOkResponse({ description: 'search has been returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Get('')
  generalSearch(@Query() dto: GeneralSearchDto) {
    return {
      searchResult: [],
    };
  }

  @ApiOkResponse({ description: 'search has been returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Get('/subreddit/:subreddit')
  subredditSearch(@Query() dto: SubredditSearchDto) {
    return {
      searchResult: [],
    };
  }
}
