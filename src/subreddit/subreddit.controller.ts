import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CreateSubredditDto } from './dto/create-subreddit.dto';
import { UpdateSubredditDto } from './dto/update-subreddit.dto';
import { SubredditService } from './subreddit.service';

@ApiTags('subreddit')
@Controller('subreddit')
export class SubredditController {
  constructor(private readonly subredditService: SubredditService) {}

  @ApiOperation({ description: 'Create a new subreddit' })
  @ApiCreatedResponse({ description: 'The resource was created succesfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post()
  create(@Body() createSubredditDto: CreateSubredditDto) {
    // TODO: implement service
  }

  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ description: "Add or edit a subreddit's icon." })
  @ApiCreatedResponse({ description: 'The resource was created successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':subreddit/icon')
  uploadIcon(@Param('subreddit') subreddit: string, @UploadedFile() file) {
    // TODO: implement service
    return;
  }

  @ApiOperation({ description: "Add flair to a subreddit's flairlist." })
  @ApiOperation({ description: "Add or edit a subreddit's icon." })
  @ApiCreatedResponse({ description: 'The resource was created successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':subreddit/flair')
  createFlair(@Param('subreddit') subreddit: string) {
    // TODO: implement service
    return;
  }

  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ description: "Add or edit a subreddit's banner." })
  @ApiCreatedResponse({ description: 'The resource was created successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':subreddit/banner')
  uploadBanner(@Param('subreddit') subreddit: string, @UploadedFile() file) {
    // TODO: implement service
    return;
  }

  @ApiOperation({ description: "Get a subreddit's flairlist." })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Get(':subreddit/flairlist')
  findFlairlist(@Param('subreddit') subreddit: string) {
    // TODO: implement service
  }

  @ApiOperation({ description: 'Get the current settings of a subreddit.' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Get(':subreddit/about/edit')
  findSettings(@Param('subreddit') subreddit: string) {
    // TODO: implement service
  }

  @ApiOperation({ description: 'Get a list of users relevant to moderators.' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Get(':subreddit/about/user')
  findUsersForMods(
    @Param('subreddit') subreddit: string,
    @Query('role') role: string,
  ) {
    // TODO: implement service
  }

  @ApiOperation({ description: 'Get a list of posts relevant to moderators.' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Get(':subreddit/about/post')
  findPostsForMods(
    @Param('subreddit') subreddit: string,
    @Query('location') location: string,
  ) {
    // TODO: implement service
  }

  @ApiOperation({
    description: 'Get subreddits the user has a specific role in.',
  })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Get('mine')
  findUserSubreddits(
    @Param('subreddit') subreddit: string,
    @Query('role') role: string,
  ) {
    // TODO: implement service
  }

  @ApiOperation({ description: "Update a subreddit's settings." })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch(':subreddit')
  update(
    @Param('subreddit') subreddit: string,
    @Body() UpdateSubredditDto: UpdateSubredditDto,
  ) {
    // TODO: implement service
  }

  @ApiOperation({ description: "Delete a subreddit's icon." })
  @ApiOkResponse({ description: 'The resource was deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Delete(':subreddit/icon')
  removeIcon(@Param('subreddit') subreddit: string) {
    // TODO: implement service
    return;
  }

  @ApiOperation({ description: "Delete flair from subreddit's flairlist." })
  @ApiOkResponse({ description: 'The resource was deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Delete(':subreddit/flair')
  removeFlair(@Param('subreddit') subreddit: string) {
    // TODO: implement service
    return;
  }

  @ApiOkResponse({ description: 'The resource was deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Delete(':subreddit/banner')
  removeBanner(@Param('subreddit') subreddit: string) {
    // TODO: implement service
    return;
  }
}
