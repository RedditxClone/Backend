import { stubFlair } from '../test/stubs/flair.stub';
import { stubSubreddit } from '../test/stubs/subreddit.stub';

export const UserService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(stubSubreddit()),
  findSubreddit: jest.fn().mockResolvedValue(stubSubreddit()),
  updateSubreddit: jest.fn().mockResolvedValue(stubSubreddit()),
  createFlair: jest.fn().mockResolvedValue({ flairList: [stubFlair()] }),
  deleteFlairById: jest.fn().mockResolvedValue({ flairList: [] }),
  uploadIcon: jest
    .fn()
    .mockResolvedValue({ icon: '6365278228aa323e825cf55e.jpeg' }),
  removeIcon: jest.fn().mockResolvedValue({ status: 'success' }),
});
