import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ description: 'Get user friends' })
  @ApiOkResponse({
    description: 'The account friends is returned successfully',
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
  spamUser(@Param('user_id') user_id: String) {
    return;
  }

  @ApiOperation({ description: 'Get user data if logged in' })
  @ApiOkResponse({
    description: 'The user is logged in and the data returned successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unautherized' })
  @Get('/me')
  getUser() {
    return 'If user cookie is valid return user data';
  }

  @ApiOperation({ description: 'Get user preferences' })
  @ApiOkResponse({ description: 'The preferences returned successfully' })
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
  @ApiOkResponse({ description: 'The user info returned successfully' })
  @ApiBadRequestResponse({ description: 'The user_id is not valid' })
  @Get('/:user_id/about')
  getUserInfo(@Param('user_id') user_id: string) {
    return 'If user cookie is valid return user data';
  }

  // TODO: Should be discused with the team
  // → /user/username/overview
  // → /user/username/submitted
  // → /user/username/comments
  // → /user/username/upvoted
  // → /user/username/downvoted
}
