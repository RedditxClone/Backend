import { stubBlock } from '../test/stubs/blocked-users.stub';

export const BlockService = jest.fn().mockReturnValue({
  block: jest.fn().mockReturnValue({ status: 'success' }),
  unblock: jest.fn().mockReturnValue({ status: 'success' }),
  existBlockBetween: jest.fn().mockReturnValue(false),
  getBlockedUsers: jest.fn().mockReturnValue(stubBlock()),
});
