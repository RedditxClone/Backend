import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from '../utils/utils.service';
import {
  AvailableUsernameDto,
  getFriendsDto,
  getUserInfoDto,
  PrefsDto,
  UserAccountDto,
  UserCommentsDto,
  UserOverviewDto,
  UserPostsDto,
} from './dto';
import { UserService } from './user.service';
import { Response } from 'express';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ description: 'Get user friends' })
  @ApiOkResponse({
    description: 'The account friends is returned successfully',
    type: getFriendsDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @Get('friend')
  getFriends() {
    return this.userService.getFriends();
  }

  @ApiOperation({ description: 'User Accept another user friend request' })
  @ApiOkResponse({ description: 'The friend request accepted successfully' })
  @ApiBadRequestResponse({ description: 'invalid user id' })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @Post('/:user_id/frined/accept')
  acceptFriendRequest() {
    return this.userService.acceptFriendRequest();
  }

  @ApiOperation({ description: 'User send a friend request to another user' })
  @ApiOkResponse({ description: 'The friend request sent successfully' })
  @ApiBadRequestResponse({ description: 'invalid user id' })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @Post('/:user_id/friend/request')
  sendFriendRequest() {
    return this.userService.sendFriendRequest();
  }

  @ApiOperation({
    description: 'delete the friendship request sent from another user',
  })
  @ApiOkResponse({ description: 'The friend request is deleted successfully' })
  @ApiBadRequestResponse({ description: 'invalid user id' })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @Delete('/:user_id/friend/request')
  deleteFriendRequest() {
    return this.userService.deleteFriendRequest();
  }

  @ApiOperation({
    description: 'remove a user from the friends of the account',
  })
  @ApiOkResponse({ description: 'The friend is deleted successfully' })
  @ApiBadRequestResponse({ description: 'invalid user id' })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @Delete('/:user_id/friend')
  unFriend() {
    return this.userService.unFriend();
  }

  @ApiOperation({ description: 'User block another user' })
  @ApiOkResponse({ description: 'User blocked successfully' })
  @ApiBadRequestResponse({ description: 'invalid user id' })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @Post('/:user_id/block')
  block() {
    return this.userService.block();
  }

  @ApiOperation({ description: 'mark user as a spam' })
  @ApiOkResponse({ description: 'User spamed successfully' })
  @ApiBadRequestResponse({ description: 'invalid user id' })
  @ApiForbiddenResponse({
    description: 'Only moderators are allowed to perform that action',
  })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @Post('/:user_id/spam')
  spamUser(@Param('user_id') user_id: string) {
    return;
  }

  @ApiOperation({ description: 'Get user data if logged in' })
  @ApiOkResponse({
    description: 'The user is logged in and the data returned successfully',
    type: UserAccountDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @Get('/me')
  getUser() {
    return;
  }

  @ApiOperation({ description: 'Get user preferences' })
  @ApiOkResponse({
    description: 'The preferences returned successfully',
    type: PrefsDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @Get('/me/prefs')
  getUserPrefs() {
    return 'Get the logged user preferences (Settings)';
  }

  @ApiOperation({ description: 'Update user preferences' })
  @ApiOkResponse({ description: 'The preferences updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @Patch('/me/prefs')
  updateUserPrefs() {
    return 'Updata the logged user preferences (Settings)';
  }

  @ApiOperation({ description: 'Get information about the user' })
  @ApiOkResponse({
    description: 'The user info returned successfully',
    type: getUserInfoDto,
  })
  @ApiBadRequestResponse({ description: 'The user_id is not valid' })
  @Get('/:user_id/about')
  getUserInfo(@Param('user_id') user_id: string) {
    return;
  }

  @ApiOperation({ description: 'Get information about the user' })
  @ApiOkResponse({
    description: 'The data returned successfully',
    type: UserOverviewDto,
  })
  @ApiBadRequestResponse({ description: 'The user_id is not valid' })
  @Get('/:user_id/overview')
  getUserOverview(@Param('user_id') user_id: string) {
    return;
  }

  @ApiOperation({ description: 'Get information about the user' })
  @ApiOkResponse({
    description: 'The data returned successfully',
    type: UserPostsDto,
  })
  @ApiBadRequestResponse({ description: 'The user_id is not valid' })
  @Get('/:user_id/submitted')
  getUserPosts(@Param('user_id') user_id: string) {
    return;
  }

  @ApiOperation({ description: 'get user info by user id' })
  @ApiOkResponse({ description: 'The user info returned successfully' })
  @ApiBadRequestResponse({ description: 'The user_id is not valid' })
  @Get('/:user_id')
  async getUserById(
    @Param('user_id', ParseObjectIdPipe) user_id: Types.ObjectId,
  ) {
    return await this.userService.getUserById(user_id);
  }

  @ApiOperation({ description: 'Get information about the user' })
  @ApiOkResponse({
    description: 'The data returned successfully',
    type: UserCommentsDto,
  })
  @ApiBadRequestResponse({ description: 'The user_id is not valid' })
  @Get('/:user_id/comments')
  getUserComments(@Param('user_id') user_id: string) {
    return;
  }

  @ApiOperation({ description: 'Get information about the user' })
  @ApiOkResponse({
    description: 'The data returned successfully',
    type: UserPostsDto,
  })
  @ApiBadRequestResponse({ description: 'The user_id is not valid' })
  @Get('/:user_id/upvoted')
  getUserUpvoted(@Param('user_id') user_id: string) {
    return;
  }

  @ApiOperation({ description: 'Get information about the user' })
  @ApiOkResponse({
    description: 'The data returned successfully',
    type: UserPostsDto,
  })
  @ApiBadRequestResponse({ description: 'The user_id is not valid' })
  @Get('/:user_id/upvoted')
  getUserDownvoted(@Param('user_id') user_id: string) {
    return;
  }

  @ApiOperation({ description: 'Check if username is available' })
  @ApiCreatedResponse({
    description: 'Username Available',
  })
  @ApiUnauthorizedResponse({ description: 'Username Taken' })
  @Post('/check-available-username')
  async checkAvailableUsername(
    @Body() availableUsernameDto: AvailableUsernameDto,
    @Res() res: Response,
  ) {
    await this.userService.checkAvailableUsername(availableUsernameDto, res);
  }
}
