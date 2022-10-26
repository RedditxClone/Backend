import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiAcceptedResponse, ApiBadRequestResponse, ApiForbiddenResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags("User")
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @ApiOperation({ description: "Get user friends" })
  @ApiAcceptedResponse({ description: "The account friends is returned successfully" })
  @ApiUnauthorizedResponse({ description: "Unautherized" })
  @Get("friend")
  getFriends() {
    return this.userService.getFriends()
  }

  @ApiOperation({ description: "User Accept another user friend request" })
  @ApiAcceptedResponse({ description: "The friend request accepted successfully" })
  @ApiBadRequestResponse({ description: "invalid user id" })
  @ApiUnauthorizedResponse({ description: "Unautherized" })
  @Post("/:user_id/frined/accept")
  acceptFriendRequest() {
    return this.userService.acceptFriendRequest()
  }

  @ApiOperation({ description: "User send a friend request to another user" })
  @ApiAcceptedResponse({ description: "The friend request sent successfully" })
  @ApiBadRequestResponse({ description: "invalid user id" })
  @ApiUnauthorizedResponse({ description: "Unautherized" })
  @Post("/:user_id/friend/request")
  sendFriendRequest() {
    return this.userService.sendFriendRequest()
  }

  @ApiOperation({ description: "delete the friendship request sent from another user" })
  @ApiAcceptedResponse({ description: "The friend request is deleted successfully" })
  @ApiBadRequestResponse({ description: "invalid user id" })
  @ApiUnauthorizedResponse({ description: "Unautherized" })
  @Delete("/:user_id/friend/request")
  deleteFriendRequest() {
    return this.userService.deleteFriendRequest()
  }

  @ApiOperation({ description: "remove a user from the friends of the account" })
  @ApiAcceptedResponse({ description: "The friend is deleted successfully" })
  @ApiBadRequestResponse({ description: "invalid user id" })
  @ApiUnauthorizedResponse({ description: "Unautherized" })
  @Delete("/:user_id/friend")
  unFriend() {
    return this.userService.unFriend()
  }

  @ApiOperation({ description: "User block another user" })
  @ApiAcceptedResponse({ description: "User blocked successfully" })
  @ApiBadRequestResponse({ description: "invalid user id" })
  @ApiUnauthorizedResponse({ description: "Unautherized" })
  @Get("/:user_id/block")
  block() {
    return this.userService.block()
  }

  @ApiOperation({ description: "Moderator spam a user" })
  @ApiAcceptedResponse({ description: "User spamed successfully" })
  @ApiBadRequestResponse({ description: "invalid user id" })
  @ApiForbiddenResponse({ description: "Only moderators are allowed to perform that action" })
  @ApiUnauthorizedResponse({ description: "Unautherized" })
  @Get("/:user_id/spam")
  spamPost() {
    return;
  }
}
