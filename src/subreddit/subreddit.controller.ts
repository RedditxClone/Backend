import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

import { User } from '../auth/decorators/user.decorator';
import { JWTUserGuard } from '../auth/guards/user.guard';
import { ParseObjectIdPipe } from '../utils/utils.service';
import { CreateSubredditDto } from './dto/create-subreddit.dto';
import { FlairDto } from './dto/flair.dto';
import { RuleDto } from './dto/rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { UpdateSubredditDto } from './dto/update-subreddit.dto';
import type { SubredditDocument } from './subreddit.schema';
import { SubredditService } from './subreddit.service';

@ApiTags('subreddit')
@Controller('subreddit')
export class SubredditController {
  constructor(private readonly subredditService: SubredditService) {}

  @ApiOperation({ description: 'Create a new subreddit' })
  @ApiCreatedResponse({ description: 'The resource was created succesfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiConflictResponse({ description: 'Subreddit name already exists' })
  @UseGuards(JWTUserGuard)
  @Post()
  createSubreddit(
    @Body() createSubredditDto: CreateSubredditDto,
    @User('username') username: string,
  ): Promise<SubredditDocument> {
    return this.subredditService.create(createSubredditDto, username);
  }

  @ApiOperation({ description: 'Get subreddit by name' })
  @ApiOkResponse({ description: 'The subreddit returned succesfully' })
  @ApiBadRequestResponse({ description: "The subreddit name doesn't exist" })
  @Get('/r/:subreddit_name')
  getSubredditByName(
    @Param('subreddit_name') subredditName: string,
  ): Promise<SubredditDocument> {
    return this.subredditService.findSubredditByName(subredditName);
  }

  @ApiOperation({ description: 'Check if subreddit name is available' })
  @ApiOkResponse({
    description: 'Subreddit Name Available',
  })
  @ApiConflictResponse({ description: 'Subreddit name is unavailable' })
  @Get('/r/:subreddit_name/available')
  checkSubredditAvailable(
    @Param('subreddit_name')
    subredditName: string,
  ) {
    return this.subredditService.checkSubredditAvailable(subredditName);
  }

  @ApiOperation({ description: 'Get subreddit by id' })
  @ApiOkResponse({ description: 'The subreddit returned succesfully' })
  @ApiBadRequestResponse({ description: "The subreddit id doesn't exist" })
  @Get('/:subreddit')
  getSubreddit(
    @Param('subreddit') subreddit: string,
  ): Promise<SubredditDocument> {
    return this.subredditService.findSubreddit(subreddit);
  }

  @UseInterceptors(FileInterceptor('icon'))
  @ApiOperation({ description: 'Add or edit a subreddit icon.' })
  @ApiCreatedResponse({ description: 'The resource was created successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Post(':subreddit/icon')
  uploadIcon(
    @Param('subreddit') subreddit: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 10_485_760,
        })
        .build(),
    )
    file,
  ) {
    return this.subredditService.uploadIcon(subreddit, file);
  }

  @ApiProperty({ description: 'join subreddit' })
  @ApiCreatedResponse({ description: 'joined successfully' })
  @ApiUnauthorizedResponse({ description: 'must be logged in' })
  @ApiBadRequestResponse({ description: 'wrong subreddit id' })
  @UseGuards(JWTUserGuard)
  @Post('/:subreddit/join')
  joinSubreddit(
    @User('_id') userId: Types.ObjectId,
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
  ) {
    return this.subredditService.joinSubreddit(userId, subreddit);
  }

  @ApiProperty({ description: 'leave subreddit' })
  @ApiCreatedResponse({ description: 'left successfully' })
  @ApiUnauthorizedResponse({ description: 'must be logged in' })
  @ApiBadRequestResponse({ description: 'user is not inside subreddit' })
  @UseGuards(JWTUserGuard)
  @Post('/:subreddit/leave')
  leaveSubreddit(
    @User('_id') userId: Types.ObjectId,
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
  ) {
    return this.subredditService.leaveSubreddit(userId, subreddit);
  }

  @ApiOperation({ description: 'create a post flair in a subreddit' })
  @ApiCreatedResponse({ description: 'The flairs created successfully' })
  @ApiForbiddenResponse({ description: 'Only admin can perform this action' })
  @ApiBadRequestResponse({ description: 'The subreddit id is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('/:subreddit/flair')
  createFlairlist(
    @Param('subreddit') subreddit: string,
    @Body() flairDto: FlairDto,
  ) {
    return this.subredditService.createFlair(subreddit, flairDto);
  }

  @ApiOperation({ description: 'Get the flairs of a post in a subreddit' })
  @ApiOkResponse({ description: 'The flairs returned successfully' })
  @ApiForbiddenResponse({ description: 'Only admin can perform this action' })
  @ApiBadRequestResponse({ description: 'The post id is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('/:subreddit/flair')
  getFlairlist(@Param('subreddit') subreddit: string) {
    return this.subredditService.getFlairs(subreddit);
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
  updateSubreddit(
    @Param('subreddit') subreddit: string,
    @Body() updateSubredditDto: UpdateSubredditDto,
  ) {
    return this.subredditService.update(subreddit, updateSubredditDto);
  }

  @ApiOperation({ description: 'Delete a subreddit icon' })
  @ApiOkResponse({ description: 'The icon was deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'The subreddit not found' })
  @Delete(':subreddit/icon')
  removeIcon(@Param('subreddit') subreddit: string) {
    return this.subredditService.removeIcon(subreddit);
  }

  @ApiOperation({ description: 'Delete flair from subreddit flairlist' })
  @ApiOkResponse({ description: 'The resource was deleted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @Delete(':subreddit/flair/:flair_id')
  removeFlair(
    @Param('subreddit') subreddit: string,
    @Param('flair_id') flair_id: string,
  ) {
    return this.subredditService.deleteFlairById(subreddit, flair_id);
  }

  @ApiOperation({ description: 'Get the flairs of the user in a subreddit' })
  @ApiOkResponse({ description: 'The flairs returned successfully' })
  @ApiBadRequestResponse({ description: 'User is not part of that community' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('/:subreddit/user/me/flair')
  getMyFlairsInSubreddit(@Param('subreddit') _subreddit: string) {
    // TODO
  }

  @ApiOperation({ description: 'Get the hottest subreddits' })
  @ApiOkResponse({ description: 'The hottest subreddits returned' })
  @Get('/:subreddit/hot')
  getHotSubreddits(@Param('subreddit') subreddit: string) {
    return this.subredditService.getHotSubreddits(subreddit);
  }

  @ApiOperation({ description: 'Get the newest subreddits' })
  @ApiOkResponse({ description: 'The newest subreddits returned successfully' })
  @Get('/:subreddit/new')
  getNewSubreddits(@Param('subreddit') _subreddit: string) {
    // TODO
  }

  @ApiOperation({ description: 'Get the top subreddits' })
  @ApiOkResponse({ description: 'The top subreddits returned successfully' })
  @Get('/:subreddit/top')
  getTopSubreddits(@Param('subreddit') _subreddit: string) {
    // TODO
  }

  @ApiOperation({ description: 'Get subreddits randomally' })
  @ApiOkResponse({ description: 'The random subreddits returned successfully' })
  @Get('/:subreddit/random')
  getRandomSubreddits(@Param('subreddit') _subreddit: string) {
    // TODO
  }

  @ApiOperation({ description: 'Add new categories to a subreddit' })
  @ApiOkResponse({ description: 'The categories were added successfully' })
  @UseGuards(JWTUserGuard)
  @Post('/:subreddit/category')
  addSubredditsWithCategories(
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
    @User('username') username: string,
    @Body('categories') categories: string[],
  ) {
    return this.subredditService.addSubredditCategories(
      subreddit,
      username,
      categories,
    );
  }

  @ApiOperation({ description: 'Get subreddits belong to a specific category' })
  @ApiOkResponse({ description: 'The subreddits returned successfully' })
  @Get('/category/:category')
  getSubredditsWithCategory(
    @Param('category') category: string,
    @Query() query,
  ) {
    // eslint-disable-next-line no-console
    return this.subredditService.getSubredditsWithCategory(
      category,
      query.page,
      query.limit,
    );
  }

  @ApiOperation({ description: 'Add a new user to the moderators of the sr' })
  @ApiOkResponse({ description: 'The user was added successfully' })
  @ApiBadRequestResponse()
  @UseGuards(JWTUserGuard)
  @Post('/:subreddit/moderation/:username')
  addNewModuratorToSr(
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
    @Param('username') newModeratorUsername: string,
    @User('username') moderatorUsername: string,
  ) {
    return this.subredditService.addNewModerator(
      moderatorUsername,
      newModeratorUsername,
      subreddit,
    );
  }

  @ApiOperation({ description: 'Get subreddits the user moderate' })
  @ApiOkResponse({ description: 'The subreddits returned succesfully' })
  @UseGuards(JWTUserGuard)
  @Get('/moderation/me')
  getSubredditsUserModerate(@User('username') username) {
    return this.subredditService.subredditIModerate(username);
  }

  @ApiOperation({ description: 'Get subreddits the user joined' })
  @ApiOkResponse({ description: 'The subreddits returned succesfully' })
  @UseGuards(JWTUserGuard)
  @Get('/join/me')
  getSubredditsUserJoined(@User('_id') userId) {
    return this.subredditService.subredditsIJoined(userId);
  }

  @ApiOperation({ description: 'Get subreddit moderators' })
  @ApiOkResponse({ description: 'The moderators returned succesfully' })
  @Get('/:subreddit/moderation/moderators')
  getSubredditsModerators(@Param('subreddit', ParseObjectIdPipe) subreddit) {
    return this.subredditService.getSubredditModerators(subreddit);
  }

  @ApiOperation({ description: 'Is in sr' })
  @ApiOkResponse({ description: 'true or false response' })
  @UseGuards(JWTUserGuard)
  @Get('/:subreddit/join/me')
  isJoined(
    @Param('subreddit', ParseObjectIdPipe) subreddit,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.subredditService.isJoined(userId, subreddit);
  }

  @ApiOperation({ description: 'Am I a moderator in that sr' })
  @ApiOkResponse({ description: 'true or false response' })
  @Get('/:subreddit/moderation/me')
  isModerator(
    @Param('subreddit', ParseObjectIdPipe) subreddit,
    @User('username') username: string,
  ) {
    return this.subredditService.isModerator(username, subreddit);
  }

  @ApiOperation({ description: 'add a rule in a subreddit' })
  @ApiCreatedResponse({ description: 'The rule was added successfully' })
  @ApiForbiddenResponse({
    description: 'Only moderators can perform this action',
  })
  @ApiBadRequestResponse({ description: 'The subreddit id is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JWTUserGuard)
  @Post('/:subreddit/rule')
  addRule(
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
    @User('username') username: string,
    @Body() ruleDto: RuleDto,
  ) {
    return this.subredditService.addRule(subreddit, username, ruleDto);
  }

  @ApiOperation({ description: 'delete a rule in a subreddit' })
  @ApiCreatedResponse({ description: 'The rule was deleted successfully' })
  @ApiForbiddenResponse({
    description: 'Only moderators can perform this action',
  })
  @ApiBadRequestResponse({ description: 'The subreddit id is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JWTUserGuard)
  @Delete('/:subreddit/rule/:ruleId')
  deleteRule(
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
    @Param('ruleId', ParseObjectIdPipe) ruleId: Types.ObjectId,
    @User('username') username: string,
  ) {
    return this.subredditService.deleteRule(subreddit, ruleId, username);
  }

  @ApiOperation({ description: 'update a rule in a subreddit' })
  @ApiCreatedResponse({ description: 'The rule was update successfully' })
  @ApiForbiddenResponse({
    description: 'Only moderators can perform this action',
  })
  @ApiBadRequestResponse({ description: 'The subreddit id is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JWTUserGuard)
  @Patch('/:subreddit/rule/:ruleId')
  updateRule(
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
    @Param('ruleId', ParseObjectIdPipe) ruleId: Types.ObjectId,
    @User('username') username: string,
    @Body() ruleDto: UpdateRuleDto,
  ) {
    return this.subredditService.updateRule(
      subreddit,
      ruleId,
      username,
      ruleDto,
    );
  }

  @ApiOperation({ description: 'Ask to join sr' })
  @ApiCreatedResponse({ description: 'The request sent successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Post('/:subreddit/join/ask')
  askToJoinSr(
    @User('_id') userId: Types.ObjectId,
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
  ) {
    return this.subredditService.askToJoinSr(subreddit, userId);
  }

  @ApiOperation({ description: 'Get users ask to join sr' })
  @ApiCreatedResponse({ description: 'The users returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Get('/:subreddit/join/ask')
  UsersAskingToJoinSubreddit(
    @User('username') username: string,
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
  ) {
    return this.subredditService.getUsersAskingToJoinSubreddit(
      subreddit,
      username,
    );
  }

  @ApiOperation({ description: 'Get users ask to join sr' })
  @ApiCreatedResponse({ description: 'The users returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Post('/:subreddit/user/:userId/join/accept')
  AcceptAJoinRequest(
    @User('username') moderatorUsername: string,
    @Param('userId', ParseObjectIdPipe) userId: Types.ObjectId,
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
  ) {
    return this.subredditService.acceptToJoinSr(
      subreddit,
      moderatorUsername,
      userId,
    );
  }

  @Get('/:subreddit/unmoderated')
  @UseGuards(JWTUserGuard)
  unmoderated(
    @Param('subreddit', ParseObjectIdPipe) subredditId: Types.ObjectId,
    @Query('limit') limit: number | undefined,
    @Query('page') page: number | undefined,
    @Query('sort') sort: string | undefined,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.subredditService.getUnModeratedThings(
      subredditId,
      userId,
      limit,
      page,
      sort,
    );
  }

  @Get('/:subreddit/spammed')
  @UseGuards(JWTUserGuard)
  spammed(
    @Param('subreddit', ParseObjectIdPipe) subredditId: Types.ObjectId,
    @Query('limit') limit: number | undefined,
    @Query('page') page: number | undefined,
    @Query('sort') sort: string | undefined,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.subredditService.getSpammedThings(
      subredditId,
      userId,
      limit,
      page,
      sort,
    );
  }

  @Get('/:subreddit/edited')
  @UseGuards(JWTUserGuard)
  edited(
    @Param('subreddit', ParseObjectIdPipe) subredditId: Types.ObjectId,
    @Query('limit') limit: number | undefined,
    @Query('page') page: number | undefined,
    @Query('sort') sort: string | undefined,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.subredditService.getEditedThings(
      subredditId,
      userId,
      limit,
      page,
      sort,
    );
  }
}
