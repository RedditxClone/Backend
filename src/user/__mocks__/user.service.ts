import { plainToClass } from 'class-transformer';
import { PrefsDto } from '../dto';
import { stubUser } from '../test/stubs/user.stub';

export const UserService = jest.fn().mockReturnValue({
  createUser: jest.fn().mockResolvedValue(stubUser()),
  getUserById: jest.fn().mockResolvedValue(stubUser()),
  follow: jest.fn().mockResolvedValue({ status: 'success' }),
  unfollow: jest.fn().mockResolvedValue({ status: 'success' }),
  getUserPrefs: jest.fn().mockResolvedValue(plainToClass(PrefsDto, stubUser())),
  updateUserPrefs: jest.fn().mockResolvedValue({ status: 'success' }),
});
