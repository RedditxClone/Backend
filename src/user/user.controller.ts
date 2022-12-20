import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

import { User } from '../auth/decorators/user.decorator';
import { JWTAdminGuard, JWTUserGuard } from '../auth/guards';
import { IsUserExistGuard } from '../auth/guards/is-user-exist.guard';
import { FollowService } from '../follow/follow.service';
import { ReturnPostDto } from '../post/dto';
import { ApiPaginatedOkResponse } from '../utils/apiFeatures/decorators/api-paginated-ok-response.decorator';
import { PaginationParamsDto } from '../utils/apiFeatures/dto';
import { ParseObjectIdPipe } from '../utils/utils.service';
import {
  AvailableUsernameDto,
  PrefsDto,
  UserAccountDto,
  UserPostsDto,
  UserSimpleDto,
} from './dto';
import { MeDto } from './dto/me.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly followService: FollowService,
  ) {}

  @ApiOperation({ description: 'Get user data if logged in' })
  @ApiOkResponse({
    description: 'The user is logged in and the data returned successfully',
    type: MeDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @Get('/me')
  @UseGuards(JWTUserGuard)
  async getCurrentUser(@User('_id') userId: Types.ObjectId) {
    return this.userService.getUserById(userId);
  }

  @ApiOperation({ description: 'generate list of random usernames' })
  @ApiOkResponse({
    description: 'return username successfully',
    type: UserAccountDto,
  })
  @Get('/random-usernames')
  async getRandomList(): Promise<string[]> {
    return this.userService.generateRandomUsernames(6);
  }

  @ApiOperation({ description: 'Get user preferences' })
  @ApiOkResponse({
    description: 'The preferences returned successfully',
    type: PrefsDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @UseGuards(JWTUserGuard)
  @Get('/me/prefs')
  async getUserPrefs(@User('_id') userId: Types.ObjectId) {
    return this.userService.getUserPrefs(userId);
  }

  @ApiOperation({ description: 'Update user preferences' })
  @ApiCreatedResponse({ description: 'The preferences updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @UseGuards(JWTUserGuard)
  @Patch('/me/prefs')
  async updateUserPrefs(
    @User('_id') userId: Types.ObjectId,
    @Body() prefsDto: PrefsDto,
  ) {
    return this.userService.updateUserPrefs(userId, prefsDto);
  }

  @ApiOperation({ description: 'Check if username is available' })
  @ApiCreatedResponse({
    description: 'Username Available',
  })
  @ApiUnauthorizedResponse({ description: 'Username Taken' })
  @Post('/check-available-username')
  async checkAvailableUsername(
    @Body() availableUsernameDto: AvailableUsernameDto,
    @Res() res,
  ) {
    return this.userService.checkAvailableUsername(availableUsernameDto, res);
  }

  @ApiOperation({ description: 'follow specific user' })
  @ApiCreatedResponse({
    description: 'you have followed the user successfully',
  })
  @ApiBadRequestResponse({
    description:
      'either you are following the user or there is a block between you and the user',
  })
  @ApiUnauthorizedResponse({
    description: 'user is not logged in',
  })
  @UseGuards(JWTUserGuard)
  @Post('/:user_id/follow')
  async followUser(
    @Param('user_id', ParseObjectIdPipe) followed: Types.ObjectId,
    @User('_id') follower: Types.ObjectId,
  ) {
    return this.userService.follow(follower, followed);
  }

  @ApiOperation({ description: 'unfollow specific user' })
  @ApiCreatedResponse({
    description: 'you have unfollowed the user successfully',
  })
  @ApiBadRequestResponse({
    description:
      'either you are not following the user or there is a block between you and the user or wrong user id',
  })
  @ApiUnauthorizedResponse({
    description: 'user is not logged in',
  })
  @UseGuards(JWTUserGuard)
  @Post('/:user_id/unfollow')
  async unfollowUser(
    @Param('user_id', ParseObjectIdPipe) user_id: Types.ObjectId,
    @User('_id') requestingUserId: Types.ObjectId,
  ) {
    return this.userService.unfollow(requestingUserId, user_id);
  }

  @ApiOperation({ description: 'get list of users you are following' })
  @ApiPaginatedOkResponse(UserSimpleDto, 'Users returned successfully')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JWTUserGuard)
  @Get('/me/following')
  getFollowingUsers(
    @User('_id') userId: Types.ObjectId,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.followService.getFollowingUsers(userId, paginationParams);
  }

  @ApiOperation({ description: 'get list of users that are following you' })
  @ApiPaginatedOkResponse(UserSimpleDto, 'Users returned successfully')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JWTUserGuard)
  @Get('/me/followed')
  getFollowedUsers(
    @User('_id') userId: Types.ObjectId,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.followService.getFollowedUsers(userId, paginationParams);
  }

  @ApiOperation({ description: 'User block another user' })
  @ApiOkResponse({ description: 'User blocked successfully' })
  @ApiBadRequestResponse({
    description: 'invalid user id or there is block between you and the user',
  })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @UseGuards(JWTUserGuard)
  @Post('/:user_id/block')
  async blockUser(
    @Param('user_id', ParseObjectIdPipe) user_id: Types.ObjectId,
    @User('_id') requestingUserId: Types.ObjectId,
  ): Promise<any> {
    return this.userService.block(requestingUserId, user_id);
  }

  @ApiOperation({ description: 'User unblock another user' })
  @ApiOkResponse({ description: 'User unblocked successfully' })
  @ApiBadRequestResponse({
    description: "invalid user id or you haven't blocked the user",
  })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @UseGuards(JWTUserGuard)
  @Post('/:user_id/unblock')
  async unblockUser(
    @Param('user_id', ParseObjectIdPipe) user_id: Types.ObjectId,
    @User('_id') requestingUserId: Types.ObjectId,
  ): Promise<any> {
    return this.userService.unblock(requestingUserId, user_id);
  }

  @ApiOperation({ description: 'get list of blocked users' })
  @ApiOkResponse({ description: 'Users returned successfully' })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @UseGuards(JWTUserGuard)
  @Get('block')
  getBlockedUsers(@User('_id') userId: Types.ObjectId): Promise<any> {
    return this.userService.getBlockedUsers(userId);
  }

  @ApiOperation({ description: 'give a moderation role to the ordinary user' })
  @ApiCreatedResponse({ description: 'type of user changed successfully' })
  @ApiUnauthorizedResponse({
    description: 'you are not allowed to make this action',
  })
  @ApiBadRequestResponse({
    description: 'you are trying to change admin type to moderator',
  })
  @UseGuards(JWTAdminGuard)
  @Post('/:user_id/make-moderator')
  async makeModeration(
    @Param('user_id', ParseObjectIdPipe) user_id: Types.ObjectId,
  ) {
    return this.userService.allowUserToBeModerator(user_id);
  }

  @ApiOperation({
    description:
      'give an admin role to the ordinary user (for testing purpose and will be deleted)',
  })
  @ApiCreatedResponse({ description: 'type of user changed successfully' })
  @ApiUnauthorizedResponse({
    description: 'you are not allowed to make this action',
  })
  @UseGuards(JWTAdminGuard)
  @Post('/:user_id/make-admin')
  async makeAdmin(
    @Param('user_id', ParseObjectIdPipe) user_id: Types.ObjectId,
  ) {
    return this.userService.makeAdmin(user_id);
  }

  @ApiOperation({
    description: 'Delete the user account by sitting the accountClosed to true',
  })
  @ApiOkResponse({ description: 'Account deleted successfully ' })
  @ApiUnauthorizedResponse({
    description: 'you are not allowed to make this action',
  })
  @UseGuards(JWTUserGuard)
  @Delete('/me')
  async deleteAccount(@User('_id') userId: Types.ObjectId) {
    return this.userService.deleteAccount(userId);
  }

  @ApiOperation({ description: 'get user info by user id' })
  @ApiOkResponse({
    description: 'The user info returned successfully',
    type: UserAccountDto,
  })
  @ApiBadRequestResponse({ description: 'The user_id is not valid' })
  @Get('/:username')
  @UseGuards(IsUserExistGuard)
  getUserByUsername(@Req() req, @Param('username') user2Id: string) {
    return this.userService.getUserInfo(req._id, user2Id);
  }

  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({
    description: 'upload a new user profile photo',
  })
  @ApiOkResponse({ description: 'Photo uploaded successfully ' })
  @ApiUnauthorizedResponse({
    description: 'you are not allowed to make this action',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(JWTUserGuard)
  @Post('/me/profile')
  uploadProfilePhoto(
    @User('_id') userId: Types.ObjectId,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 10_485_760,
        })
        .build(),
    )
    file,
  ) {
    return this.userService.uploadPhoto(userId, file, 'profilePhoto');
  }

  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({
    description: 'upload a new user profile photo',
  })
  @ApiOkResponse({ description: 'Photo uploaded successfully ' })
  @ApiUnauthorizedResponse({
    description: 'you are not allowed to make this action',
  })
  @UseGuards(JWTUserGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('/me/cover')
  uploadCoverPhoto(
    @User('_id') userId: Types.ObjectId,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 10_485_760,
        })
        .build(),
    )
    file,
  ) {
    return this.userService.uploadPhoto(userId, file, 'coverPhoto');
  }

  @ApiOperation({
    description:
      'Close {option = -1} or reopen {option = 1} all notification for a post or comment',
  })
  @ApiCreatedResponse({ description: 'successfully done' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Request' })
  @ApiBadRequestResponse({ description: 'invalid mongo id' })
  @UseGuards(JWTUserGuard)
  @Post('thing/:thing/notify/:option')
  notifyPostComment(
    @Param('thing', ParseObjectIdPipe) thingId,
    @Param('option', ParseIntPipe) option,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.userService.notifyPostComment(userId, thingId, option);
  }

  @ApiOperation({
    description: 'Save post',
  })
  @ApiOkResponse({ description: 'post saved successfully ' })
  @ApiUnauthorizedResponse({
    description: 'unautherized',
  })
  @HttpCode(200)
  @UseGuards(JWTUserGuard)
  @Post('/post/:post_id/save')
  savePost(
    @Param('post_id', ParseObjectIdPipe) post_id: Types.ObjectId,
    @Req() { user },
  ) {
    return this.userService.savePost(user._id, post_id);
  }

  @ApiOperation({
    description: 'unsave post',
  })
  @ApiOkResponse({ description: 'post saved successfully ' })
  @ApiUnauthorizedResponse({
    description: 'unautherized',
  })
  @HttpCode(200)
  @UseGuards(JWTUserGuard)
  @Post('/post/:post_id/unsave')
  unsavePost(
    @Param('post_id', ParseObjectIdPipe) post_id: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.userService.unsavePost(userId, post_id);
  }

  @ApiOperation({
    description: 'get saved posts',
  })
  @ApiPaginatedOkResponse(ReturnPostDto, 'saved posts returned successfully ')
  @ApiUnauthorizedResponse({
    description: 'unautherized',
  })
  @UseGuards(JWTUserGuard)
  @Get('/post/save')
  getSavedPosts(
    @User('_id') userId: Types.ObjectId,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.userService.getSavedPosts(userId, paginationParams);
  }

  @ApiOperation({ description: 'Get posts of the user' })
  @ApiOkResponse({
    description: 'The data returned successfully',
    type: UserPostsDto,
  })
  @ApiBadRequestResponse({ description: 'The user_id is not valid' })
  @Get('/:user_id/posts')
  @UseGuards(IsUserExistGuard)
  getUserPosts(
    @User('_id') userId: Types.ObjectId,
    @Param('user_id', ParseObjectIdPipe) ownerId: Types.ObjectId,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.userService.getUserPosts(ownerId, userId, pagination);
  }

  @ApiOperation({ description: 'Get posts and comments of the user' })
  @ApiOkResponse({
    description: 'The data returned successfully',
    type: UserPostsDto,
  })
  @ApiBadRequestResponse({ description: 'The user_id is not valid' })
  @Get('/me/overview')
  @UseGuards(JWTUserGuard)
  getMyOverview(
    @User('_id') userId: Types.ObjectId,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.userService.getOverviewThings(userId, pagination);
  }

  @ApiOperation({ description: 'Get posts and comments of the user' })
  @ApiOkResponse({
    description: 'The data returned successfully',
    type: UserPostsDto,
  })
  @ApiBadRequestResponse({ description: 'The user_id is not valid' })
  @Get('/me/history')
  @UseGuards(JWTUserGuard)
  getMyHistory(
    @User('_id') userId: Types.ObjectId,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.userService.getHistoryThings(userId, pagination);
  }

  @ApiOperation({ description: 'Get posts of the user' })
  @ApiOkResponse({
    description: 'The data returned successfully',
    type: UserPostsDto,
  })
  @ApiBadRequestResponse({ description: 'The user_id is not valid' })
  @Get('/:user_id/comments')
  @UseGuards(IsUserExistGuard)
  getUserComments(
    @User('_id') ownerId: Types.ObjectId,
    @Param('user_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.userService.getUserComments(ownerId, userId, pagination);
  }
}
