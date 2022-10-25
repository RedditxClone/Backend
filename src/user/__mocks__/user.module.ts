import { Types } from 'mongoose';
import { User } from '../user.schema';

class userMock {
  users: any[] = [];
  public create(user: User): any {
    this.users.push({ ...user, _id: Types.ObjectId.createFromTime(1) });
    return this.users[this.users.length - 1];
  }
  public getUserById(id: Types.ObjectId) {
    return this.users.find((user) => user._id == id);
  }
}
export const UserModule = jest.fn().mockReturnValue(userMock);
