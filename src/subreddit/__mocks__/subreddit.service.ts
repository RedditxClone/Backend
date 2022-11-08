import { stubFlair } from '../test/stubs/flair.stub';
import { stubSubreddit } from '../test/stubs/subreddit.stub';

export const SubredditService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(stubSubreddit()),
  findSubreddit: jest.fn().mockResolvedValue(stubSubreddit()),
  update: jest.fn().mockResolvedValue({ status: 'success' }),
  createFlair: jest.fn().mockResolvedValue({ flairList: [stubFlair()] }),
  getFlairs: jest.fn().mockResolvedValue({ flairList: [stubFlair()] }),
  deleteFlairById: jest.fn().mockResolvedValue({ status: 'success' }),
  uploadIcon: jest
    .fn()
    .mockResolvedValue({ icon: '6365278228aa323e825cf55e.jpeg' }),
  removeIcon: jest.fn().mockResolvedValue({ status: 'success' }),
});
