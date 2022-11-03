export const FollowService = jest.fn().mockReturnValue({
  follow: jest.fn().mockReturnValue({ status: 'success' }),
  unfollow: jest.fn().mockReturnValue({ status: 'success' }),
});
