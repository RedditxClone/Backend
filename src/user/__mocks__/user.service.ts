import { stubUser } from '../test/stubs/user.stub';

export const UserService = jest.fn().mockReturnValue({
  createUser: jest.fn().mockResolvedValue(stubUser()),
  getUserById: jest.fn().mockResolvedValue(stubUser()),
  checkAvailableUsername: jest.fn().mockResolvedValue(null),
  follow: jest.fn().mockResolvedValue({ status: 'success' }),
  unfollow: jest.fn().mockResolvedValue({ status: 'success' }),
});
