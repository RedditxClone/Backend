import { stubUser } from '../test/stubs/user.stub';

export const UserService = jest.fn().mockReturnValue({
  createUser: jest.fn().mockResolvedValue(stubUser()),
  getUserById: jest.fn().mockResolvedValue(stubUser()),
  follow: jest.fn().mockResolvedValue({ status: 'success' }),
  unfollow: jest.fn().mockResolvedValue({ status: 'success' }),
  block: jest.fn().mockResolvedValue({ status: 'success' }),
  unblock: jest.fn().mockResolvedValue({ status: 'success' }),
  allowUserToBeModerator: jest
    .fn()
    .mockResolvedValue({ ...stubUser(), authType: 'moderator' }),
  makeAdmin: jest.fn().mockResolvedValue({ ...stubUser(), authType: 'admin' }),
});
