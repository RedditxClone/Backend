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
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
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
  create(@Body() _createSubredditDto: CreateSubredditDto) {
    // TODO: implement service
  }

  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ description: 'Add or edit a subreddit icon.' })
  @ApiCreatedResponse({ description: 'The resource was created successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':subreddit/icon')
  uploadIcon(@Param('subreddit') _subreddit: string, @UploadedFile() _file) {
    // TODO: implement service
  }

  @ApiOperation({ description: 'Add flair to a subreddit flairlist' })
  @ApiOperation({ description: 'Add or edit a subreddit icon' })
  @ApiCreatedResponse({ description: 'The resource was created successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':subreddit/flair')
  createFlair(@Param('subreddit') _subreddit: string) {
    // TODO: implement service
  }

  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ description: 'Add or edit a subreddit banner.' })
  @ApiCreatedResponse({ description: 'The resource was created successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':subreddit/banner')
  uploadBanner(@Param('subreddit') _subreddit: string, @UploadedFile() _file) {
    // TODO: implement service
  }

  @ApiOperation({ description: 'Get a subreddit flairlist.' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Get(':subreddit/flairlist')
  findFlairlist(@Param('subreddit') _subreddit: string) {
    // TODO: implement service
  }

  @ApiOperation({ description: 'Get the current settings of a subreddit.' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Get(':subreddit/about/edit')
  findSettings(@Param('subreddit') _subreddit: string) {
    // TODO: implement service
  }

  @ApiOperation({ description: 'Get a list of users relevant to moderators.' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Get(':subreddit/about/user')
  findUsersForMods(
    @Param('subreddit') _subreddit: string,
    @Query('role') _role: string,
  ) {
    // TODO: implement service
  }

  @ApiOperation({ description: 'Get a list of posts relevant to moderators.' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Get(':subreddit/about/post')
  findPostsForMods(
    @Param('subreddit') _subreddit: string,
    @Query('location') _location: string,
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
    @Param('subreddit') _subreddit: string,
    @Query('role') _role: string,
  ) {
    // TODO: implement service
  }

  @ApiOperation({ description: 'Update a subreddit settings' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch(':subreddit')
  update(
    @Param('subreddit') _subreddit: string,
    @Body() _UpdateSubredditDto: UpdateSubredditDto,
  ) {
    // TODO: implement service
  }

  @ApiOperation({ description: 'Delete a subreddit icon' })
  @ApiOkResponse({ description: 'The resource was deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Delete(':subreddit/icon')
  removeIcon(@Param('subreddit') _subreddit: string) {
    // TODO: implement service
  }

  @ApiOperation({ description: 'Delete flair from subreddit flairlist' })
  @ApiOkResponse({ description: 'The resource was deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Delete(':subreddit/flair')
  removeFlair(@Param('subreddit') _subreddit: string) {
    // TODO: implement service
  }

  @ApiOkResponse({ description: 'The resource was deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Delete(':subreddit/banner')
  removeBanner(@Param('subreddit') _subreddit: string) {
    // TODO: implement service
  }

  @ApiOperation({ description: 'Get the flairs of a user in a subreddit' })
  @ApiOkResponse({ description: 'The flairs returned successfully' })
  @ApiForbiddenResponse({ description: 'Only moderators are allowed' })
  @ApiBadRequestResponse({ description: 'The user id is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('/:subreddit/user/:user_id/flair')
  getUserFlairs(
    @Param('subreddit') subreddit: string,
    @Param('user_id') user_id: string,
  ) {
    return `${user_id}, ${subreddit}`;
  }

  @ApiOperation({ description: 'create a flair for a user in a subreddit' })
  @ApiCreatedResponse({ description: 'The flairs created successfully' })
  @ApiForbiddenResponse({ description: 'Only moderators are allowed' })
  @ApiBadRequestResponse({ description: 'The user id is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('/:subreddit/user/:user_id/flair')
  createUserFlair(
    @Param('subreddit') _subreddit: string,
    @Param('user_id') _user_id: string,
  ) {
    // todo
  }

  @ApiOperation({ description: 'Remove flairs from user in a subreddit' })
  @ApiOkResponse({ description: 'The flairs deleted successfully' })
  @ApiForbiddenResponse({ description: 'Only admin can perform this action' })
  @ApiBadRequestResponse({ description: 'The user id is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete('/:subreddit/user/:user_id/flair')
  deleteUserFlair(
    @Param('subreddit') _subreddit: string,
    @Param('user_id') _user_id: string,
  ) {
    // todo
  }

  @ApiOperation({ description: 'Get the flairs of a post in a subreddit' })
  @ApiOkResponse({ description: 'The flairs returned successfully' })
  @ApiForbiddenResponse({ description: 'Only admin can perform this action' })
  @ApiBadRequestResponse({ description: 'The post id is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('/:subreddit/post/:post_id/flair')
  getPostFlairs(
    @Param('subreddit') _subreddit: string,
    @Param('post_id') _post_id: string,
  ) {
    // todo
  }

  @ApiOperation({ description: 'create a flair for a post in a subreddit' })
  @ApiCreatedResponse({ description: 'The flairs created successfully' })
  @ApiForbiddenResponse({ description: 'Only admin can perform this action' })
  @ApiBadRequestResponse({ description: 'The post id is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('/:subreddit/post/:post_id/flair')
  createPostFlair(
    @Param('subreddit') _subreddit: string,
    @Param('post_id') _post_id: string,
  ) {
    // todo
  }

  @ApiOperation({ description: 'Remove flairs from post in a subreddit' })
  @ApiOkResponse({ description: 'The flairs deleted successfully' })
  @ApiForbiddenResponse({ description: 'Only admin can perform this action' })
  @ApiBadRequestResponse({ description: 'The post id is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete('/:subreddit/post/:post_id/flair')
  deletePostFlair(
    @Param('subreddit') _subreddit: string,
    @Param('post_id') _post_id: string,
  ) {
    // todo
  }

  @ApiOperation({ description: 'Get the flairs of the user in a subreddit' })
  @ApiOkResponse({ description: 'The flairs returned successfully' })
  @ApiBadRequestResponse({ description: 'User is not part of that community' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('/:subreddit/user/me/flair')
  getMyFlairsInSubreddit(@Param('subreddit') _subreddit: string) {
    // todo
  }

  // GET /api/subreddit/:subreddit/{hot,new,top,random}
  @ApiOperation({ description: 'Get the hottest subreddits' })
  @ApiOkResponse({ description: 'The hottest subreddits returned' })
  @Get('/:subreddit/hot')
  getHotSubreddits(@Param('subreddit') _subreddit: string) {
    // todo
  }

  @ApiOperation({ description: 'Get the newest subreddits' })
  @ApiOkResponse({ description: 'The newest subreddits returned successfully' })
  @Get('/:subreddit/new')
  getNewSubreddits(@Param('subreddit') _subreddit: string) {
    // todo
  }

  @ApiOperation({ description: 'Get the top subreddits' })
  @ApiOkResponse({ description: 'The top subreddits returned successfully' })
  @Get('/:subreddit/top')
  getTopSubreddits(@Param('subreddit') _subreddit: string) {
    // todo
  }

  @ApiOperation({ description: 'Get subreddits randomally' })
  @ApiOkResponse({ description: 'The random subreddits returned successfully' })
  @Get('/:subreddit/random')
  getRandomSubreddits(@Param('subreddit') _subreddit: string) {
    // todo
  }
  // TODO
  // - DELETE /api/subreddit/:subreddit/me/flair*
  // - POST /api/subreddit/:subreddit/me/flair*
  // - GET /api/subreddit/:subreddit/flair*
  // - POST /api/subreddit/:subreddit/flair*
  // - UPDATE /api/subreddit/:subreddit/flair*
}
