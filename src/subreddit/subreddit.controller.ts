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
  Req,
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
import { IsUserExistGuard } from '../auth/guards/is-user-exist.guard';
import { JWTUserGuard } from '../auth/guards/user.guard';
import { ReturnPostDto } from '../post/dto';
import { PostCommentService } from '../post-comment/post-comment.service';
import { UserUniqueKeys } from '../user/dto/user-unique-keys.dto';
import { PaginationParamsDto } from '../utils/apiFeatures/dto';
import { ParseObjectIdPipe } from '../utils/utils.service';
import { ActiveTopicsDto } from './dto/activeTopic.dto';
import { ApproveUserDto } from './dto/approve-user.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { CreateSubredditDto } from './dto/create-subreddit.dto';
import { FlairDto } from './dto/flair.dto';
import { MuteUserDto } from './dto/mute-user.dto';
import { RuleDto } from './dto/rule.dto';
import { SubTopicsDto } from './dto/subTopic.dto';
import { ThingTypeDto } from './dto/thing-type.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { UpdateSubredditDto } from './dto/update-subreddit.dto';
import type { SubredditDocument } from './subreddit.schema';
import { SubredditService } from './subreddit.service';

@ApiTags('subreddit')
@Controller('subreddit')
export class SubredditController {
  constructor(
    private readonly subredditService: SubredditService,
    private readonly postCommentService: PostCommentService,
  ) {}

  @ApiOperation({ description: 'Create a new subreddit' })
  @ApiCreatedResponse({ description: 'The resource was created succesfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiConflictResponse({ description: 'Subreddit name already exists' })
  @UseGuards(JWTUserGuard)
  @Post()
  createSubreddit(
    @Body() createSubredditDto: CreateSubredditDto,
    @User() { _id, username },
  ): Promise<SubredditDocument> {
    return this.subredditService.create(createSubredditDto, username, _id);
  }

  @ApiOperation({ description: 'Get subreddit by name' })
  @ApiOkResponse({ description: 'The subreddit returned succesfully' })
  @ApiBadRequestResponse({ description: "The subreddit name doesn't exist" })
  @UseGuards(IsUserExistGuard)
  @Get('/r/:subreddit_name')
  getSubredditByName(
    @Param('subreddit_name') subredditName: string,
    @Req() { _id },
  ) {
    return this.subredditService.findSubredditByName(subredditName, _id);
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

  @ApiOperation({ description: 'Update a subreddit settings' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @Patch('r/:subreddit_name')
  updateSubreddit(
    @Param('subreddit_name') subreddit: string,
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

  @ApiOperation({ description: 'Get the hottest subreddits' })
  @ApiOkResponse({ description: 'The hottest subreddits returned' })
  @Get('/:subreddit/hot')
  getHotSubreddits(@Param('subreddit') subreddit: string) {
    return this.subredditService.getHotSubreddits(subreddit);
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
  @UseGuards(IsUserExistGuard)
  @Get('/category/:category')
  getSubredditsWithCategory(
    @Param('category') category: string,
    @Query() query,
    @Req() { _id },
  ) {
    // eslint-disable-next-line no-console
    return this.subredditService.getSubredditsWithCategory(
      category,
      query.page,
      query.limit,
      _id,
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
    @Param('subreddit') srName: string,
    @Query() pagination: PaginationParamsDto,
    @Query() thingType: ThingTypeDto,
    @User('username') username: string,
  ) {
    return this.subredditService.getUnModeratedThings(
      srName,
      username,
      pagination,
      thingType.type,
    );
  }

  @Get('/:subreddit/spammed')
  @UseGuards(JWTUserGuard)
  spammed(
    @Param('subreddit') srName: string,
    @Query() pagination: PaginationParamsDto,
    @Query() thingType: ThingTypeDto,
    @User('username') username: string,
  ) {
    return this.subredditService.getSpammedThings(
      srName,
      username,
      pagination,
      thingType.type,
    );
  }

  @Get('/:subreddit/edited')
  @UseGuards(JWTUserGuard)
  edited(
    @Param('subreddit') srName: string,
    @Query() pagination: PaginationParamsDto,
    @Query() thingType: ThingTypeDto,
    @User('username') username: string,
  ) {
    return this.subredditService.getEditedThings(
      srName,
      username,
      pagination,
      thingType.type,
    );
  }

  @ApiOperation({ description: 'mute a user' })
  @ApiCreatedResponse({ description: 'The user muted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Post('/:subreddit/user/mute')
  muteUser(
    @User('username') moderatorUsername: string,
    @Body() mutedUserDto: MuteUserDto,
    @Param('subreddit', ParseObjectIdPipe) subredditId: Types.ObjectId,
  ) {
    return this.subredditService.addUserToListUserDate(
      subredditId,
      moderatorUsername,
      mutedUserDto,
      'mutedUsers',
      { moderators: { $ne: mutedUserDto.username } },
    );
  }

  @ApiOperation({ description: 'unmute user' })
  @ApiCreatedResponse({ description: 'The user unmuted successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Delete('/:subreddit/user/:username/mute')
  unMuteUser(
    @User('username') moderatorUsername: string,
    @Param('username') username: string,
    @Param('subreddit', ParseObjectIdPipe) subredditId: Types.ObjectId,
  ) {
    return this.subredditService.removeUserFromListUserDate(
      subredditId,
      moderatorUsername,
      username,
      'mutedUsers',
    );
  }

  @ApiOperation({ description: 'get muted users' })
  @ApiCreatedResponse({ description: 'The users returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Get('/:subreddit/user/mute')
  async getMutedUsers(
    @User('username') moderatorUsername: string,
    @Param('subreddit', ParseObjectIdPipe) subredditId: Types.ObjectId,
  ) {
    return this.subredditService.getUsersFromListUserDate(
      subredditId,
      moderatorUsername,
      'mutedUsers',
    );
  }

  @ApiOperation({ description: 'ban a user' })
  @ApiCreatedResponse({ description: 'The user banned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Post('/:subreddit/user/ban')
  banUser(
    @User('username') moderatorUsername: string,
    @Param('subreddit', ParseObjectIdPipe) subredditId: Types.ObjectId,
    @Body() bannedUserDto: BanUserDto,
  ) {
    return this.subredditService.addUserToListUserDate(
      subredditId,
      moderatorUsername,
      bannedUserDto,
      'bannedUsers',
      { moderators: { $ne: bannedUserDto.username } },
    );
  }

  @ApiOperation({ description: 'unban user' })
  @ApiCreatedResponse({ description: 'The user unbanned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Delete('/:subreddit/user/:username/ban')
  async unbanUser(
    @User('username') moderatorUsername: string,
    @Param('username') username: string,
    @Param('subreddit', ParseObjectIdPipe) subredditId: Types.ObjectId,
  ) {
    return this.subredditService.removeUserFromListUserDate(
      subredditId,
      moderatorUsername,
      username,
      'bannedUsers',
    );
  }

  @ApiOperation({ description: 'get banned users' })
  @ApiCreatedResponse({ description: 'The users returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Get('/:subreddit/user/ban')
  async getbanedUsers(
    @User('username') moderatorUsername: string,
    @Param('subreddit', ParseObjectIdPipe) subredditId: Types.ObjectId,
  ) {
    return this.subredditService.getUsersFromListUserDate(
      subredditId,
      moderatorUsername,
      'bannedUsers',
    );
  }

  @ApiOperation({ description: 'approve user' })
  @ApiCreatedResponse({ description: 'The user approved successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Post('/:subreddit/user/approve')
  approveUser(
    @User('username') moderatorUsername: string,
    @Body() approvedUserDto: ApproveUserDto,
    @Param('subreddit', ParseObjectIdPipe) subredditId: Types.ObjectId,
  ) {
    return this.subredditService.addUserToListUserDate(
      subredditId,
      moderatorUsername,
      approvedUserDto,
      'approvedUsers',
    );
  }

  @ApiOperation({ description: 'unapprove user' })
  @ApiCreatedResponse({ description: 'The user unapproved successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Delete('/:subreddit/user/:username/approve')
  async unapproveUser(
    @User('username') moderatorUsername: string,
    @Param('username') username: string,
    @Param('subreddit', ParseObjectIdPipe) subredditId: Types.ObjectId,
  ) {
    return this.subredditService.removeUserFromListUserDate(
      subredditId,
      moderatorUsername,
      username,
      'approvedUsers',
    );
  }

  @ApiOperation({ description: 'get approved users' })
  @ApiCreatedResponse({ description: 'The users returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @UseGuards(JWTUserGuard)
  @Get('/:subreddit/user/approve')
  async getapprovedUsers(
    @User('username') moderatorUsername: string,
    @Param('subreddit', ParseObjectIdPipe) subredditId: Types.ObjectId,
  ) {
    return this.subredditService.getUsersFromListUserDate(
      subredditId,
      moderatorUsername,
      'approvedUsers',
    );
  }

  @ApiOperation({ description: 'Add subtopics list' })
  @ApiCreatedResponse({ description: 'The list was added successfully' })
  @ApiForbiddenResponse({
    description: 'Only moderators can perform this action',
  })
  @ApiBadRequestResponse({ description: 'The subreddit id is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JWTUserGuard)
  @Post('/:subreddit/subtopics')
  addSubTopics(
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
    @User('username') username: string,
    @Body() subTopics: SubTopicsDto,
  ) {
    return this.subredditService.addSubTobics(
      subreddit,
      subTopics.subTopics,
      username,
    );
  }

  @ApiOperation({ description: 'Add activeTopic' })
  @ApiCreatedResponse({ description: 'The activeTopic was added successfully' })
  @ApiForbiddenResponse({
    description: 'Only moderators can perform this action',
  })
  @ApiBadRequestResponse({ description: 'The subreddit id is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JWTUserGuard)
  @Post('/:subreddit/activetopic')
  addActiveTopic(
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
    @User('username') username: string,
    @Body() activeTopic: ActiveTopicsDto,
  ) {
    return this.subredditService.addActiveTobic(
      subreddit,
      activeTopic.activeTopic,
      username,
    );
  }

  @ApiOperation({ description: 'get sr statistics of a week ago' })
  @ApiOkResponse({ description: 'The data retrived successfully' })
  @Get('/:subreddit/statistics/week')
  getSrWeekStat(
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
  ) {
    return this.subredditService.getSrStatitisticsWeek(subreddit);
  }

  @ApiOperation({ description: 'get sr statistics of a year ago' })
  @ApiOkResponse({ description: 'The data retrived successfully' })
  @Get('/:subreddit/statistics/year')
  getSrYearStat(
    @Param('subreddit', ParseObjectIdPipe) subreddit: Types.ObjectId,
  ) {
    return this.subredditService.getSrStatitisticsYear(subreddit);
  }

  @ApiOperation({ description: 'get posts of subreddit' })
  @ApiOkResponse({
    description: 'posts returned successfully',
    type: ReturnPostDto,
  })
  @UseGuards(IsUserExistGuard)
  @Get('/:subreddit_id/posts')
  getSubredditPosts(
    @User() userInfo: UserUniqueKeys,
    @Param('subreddit_id', ParseObjectIdPipe) subredditId: Types.ObjectId,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.postCommentService.getPostsOfSubreddit(
      subredditId,
      userInfo._id,
      pagination,
    );
  }
}
