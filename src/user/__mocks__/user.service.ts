import { plainToClass } from 'class-transformer';
import { PrefsDto } from '../dto';
import { stubUser } from '../test/stubs/user.stub';

export const UserService = jest.fn().mockReturnValue({
  createUser: jest.fn().mockResolvedValue(stubUser()),
  getUserById: jest.fn().mockResolvedValue(stubUser()),
  checkAvailableUsername: jest.fn().mockResolvedValue({ status: true }),
  follow: jest.fn().mockResolvedValue({ status: 'success' }),
  unfollow: jest.fn().mockResolvedValue({ status: 'success' }),
  getUserPrefs: jest.fn().mockResolvedValue(plainToClass(PrefsDto, stubUser())),
  updateUserPrefs: jest.fn().mockResolvedValue({ status: 'success' }),
  block: jest.fn().mockResolvedValue({ status: 'success' }),
  unblock: jest.fn().mockResolvedValue({ status: 'success' }),
  allowUserToBeModerator: jest
    .fn()
    .mockResolvedValue({ ...stubUser(), authType: 'moderator' }),
  makeAdmin: jest.fn().mockResolvedValue({ ...stubUser(), authType: 'admin' }),
  deleteAccount: jest.fn().mockResolvedValue({ status: 'success' }),
  savePost: jest.fn().mockResolvedValue({ status: 'success' }),
  getSavedPosts: jest.fn().mockResolvedValue({
    _id: '6366f73606cdac163ace51b1',
    savedPosts: ['636a7faa18454a10a4791426'],
  }),
});
