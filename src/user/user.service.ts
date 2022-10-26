import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {

  block() {
    return 'block a user'
  }

  getFriends() {
    return 'get user list of friends'
  }

  acceptFriendRequest() {
    return 'accept user friend request'
  }

  sendFriendRequest() {
    return 'send a friend request'
  }

  deleteFriendRequest() {
    return 'delete a friend request'
  }

  unFriend() {
    return 'delete a friend'
  }
}
