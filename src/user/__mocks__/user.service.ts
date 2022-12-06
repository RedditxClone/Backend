import { plainToClass } from 'class-transformer';

import { stubBlock } from '../../block/test/stubs/blocked-users.stub';
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
  getBlockedUsers: jest.fn().mockResolvedValue(stubBlock()),
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
  uploadPhoto: jest.fn().mockResolvedValue({
    photo: 'statics/somefolder/636c31ef6b71bf1c6226a5a4.jpeg',
  }),
});
