export const BlockService = jest.fn().mockReturnValue({
  block: jest.fn().mockReturnValue({ status: 'success' }),
  unblock: jest.fn().mockReturnValue({ status: 'success' }),
  existBlockBetween: jest.fn().mockReturnValue(false),
});
