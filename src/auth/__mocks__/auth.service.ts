import { stubUser } from '../../user/test/stubs/user.stub';

export const AuthService = jest.fn().mockReturnValue({
  login: jest.fn().mockReturnValue(stubUser()),
  signup: jest.fn().mockReturnValue(stubUser()),
  forgetUsername: jest.fn().mockReturnValue(null),
  changePassword: jest.fn().mockReturnValue(null),
  forgetPassword: jest.fn().mockReturnValue({ status: 'success' }),
  changePasswordUsingToken: jest.fn().mockReturnValue({ status: 'success' }),
});
