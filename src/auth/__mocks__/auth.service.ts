import { stubUser } from '../../user/test/stubs/user.stub';

export const AuthService = jest.fn().mockReturnValue({
  login: jest.fn().mockReturnValue(stubUser()),
  signup: jest.fn().mockReturnValue(stubUser()),
  forgetUsername: jest.fn().mockReturnValue(null),
});
